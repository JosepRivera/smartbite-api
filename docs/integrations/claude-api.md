# Integración Claude API

SmartBite usa Claude API de Anthropic en cuatro funcionalidades. Esta
documentación describe cómo se usa en cada módulo, la estrategia de
modelo recomendada para producción y los costos estimados.

---

## Dónde se usa Claude API

| Módulo         | Funcionalidad       | Uso concreto                                                             | Timeout |
| -------------- | ------------------- | ------------------------------------------------------------------------ | ------- |
| `AIModule`     | IA-1 Text-to-SQL    | Genera SQL desde lenguaje natural y redacta la respuesta                 | 10 s    |
| `DemandModule` | IA-2 Predicción     | Factor de ajuste contextual sobre la predicción Holt-Winters             | 30 s    |
| `MRPModule`    | IA-3 MRP            | Narración en lenguaje natural de la lista de compras                     | 30 s    |
| `VoiceModule`  | VOZ-1 Voice-to-Form | Extracción de entidades del formulario desde la transcripción de Whisper | 10 s    |

---

## Modelo recomendado por entorno

### Pre-tesis / desarrollo
Usar **`claude-sonnet-4-5`** para todas las funcionalidades. Ofrece la
mejor calidad para demostrar el sistema en la defensa y los costos en
desarrollo son mínimos dado el bajo volumen de llamadas.

### Producción
Usar **`claude-haiku-4-5`** (`claude-haiku-4-5-20251001`) para todas las
funcionalidades. Es el modelo más económico de la familia Claude 4 y es
suficiente para las cuatro tareas de SmartBite:

- **Text-to-SQL:** Las consultas son sobre un schema conocido y limitado. Haiku las maneja con alta precisión.
- **Ajuste contextual IA-2:** Solo recibe una fecha y la predicción numérica base. La respuesta esperada es un factor multiplicativo simple (ej: `1.15` para un feriado).
- **Narración MRP:** Redactar una lista de compras en lenguaje natural es una tarea de baja complejidad.
- **Extracción de entidades VOZ-1:** Las frases son cortas y el schema del formulario es fijo y conocido.

Si en producción se detecta que alguna funcionalidad específica requiere
mayor razonamiento (ej: consultas de IA-1 muy complejas), se puede
escalar solo esa llamada a `claude-sonnet-4-5` sin cambiar el resto.

---

## Estimación de costos en producción

### Precios de Claude Haiku 4.5
- Input: **$1.00 por millón de tokens**
- Output: **$5.00 por millón de tokens**

### Estimación por funcionalidad (negocio típico, 1 local)

| Funcionalidad          | Frecuencia           | Tokens estimados / llamada | Costo mensual aprox. |
| ---------------------- | -------------------- | -------------------------- | -------------------- |
| IA-2 ajuste contextual | 1 vez/día (cron job) | ~500 input + ~50 output    | $0.02                |
| IA-3 narración MRP     | 1–3 veces/día        | ~800 input + ~200 output   | $0.05                |
| IA-1 Text-to-SQL       | ~10 consultas/día    | ~1,500 input + ~300 output | $0.90                |
| VOZ-1 extracción       | ~30 registros/día    | ~400 input + ~100 output   | $0.46                |
| **Total estimado**     |                      |                            | **~$1.43 / mes**     |

> Los tokens de input incluyen el system prompt con el schema de la BD.
> El uso de **prompt caching** de Anthropic puede reducir el costo de
> IA-1 y VOZ-1 hasta un 90% en los tokens de input que se repiten
> (system prompt, schema), dejando el costo total por debajo de **$0.50/mes**.

### Justificación del costo para el dueño

El costo de Claude API en producción para un restaurante típico con
SmartBite es de aproximadamente **S/ 2–6 al mes** (con o sin prompt caching).

Para contextualizar:
- Servicios alternativos de terceros como BiPe Alerta cobran S/ 30–80/mes
  solo para la detección de pagos — que SmartBite resuelve sin costo con la app Kotlin.
- Un sistema POS tradicional cobra S/ 80–200/mes.
- SmartBite ofrece POS + stock + reportes + IA predictiva por S/ 2–6/mes en APIs externas.

El modelo de negocio puede absorber este costo de dos formas:
1. **Incluido en la suscripción mensual:** El desarrollador paga la API y lo carga en el precio del servicio (S/ 30–50/mes por local).
2. **API Key propia del negocio:** El dueño crea su cuenta en Anthropic y pone su propia API Key en la configuración. Paga directamente a Anthropic lo que consume.

---

## Configuración

```typescript
// src/config/env.validation.ts
ANTHROPIC_API_KEY: z.string().min(1),
ANTHROPIC_MODEL: z.string().default('claude-haiku-4-5-20251001'),
CLAUDE_TIMEOUT_INTERACTIVE: z.number().default(10000), // ms — IA-1, VOZ-1
CLAUDE_TIMEOUT_BATCH: z.number().default(30000),        // ms — IA-2, IA-3
```

```typescript
// src/ai/claude.service.ts — patrón base para todas las llamadas
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeService {
  private client: Anthropic;

  constructor(private config: ConfigService) {
    this.client = new Anthropic({
      apiKey: this.config.get('ANTHROPIC_API_KEY'),
    });
  }

  async complete(prompt: string, system: string, timeoutMs: number): Promise<string | null> {
    try {
      const response = await Promise.race([
        this.client.messages.create({
          model: this.config.get('ANTHROPIC_MODEL'),
          max_tokens: 1024,
          system,
          messages: [{ role: 'user', content: prompt }],
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeoutMs)
        ),
      ]);
      return (response as any).content[0].text;
    } catch (error) {
      // Loguear el error pero NO propagar como 500
      console.error('[ClaudeService] Error:', error.message);
      return null; // null = activar fallback en el módulo que llama
    }
  }
}
```

> Si `complete()` retorna `null`, el módulo que llama activa su fallback
> específico. Ver `decisions/0007-claude-fallback-strategy.md`.

---

## Prompts por funcionalidad

Los prompts completos viven en cada módulo:

| Archivo                                           | Funcionalidad                                       |
| ------------------------------------------------- | --------------------------------------------------- |
| `src/ai/prompts/text-to-sql.prompt.ts`            | IA-1: genera SQL desde pregunta en lenguaje natural |
| `src/demand/prompts/context-adjustment.prompt.ts` | IA-2: factor de ajuste por fecha/feriado            |
| `src/mrp/prompts/shopping-list.prompt.ts`         | IA-3: narración de la lista de compras              |
| `src/voice/prompts/entity-extraction.prompt.ts`   | VOZ-1: extrae campos del formulario activo          |

---

## SDK

```bash
pnpm add @anthropic-ai/sdk
```

Versión usada: ver `package.json`. Siempre usar la versión oficial del SDK
de Anthropic, no llamadas HTTP directas.
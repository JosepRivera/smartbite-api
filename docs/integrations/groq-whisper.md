# Integración Groq Whisper API

SmartBite usa Groq Whisper para transcribir el audio del usuario en VOZ-1.
Groq ofrece la API de Whisper más rápida del mercado gracias a su hardware
LPU (Language Processing Unit), con latencias menores a 1 segundo para
audios cortos.

---

## Dónde se usa

Exclusivamente en `VoiceModule` (VOZ-1). Groq Whisper transcribe el audio
a texto en español peruano. La transcripción resultante se envía a Claude API
para extraer los campos del formulario activo.

Groq Whisper es independiente de Claude API. Si Claude falla, la transcripción
ya existe y se muestra al usuario. Si Groq falla, no hay transcripción y el
formulario queda vacío. Ver los tres escenarios de fallback en
`decisions/0007-claude-fallback-strategy.md`.

---

## Modelo

Usar **`whisper-large-v3-turbo`** en producción.

| Modelo                   | Velocidad | Precisión | Precio               |
| ------------------------ | --------- | --------- | -------------------- |
| `whisper-large-v3`       | Alta      | Máxima    | $0.111/hora de audio |
| `whisper-large-v3-turbo` | Muy alta  | Muy alta  | $0.04/hora de audio  |

`whisper-large-v3-turbo` ofrece una relación costo/calidad óptima para
frases cortas en español (5–15 segundos típicamente). La diferencia de
precisión respecto a `large-v3` es imperceptible para el caso de uso.

---

## Estimación de costos en producción

Un audio típico de VOZ-1 dura entre 5 y 15 segundos.

| Escenario | Registros/día | Duración promedio | Costo/mes |
| --------- | ------------- | ----------------- | --------- |
| Uso bajo  | 10            | 10 s              | ~$0.002   |
| Uso medio | 30            | 10 s              | ~$0.006   |
| Uso alto  | 100           | 15 s              | ~$0.028   |

El costo de Groq Whisper es prácticamente cero para un restaurante típico.
**Menos de S/ 0.11 al mes** en el escenario de uso alto.

---

## Configuración

```typescript
// src/config/env.validation.ts
GROQ_API_KEY: z.string().min(1),
GROQ_WHISPER_MODEL: z.string().default('whisper-large-v3-turbo'),
GROQ_TIMEOUT: z.number().default(15000), // 15 segundos
```

---

## Implementación

```typescript
// src/voice/voice.service.ts
import Groq from 'groq-sdk';
import { Readable } from 'stream';

@Injectable()
export class VoiceService {
  private groq: Groq;

  constructor(
    private config: ConfigService,
    private claudeService: ClaudeService,
  ) {
    this.groq = new Groq({ apiKey: this.config.get('GROQ_API_KEY') });
  }

  async processAudio(audioBuffer: Buffer, mimeType: string, formType: string) {
    // Paso 1: Transcribir con Groq Whisper
    let transcription: string | null = null;

    try {
      const file = await toFile(audioBuffer, 'audio.webm', { type: mimeType });
      const response = await Promise.race([
        this.groq.audio.transcriptions.create({
          file,
          model: this.config.get('GROQ_WHISPER_MODEL'),
          language: 'es',
          response_format: 'text',
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), this.config.get('GROQ_TIMEOUT'))
        ),
      ]);
      transcription = response as string;
    } catch (error) {
      console.error('[VoiceService] Groq Whisper error:', error.message);
      // Fallback: sin transcripción, formulario vacío
      return { transcription: null, fields: null, fallback: 'groq_failed' };
    }

    // Paso 2: Extraer entidades con Claude API
    const fields = await this.claudeService.extractFormFields(transcription, formType);

    if (!fields) {
      // Fallback: mostrar transcripción cruda para llenado manual
      return { transcription, fields: null, fallback: 'claude_failed' };
    }

    return { transcription, fields, fallback: null };
  }
}
```

### Respuesta al cliente

```typescript
// Flutter interpreta el campo `fallback` para saber qué mostrar:
// fallback: null          → prerrellenar el formulario con `fields`
// fallback: 'claude_failed' → mostrar `transcription` en campo de texto
// fallback: 'groq_failed'   → mostrar mensaje de error, formulario vacío
```

---

## Formatos de audio aceptados

Groq Whisper acepta: `flac`, `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `ogg`,
`wav`, `webm`. Flutter graba en `webm` por defecto con el paquete `record`.

El archivo se recibe en NestJS vía `multer` como `multipart/form-data`
con el campo `audio`.

```typescript
// src/voice/voice.controller.ts
@Post('transcribe')
@UseInterceptors(FileInterceptor('audio'))
async transcribe(
  @UploadedFile() file: Express.Multer.File,
  @Body('formType') formType: string,
) {
  return this.voiceService.processAudio(file.buffer, file.mimetype, formType);
}
```

---

## SDK

```bash
pnpm add groq-sdk
```

Versión usada: ver `package.json`.
# ADR-0011 — Estrategia de caché en memoria

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** Transversal (REP-1, IA-1, VOZ-1, OPS-4)

---

## Contexto

Varias consultas del sistema se ejecutan con alta frecuencia sobre datos
que cambian raramente. Sin caché, cada request genera una query innecesaria
a la BD o una llamada repetida a una API externa. Se necesita una estrategia
de caché simple, sin infraestructura adicional (sin Redis), adecuada para
un servidor de instancia única.

## Qué se cachea y por qué

**Schema de la BD para Claude API (IA-1, VOZ-1)**
El system prompt que se envía a Claude en IA-1 y VOZ-1 incluye el schema
completo de las tablas permitidas. Este schema nunca cambia en tiempo de
ejecución. Sin caché, se regenera en cada request aunque sea idéntico.
TTL: indefinido (hasta reinicio del servidor).

**Lista de productos activos (OPS-4)**
Cada vez que el mozo o cajero crea una orden, Flutter consulta los productos
activos para mostrar el menú. Esta lista cambia solo cuando el dueño
modifica un producto, lo que ocurre raramente durante el turno.
TTL: 5 minutos. Se invalida manualmente cuando el dueño actualiza un producto.

**Patrones de parseo de billeteras (PAG-1)**
Los patrones regex para parsear notificaciones de Yape, Plin y Ágora se
almacenan en el backend. La app Kotlin los descarga al iniciar. Cambian
solo si una billetera modifica su formato de notificación.
TTL: indefinido (hasta reinicio del servidor).

**Prompt caching de Anthropic (IA-1, IA-2, IA-3, VOZ-1)**
Anthropic ofrece prompt caching a nivel de API: los tokens del system prompt
que se repiten entre llamadas se cobran al 10% del precio normal. Esto no
requiere implementación en el servidor — se activa con el parámetro
`cache_control` en la llamada al SDK. Puede reducir el costo de Claude API
hasta un 90% en los tokens de input que se repiten.

## Qué NO se cachea

- Ventas y órdenes: cambian constantemente durante el turno.
- Dashboard (REP-1): necesita datos en tiempo real por definición.
- Notificaciones de pago: deben aparecer inmediatamente al cajero.
- Cierres de caja: son inmutables pero se consultan raramente.

## Implementación

Se usa **`@nestjs/cache-manager`** con el store en memoria (sin Redis).
Es suficiente para una instancia única y no añade dependencias de infraestructura.

```typescript
// src/app.module.ts
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300, // 5 minutos por defecto
      max: 100, // máximo 100 entradas en memoria
    }),
  ],
})
export class AppModule {}
```

```typescript
// Uso en un servicio — caché del schema para Claude
@Injectable()
export class AIService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private prisma: PrismaService,
  ) {}

  private async getSchema(): Promise<string> {
    const cached = await this.cache.get<string>('db_schema');
    if (cached) return cached;

    const schema = await this.buildSchemaString(); // genera el schema una sola vez
    await this.cache.set('db_schema', schema, 0); // TTL 0 = indefinido
    return schema;
  }
}
```

```typescript
// Invalidación manual al actualizar productos
@Injectable()
export class ProductsService {
  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async update(id: string, dto: UpdateProductDto) {
    const result = await this.prisma.product.update({ where: { id }, data: dto });
    await this.cache.del('active_products'); // invalida el caché
    return result;
  }
}
```

## Decisión

Se usa **caché en memoria con `@nestjs/cache-manager`** sin Redis. Las
claves a cachear son: `db_schema` (indefinido), `active_products` (5 min)
y `wallet_patterns` (indefinido). El prompt caching de Anthropic se activa
en todas las llamadas a Claude API con `cache_control`.

## Consecuencias

- Sin dependencia de Redis. El caché vive en el proceso de NestJS.
- Si el servidor se reinicia, el caché se vacía y se reconstruye en las primeras requests. No es un problema para datos de baja frecuencia de cambio.
- Si en el futuro el sistema escala a múltiples instancias, hay que migrar a Redis. Se documenta en trabajo futuro.
- El caché de productos se invalida explícitamente en cada operación de escritura de `ProductsService`.
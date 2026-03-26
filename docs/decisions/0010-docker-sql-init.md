# ADR-0010 — Inicialización SQL automática via Docker

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** Transversal

---

## Contexto

Tres elementos del schema no pueden ser gestionados por Prisma migrate de
forma nativa o completa:

1. **Vistas SQL** (`v_daily_summary`, `v_product_profitability`) — Prisma 4.9+ permite declararlas en el schema para obtener tipado, pero no las crea con `prisma migrate`. Deben existir en la BD antes de que Prisma las use.
2. **Permisos de tabla** — el rol de la app debe tener bloqueados UPDATE y DELETE sobre `cash_closes` para garantizar la inmutabilidad a nivel de BD. Prisma no gestiona permisos de roles PostgreSQL.
3. **Índices parciales** — `WHERE stock <= min_stock` para OPS-7. Prisma los soporta parcialmente pero con limitaciones en algunos casos de uso.

## Alternativas evaluadas

**Migraciones Prisma con SQL raw**
- Prisma permite incluir SQL arbitrario en una migración con `prisma migrate`.
- Problema: si se hace `prisma migrate reset`, las vistas y permisos se pierden y hay que recordar recrearlos manualmente.
- Mezcla la gestión del schema (responsabilidad de Prisma) con la configuración de la BD (responsabilidad del DBA).

**Script manual post-setup**
- El desarrollador ejecuta `psql -f setup.sql` después de levantar la BD.
- Problema: paso manual que se puede olvidar. No funciona en CI/CD sin configuración adicional.

**Docker `docker-entrypoint-initdb.d`**
- Docker ejecuta automáticamente cualquier archivo `.sql` o `.sh` en `/docker-entrypoint-initdb.d/` la primera vez que el contenedor arranca con un volumen vacío.
- Sin intervención manual. Funciona igual en desarrollo, CI/CD y onboarding de nuevos desarrolladores.
- Los scripts corren en orden alfabético, lo que permite controlar la secuencia.
- Si se necesita recrear (por ejemplo, tras un `pnpm clean`), Docker vuelve a ejecutarlos automáticamente al levantar.

## Decisión

Se usan **scripts SQL en `prisma/sql/`** montados en
`/docker-entrypoint-initdb.d/` via `docker-compose.yml`. Docker los
ejecuta automáticamente al crear el contenedor. Prisma declara las vistas
en `schema.prisma` para obtener tipado, pero no las crea.

## Consecuencias

- Los archivos en `prisma/sql/` son la fuente de verdad para vistas, permisos e índices parciales.
- El flujo de setup es siempre `pnpm dev` — sin pasos manuales adicionales.
- Si se modifica una vista, se hace `pnpm clean` + `pnpm dev:build` para que Docker recree el contenedor con el script actualizado.
- En producción (Railway), los scripts se ejecutan una vez como parte del setup inicial del servidor PostgreSQL.
- Los scripts son idempotentes: usan `CREATE OR REPLACE VIEW` y `CREATE INDEX IF NOT EXISTS` para no fallar si ya existen.
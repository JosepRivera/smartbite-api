# ADR-0001 — Prisma ORM sobre TypeORM

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** Transversal

---

## Contexto

El proyecto necesita un ORM para interactuar con PostgreSQL desde NestJS. Las dos opciones más usadas en el ecosistema Node.js son Prisma y TypeORM.

## Alternativas evaluadas

**TypeORM**
- Es el ORM histórico de NestJS y está documentado en la guía oficial.
- Usa decoradores en las entidades para definir el schema.
- El tipado en tiempo de ejecución es débil: las consultas devuelven `any` salvo que se tipen manualmente.
- Las migraciones se generan a partir de las entidades, lo que puede generar migraciones incorrectas si las entidades están mal configuradas.
- El mantenimiento del proyecto ha sido inconsistente en los últimos años.

**Prisma**
- Define el schema en un archivo `.prisma` separado del código de aplicación.
- Genera un cliente TypeScript completamente tipado a partir del schema. Cualquier consulta incorrecta falla en tiempo de compilación, no en tiempo de ejecución.
- Las migraciones se generan a partir del schema y son predecibles y auditables.
- Prisma Studio permite inspeccionar la base de datos visualmente durante el desarrollo.
- Mantenimiento activo y documentación de alta calidad.

## Decisión

Se usa **Prisma ORM**. El tipado fuerte generado automáticamente reduce errores en consultas complejas y hace el código más mantenible. El schema centralizado en `prisma/schema.prisma` es la fuente de verdad única para la estructura de la base de datos.

## Consecuencias

- El schema de la BD se define en `prisma/schema.prisma`, no en clases de TypeScript.
- Cualquier cambio en la BD requiere una migración generada con `prisma migrate dev`.
- No se usa TypeORM en ninguna parte del proyecto.
- Prisma Client se importa desde `@prisma/client` y se inyecta como servicio en NestJS.
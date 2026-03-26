# ADR-0009 — PostgreSQL sobre otras bases de datos

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** Transversal

---

## Contexto

El proyecto necesita una base de datos relacional para almacenar ventas,
stock, recetas, reportes y cierres de caja. Las alternativas más comunes
en el ecosistema Node.js son PostgreSQL, MySQL y MongoDB.

## Alternativas evaluadas

**MongoDB**
- Modelo de documentos flexible, bueno para schemas que cambian frecuentemente.
- No garantiza transacciones ACID en operaciones multi-documento de forma nativa en versiones anteriores. Aunque MongoDB 4+ las soporta, añade complejidad de configuración.
- El modelo relacional de SmartBite (ventas → ítems → productos → recetas → insumos) es naturalmente tabular, no documental. Modelarlo en documentos anidados genera inconsistencias de datos.
- No tiene permisos a nivel de tabla, necesarios para la inmutabilidad del cierre de caja.

**MySQL**
- Sólido para proyectos relacionales. Buen soporte en Prisma.
- No tiene `gen_random_uuid()` nativo sin extensiones.
- Las vistas materializadas no están disponibles de forma nativa.
- El control de permisos a nivel de tabla es más limitado que PostgreSQL.
- Prisma tiene mejor soporte y más funcionalidades con PostgreSQL.

**PostgreSQL**
- Transacciones ACID completas y confiables.
- `gen_random_uuid()` nativo para PKs sin dependencias externas.
- Permisos a nivel de tabla: el rol de la app puede tener UPDATE/DELETE bloqueados en `cash_closes` directamente desde la BD, garantizando la inmutabilidad a dos niveles (API + BD).
- Vistas y vistas materializadas nativas para las consultas de alto costo de REP-1 y REP-3.
- Índices parciales para OPS-7 (`WHERE stock <= min_stock`).
- `TIMESTAMPTZ` para manejo correcto de zonas horarias sin configuración adicional.
- Soporte de primera clase en Prisma ORM.
- Es el estándar de Railway (plataforma de despliegue elegida para la demo).

## Decisión

Se usa **PostgreSQL 16**. Es la única opción que cubre todos los requisitos
técnicos del proyecto: transacciones atómicas para el descuento de stock,
permisos de tabla para la inmutabilidad del cierre de caja, y vistas para
las consultas complejas de reportes.

## Consecuencias

- El schema se define en `prisma/schema.prisma`. Prisma es la fuente de verdad.
- Las vistas SQL (`v_daily_summary`, `v_product_profitability`) se crean automáticamente via Docker al levantar el entorno. Ver `decisions/0010-docker-sql-init.md`.
- Los permisos de tabla para `cash_closes` se aplican via script SQL en el mismo init de Docker.
- Los índices parciales que Prisma no soporta bien se declaran también en el script SQL de init.
- No se usa MySQL ni MongoDB en ninguna parte del proyecto.
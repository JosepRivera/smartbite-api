<div align="center">

# SmartBite API

[![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white&labelColor=E0234E&color=2d2d2d)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-V6-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=3178C6&color=2d2d2d)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-V16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=4169E1&color=2d2d2d)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?style=for-the-badge&logo=prisma&logoColor=white&labelColor=2D3748&color=2d2d2d)](https://www.prisma.io/)
[![Node.js](https://img.shields.io/badge/Node.js-v24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=339933&color=2d2d2d)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-v29-2496ED?style=for-the-badge&logo=docker&logoColor=white&labelColor=2496ED&color=2d2d2d)](https://www.docker.com/)
[![pnpm](https://img.shields.io/badge/pnpm-v10-F69220?style=for-the-badge&logo=pnpm&logoColor=white&labelColor=F69220&color=2d2d2d)](https://pnpm.io/)
[![Biome](https://img.shields.io/badge/Biome-v2-60A5FA?style=for-the-badge&logo=biome&logoColor=white&labelColor=60A5FA&color=2d2d2d)](https://biomejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-v4-2d2d2d?style=for-the-badge&logo=vitest&logoColor=6E9F18&labelColor=000000&color=2d2d2d)](https://vitest.dev/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white&labelColor=000000&color=2d2d2d)](https://jwt.io/)
[![Zod](https://img.shields.io/badge/Zod-v4-3E67B1?style=for-the-badge&logo=zod&logoColor=white&labelColor=3E67B1&color=2d2d2d)](https://zod.dev/)
[![Kotlin](https://img.shields.io/badge/Kotlin-v2-000000?style=for-the-badge&logo=kotlin&logoColor=7F52FF&labelColor=000000&color=2d2d2d)](https://kotlinlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Platform-1a2e2a?style=for-the-badge&logo=supabase&logoColor=3ECF8E&labelColor=11181C&color=2d2d2d)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Render-Platform-FFFFFF?style=for-the-badge&logo=render&logoColor=black&labelColor=FFFFFF&color=2d2d2d)](https://render.com/)
[![Anthropic](https://img.shields.io/badge/Claude-V4.6-CC785C?style=for-the-badge&logo=anthropic&logoColor=white&labelColor=CC785C&color=2d2d2d)](https://www.anthropic.com/)
[![Groq](https://img.shields.io/badge/Groq-V3-F55036?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F55036&color=2d2d2d)](https://groq.com/)

**Backend REST para el sistema de gestión inteligente SmartBite.**

</div>

SmartBite es un sistema de gestión para restaurantes y negocios de comida rápida en el Perú, diseñado para negocios con entre 3 y 20 empleados que operan con pagos mixtos (efectivo, Yape, Plin, Ágora). El backend centraliza ventas, stock, recetas, reportes y cierre de caja. Incorpora inteligencia artificial para predicción de demanda (Holt-Winters + Claude API) y consultas en lenguaje natural (Text-to-SQL). Los pagos digitales se resuelven con una app Android nativa en Kotlin que intercepta notificaciones de Yape, Plin y Ágora con `NotificationListenerService`, sin depender de terceros.

La autenticación es gestionada por **Supabase Auth**: el dueño entra con Google OAuth, los empleados con usuario y contraseña. NestJS no firma tokens ni gestiona sesiones — solo los valida.

---

## Roadmap

| Código | Funcionalidad | Estado |
| ------ | ------------- | ------ |
| AUTH-1 | Autenticación y sesiones (Supabase Auth) | ✅ |
| AUTH-2 | Gestión de empleados y roles | ✅ |
| OPS-1  | Productos y precios | ✅ |
| OPS-2  | Insumos y stock | ✅ |
| OPS-3  | Recetas por producto | 🔧 |
| OPS-4  | Registro de ventas con cobro | ⏳ |
| OPS-5  | Gastos y compras | ⏳ |
| OPS-6  | Historial y corrección de ventas | ⏳ |
| OPS-7  | Alertas de stock bajo | ⏳ |
| REP-1  | Dashboard en tiempo real | ⏳ |
| REP-2  | Reportes por período | ⏳ |
| REP-3  | Rentabilidad por producto | ⏳ |
| REP-4  | Cierre de caja diario inmutable | ⏳ |
| IA-1   | Asistente conversacional (Text-to-SQL) | ⏳ |
| IA-2   | Predicción de demanda (Holt-Winters) | ⏳ |
| IA-3   | Recomendador de compras (MRP) | ⏳ |
| IA-4   | Plan de producción diario | ⏳ |
| VOZ-1  | Registro por voz (Voice-to-Form) | ⏳ |
| PAG-1  | Listener Yape / Plin / Ágora | ⏳ |

✅ Completado · 🔧 En desarrollo · ⏳ Pendiente

### Orden de implementación

El orden respeta dependencias: cada módulo necesita los anteriores para funcionar correctamente.

| # | Código | Depende de |
|---|--------|-----------|
| 1 | AUTH-1, AUTH-2 | — |
| 2 | OPS-1 | — |
| 3 | OPS-2 | — |
| 4 | OPS-3 | OPS-1, OPS-2 |
| 5 | OPS-4 | OPS-1, OPS-3 (descuento de stock) |
| 6 | OPS-5 | — |
| 7 | OPS-6 | OPS-4 |
| 8 | OPS-7 | OPS-2, OPS-4 |
| 9 | REP-1 | OPS-4, OPS-5 |
| 10 | REP-2 | OPS-4 |
| 11 | REP-3 | OPS-1, OPS-2, OPS-3 |
| 12 | REP-4 | OPS-4, OPS-5 |
| 13 | IA-1 | Cualquier módulo con datos |
| 14 | IA-2 | OPS-4 (historial de ventas) |
| 15 | IA-3 | IA-2, OPS-2, OPS-3 |
| 16 | IA-4 | IA-2 |
| 17 | VOZ-1 | OPS-2, OPS-4, OPS-5 |
| 18 | PAG-1 | OPS-4 |

**Próximo:** OPS-4 — registro de ventas con cobro.

---

## Setup

**Requisitos:** Docker, Docker Compose, pnpm y un proyecto en [supabase.com](https://supabase.com).

```bash
git clone https://github.com/tu-usuario/smartbite-api.git
cd smartbite-api
pnpm install
cp .env.example .env
```

Completar en el `.env`: `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (Settings → API en el dashboard de Supabase). El resto ya tiene valores por defecto para desarrollo local.

### Desarrollo

```bash
pnpm dev
```

Levanta PostgreSQL local + API en modo watch. Al iniciar aplica migraciones, vistas e índices automáticamente.

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

### Tests

```bash
pnpm test           # Tests unitarios (Vitest)
pnpm test:e2e       # Tests de integración en Docker aislado
pnpm test:e2e:down  # Limpia los contenedores de test
```

### Producción / Staging (Supabase cloud)

```bash
# 1. Ejecutar prisma/supabase-setup.sql en el SQL Editor de Supabase (solo una vez)
# 2. Actualizar .env con las URLs de Supabase cloud (Settings → Database)
pnpm db:baseline    # Registrar el baseline de migraciones (solo primera vez)
docker compose up   # Inicia la API contra Supabase cloud
```

---

## Comandos

| Comando            | Descripción                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `pnpm dev`         | Inicia PostgreSQL local + API en modo watch                               |
| `pnpm dev:build`   | Reconstruye imágenes (usar al agregar dependencias o cambiar Dockerfile)  |
| `pnpm stop`        | Detiene los contenedores (la BD persiste en el volumen Docker)            |
| `pnpm shell`       | Shell interactiva dentro del contenedor de la app                         |
| `pnpm db:migrate`  | Crea y aplica una nueva migración                                         |
| `pnpm db:baseline` | Registra el baseline en Supabase cloud (solo primera vez)                 |
| `pnpm db:seed`     | Carga 6 meses de datos sintéticos de prueba                               |
| `pnpm db:gen`      | Regenera el cliente Prisma (solo si editás el schema fuera de Docker)     |
| `pnpm test`        | Tests unitarios con Vitest                                                |
| `pnpm test:e2e`    | Tests de integración en Docker                                            |
| `pnpm lint`        | Lint y auto-fix con Biome                                                 |
| `pnpm check`       | Lint + format en un solo comando                                          |
| `pnpm build`       | Compila TypeScript a `dist/`                                              |

---

## Documentación

| Documento | Contenido |
| --------- | --------- |
| [`docs/features.md`](./docs/features.md) | Las 19 funcionalidades del sistema |
| [`docs/architecture.md`](./docs/architecture.md) | Stack, módulos y decisiones técnicas |
| [`docs/database-schema.md`](./docs/database-schema.md) | Tablas, relaciones, índices y constraints |
| [`docs/api/01-auth.md`](./docs/api/01-auth.md) | Endpoints de autenticación |
| [`docs/api/02-users.md`](./docs/api/02-users.md) | Gestión de empleados y roles |
| [`docs/api/06-payments.md`](./docs/api/06-payments.md) | Listener de pagos digitales |

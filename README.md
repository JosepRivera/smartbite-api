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
[![Vitest](https://img.shields.io/badge/Vitest-v4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white&labelColor=6E9F18&color=2d2d2d)](https://vitest.dev/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white&labelColor=000000&color=2d2d2d)](https://jwt.io/)
[![Anthropic](https://img.shields.io/badge/Claude-V4.5-CC785C?style=for-the-badge&logo=anthropic&logoColor=white&labelColor=CC785C&color=2d2d2d)](https://www.anthropic.com/)
[![Groq](https://img.shields.io/badge/Groq-Whisper-F55036?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F55036&color=2d2d2d)](https://groq.com/)

**Backend del sistema de gestión inteligente para restaurantes.**  
Gestión de ventas, stock, recetas, reportes financieros, predicción de demanda
y pagos digitales con Yape, Plin y Ágora.

</div>

---

## Tabla de contenidos

- [SmartBite API](#smartbite-api)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [Descripción](#descripción)
  - [Funcionalidades](#funcionalidades)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Esquema de base de datos](#esquema-de-base-de-datos)
  - [Variables de entorno](#variables-de-entorno)
  - [Instalación y configuración](#instalación-y-configuración)
    - [Requisitos previos](#requisitos-previos)
    - [Pasos](#pasos)
  - [Flujos de trabajo frecuentes](#flujos-de-trabajo-frecuentes)
    - [Agregar o actualizar dependencias](#agregar-o-actualizar-dependencias)
    - [Crear una migración de base de datos](#crear-una-migración-de-base-de-datos)
    - [Cargar datos de prueba](#cargar-datos-de-prueba)
  - [Comandos disponibles](#comandos-disponibles)
    - [Desarrollo](#desarrollo)
    - [Base de datos](#base-de-datos)
    - [Cuándo usar cada comando de BD](#cuándo-usar-cada-comando-de-bd)
    - [Tests](#tests)
    - [Calidad de código](#calidad-de-código)
  - [Documentación de la API](#documentación-de-la-api)

---

## Descripción

**SmartBite API** es el backend de un sistema de gestión inteligente para
restaurantes y negocios de comida rápida medianos en el Perú. Está diseñado
para negocios con entre 3 y 20 empleados que actualmente operan sin sistema
digital, con pagos mixtos en efectivo y billeteras digitales (Yape, Plin, Ágora).

El sistema centraliza la operación del restaurante: registro de ventas por rol
(mozo, cajero, cocinero), control de stock con descuento automático por receta,
reportes financieros y cierre de caja inmutable. Incorpora inteligencia artificial
para consultas en lenguaje natural (Text-to-SQL), predicción de demanda con el
algoritmo Holt-Winters y registro por voz en operaciones frecuentes.

La integración de pagos digitales se resuelve con una app Android nativa en Kotlin
que intercepta notificaciones de Yape, Plin y Ágora usando `NotificationListenerService`,
sin depender de servicios de terceros.

Desarrollado como proyecto de pre-tesis en Tecsup, carrera Diseño y Desarrollo
de Software, 2026-1, línea StartUp.

---

## Funcionalidades

| Módulo                         | Descripción                                                         | Estado          |
| ------------------------------ | ------------------------------------------------------------------- | --------------- |
| **AUTH-1** Autenticación JWT   | Login, logout y renovación de tokens con refresh tokens             | ✅ Completado |
| **AUTH-2** Gestión de personal | El dueño crea y administra cuentas de empleados con roles           | ✅ Completado |
| **OPS-1** Productos            | CRUD de productos y precios de la carta                             | 🔧 En desarrollo |
| **OPS-2** Insumos y stock      | CRUD de insumos con descuento automático al confirmar ventas        | 🔧 En desarrollo |
| **OPS-3** Recetas              | Relación producto-insumo que alimenta el stock y el MRP             | 🔧 En desarrollo |
| **OPS-4** Registro de ventas   | Órdenes con ticket, cobro múltiple y estados de pago                | 🔧 En desarrollo |
| **OPS-5** Gastos               | Registro de gastos operativos para el cierre de caja                | 🔧 En desarrollo |
| **OPS-6** Historial de ventas  | Listado filtrable y corrección de órdenes por el dueño              | 🔧 En desarrollo |
| **OPS-7** Alertas de stock     | Notificación cuando un insumo cae bajo el umbral mínimo             | 🔧 En desarrollo |
| **REP-1** Dashboard            | Resumen en tiempo real del día: ventas, ingresos y productos top    | 🔧 En desarrollo |
| **REP-2** Reportes por período | Ventas agrupadas por día, semana o mes con filtro por empleado      | 🔧 En desarrollo |
| **REP-3** Rentabilidad         | Margen por producto calculado desde la receta                       | 🔧 En desarrollo |
| **REP-4** Cierre de caja       | Registro diario inmutable con desglose efectivo vs digital          | 🔧 En desarrollo |
| **IA-1** Text-to-SQL           | Asistente conversacional en lenguaje natural usando Claude API      | 🔧 En desarrollo |
| **IA-2** Predicción de demanda | Algoritmo Holt-Winters propio + ajuste contextual con Claude API    | 🔧 En desarrollo |
| **IA-3** Recomendador MRP      | Lista de compras calculada desde predicción y stock actual          | 🔧 En desarrollo |
| **IA-4** Plan de producción    | Plan diario precalculado por cron job a las 6 am                    | 🔧 En desarrollo |
| **VOZ-1** Voice-to-Form        | Transcripción con Groq Whisper + extracción de entidades con Claude | 🔧 En desarrollo |
| **PAG-1** Listener de pagos    | App Kotlin que intercepta notificaciones de Yape, Plin y Ágora      | 🔧 En desarrollo |

---

## Estructura del proyecto
```
smartbite-api/
├── docs/
│   ├── api/                  # Documentación de endpoints por módulo
│   ├── decisions/            # Architecture Decision Records (ADRs)
│   ├── integrations/         # Claude API, Groq Whisper, listener Kotlin
│   ├── assets/               # Diagramas ER y de arquitectura
│   ├── architecture.md       # Visión general del sistema
│   ├── database-schema.md    # Tablas, índices, constraints y relaciones
│   └── api-conventions.md    # Reglas generales de la API
├── prisma/
│   ├── migrations/           # Historial de migraciones
│   ├── schema.prisma         # Definición del modelo de datos
│   └── seed.ts               # Seeder con 6 meses de datos sintéticos
├── src/
│   ├── auth/                 # Login, logout, refresh de tokens
│   ├── users/                # Gestión de empleados y roles
│   ├── products/             # CRUD de productos
│   ├── ingredients/          # CRUD de insumos y stock
│   ├── recipes/              # Recetas por producto
│   ├── sales/                # Órdenes, cobros, historial y corrección
│   ├── expenses/             # Registro de gastos
│   ├── cash-closes/          # Cierre de caja inmutable
│   ├── dashboard/            # Resumen del día en tiempo real
│   ├── reports/              # Reportes por período y rentabilidad
│   ├── ai/                   # Asistente conversacional Text-to-SQL
│   ├── demand/               # Holt-Winters + ajuste Claude API
│   ├── mrp/                  # Motor de recomendación de compras
│   ├── production-plans/     # Plan de producción + cron job 6am
│   ├── voice/                # Transcripción Whisper + extracción Claude
│   ├── payments/             # Notificaciones del listener Kotlin
│   ├── devices/              # Registro y revocación de dispositivos
│   ├── common/               # Guards, decoradores, interceptors, pipes
│   ├── prisma/               # Módulo global de Prisma
│   ├── config/               # Validación de variables de entorno
│   ├── app.module.ts         # Módulo raíz
│   └── main.ts               # Bootstrap: CORS, pipes, prefijo global
├── test/                     # Tests e2e para flujos críticos
├── docker-compose.yml        # Entorno de desarrollo con hot-reload
├── docker-compose.test.yml   # Entorno aislado para tests e2e
├── biome.json                # Configuración de Biome (lint + format)
└── Dockerfile                # Build de desarrollo
```

> Detalles completos de arquitectura en [`docs/architecture.md`](./docs/architecture.md).

---

## Esquema de base de datos

El schema tiene 12 tablas y 3 enums. Los totales del cierre de caja se
persisten de forma intencional para garantizar la inmutabilidad del
registro histórico. Ver [`docs/decisions/0005-cash-close-immutability.md`](./docs/decisions/0005-cash-close-immutability.md).

![Diagrama ER](docs/assets/er-diagram.svg)

Decisiones de diseño destacadas:

- **El stock se descuenta solo al confirmar el cobro**, nunca al crear la orden.
- **Los cierres de caja son inmutables** a nivel de API y de permisos en la BD.
- **Los refresh tokens se guardan como hash** bcrypt, nunca en texto plano.
- **La app Kotlin usa API Key**, no JWT. Ver [`docs/decisions/0004-api-key-auth-for-kotlin.md`](./docs/decisions/0004-api-key-auth-for-kotlin.md).
- **El plan de producción es precalculado** por un cron job a las 6 am. Ver [`docs/decisions/0008-precalculated-production-plan.md`](./docs/decisions/0008-precalculated-production-plan.md).

> Schema completo con columnas, índices y constraints: [`docs/database-schema.md`](./docs/database-schema.md)

---

## Variables de entorno

Copia el archivo de ejemplo antes de iniciar:
```bash
cp .env.example .env
```

| Variable                | Descripción                     | Ejemplo                 |
| ----------------------- | ------------------------------- | ----------------------- |
| `POSTGRES_USER`         | Usuario de PostgreSQL           | `smartbite_user`        |
| `POSTGRES_PASSWORD`     | Contraseña de PostgreSQL        | —                       |
| `POSTGRES_DB`           | Nombre de la base de datos      | `smartbite_db`          |
| `POSTGRES_PORT`         | Puerto expuesto en el host      | `5432`                  |
| `PORT`                  | Puerto en que escucha la API    | `3000`                  |
| `NODE_ENV`              | Entorno de ejecución            | `development`           |
| `JWT_SECRET`            | Clave para firmar access tokens | —                       |
| `JWT_ACCESS_TOKEN_TTL`  | Duración del access token       | `15m`                   |
| `JWT_REFRESH_TOKEN_TTL` | Duración del refresh token      | `7d`                    |
| `CORS_ORIGIN`           | Origen permitido por CORS       | `http://localhost:3000` |
| `BCRYPT_ROUNDS`         | Rondas de bcrypt                | `10`                    |
| `ANTHROPIC_API_KEY`     | API Key de Claude (Anthropic)   | —                       |
| `GROQ_API_KEY`          | API Key de Groq Whisper         | —                       |

> `DATABASE_URL` es construida automáticamente por Docker Compose. Solo
> defínela manualmente si corres fuera de Docker.

> **Nunca** subas tu archivo `.env` al repositorio. Está incluido en
> `.gitignore` por defecto.

---

## Instalación y configuración

### Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose instalados
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- Node.js v20+ (solo si corres fuera de Docker)

### Pasos

**1. Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/smartbite-api.git
cd smartbite-api
```

**2. Configurar variables de entorno**
```bash
cp .env.example .env
# Completar con tus credenciales de PostgreSQL, JWT y las API Keys
```

**3. Instalar dependencias localmente** (opcional, para soporte del IDE)
```bash
pnpm install
```

**4. Iniciar el entorno de desarrollo**
```bash
pnpm dev
```

Esto levanta dos contenedores: `smartbite-postgres-dev` y `smartbite-app-dev`.
La app corre en modo watch — cualquier cambio en `src/` se refleja
automáticamente. Las migraciones pendientes se aplican al iniciar.

- API: `http://localhost:3000`

---

## Flujos de trabajo frecuentes

### Agregar o actualizar dependencias
```bash
pnpm add <paquete>
pnpm dev:build   # reconstruye el contenedor con la nueva dependencia
```

### Crear una migración de base de datos
```bash
# 1. Modificar prisma/schema.prisma
# 2. Crear y aplicar la migración
pnpm db:migrate
```

### Cargar datos de prueba
```bash
pnpm db:seed
# Genera 6 meses de datos sintéticos con variación realista:
# mayor demanda viernes-sábado, picos en feriados peruanos
```

---

## Comandos disponibles

### Desarrollo

| Comando          | Descripción                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| `pnpm dev`       | Inicia el entorno con Docker Compose                                      |
| `pnpm dev:build` | Reconstruye imágenes e inicia (usar al agregar deps o cambiar Dockerfile) |
| `pnpm stop`      | Detiene y elimina los contenedores de desarrollo                          |
| `pnpm shell`     | Abre una shell interactiva dentro del contenedor de la app                |
| `pnpm clean`     | Detiene contenedores y elimina volúmenes — **borra la base de datos**     |

### Base de datos

| Comando           | Descripción                                     |
| ----------------- | ----------------------------------------------- |
| `pnpm db:migrate` | Crea y aplica una nueva migración               |
| `pnpm db:reset`   | Resetea la BD y re-aplica todas las migraciones |
| `pnpm db:seed`    | Carga datos sintéticos de prueba                |
| `pnpm db:gen`     | Regenera el cliente de Prisma                   |

### Cuándo usar cada comando de BD

| Situación                             | Comando                         |
| ------------------------------------- | ------------------------------- |
| Modifiqué `schema.prisma`             | `pnpm db:migrate`               |
| Resetear BD sin borrar contenedores   | `pnpm db:reset`                 |
| Historial de migraciones en conflicto | `pnpm db:reset`                 |
| Cambié el Dockerfile o dependencias   | `pnpm dev:build`                |
| Borrar todo y empezar desde cero      | `pnpm clean` → `pnpm dev:build` |

### Tests

| Comando              | Descripción                                    |
| -------------------- | ---------------------------------------------- |
| `pnpm test`          | Corre los tests unitarios con Vitest           |
| `pnpm test:watch`    | Corre los tests en modo watch                  |
| `pnpm test:cov`      | Tests con reporte de cobertura                 |
| `pnpm test:e2e`      | Tests e2e en Docker                            |
| `pnpm test:e2e:down` | Detiene y elimina los contenedores de test e2e |

### Calidad de código

| Comando       | Descripción                      |
| ------------- | -------------------------------- |
| `pnpm lint`   | Lint y auto-fix con Biome        |
| `pnpm format` | Formatea el código con Biome     |
| `pnpm check`  | Lint + format en un solo comando |
| `pnpm build`  | Compila TypeScript a `dist/`     |

---

## Documentación de la API

Una vez que el servidor esté corriendo, la documentación Swagger está
disponible en:
```
http://localhost:3000/api/docs
```

Los endpoints protegidos requieren un Bearer Token. Obténlo desde
`POST /api/v1/auth/login` y pégalo en el botón **Authorize** de Swagger UI.

La documentación detallada de cada módulo está en `docs/api/`:

| Archivo                                                | Módulo                              |
| ------------------------------------------------------ | ----------------------------------- |
| [`docs/api/01-auth.md`](./docs/api/01-auth.md)         | Autenticación y gestión de personal |
| [`docs/api/02-ops.md`](./docs/api/02-ops.md)           | Gestión operativa                   |
| [`docs/api/03-reports.md`](./docs/api/03-reports.md)   | Reportes y cierre de caja           |
| [`docs/api/04-ai.md`](./docs/api/04-ai.md)             | Inteligencia artificial             |
| [`docs/api/05-voice.md`](./docs/api/05-voice.md)       | Registro por voz                    |
| [`docs/api/06-payments.md`](./docs/api/06-payments.md) | Pagos digitales                     |

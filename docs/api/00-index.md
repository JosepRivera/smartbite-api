# Índice de la API · docs/api/00-index.md

> Referencia completa de todos los endpoints de SmartBite.
> Ver el Swagger en `http://localhost:3000/api/docs` para explorar los endpoints interactivamente.

---

## Autenticación · `docs/api/01-auth.md`

| Método | Endpoint              | Descripción                              | Roles   |
| ------ | --------------------- | ---------------------------------------- | ------- |
| POST   | /auth/login           | Iniciar sesión con usuario y contraseña  | Público |
| POST   | /auth/logout          | Cerrar todas las sesiones activas        | Todos   |
| POST   | /auth/refresh         | Renovar access token                     | Público |
| POST   | /auth/forgot-password | Solicitar recuperación de contraseña     | Público |
| POST   | /auth/reset-password  | Cambiar contraseña con token de recovery | JWT     |

---

## Empleados y roles · `docs/api/02-users.md`

| Método | Endpoint   | Descripción                                  | Roles               |
| ------ | ---------- | -------------------------------------------- | ------------------- |
| GET    | /users     | Listar empleados                             | OWNER               |
| POST   | /users     | Crear empleado                               | OWNER               |
| GET    | /users/:id | Obtener perfil (propio o ajeno si es OWNER)  | Todos               |
| PATCH  | /users/:id | Editar empleado (OWNER) o cambiar contraseña | Todos (con límites) |
| DELETE | /users/:id | Desactivar empleado (soft delete)            | OWNER               |

---

## Gestión operativa · `docs/api/02-ops.md`

| Método | Endpoint            | Descripción               | Roles                  |
| ------ | ------------------- | ------------------------- | ---------------------- |
| GET    | /products           | Listar productos          | Todos                  |
| POST   | /products           | Crear producto            | OWNER                  |
| GET    | /products/:id       | Obtener producto          | Todos                  |
| PATCH  | /products/:id       | Editar producto           | OWNER                  |
| DELETE | /products/:id       | Desactivar producto       | OWNER                  |
| GET    | /ingredients        | Listar insumos            | OWNER                  |
| POST   | /ingredients        | Crear insumo              | OWNER                  |
| GET    | /ingredients/:id    | Obtener insumo            | OWNER                  |
| PATCH  | /ingredients/:id    | Editar insumo / stock     | OWNER                  |
| GET    | /recipes/:productId | Obtener receta            | OWNER                  |
| PUT    | /recipes/:productId | Crear o reemplazar receta | OWNER                  |
| GET    | /sales              | Listar órdenes            | Todos                  |
| POST   | /sales              | Crear orden               | OWNER, CASHIER, WAITER |
| GET    | /sales/:id          | Obtener orden             | Todos                  |
| GET    | /sales/:id/receipt  | Ticket de la orden        | OWNER, CASHIER, WAITER |
| PATCH  | /sales/:id/status   | Cobrar o cancelar         | OWNER, CASHIER, WAITER |
| POST   | /sales/bulk-pay     | Cobro múltiple            | OWNER, CASHIER         |
| PATCH  | /sales/:id          | Corregir venta (OPS-6)    | OWNER                  |
| GET    | /expenses           | Listar gastos             | OWNER                  |
| POST   | /expenses           | Registrar gasto           | OWNER                  |

---

## Reportes · `docs/api/03-reports.md`

| Método | Endpoint               | Descripción               | Roles |
| ------ | ---------------------- | ------------------------- | ----- |
| GET    | /dashboard             | Resumen del día           | OWNER |
| GET    | /reports/periods       | Ventas por período        | OWNER |
| GET    | /reports/profitability | Rentabilidad por producto | OWNER |
| GET    | /cash-closes           | Historial de cierres      | OWNER |
| POST   | /cash-closes           | Generar cierre del día    | OWNER |
| GET    | /cash-closes/:id       | Obtener cierre            | OWNER |

---

## Inteligencia artificial · `docs/api/04-ai.md`

| Método | Endpoint                     | Descripción                | Roles |
| ------ | ---------------------------- | -------------------------- | ----- |
| POST   | /ai/query                    | Asistente conversacional   | OWNER |
| GET    | /mrp                         | Recomendador de compras    | OWNER |
| GET    | /production-plans/today      | Plan de producción del día | Todos |
| POST   | /production-plans/regenerate | Regenerar plan manualmente | OWNER |

---

## Voz · `docs/api/05-voice.md`

| Método | Endpoint          | Descripción                        | Roles |
| ------ | ----------------- | ---------------------------------- | ----- |
| POST   | /voice/transcribe | Transcribir audio y extraer campos | Todos |

---

## Pagos · `docs/api/06-payments.md`

| Método | Endpoint                           | Descripción                   | Roles          |
| ------ | ---------------------------------- | ----------------------------- | -------------- |
| POST   | /payments/notifications            | Recibir notificación Kotlin   | API Key        |
| GET    | /payments/notifications            | Listar notificaciones del día | OWNER, CASHIER |
| PATCH  | /payments/notifications/:id/review | Marcar como revisada          | OWNER, CASHIER |
| POST   | /devices/register                  | Registrar dispositivo         | OWNER          |
| GET    | /devices                           | Listar dispositivos           | OWNER          |
| POST   | /devices/:id/revoke                | Revocar dispositivo           | OWNER          |

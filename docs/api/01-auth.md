# Autenticación · docs/api/01-auth.md

> Gestión de sesiones y cuentas de usuario.

---

## Valores de referencia (usados en todos los ejemplos)

| Variable        | Valor                                        |
| --------------- | -------------------------------------------- |
| `OWNER_ID`      | `a1b2c3d4-e5f6-7890-abcd-ef1234567890`       |
| `CASHIER_ID`    | `b2c3d4e5-f6a7-8901-bcde-f12345678901`       |
| `ACCESS_TOKEN`  | `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiMmMzZDRlNS1mNmE3LTg5MDEtYmNkZS1mMTIzNDU2Nzg5MDEiLCJyb2xlIjoiQ0FTSElFUiIsImlhdCI6MTc0MzE2ODAwMCwiZXhwIjoxNzQzMTY4OTAwfQ.sig` |
| `REFRESH_TOKEN` | `a8f5f167f44f4964e6c998dee827110c8a5b3d2e1b7c4f9a0e3d6b9c2f1e4d7a` |

---

## Índice

- [Login · POST /auth/login](#login--post-authlogin)
- [Refresh · POST /auth/refresh](#refresh--post-authrefresh)
- [Logout · POST /auth/logout](#logout--post-authlogout)
- [Listar empleados · GET /users](#listar-empleados--get-users)
- [Crear empleado · POST /users](#crear-empleado--post-users)
- [Obtener por ID · GET /users/:id](#obtener-por-id--get-usersid)
- [Editar empleado · PATCH /users/:id](#editar-empleado--patch-usersid)
- [Desactivar empleado · DELETE /users/:id](#desactivar-empleado--delete-usersid)

---

### Login · POST /auth/login

> Autentica al usuario y devuelve un access token y un refresh token.
> Es el único endpoint público del sistema.

**Autenticación:** No requerida

---

#### Request body

| Campo      | Tipo   | Requerido | Validación | Descripción       |
| ---------- | ------ | --------- | ---------- | ----------------- |
| `username` | string | ✅         | min 1      | Nombre de usuario |
| `password` | string | ✅         | min 1      | Contraseña        |

---

#### Ejemplo de request

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ana.garcia",
    "password": "secreto123"
  }'
```

---

#### Respuesta exitosa · `200 OK`
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiMmMzZDRlNS1mNmE3LTg5MDEtYmNkZS1mMTIzNDU2Nzg5MDEiLCJyb2xlIjoiQ0FTSElFUiIsImlhdCI6MTc0MzE2ODAwMCwiZXhwIjoxNzQzMTY4OTAwfQ.sig",
    "refresh_token": "a8f5f167f44f4964e6c998dee827110c8a5b3d2e1b7c4f9a0e3d6b9c2f1e4d7a"
  }
}
```

---

#### Casos de error

| Status | Error        | Causa                           |
| ------ | ------------ | ------------------------------- |
| 400    | Bad Request  | Campos requeridos faltantes     |
| 401    | Unauthorized | Credenciales incorrectas        |
| 403    | Forbidden    | Cuenta desactivada por el dueño |

**400 — Campos faltantes**
```json
{
  "message": ["El usuario es requerido", "La contraseña es requerida"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**401 — Credenciales incorrectas**
```json
{
  "message": "Credenciales incorrectas",
  "error": "Unauthorized",
  "statusCode": 401
}
```

> **Nota:** El mismo mensaje se devuelve tanto si el usuario no existe como si la contraseña es incorrecta, para no revelar cuál de los dos falló.

**403 — Cuenta desactivada**
```json
{
  "message": "Cuenta desactivada",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

### Refresh · POST /auth/refresh

> Renueva el access token usando el refresh token. No requiere que el usuario
> vuelva a ingresar su contraseña.

**Autenticación:** No requerida

---

#### Request body

| Campo           | Tipo   | Requerido | Descripción          |
| --------------- | ------ | --------- | -------------------- |
| `refresh_token` | string | ✅         | Refresh token válido |

---

#### Ejemplo de request

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "a8f5f167f44f4964e6c998dee827110c8a5b3d2e1b7c4f9a0e3d6b9c2f1e4d7a"
  }'
```

---

#### Respuesta exitosa · `200 OK`
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiMmMzZDRlNS1mNmE3LTg5MDEtYmNkZS1mMTIzNDU2Nzg5MDEiLCJyb2xlIjoiQ0FTSElFUiIsImlhdCI6MTc0MzE2ODEwMCwiZXhwIjoxNzQzMTY5MDAwfQ.sig",
    "refresh_token": "b9e6a278055f507df7daa9eff938221d9b6c4e3f2c8d5fab1f4e7cad3a2f5e8b"
  }
}
```

> **Nota:** Cada llamada a refresh rota los tokens: el refresh token enviado queda revocado y se devuelve uno nuevo. Usar el token antiguo después de rotar devuelve `401 Refresh token revocado`.

---

#### Casos de error

| Status | Error        | Causa                             |
| ------ | ------------ | --------------------------------- |
| 401    | Unauthorized | Refresh token inválido o revocado |
| 401    | Unauthorized | Refresh token expirado            |

**401 — Refresh token inválido**
```json
{
  "message": "Refresh token inválido",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**401 — Refresh token revocado**
```json
{
  "message": "Refresh token revocado",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**401 — Refresh token expirado**
```json
{
  "message": "Refresh token expirado",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### Logout · POST /auth/logout

> Revoca el refresh token de la sesión actual. El access token sigue válido
> hasta que expire (15 minutos).

**Autenticación:** Requiere Bearer token

---

#### Request body

| Campo           | Tipo   | Requerido | Descripción             |
| --------------- | ------ | --------- | ----------------------- |
| `refresh_token` | string | ✅         | Refresh token a revocar |

---

#### Ejemplo de request

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiMmMzZDRlNS1mNmE3LTg5MDEtYmNkZS1mMTIzNDU2Nzg5MDEiLCJyb2xlIjoiQ0FTSElFUiIsImlhdCI6MTc0MzE2ODAwMCwiZXhwIjoxNzQzMTY4OTAwfQ.sig" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "a8f5f167f44f4964e6c998dee827110c8a5b3d2e1b7c4f9a0e3d6b9c2f1e4d7a"
  }'
```

---

#### Respuesta exitosa · `200 OK`
```json
{
  "data": {
    "message": "Sesión cerrada"
  }
}
```

---

#### Casos de error

| Status | Error        | Causa                    |
| ------ | ------------ | ------------------------ |
| 401    | Unauthorized | Token ausente o inválido |

**401 — Token ausente**
```json
{
  "message": "Token ausente",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**401 — Token inválido o expirado**
```json
{
  "message": "Token inválido o expirado",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

### Listar empleados · GET /users

> Devuelve todos los usuarios del sistema incluyendo desactivados.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Ejemplo de request

```bash
curl -X GET http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJyb2xlIjoiT1dORVIiLCJpYXQiOjE3NDMxNjgwMDAsImV4cCI6MTc0MzE2ODkwMH0.sig"
```

---

#### Respuesta exitosa · `200 OK`
```json
{
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Carlos Mendoza",
      "username": "carlos.dueno",
      "role": "OWNER",
      "isActive": true,
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-03-28T08:00:00.000Z"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "Ana García",
      "username": "ana.garcia",
      "role": "CASHIER",
      "isActive": true,
      "createdAt": "2026-02-10T09:15:00.000Z",
      "updatedAt": "2026-02-10T09:15:00.000Z"
    }
  ]
}
```

---

#### Casos de error

| Status | Error        | Causa                    |
| ------ | ------------ | ------------------------ |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Rol sin permiso          |

**401 — Token ausente o inválido**
```json
{
  "message": "Token ausente",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**403 — Rol sin permiso**
```json
{
  "message": "No tienes permiso para esta acción",
  "error": "Forbidden",
  "statusCode": 403
}
```

---

### Crear empleado · POST /users

> Crea una cuenta de empleado. Solo el dueño puede hacerlo.
> No existe registro público.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Request body

| Campo      | Tipo      | Requerido | Validación                              | Descripción             |
| ---------- | --------- | --------- | --------------------------------------- | ----------------------- |
| `name`     | string    | ✅         | min 1, max 100                          | Nombre completo         |
| `username` | string    | ✅         | min 3, max 50, solo letras/números/`_`/`-` | Nombre de usuario único |
| `password` | string    | ✅         | min 6, max 128                          | Contraseña inicial      |
| `role`     | role_enum | ✅         | `CASHIER`, `WAITER`, `COOK`             | Rol del empleado        |

---

#### Ejemplo de request

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJyb2xlIjoiT1dORVIiLCJpYXQiOjE3NDMxNjgwMDAsImV4cCI6MTc0MzE2ODkwMH0.sig" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana García",
    "username": "ana.garcia",
    "password": "clave456",
    "role": "CASHIER"
  }'
```

---

#### Respuesta exitosa · `201 Created`
```json
{
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Ana García",
    "username": "ana.garcia",
    "role": "CASHIER",
    "isActive": true,
    "createdAt": "2026-03-28T14:20:00.000Z",
    "updatedAt": "2026-03-28T14:20:00.000Z"
  }
}
```

---

#### Casos de error

| Status | Error        | Causa                    |
| ------ | ------------ | ------------------------ |
| 400    | Bad Request  | Validación fallida       |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Rol sin permiso          |
| 409    | Conflict     | Username ya existe       |

**400 — Validación fallida**
```json
{
  "message": ["El nombre es requerido", "El usuario debe tener al menos 3 caracteres"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**401 — Token ausente o inválido**
```json
{
  "message": "Token ausente",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**403 — Rol sin permiso**
```json
{
  "message": "No tienes permiso para esta acción",
  "error": "Forbidden",
  "statusCode": 403
}
```

**409 — Username ya existe**
```json
{
  "message": "El username ya está en uso",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### Obtener por ID · GET /users/:id

> Devuelve el perfil de un usuario por su ID.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER` (cualquier usuario), resto de roles (solo su propio perfil)

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| `id`      | UUID | ID del usuario |

---

#### Ejemplo de request

```bash
curl -X GET http://localhost:3000/api/v1/users/b2c3d4e5-f6a7-8901-bcde-f12345678901 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiMmMzZDRlNS1mNmE3LTg5MDEtYmNkZS1mMTIzNDU2Nzg5MDEiLCJyb2xlIjoiQ0FTSElFUiIsImlhdCI6MTc0MzE2ODAwMCwiZXhwIjoxNzQzMTY4OTAwfQ.sig"
```

---

#### Respuesta exitosa · `200 OK`
```json
{
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Ana García",
    "username": "ana.garcia",
    "role": "CASHIER",
    "isActive": true,
    "createdAt": "2026-02-10T09:15:00.000Z",
    "updatedAt": "2026-02-10T09:15:00.000Z"
  }
}
```

---

#### Casos de error

| Status | Error        | Causa                    |
| ------ | ------------ | ------------------------ |
| 400    | Bad Request  | UUID mal formado         |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Acceso a perfil ajeno    |
| 404    | Not Found    | Usuario no encontrado    |

**400 — UUID mal formado**
```json
{
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```

**401 — Token ausente o inválido**
```json
{
  "message": "Token ausente",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**403 — Acceso a perfil ajeno**
```json
{
  "message": "No tienes permiso para esta acción",
  "error": "Forbidden",
  "statusCode": 403
}
```

**404 — Usuario no encontrado**
```json
{
  "message": "Usuario no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

---

### Editar empleado · PATCH /users/:id

> Edita los datos de un empleado. El dueño puede editar cualquier cuenta.
> Un empleado solo puede cambiar su propia contraseña.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER` (todos los campos), resto de roles (solo `password`)

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| `id`      | UUID | ID del usuario |

---

#### Request body

| Campo       | Tipo      | Requerido | Validación                              | Descripción          |
| ----------- | --------- | --------- | --------------------------------------- | -------------------- |
| `name`      | string    | ❌         | min 1, max 100                          | Nombre completo      |
| `username`  | string    | ❌         | min 3, max 50, solo letras/números/`_`/`-` | Nombre de usuario    |
| `password`  | string    | ❌         | min 6, max 128                          | Nueva contraseña     |
| `role`      | role_enum | ❌         | `CASHIER`, `WAITER`, `COOK`             | Rol del empleado     |
| `is_active` | boolean   | ❌         |                                         | Activar o desactivar |

---

#### Ejemplo de request — OWNER edita empleado

```bash
curl -X PATCH http://localhost:3000/api/v1/users/b2c3d4e5-f6a7-8901-bcde-f12345678901 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJyb2xlIjoiT1dORVIiLCJpYXQiOjE3NDMxNjgwMDAsImV4cCI6MTc0MzE2ODkwMH0.sig" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana García López",
    "role": "CASHIER",
    "is_active": true
  }'
```

#### Ejemplo de request — empleado cambia su propia contraseña

```bash
curl -X PATCH http://localhost:3000/api/v1/users/b2c3d4e5-f6a7-8901-bcde-f12345678901 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJiMmMzZDRlNS1mNmE3LTg5MDEtYmNkZS1mMTIzNDU2Nzg5MDEiLCJyb2xlIjoiQ0FTSElFUiIsImlhdCI6MTc0MzE2ODAwMCwiZXhwIjoxNzQzMTY4OTAwfQ.sig" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "nuevaclave789"
  }'
```

---

#### Respuesta exitosa · `200 OK`
```json
{
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Ana García López",
    "username": "ana.garcia",
    "role": "CASHIER",
    "isActive": true,
    "createdAt": "2026-02-10T09:15:00.000Z",
    "updatedAt": "2026-03-28T15:45:00.000Z"
  }
}
```

---

#### Casos de error

| Status | Error        | Causa                         |
| ------ | ------------ | ----------------------------- |
| 400    | Bad Request  | UUID mal formado o validación |
| 401    | Unauthorized | Token ausente o inválido      |
| 403    | Forbidden    | Rol sin permiso               |
| 404    | Not Found    | Usuario no encontrado         |
| 409    | Conflict     | Username ya existe            |

**400 — UUID mal formado**
```json
{
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```

**400 — Validación fallida**
```json
{
  "message": ["La contraseña debe tener al menos 6 caracteres"],
  "error": "Bad Request",
  "statusCode": 400
}
```

**401 — Token ausente o inválido**
```json
{
  "message": "Token ausente",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**403 — Empleado intenta editar campos restringidos**
```json
{
  "message": "Solo puedes cambiar tu contraseña",
  "error": "Forbidden",
  "statusCode": 403
}
```

**403 — Empleado intenta editar perfil ajeno**
```json
{
  "message": "No tienes permiso para esta acción",
  "error": "Forbidden",
  "statusCode": 403
}
```

**404 — Usuario no encontrado**
```json
{
  "message": "Usuario no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

**409 — Username ya existe**
```json
{
  "message": "El username ya está en uso",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### Desactivar empleado · DELETE /users/:id

> Desactiva la cuenta de un empleado (soft delete). El empleado no puede
> iniciar sesión pero su historial de ventas y registros se conserva.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| `id`      | UUID | ID del usuario |

---

#### Ejemplo de request

```bash
curl -X DELETE http://localhost:3000/api/v1/users/b2c3d4e5-f6a7-8901-bcde-f12345678901 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJyb2xlIjoiT1dORVIiLCJpYXQiOjE3NDMxNjgwMDAsImV4cCI6MTc0MzE2ODkwMH0.sig"
```

---

#### Respuesta exitosa · `200 OK`
```json
{
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Ana García",
    "username": "ana.garcia",
    "role": "CASHIER",
    "isActive": false,
    "createdAt": "2026-02-10T09:15:00.000Z",
    "updatedAt": "2026-03-28T16:00:00.000Z"
  }
}
```

> **Nota:** Es un soft delete. El registro permanece en la base de datos con `isActive: false`. El empleado desactivado no puede hacer login pero su historial queda intacto.

---

#### Casos de error

| Status | Error                | Causa                                 |
| ------ | -------------------- | ------------------------------------- |
| 400    | Bad Request          | UUID mal formado                      |
| 401    | Unauthorized         | Token ausente o inválido              |
| 403    | Forbidden            | Rol sin permiso                       |
| 404    | Not Found            | Usuario no encontrado                 |
| 422    | Unprocessable Entity | No se puede desactivar al único OWNER |

**400 — UUID mal formado**
```json
{
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```

**401 — Token ausente o inválido**
```json
{
  "message": "Token ausente",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**403 — Rol sin permiso**
```json
{
  "message": "No tienes permiso para esta acción",
  "error": "Forbidden",
  "statusCode": 403
}
```

**404 — Usuario no encontrado**
```json
{
  "message": "Usuario no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

**422 — Único OWNER activo**
```json
{
  "message": "No se puede desactivar al único OWNER activo",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```

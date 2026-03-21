# Autenticación · docs/api/01-auth.md

> Gestión de sesiones y cuentas de usuario.

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

**Headers**
```
POST /api/v1/auth/login
Content-Type: application/json
```

**Body**
```json
// pendiente — completar al implementar
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
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
// pendiente
```

**401 — Credenciales incorrectas**
```json
// pendiente
```

**403 — Cuenta desactivada**
```json
// pendiente
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

**Headers**
```
POST /api/v1/auth/refresh
Content-Type: application/json
```

**Body**
```json
// pendiente — completar al implementar
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error        | Causa                             |
| ------ | ------------ | --------------------------------- |
| 401    | Unauthorized | Refresh token inválido o revocado |
| 401    | Unauthorized | Refresh token expirado            |

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

**Headers**
```
POST /api/v1/auth/logout
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**
```json
// pendiente — completar al implementar
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error        | Causa                    |
| ------ | ------------ | ------------------------ |
| 401    | Unauthorized | Token ausente o inválido |

---

### Listar empleados · GET /users

> Devuelve todos los usuarios del sistema incluyendo desactivados.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/users
Authorization: Bearer <token>
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error        | Causa                    |
| ------ | ------------ | ------------------------ |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Rol sin permiso          |

---

### Crear empleado · POST /users

> Crea una cuenta de empleado. Solo el dueño puede hacerlo.
> No existe registro público.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Request body

| Campo      | Tipo      | Requerido | Validación                  | Descripción             |
| ---------- | --------- | --------- | --------------------------- | ----------------------- |
| `name`     | string    | ✅         | min 1, max 100              | Nombre completo         |
| `username` | string    | ✅         | min 3, max 50, sin espacios | Nombre de usuario único |
| `password` | string    | ✅         | min 6                       | Contraseña inicial      |
| `role`     | role_enum | ✅         | `CASHIER`, `WAITER`, `COOK` | Rol del empleado        |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/users
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**
```json
// pendiente — completar al implementar
```

---

#### Respuesta exitosa · `201 Created`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error        | Causa                    |
| ------ | ------------ | ------------------------ |
| 400    | Bad Request  | Validación fallida       |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Rol sin permiso          |
| 409    | Conflict     | Username ya existe       |

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

**Headers**
```
GET /api/v1/users/:id
Authorization: Bearer <token>
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error        | Causa                    |
| ------ | ------------ | ------------------------ |
| 400    | Bad Request  | UUID mal formado         |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Acceso a perfil ajeno    |
| 404    | Not Found    | Usuario no encontrado    |

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

| Campo       | Tipo      | Requerido | Validación                  | Descripción          |
| ----------- | --------- | --------- | --------------------------- | -------------------- |
| `name`      | string    | ❌         | min 1, max 100              | Nombre completo      |
| `username`  | string    | ❌         | min 3, max 50, sin espacios | Nombre de usuario    |
| `password`  | string    | ❌         | min 6                       | Nueva contraseña     |
| `role`      | role_enum | ❌         | `CASHIER`, `WAITER`, `COOK` | Rol del empleado     |
| `is_active` | boolean   | ❌         |                             | Activar o desactivar |

---

#### Ejemplo de request

**Headers**
```
PATCH /api/v1/users/:id
Authorization: Bearer <token>
Content-Type: application/json
```

**Body**
```json
// pendiente — completar al implementar
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
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

**Headers**
```
DELETE /api/v1/users/:id
Authorization: Bearer <token>
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error                | Causa                                 |
| ------ | -------------------- | ------------------------------------- |
| 400    | Bad Request          | UUID mal formado                      |
| 401    | Unauthorized         | Token ausente o inválido              |
| 403    | Forbidden            | Rol sin permiso                       |
| 404    | Not Found            | Usuario no encontrado                 |
| 422    | Unprocessable Entity | No se puede desactivar al único OWNER |
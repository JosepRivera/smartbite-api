# Auth · docs/api/01-auth.md

> Autenticación delegada a Supabase Auth. NestJS actúa como proxy thin: no firma tokens ni gestiona contraseñas. El dueño entra con Google OAuth; los empleados con usuario y contraseña.

**Base URL:** `/api/v1/auth`

---

## Índice

- [POST /auth/login](#post-authlogin)
- [POST /auth/logout](#post-authlogout)
- [POST /auth/refresh](#post-authrefresh)
- [POST /auth/forgot-password](#post-authforgot-password)
- [POST /auth/reset-password](#post-authreset-password)
- [GET /auth/google](#get-authgoogle)
- [GET /auth/callback](#get-authcallback)
- [PATCH /auth/owner-email](#patch-authowner-email)

---

## POST /auth/login

Login con usuario y contraseña. Exclusivo para empleados (y el dueño si tiene cuenta con contraseña). El dueño usualmente entra con Google OAuth.

**Autenticación:** No requerida

### Request body

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `username` | string | ✅ | Nombre de usuario |
| `password` | string | ✅ | Contraseña |

```json
{
  "username": "juan",
  "password": "MiClave123"
}
```

### Respuesta exitosa · `200 OK`

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.AKd9...",
  "expires_in": 900,
  "user": {
    "id": "uuid-del-usuario",
    "name": "Juan García",
    "username": "juan",
    "role": "CASHIER",
    "isActive": true
  }
}
```

> `expires_in` está en segundos. El access token expira a los 15 minutos (900 s).

### Errores

| Status | Causa |
| ------ | ----- |
| 401 | Credenciales inválidas o cuenta desactivada |
| 404 | Perfil de usuario no encontrado en la BD |

---

## POST /auth/logout

Invalida todas las sesiones activas del usuario en Supabase Auth.

**Autenticación:** Bearer token requerido

```
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

### Respuesta exitosa · `204 No Content`

Sin cuerpo de respuesta.

### Errores

| Status | Causa |
| ------ | ----- |
| 401 | Token ausente o inválido |

---

## POST /auth/refresh

Renueva el access token con el refresh token. Supabase rota el refresh token en cada uso — el token anterior queda invalidado.

**Autenticación:** No requerida

### Request body

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `refresh_token` | string | ✅ | Refresh token activo |

```json
{
  "refresh_token": "v1.AKd9..."
}
```

### Respuesta exitosa · `200 OK`

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.BXe0...",
  "expires_in": 900
}
```

### Errores

| Status | Causa |
| ------ | ----- |
| 401 | Refresh token inválido o expirado |

---

## POST /auth/forgot-password

Solicita recuperación de contraseña. Supabase envía un email con el link de recuperación.

**Solo funciona para el dueño** (tiene Gmail real). Los empleados usan emails sintéticos `@smartbite.local` — si olvidan su contraseña, el dueño la resetea desde `PATCH /users/:id/password`.

**Autenticación:** No requerida

> Siempre retorna éxito para evitar email enumeration attacks.

### Request body

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `email` | string | ✅ | Email del dueño (su Gmail) |

```json
{
  "email": "dueno@gmail.com"
}
```

### Respuesta exitosa · `200 OK`

```json
{
  "message": "Si el email existe, recibirás las instrucciones de recuperación."
}
```

---

## POST /auth/reset-password

Actualiza la contraseña del usuario autenticado. El usuario debe enviar el JWT de recovery que Supabase incluyó en el email de recuperación.

**Autenticación:** Bearer token requerido (JWT de recovery de Supabase)

### Request body

| Campo | Tipo | Requerido | Validación | Descripción |
| ----- | ---- | --------- | ---------- | ----------- |
| `password` | string | ✅ | mín. 8 caracteres | Nueva contraseña |

```json
{
  "password": "NuevaClave456"
}
```

### Respuesta exitosa · `200 OK`

```json
{
  "message": "Contraseña actualizada correctamente."
}
```

### Errores

| Status | Causa |
| ------ | ----- |
| 401 | Token de recovery inválido o expirado |
| 500 | Error interno al actualizar en Supabase |

---

## GET /auth/google

Genera la URL de OAuth de Google. El cliente Kotlin abre esta URL en un WebView o navegador.

**Autenticación:** No requerida

**Prerequisito:** Google OAuth configurado en el dashboard de Supabase (Authentication → Providers → Google).

### Query parameters

| Parámetro | Tipo | Requerido | Descripción |
| --------- | ---- | --------- | ----------- |
| `redirect_to` | string | No | URL de callback después del OAuth. Debe estar en la lista de URLs permitidas en Supabase. |

```
GET /api/v1/auth/google?redirect_to=https://mi-app.com/auth/callback
```

### Respuesta exitosa · `200 OK`

```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=..."
}
```

> El cliente abre esta URL. Google redirige a Supabase, Supabase redirige a `/auth/callback` con un `code`.

---

## GET /auth/callback

Intercambia el código OAuth (PKCE) por tokens de sesión. Supabase redirige aquí después del login con Google.

Si es la primera vez que esta cuenta Google entra, se crea automáticamente el perfil OWNER en la tabla `users`. Si ya existe un OWNER con distinto email, el acceso es rechazado.

**Autenticación:** No requerida

### Query parameters

| Parámetro | Tipo | Requerido | Descripción |
| --------- | ---- | --------- | ----------- |
| `code` | string | ✅ | Código OAuth recibido de Supabase en el callback |

```
GET /api/v1/auth/callback?code=abc123...
```

### Respuesta exitosa · `200 OK`

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.AKd9...",
  "expires_in": 900
}
```

### Errores

| Status | Causa |
| ------ | ----- |
| 401 | Código OAuth inválido, expirado, o la cuenta Google no es la del dueño registrado |

---

## PATCH /auth/owner-email

Actualiza el email de Google del dueño en Supabase Auth. Solo funciona mientras el dueño tiene una sesión activa con su Gmail actual.

**Autenticación:** Bearer token requerido · Solo OWNER

### Request body

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `new_email` | string | ✅ | Nuevo Gmail del dueño |

```json
{
  "new_email": "nuevogmail@gmail.com"
}
```

### Respuesta exitosa · `200 OK`

```json
{
  "message": "Email actualizado. Usá el nuevo Gmail para iniciar sesión."
}
```

### Errores

| Status | Causa |
| ------ | ----- |
| 400 | Email inválido |
| 401 | Token ausente o inválido |
| 403 | El usuario autenticado no es OWNER |

> Si el dueño ya perdió acceso al Gmail anterior, la actualización debe hacerse manualmente desde el dashboard de Supabase.

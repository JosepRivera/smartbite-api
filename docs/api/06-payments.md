# Pagos · docs/api/06-payments.md

> Notificaciones del listener Kotlin y gestión de dispositivos autorizados.

---

## Índice

- [Pagos · docs/api/06-payments.md](#pagos--docsapi06-paymentsmd)
  - [Índice](#índice)
  - [Notificaciones](#notificaciones)
    - [Recibir notificación · POST /payments/notifications](#recibir-notificación--post-paymentsnotifications)
      - [Request body](#request-body)
      - [Ejemplo de request](#ejemplo-de-request)
      - [Respuesta exitosa · `201 Created`](#respuesta-exitosa--201-created)
      - [Casos de error](#casos-de-error)
    - [Listar notificaciones · GET /payments/notifications](#listar-notificaciones--get-paymentsnotifications)
      - [Query parameters](#query-parameters)
      - [Ejemplo de request](#ejemplo-de-request-1)
      - [Respuesta exitosa · `200 OK`](#respuesta-exitosa--200-ok)
      - [Casos de error](#casos-de-error-1)
    - [Marcar como revisada · PATCH /payments/notifications/:id/review](#marcar-como-revisada--patch-paymentsnotificationsidreview)
      - [Parámetros de ruta](#parámetros-de-ruta)
      - [Ejemplo de request](#ejemplo-de-request-2)
      - [Respuesta exitosa · `200 OK`](#respuesta-exitosa--200-ok-1)
      - [Casos de error](#casos-de-error-2)
  - [Dispositivos](#dispositivos)
    - [Registrar dispositivo · POST /devices/register](#registrar-dispositivo--post-devicesregister)
      - [Request body](#request-body-1)
      - [Ejemplo de request](#ejemplo-de-request-3)
      - [Respuesta exitosa · `201 Created`](#respuesta-exitosa--201-created-1)
      - [Casos de error](#casos-de-error-3)
    - [Listar dispositivos · GET /devices](#listar-dispositivos--get-devices)
      - [Ejemplo de request](#ejemplo-de-request-4)
      - [Respuesta exitosa · `200 OK`](#respuesta-exitosa--200-ok-2)
      - [Casos de error](#casos-de-error-4)
    - [Revocar dispositivo · POST /devices/:id/revoke](#revocar-dispositivo--post-devicesidrevoke)
      - [Parámetros de ruta](#parámetros-de-ruta-1)
      - [Ejemplo de request](#ejemplo-de-request-5)
      - [Respuesta exitosa · `200 OK`](#respuesta-exitosa--200-ok-3)
      - [Casos de error](#casos-de-error-5)

---

## Notificaciones

### Recibir notificación · POST /payments/notifications

> Endpoint exclusivo para la app Kotlin. Recibe una notificación de pago
> interceptada del celular del negocio y la guarda en BD.
> Implementa idempotencia: si llega el mismo `notification_id` dos veces,
> el segundo se ignora silenciosamente.

**Autenticación:** API Key en header `X-API-Key`
**Roles permitidos:** Solo dispositivos registrados y activos

---

#### Request body

| Campo             | Tipo                | Requerido | Descripción                                |
| ----------------- | ------------------- | --------- | ------------------------------------------ |
| `notification_id` | string              | ✅         | ID único de la notificación (idempotencia) |
| `amount`          | number              | ✅         | Monto recibido en soles                    |
| `sender_name`     | string              | ✅         | Nombre del remitente                       |
| `source`          | payment_source_enum | ✅         | `YAPE`, `PLIN` o `AGORA`                   |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/payments/notifications
X-API-Key: <api_key>
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

| Status | Error             | Causa                                |
| ------ | ----------------- | ------------------------------------ |
| 400    | Bad Request       | Validación fallida                   |
| 401    | Unauthorized      | API Key ausente, inválida o revocada |
| 429    | Too Many Requests | Más de 20 requests por minuto        |

---

### Listar notificaciones · GET /payments/notifications

> Lista las notificaciones de pago recibidas hoy. El cajero las consulta
> como referencia visual para confirmar pagos digitales.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`, `CASHIER`

---

#### Query parameters

| Parámetro     | Tipo    | Default | Descripción                                |
| ------------- | ------- | ------- | ------------------------------------------ |
| `is_reviewed` | boolean | `false` | Si es `false` devuelve solo las pendientes |
| `source`      | string  | —       | Filtra por `YAPE`, `PLIN` o `AGORA`        |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/payments/notifications
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

### Marcar como revisada · PATCH /payments/notifications/:id/review

> El cajero marca una notificación como revisada después de haber
> identificado y cobrado la orden correspondiente.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`, `CASHIER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción           |
| --------- | ---- | --------------------- |
| `id`      | UUID | ID de la notificación |

---

#### Ejemplo de request

**Headers**
```
PATCH /api/v1/payments/notifications/:id/review
Authorization: Bearer <token>
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error        | Causa                      |
| ------ | ------------ | -------------------------- |
| 400    | Bad Request  | UUID mal formado           |
| 401    | Unauthorized | Token ausente o inválido   |
| 403    | Forbidden    | Rol sin permiso            |
| 404    | Not Found    | Notificación no encontrada |

---

## Dispositivos

### Registrar dispositivo · POST /devices/register

> Registra la app Kotlin como dispositivo autorizado. El dueño llama a este
> endpoint desde Flutter, obtiene la API Key y la transfiere a la app Kotlin
> mediante un QR. La API Key se retorna una sola vez y no se puede recuperar después.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Request body

| Campo  | Tipo   | Requerido | Validación    | Descripción                        |
| ------ | ------ | --------- | ------------- | ---------------------------------- |
| `name` | string | ✅         | min 1, max 50 | Nombre descriptivo del dispositivo |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/devices/register
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

> La respuesta incluye la `api_key` en texto plano una sola vez.
> El servidor guarda únicamente el hash. Si se pierde, hay que revocar
> el dispositivo y registrar uno nuevo.

---

#### Casos de error

| Status | Error        | Causa                    |
| ------ | ------------ | ------------------------ |
| 400    | Bad Request  | Validación fallida       |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Rol sin permiso          |

---

### Listar dispositivos · GET /devices

> Lista todos los dispositivos registrados con su estado activo o revocado.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/devices
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

### Revocar dispositivo · POST /devices/:id/revoke

> Revoca el acceso de un dispositivo. A partir de este momento cualquier
> POST del listener con esa API Key recibe `401` de inmediato.
> Usar cuando el celular del negocio se pierde o es robado.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción        |
| --------- | ---- | ------------------ |
| `id`      | UUID | ID del dispositivo |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/devices/:id/revoke
Authorization: Bearer <token>
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error                | Causa                          |
| ------ | -------------------- | ------------------------------ |
| 400    | Bad Request          | UUID mal formado               |
| 401    | Unauthorized         | Token ausente o inválido       |
| 403    | Forbidden            | Rol sin permiso                |
| 404    | Not Found            | Dispositivo no encontrado      |
| 422    | Unprocessable Entity | Dispositivo ya estaba revocado |
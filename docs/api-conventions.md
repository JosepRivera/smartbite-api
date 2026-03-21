# Convenciones de la API

Este documento define las reglas que aplican a todos los endpoints de SmartBite.
Cualquier desviación de estas convenciones está documentada en el endpoint específico.

---

## URL base
```
http://localhost:3000/api/v1    ← desarrollo
https://api.smartbite.app/v1   ← producción
```

Todos los endpoints tienen el prefijo `/api/v1`.

---

## Autenticación

La mayoría de endpoints requieren un JWT válido en el header:
```
Authorization: Bearer <access_token>
```

El listener Kotlin usa una API Key en su propio header:
```
X-API-Key: <api_key>
```

Los únicos endpoints públicos (sin autenticación) son:
```
POST /api/v1/auth/login
POST /api/v1/auth/refresh
```

---

## Roles

Cada endpoint tiene uno o más roles permitidos. Si el token es válido pero
el rol no tiene permiso, el servidor responde con `403 Forbidden`.

| Rol      | Valor en el token |
| -------- | ----------------- |
| Dueño    | `OWNER`           |
| Cajero   | `CASHIER`         |
| Mozo     | `WAITER`          |
| Cocinero | `COOK`            |

---

## Formato de respuesta

Todas las respuestas exitosas siguen esta estructura:
```json
{
  "data": { }
}
```

Para listas:
```json
{
  "data": [ ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

El campo `meta` solo aparece en endpoints que devuelven listas paginadas.

---

## Formato de errores

Todos los errores siguen esta estructura:
```json
{
  "message": "Descripción legible del error",
  "error": "NombreDelError",
  "statusCode": 400
}
```

Para errores de validación con múltiples campos:
```json
{
  "message": [
    "name must not be empty",
    "price must be a positive number"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Códigos de estado HTTP

| Código                      | Cuándo se usa                                                                |
| --------------------------- | ---------------------------------------------------------------------------- |
| `200 OK`                    | Consulta o actualización exitosa                                             |
| `201 Created`               | Recurso creado exitosamente                                                  |
| `204 No Content`            | Eliminación exitosa sin cuerpo de respuesta                                  |
| `400 Bad Request`           | Datos inválidos o mal formados                                               |
| `401 Unauthorized`          | Token ausente, inválido o expirado                                           |
| `403 Forbidden`             | Token válido pero rol sin permiso                                            |
| `404 Not Found`             | Recurso no encontrado                                                        |
| `409 Conflict`              | Conflicto con el estado actual (ej: cierre de caja ya existe para esa fecha) |
| `422 Unprocessable Entity`  | Datos válidos pero que violan una regla de negocio                           |
| `500 Internal Server Error` | Error inesperado del servidor                                                |

---

## Diferencia entre 400 y 422

- `400` → el dato en sí es inválido. Ejemplo: un campo requerido vacío, un UUID mal formado, un número negativo donde se espera positivo.
- `422` → el dato es válido pero viola una regla de negocio. Ejemplo: intentar cerrar la caja cuando ya existe un cierre para ese día, cancelar una venta que ya fue cobrada.

---

## Paginación

Los endpoints que devuelven listas aceptan estos query params:

| Param   | Tipo | Default | Descripción                         |
| ------- | ---- | ------- | ----------------------------------- |
| `page`  | Int  | `1`     | Número de página                    |
| `limit` | Int  | `20`    | Registros por página. Máximo: `100` |

Ejemplo:
```
GET /api/v1/sales?page=2&limit=10
```

---

## Filtros y ordenamiento

Los endpoints que lo soportan aceptan query params adicionales documentados
en cada endpoint. Ejemplo:
```
GET /api/v1/sales?status=OPEN&from=2025-03-01&to=2025-03-31
GET /api/v1/sales?orderBy=created_at&order=desc
```

---

## Fechas

Todas las fechas en requests y responses usan formato **ISO 8601**:
```
2025-03-21T15:42:00.000Z   ← datetime con zona horaria UTC
2025-03-21                  ← date sin hora
```

Los campos de solo fecha (`date` en `cash_closes`, `daily_production_plans`)
se envían y reciben como `YYYY-MM-DD`.

---

## IDs

Todos los IDs son **UUID v4**. Ejemplo:
```
95d40fe1-6d1d-4105-9df4-f6221f4d92b6
```

Si se envía un ID con formato inválido, el servidor responde con `400 Bad Request`:
```json
{
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Endpoints de solo lectura para IA

Los endpoints de IA-1 (Text-to-SQL) ejecutan consultas en modo solo lectura.
No pueden modificar datos. Si Claude API genera un SQL con `INSERT`, `UPDATE`,
`DELETE` o `DROP`, el servidor lo rechaza con `422 Unprocessable Entity` antes
de ejecutarlo.

---

## Rate limiting

| Tipo de cliente      | Límite                               |
| -------------------- | ------------------------------------ |
| Flutter (JWT)        | 200 requests / minuto por usuario    |
| App Kotlin (API Key) | 20 requests / minuto por dispositivo |

Superar el límite devuelve `429 Too Many Requests`.

---

## Versionado

La API usa versionado en la URL (`/v1`). Si en el futuro se introduce una
versión con cambios incompatibles, se crea `/v2` sin romper `/v1`.

---

## Documentación de endpoints

Cada módulo tiene su propio archivo de documentación en `docs/api/`:

| Archivo          | Módulo                  | Funcionalidades |
| ---------------- | ----------------------- | --------------- |
| `01-auth.md`     | Autenticación           | AUTH-1, AUTH-2  |
| `02-ops.md`      | Gestión operativa       | OPS-1 al OPS-7  |
| `03-reports.md`  | Reportes                | REP-1 al REP-4  |
| `04-ai.md`       | Inteligencia artificial | IA-1 al IA-4    |
| `05-voice.md`    | Voz                     | VOZ-1           |
| `06-payments.md` | Pagos                   | PAG-1           |
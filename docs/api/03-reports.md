# Reportes · docs/api/03-reports.md

> Dashboard, reportes por período, rentabilidad y cierre de caja.

---

## Índice

- [Dashboard · GET /dashboard](#dashboard--get-dashboard)
- [Reportes por período · GET /reports/periods](#reportes-por-período--get-reportsperiods)
- [Rentabilidad · GET /reports/profitability](#rentabilidad--get-reportsprofitability)
- [Listar cierres · GET /cash-closes](#listar-cierres--get-cash-closes)
- [Generar cierre · POST /cash-closes](#generar-cierre--post-cash-closes)
- [Obtener cierre · GET /cash-closes/:id](#obtener-cierre--get-cash-closesid)

---

### Dashboard · GET /dashboard

> Resumen en tiempo real del día: ventas totales, desglose efectivo vs
> digital, productos más vendidos y ganancia estimada.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/dashboard
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

### Reportes por período · GET /reports/periods

> Ventas agrupadas por día, semana o mes con comparación entre períodos.
> Filtro por empleado para análisis de rendimiento individual.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Query parameters

| Parámetro | Tipo   | Requerido | Descripción                            |
| --------- | ------ | --------- | -------------------------------------- |
| `from`    | date   | ✅         | Fecha de inicio `YYYY-MM-DD`           |
| `to`      | date   | ✅         | Fecha de fin `YYYY-MM-DD`              |
| `groupBy` | string | ❌         | `day`, `week`, `month`. Default: `day` |
| `user_id` | UUID   | ❌         | Filtra por empleado                    |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/reports/periods?from=2025-03-01&to=2025-03-31&groupBy=week
Authorization: Bearer <token>
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error        | Causa                        |
| ------ | ------------ | ---------------------------- |
| 400    | Bad Request  | Fechas inválidas o faltantes |
| 401    | Unauthorized | Token ausente o inválido     |
| 403    | Forbidden    | Rol sin permiso              |

---

### Rentabilidad · GET /reports/profitability

> Ganancia unitaria por producto: precio de venta menos costo de insumos
> según la receta. Ordena de mayor a menor margen.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/reports/profitability
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

### Listar cierres · GET /cash-closes

> Lista el historial de cierres de caja ordenado por fecha descendente.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Query parameters

| Parámetro | Tipo | Default | Descripción          |
| --------- | ---- | ------- | -------------------- |
| `from`    | date | —       | Fecha de inicio      |
| `to`      | date | —       | Fecha de fin         |
| `page`    | int  | `1`     | Página               |
| `limit`   | int  | `20`    | Registros por página |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/cash-closes
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

### Generar cierre · POST /cash-closes

> Genera el cierre de caja del día actual. Solo se puede generar uno por día.
> El registro es inmutable: no se puede modificar ni eliminar después.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Request body

No requiere body. El sistema calcula automáticamente todos los totales
a partir de las ventas y gastos del día.

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/cash-closes
Authorization: Bearer <token>
```

---

#### Respuesta exitosa · `201 Created`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error        | Causa                                  |
| ------ | ------------ | -------------------------------------- |
| 401    | Unauthorized | Token ausente o inválido               |
| 403    | Forbidden    | Rol sin permiso                        |
| 409    | Conflict     | Ya existe un cierre para el día de hoy |

---

### Obtener cierre · GET /cash-closes/:id

> Devuelve el detalle de un cierre de caja por su ID.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción   |
| --------- | ---- | ------------- |
| `id`      | UUID | ID del cierre |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/cash-closes/:id
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
| 403    | Forbidden    | Rol sin permiso          |
| 404    | Not Found    | Cierre no encontrado     |
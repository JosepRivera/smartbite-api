# Gestión operativa · docs/api/02-ops.md

> Operaciones diarias del negocio: productos, insumos, recetas, ventas y gastos.

---

## Índice

- [Productos](#productos)
  - [Listar · GET /products](#listar--get-products)
  - [Crear · POST /products](#crear--post-products)
  - [Obtener por ID · GET /products/:id](#obtener-por-id--get-productsid)
  - [Editar · PATCH /products/:id](#editar--patch-productsid)
  - [Desactivar · DELETE /products/:id](#desactivar--delete-productsid)
- [Insumos](#insumos)
  - [Listar · GET /ingredients](#listar--get-ingredients)
  - [Crear · POST /ingredients](#crear--post-ingredients)
  - [Obtener por ID · GET /ingredients/:id](#obtener-por-id--get-ingredientsid)
  - [Editar · PATCH /ingredients/:id](#editar--patch-ingredientsid)
- [Recetas](#recetas)
  - [Obtener receta · GET /recipes/:productId](#obtener-receta--get-recipesproductid)
  - [Crear o reemplazar · PUT /recipes/:productId](#crear-o-reemplazar--put-recipesproductid)
- [Ventas](#ventas)
  - [Listar · GET /sales](#listar--get-sales)
  - [Crear orden · POST /sales](#crear-orden--post-sales)
  - [Obtener por ID · GET /sales/:id](#obtener-por-id--get-salesid)
  - [Ticket de orden · GET /sales/:id/receipt](#ticket-de-orden--get-salesidreceipt)
  - [Cobrar o cancelar · PATCH /sales/:id/status](#cobrar-o-cancelar--patch-salesidstatus)
  - [Cobro múltiple · POST /sales/bulk-pay](#cobro-múltiple--post-salesbulk-pay)
  - [Corregir venta · PATCH /sales/:id](#corregir-venta--patch-salesid)
- [Gastos](#gastos)
  - [Listar · GET /expenses](#listar--get-expenses)
  - [Crear · POST /expenses](#crear--post-expenses)

---

## Productos

### Listar · GET /products

> Lista todos los productos de la carta. Por defecto solo devuelve los activos.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** Todos

---

#### Query parameters

| Parámetro         | Tipo    | Default | Descripción                           |
| ----------------- | ------- | ------- | ------------------------------------- |
| `includeInactive` | boolean | `false` | Si es `true` incluye los desactivados |
| `category`        | string  | —       | Filtra por categoría                  |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/products
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

---

### Crear · POST /products

> Crea un nuevo producto en la carta.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Request body

| Campo      | Tipo   | Requerido | Validación     | Descripción                           |
| ---------- | ------ | --------- | -------------- | ------------------------------------- |
| `name`     | string | ✅         | min 1, max 100 | Nombre del producto                   |
| `price`    | number | ✅         | mayor a 0      | Precio de venta en soles              |
| `category` | string | ✅         | min 1, max 50  | Categoría (ej: hamburguesas, bebidas) |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/products
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
| 409    | Conflict     | Nombre ya existe         |

---

### Obtener por ID · GET /products/:id

> Devuelve un producto por su ID incluyendo si está inactivo.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** Todos

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción     |
| --------- | ---- | --------------- |
| `id`      | UUID | ID del producto |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/products/:id
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
| 404    | Not Found    | Producto no encontrado   |

---

### Editar · PATCH /products/:id

> Edita los datos de un producto. Todos los campos son opcionales.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción     |
| --------- | ---- | --------------- |
| `id`      | UUID | ID del producto |

---

#### Request body

| Campo      | Tipo   | Requerido | Validación     | Descripción     |
| ---------- | ------ | --------- | -------------- | --------------- |
| `name`     | string | ❌         | min 1, max 100 | Nombre          |
| `price`    | number | ❌         | mayor a 0      | Precio en soles |
| `category` | string | ❌         | min 1, max 50  | Categoría       |

---

#### Ejemplo de request

**Headers**
```
PATCH /api/v1/products/:id
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
| 400    | Bad Request  | UUID mal formado         |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Rol sin permiso          |
| 404    | Not Found    | Producto no encontrado   |
| 409    | Conflict     | Nombre ya existe         |

---

### Desactivar · DELETE /products/:id

> Desactiva un producto (soft delete). Deja de aparecer en la carta pero
> su historial de ventas se conserva.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción     |
| --------- | ---- | --------------- |
| `id`      | UUID | ID del producto |

---

#### Ejemplo de request

**Headers**
```
DELETE /api/v1/products/:id
Authorization: Bearer <token>
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error                | Causa                                      |
| ------ | -------------------- | ------------------------------------------ |
| 400    | Bad Request          | UUID mal formado                           |
| 401    | Unauthorized         | Token ausente o inválido                   |
| 403    | Forbidden            | Rol sin permiso                            |
| 404    | Not Found            | Producto no encontrado                     |
| 422    | Unprocessable Entity | El producto tiene órdenes abiertas activas |

---

## Insumos

### Listar · GET /ingredients

> Lista todos los insumos con su stock actual.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Query parameters

| Parámetro  | Tipo    | Default | Descripción                                                    |
| ---------- | ------- | ------- | -------------------------------------------------------------- |
| `lowStock` | boolean | `false` | Si es `true` devuelve solo los que están bajo el umbral mínimo |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/ingredients
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

### Crear · POST /ingredients

> Registra un nuevo insumo con su stock inicial y umbral mínimo de alerta.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Request body

| Campo       | Tipo   | Requerido | Validación        | Descripción                             |
| ----------- | ------ | --------- | ----------------- | --------------------------------------- |
| `name`      | string | ✅         | min 1, max 100    | Nombre del insumo                       |
| `unit`      | string | ✅         | min 1, max 20     | Unidad de medida (kg, unidades, litros) |
| `stock`     | number | ✅         | mayor o igual a 0 | Stock inicial                           |
| `min_stock` | number | ✅         | mayor o igual a 0 | Umbral mínimo para alerta OPS-7         |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/ingredients
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
| 409    | Conflict     | Nombre ya existe         |

---

### Obtener por ID · GET /ingredients/:id

> Devuelve un insumo por su ID.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción   |
| --------- | ---- | ------------- |
| `id`      | UUID | ID del insumo |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/ingredients/:id
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
| 404    | Not Found    | Insumo no encontrado     |

---

### Editar · PATCH /ingredients/:id

> Edita los datos de un insumo. Todos los campos son opcionales.
> Para ajustar el stock por una entrega de mercadería usar este endpoint.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción   |
| --------- | ---- | ------------- |
| `id`      | UUID | ID del insumo |

---

#### Request body

| Campo       | Tipo   | Requerido | Validación        | Descripción          |
| ----------- | ------ | --------- | ----------------- | -------------------- |
| `name`      | string | ❌         | min 1, max 100    | Nombre               |
| `unit`      | string | ❌         | min 1, max 20     | Unidad de medida     |
| `stock`     | number | ❌         | mayor o igual a 0 | Stock actual         |
| `min_stock` | number | ❌         | mayor o igual a 0 | Umbral mínimo alerta |

---

#### Ejemplo de request

**Headers**
```
PATCH /api/v1/ingredients/:id
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
| 400    | Bad Request  | UUID mal formado         |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Rol sin permiso          |
| 404    | Not Found    | Insumo no encontrado     |
| 409    | Conflict     | Nombre ya existe         |

---

## Recetas

### Obtener receta · GET /recipes/:productId

> Devuelve la receta completa de un producto con sus insumos y cantidades.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro   | Tipo | Descripción     |
| ----------- | ---- | --------------- |
| `productId` | UUID | ID del producto |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/recipes/:productId
Authorization: Bearer <token>
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

---

#### Casos de error

| Status | Error        | Causa                          |
| ------ | ------------ | ------------------------------ |
| 400    | Bad Request  | UUID mal formado               |
| 401    | Unauthorized | Token ausente o inválido       |
| 403    | Forbidden    | Rol sin permiso                |
| 404    | Not Found    | Producto sin receta registrada |

---

### Crear o reemplazar · PUT /recipes/:productId

> Crea o reemplaza por completo la receta de un producto. Si ya existía
> una receta, se elimina y se crea la nueva en una sola transacción.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro   | Tipo | Descripción     |
| ----------- | ---- | --------------- |
| `productId` | UUID | ID del producto |

---

#### Request body

| Campo                   | Tipo   | Requerido | Validación     | Descripción                     |
| ----------------------- | ------ | --------- | -------------- | ------------------------------- |
| `items`                 | array  | ✅         | min 1 elemento | Lista de insumos de la receta   |
| `items[].ingredient_id` | UUID   | ✅         |                | ID del insumo                   |
| `items[].quantity`      | number | ✅         | mayor a 0      | Cantidad por unidad de producto |

---

#### Ejemplo de request

**Headers**
```
PUT /api/v1/recipes/:productId
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

| Status | Error        | Causa                           |
| ------ | ------------ | ------------------------------- |
| 400    | Bad Request  | UUID mal formado o validación   |
| 401    | Unauthorized | Token ausente o inválido        |
| 403    | Forbidden    | Rol sin permiso                 |
| 404    | Not Found    | Producto o insumo no encontrado |

---

## Ventas

### Listar · GET /sales

> Lista las órdenes del sistema. El dueño ve todas. El cajero y el mozo
> solo ven las órdenes en estado `OPEN` del día actual.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** Todos

---

#### Query parameters

| Parámetro | Tipo   | Default | Descripción                                   |
| --------- | ------ | ------- | --------------------------------------------- |
| `status`  | string | —       | Filtra por estado (`OPEN`, `PAID_CASH`, etc.) |
| `from`    | date   | —       | Fecha de inicio `YYYY-MM-DD`                  |
| `to`      | date   | —       | Fecha de fin `YYYY-MM-DD`                     |
| `user_id` | UUID   | —       | Filtra por empleado (solo `OWNER`)            |
| `page`    | int    | `1`     | Página                                        |
| `limit`   | int    | `20`    | Registros por página                          |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/sales?status=OPEN
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

---

### Crear orden · POST /sales

> Registra una nueva orden. El stock no se descuenta en este momento,
> solo al confirmar el cobro. Se genera el ticket automáticamente.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`, `CASHIER`, `WAITER`

---

#### Request body

| Campo                | Tipo   | Requerido | Validación | Descripción                             |
| -------------------- | ------ | --------- | ---------- | --------------------------------------- |
| `items`              | array  | ✅         | min 1      | Lista de productos y cantidades         |
| `items[].product_id` | UUID   | ✅         |            | ID del producto                         |
| `items[].quantity`   | int    | ✅         | mayor a 0  | Cantidad ordenada                       |
| `customer_name`      | string | ❌         | max 100    | Nombre del cliente para pagos digitales |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/sales
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

| Status | Error                | Causa                    |
| ------ | -------------------- | ------------------------ |
| 400    | Bad Request          | Validación fallida       |
| 401    | Unauthorized         | Token ausente o inválido |
| 403    | Forbidden            | Rol sin permiso          |
| 404    | Not Found            | product_id no existe     |
| 422    | Unprocessable Entity | Producto inactivo        |

---

### Obtener por ID · GET /sales/:id

> Devuelve una orden completa con sus ítems.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER` (cualquier orden), resto (solo sus propias órdenes del día)

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| `id`      | UUID | ID de la orden |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/sales/:id
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
| 403    | Forbidden    | Acceso a orden ajena     |
| 404    | Not Found    | Orden no encontrada      |

---

### Ticket de orden · GET /sales/:id/receipt

> Devuelve el resumen de la orden formateado como ticket para mostrar
> en pantalla o enviar a impresora térmica bluetooth.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`, `CASHIER`, `WAITER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| `id`      | UUID | ID de la orden |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/sales/:id/receipt
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
| 404    | Not Found    | Orden no encontrada      |

---

### Cobrar o cancelar · PATCH /sales/:id/status

> Cambia el estado de una orden. Desde `OPEN` puede pasar a `PAID_*`
> o `CANCELLED`. Al cobrar se descuenta el stock automáticamente.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`, `CASHIER` (cobrar y cancelar), `WAITER` (solo cancelar sus propias órdenes)

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| `id`      | UUID | ID de la orden |

---

#### Request body

| Campo    | Tipo             | Requerido | Descripción                                                       |
| -------- | ---------------- | --------- | ----------------------------------------------------------------- |
| `status` | sale_status_enum | ✅         | `PAID_CASH`, `PAID_YAPE`, `PAID_PLIN`, `PAID_AGORA` o `CANCELLED` |

---

#### Ejemplo de request

**Headers**
```
PATCH /api/v1/sales/:id/status
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

| Status | Error                | Causa                                         |
| ------ | -------------------- | --------------------------------------------- |
| 400    | Bad Request          | UUID mal formado o status inválido            |
| 401    | Unauthorized         | Token ausente o inválido                      |
| 403    | Forbidden            | Rol sin permiso o cancelar orden ajena        |
| 404    | Not Found            | Orden no encontrada                           |
| 422    | Unprocessable Entity | Orden ya cobrada — no se puede cambiar estado |

---

### Cobro múltiple · POST /sales/bulk-pay

> Cobra varias órdenes en una sola operación. Útil cuando un cliente
> paga por varias personas. El stock se descuenta en todas las órdenes.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`, `CASHIER`

---

#### Request body

| Campo      | Tipo             | Requerido | Validación | Descripción                                          |
| ---------- | ---------------- | --------- | ---------- | ---------------------------------------------------- |
| `sale_ids` | UUID[]           | ✅         | min 2      | IDs de las órdenes a cobrar                          |
| `status`   | sale_status_enum | ✅         |            | `PAID_CASH`, `PAID_YAPE`, `PAID_PLIN` o `PAID_AGORA` |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/sales/bulk-pay
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

| Status | Error                | Causa                                            |
| ------ | -------------------- | ------------------------------------------------ |
| 400    | Bad Request          | Validación fallida                               |
| 401    | Unauthorized         | Token ausente o inválido                         |
| 403    | Forbidden            | Rol sin permiso                                  |
| 404    | Not Found            | Una o más órdenes no encontradas                 |
| 422    | Unprocessable Entity | Una o más órdenes ya están cobradas o canceladas |

---

### Corregir venta · PATCH /sales/:id

> Corrige los productos o cantidades de una orden. Solo el dueño puede
> hacerlo. Se guarda quién realizó la corrección y cuándo.
> Campos permitidos: productos, cantidades y método de pago.
> No se puede editar el precio ni la fecha.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Parámetros de ruta

| Parámetro | Tipo | Descripción    |
| --------- | ---- | -------------- |
| `id`      | UUID | ID de la orden |

---

#### Request body

| Campo                | Tipo  | Requerido | Validación | Descripción              |
| -------------------- | ----- | --------- | ---------- | ------------------------ |
| `items`              | array | ❌         | min 1      | Nueva lista de productos |
| `items[].product_id` | UUID  | ✅         |            | ID del producto          |
| `items[].quantity`   | int   | ✅         | mayor a 0  | Nueva cantidad           |

---

#### Ejemplo de request

**Headers**
```
PATCH /api/v1/sales/:id
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
| 400    | Bad Request  | UUID mal formado         |
| 401    | Unauthorized | Token ausente o inválido |
| 403    | Forbidden    | Rol sin permiso          |
| 404    | Not Found    | Orden no encontrada      |

---

## Gastos

### Listar · GET /expenses

> Lista los gastos del negocio con filtros por fecha.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Query parameters

| Parámetro  | Tipo   | Default | Descripción          |
| ---------- | ------ | ------- | -------------------- |
| `from`     | date   | —       | Fecha de inicio      |
| `to`       | date   | —       | Fecha de fin         |
| `category` | string | —       | Filtra por categoría |
| `page`     | int    | `1`     | Página               |
| `limit`    | int    | `20`    | Registros por página |

---

#### Ejemplo de request

**Headers**
```
GET /api/v1/expenses
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

### Crear · POST /expenses

> Registra un gasto operativo. Base del cálculo de ganancia en el cierre de caja.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** `OWNER`

---

#### Request body

| Campo         | Tipo   | Requerido | Validación                          | Descripción           |
| ------------- | ------ | --------- | ----------------------------------- | --------------------- |
| `description` | string | ✅         | min 1, max 200                      | Descripción del gasto |
| `amount`      | number | ✅         | mayor a 0                           | Monto en soles        |
| `category`    | string | ✅         | insumos, alquiler, servicios, otros | Categoría             |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/expenses
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
# Gestión operativa · docs/api/02-ops.md

> Operaciones diarias del negocio: productos, insumos y recetas.
>
> **Base URL:** `http://localhost:3000/api/v1`
>
> **Formato de respuestas:** ver `01-auth.md#formato-de-respuestas` — éxito en `data: {}`, validación en `errors: []`.

## Formatos de error

### Validación de body (Zod) · `400`

Cuando el body no cumple el schema, cada campo inválido aparece en `errors[]`:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "number",
      "path": ["price"],
      "message": "Invalid input: expected number, received undefined"
    }
  ]
}
```

### Error de negocio / guard · `4xx`

Autenticación, permisos, not found, UUID inválido — formato plano:

```json
{
  "message": "Producto no encontrado",
  "error": "Not Found",
  "statusCode": 404
}
```

### UUID inválido en ruta · `400`

```json
{
  "message": "Validation failed (uuid is expected)",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Sin token · `401`

```json
{
  "message": "Token ausente",
  "error": "Unauthorized",
  "statusCode": 401
}
```

---

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
- [Ventas](#ventas)
  - [Crear venta · POST /sales](#crear-venta--post-sales)
  - [Listar ventas · GET /sales](#listar-ventas--get-sales)
  - [Obtener venta · GET /sales/:id](#obtener-venta--get-salesid)
  - [Cobrar venta · PATCH /sales/:id/pay](#cobrar-venta--patch-salesidpay)
  - [Cancelar venta · PATCH /sales/:id/cancel](#cancelar-venta--patch-salesidcancel)
- [Gastos](#gastos)
  - [Registrar gasto · POST /expenses](#registrar-gasto--post-expenses)
  - [Listar gastos · GET /expenses](#listar-gastos--get-expenses)
  - [Obtener gasto · GET /expenses/:id](#obtener-gasto--get-expensesid)
  - [Eliminar gasto · DELETE /expenses/:id](#eliminar-gasto--delete-expensesid)
  - [Obtener receta · GET /recipes/:productId](#obtener-receta--get-recipesproductid)
  - [Crear o reemplazar · PUT /recipes/:productId](#crear-o-reemplazar--put-recipesproductid)

---

## Productos

> `price` retorna como **string** (tipo Decimal de Prisma).

### Listar · GET /products

**Autenticación:** Bearer token · **Roles:** Todos

#### Query parameters

| Parámetro | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `includeInactive` | boolean | `false` | Si es `true` incluye los desactivados |
| `category` | string | — | Filtra por categoría |

```
GET /api/v1/products
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": [
    {
      "id": "f0feca65-5203-4a60-bb55-1b71fca18e96",
      "name": "Hamburguesa Clásica",
      "price": "1500",
      "category": "Hamburguesas",
      "isActive": true,
      "createdAt": "2026-04-16T21:30:11.640Z",
      "updatedAt": "2026-04-16T21:30:11.640Z"
    }
  ]
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 401 | Token ausente o inválido |

---

### Crear · POST /products

**Autenticación:** Bearer token · **Roles:** OWNER

#### Request body

| Campo | Tipo | Requerido | Validación | Descripción |
| --- | --- | --- | --- | --- |
| `name` | string | ✅ | mín. 1 · máx. 100 | Nombre del producto |
| `price` | number | ✅ | mayor a 0 | Precio de venta |
| `category` | string | ✅ | mín. 1 · máx. 50 | Categoría |

```json
{
  "name": "Hamburguesa Clásica",
  "price": 1500,
  "category": "Hamburguesas"
}
```

#### Respuesta exitosa · `201 Created`

```json
{
  "data": {
    "id": "f0feca65-5203-4a60-bb55-1b71fca18e96",
    "name": "Hamburguesa Clásica",
    "price": "1500",
    "category": "Hamburguesas",
    "isActive": true,
    "createdAt": "2026-04-16T21:30:11.640Z",
    "updatedAt": "2026-04-16T21:30:11.640Z"
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | Validación fallida |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |
| 409 | Nombre ya existe |

---

### Obtener por ID · GET /products/:id

**Autenticación:** Bearer token · **Roles:** Todos

#### Parámetros de ruta

| Parámetro | Tipo | Descripción |
| --- | --- | --- |
| `id` | UUID | ID del producto |

```
GET /api/v1/products/:id
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "id": "f0feca65-5203-4a60-bb55-1b71fca18e96",
    "name": "Hamburguesa Clásica",
    "price": "1500",
    "category": "Hamburguesas",
    "isActive": true,
    "createdAt": "2026-04-16T21:30:11.640Z",
    "updatedAt": "2026-04-16T21:30:11.640Z"
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | UUID mal formado |
| 401 | Token ausente o inválido |
| 404 | Producto no encontrado |

---

### Editar · PATCH /products/:id

**Autenticación:** Bearer token · **Roles:** OWNER

#### Request body (todos opcionales)

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `name` | string | Nombre |
| `price` | number | Precio |
| `category` | string | Categoría |

```json
{ "price": 1800 }
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "id": "f0feca65-5203-4a60-bb55-1b71fca18e96",
    "name": "Hamburguesa Clásica",
    "price": "1800",
    "category": "Hamburguesas",
    "isActive": true,
    "createdAt": "2026-04-16T21:30:11.640Z",
    "updatedAt": "2026-04-16T21:30:12.527Z"
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | UUID mal formado o validación fallida |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |
| 404 | Producto no encontrado |
| 409 | Nombre ya existe |

---

### Desactivar · DELETE /products/:id

Soft delete. El historial de ventas se conserva.

**Autenticación:** Bearer token · **Roles:** OWNER

```
DELETE /api/v1/products/:id
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "id": "f0feca65-5203-4a60-bb55-1b71fca18e96",
    "name": "Hamburguesa Clásica",
    "price": "1800",
    "category": "Hamburguesas",
    "isActive": false,
    "createdAt": "2026-04-16T21:30:11.640Z",
    "updatedAt": "2026-04-16T21:30:48.574Z"
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | UUID mal formado |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |
| 404 | Producto no encontrado |
| 422 | Producto con órdenes abiertas activas |

---

## Insumos

> `stock`, `minStock` y `costPerUnit` retornan como **string** (Decimal de Prisma).
> `is_low_stock` es un booleano calculado: `stock < minStock`.

### Listar · GET /ingredients

**Autenticación:** Bearer token · **Roles:** OWNER

#### Query parameters

| Parámetro | Tipo | Default | Descripción |
| --- | --- | --- | --- |
| `lowStock` | boolean | `false` | Solo los que están bajo el umbral mínimo |

```
GET /api/v1/ingredients
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": [
    {
      "id": "b23099be-d675-4118-8c64-b7d113511a6e",
      "name": "Pan de hamburguesa",
      "unit": "unidad",
      "stock": "150",
      "minStock": "20",
      "costPerUnit": "50",
      "createdAt": "2026-04-16T21:30:42.652Z",
      "updatedAt": "2026-04-16T21:30:44.377Z",
      "is_low_stock": false
    }
  ]
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |

---

### Crear · POST /ingredients

**Autenticación:** Bearer token · **Roles:** OWNER

#### Request body

| Campo | Tipo | Requerido | Validación | Descripción |
| --- | --- | --- | --- | --- |
| `name` | string | ✅ | mín. 1 · máx. 100 | Nombre del insumo |
| `unit` | string | ✅ | mín. 1 · máx. 20 | Unidad de medida (`kg`, `unidad`, `litro`) |
| `stock` | number | ✅ | ≥ 0 | Stock inicial |
| `min_stock` | number | ✅ | ≥ 0 | Umbral mínimo para alerta |
| `cost_per_unit` | number | ❌ | ≥ 0 | Costo por unidad (default `0`) |

```json
{
  "name": "Pan de hamburguesa",
  "unit": "unidad",
  "stock": 100,
  "min_stock": 20,
  "cost_per_unit": 50
}
```

#### Respuesta exitosa · `201 Created`

```json
{
  "data": {
    "id": "b23099be-d675-4118-8c64-b7d113511a6e",
    "name": "Pan de hamburguesa",
    "unit": "unidad",
    "stock": "100",
    "minStock": "20",
    "costPerUnit": "50",
    "createdAt": "2026-04-16T21:30:42.652Z",
    "updatedAt": "2026-04-16T21:30:42.652Z",
    "is_low_stock": false
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | Validación fallida |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |
| 409 | Nombre ya existe |

---

### Obtener por ID · GET /ingredients/:id

**Autenticación:** Bearer token · **Roles:** OWNER

```
GET /api/v1/ingredients/:id
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "id": "b23099be-d675-4118-8c64-b7d113511a6e",
    "name": "Pan de hamburguesa",
    "unit": "unidad",
    "stock": "100",
    "minStock": "20",
    "costPerUnit": "50",
    "createdAt": "2026-04-16T21:30:42.652Z",
    "updatedAt": "2026-04-16T21:30:42.652Z",
    "is_low_stock": false
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | UUID mal formado |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |
| 404 | Insumo no encontrado |

---

### Editar · PATCH /ingredients/:id

Usar para ajustar stock tras entrega de mercadería.

**Autenticación:** Bearer token · **Roles:** OWNER

#### Request body (todos opcionales)

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `name` | string | Nombre |
| `unit` | string | Unidad de medida |
| `stock` | number | Stock actual |
| `min_stock` | number | Umbral mínimo |
| `cost_per_unit` | number | Costo por unidad |

```json
{ "stock": 150 }
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "id": "b23099be-d675-4118-8c64-b7d113511a6e",
    "name": "Pan de hamburguesa",
    "unit": "unidad",
    "stock": "150",
    "minStock": "20",
    "costPerUnit": "50",
    "createdAt": "2026-04-16T21:30:42.652Z",
    "updatedAt": "2026-04-16T21:30:44.377Z",
    "is_low_stock": false
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | UUID mal formado o validación fallida |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |
| 404 | Insumo no encontrado |
| 409 | Nombre ya existe |

---

## Recetas

### Obtener receta · GET /recipes/:productId

**Autenticación:** Bearer token · **Roles:** OWNER

```
GET /api/v1/recipes/:productId
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "product_id": "f0feca65-5203-4a60-bb55-1b71fca18e96",
    "items": [
      {
        "id": "7296f29d-0fa9-4220-9918-6e7f4a69f354",
        "ingredient_id": "b23099be-d675-4118-8c64-b7d113511a6e",
        "ingredient_name": "Pan de hamburguesa",
        "unit": "unidad",
        "quantity": 1
      }
    ]
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | UUID mal formado |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |
| 404 | Producto sin receta registrada |

---

### Crear o reemplazar · PUT /recipes/:productId

Reemplaza por completo la receta. Operación atómica: elimina la anterior y crea la nueva en una sola transacción.

**Autenticación:** Bearer token · **Roles:** OWNER

#### Request body

| Campo | Tipo | Requerido | Validación | Descripción |
| --- | --- | --- | --- | --- |
| `items` | array | ✅ | mín. 1 | Lista de insumos |
| `items[].ingredient_id` | UUID | ✅ | | ID del insumo |
| `items[].quantity` | number | ✅ | mayor a 0 | Cantidad por unidad de producto |

```json
{
  "items": [
    { "ingredient_id": "b23099be-d675-4118-8c64-b7d113511a6e", "quantity": 1 }
  ]
}
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "product_id": "f0feca65-5203-4a60-bb55-1b71fca18e96",
    "items": [
      {
        "id": "7296f29d-0fa9-4220-9918-6e7f4a69f354",
        "ingredient_id": "b23099be-d675-4118-8c64-b7d113511a6e",
        "ingredient_name": "Pan de hamburguesa",
        "unit": "unidad",
        "quantity": 1
      }
    ]
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | UUID mal formado o validación fallida |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |
| 404 | Producto o insumo no encontrado |

---

## Ventas

> `total`, `unit_price` y `subtotal` retornan como **number** (calculados en JS).
> El stock de insumos se descuenta automáticamente al cobrar, según la receta de cada producto.

### Crear venta · POST /sales

Crea una venta nueva en estado `OPEN`. El precio se toma del producto en el momento de la venta (snapshot). Solo acepta productos activos.

**Autenticación:** Bearer token · **Roles:** OWNER, CASHIER, WAITER

#### Request body

| Campo | Tipo | Requerido | Validación | Descripción |
| --- | --- | --- | --- | --- |
| `items` | array | ✅ | mín. 1 | Ítems de la venta |
| `items[].product_id` | UUID | ✅ | | ID del producto activo |
| `items[].quantity` | integer | ✅ | > 0 | Cantidad |
| `table_number` | string | ❌ | máx. 10 | Número o nombre de mesa |
| `customer_name` | string | ❌ | máx. 100 | Nombre del cliente |

```json
{
  "items": [
    { "product_id": "89c04027-59c0-4e4e-885e-fab292015dae", "quantity": 2 },
    { "product_id": "e9da7c23-05ff-4176-a8f3-883908636183", "quantity": 1 }
  ],
  "table_number": "5",
  "customer_name": "Juan"
}
```

#### Respuesta exitosa · `201 Created`

```json
{
  "data": {
    "id": "c38b05a9-a3fe-4771-abb7-04011a56b0e1",
    "status": "OPEN",
    "total": 4800,
    "table_number": "5",
    "customer_name": "Juan",
    "created_at": "2026-04-16T22:14:19.198Z",
    "user": {
      "id": "e510d36a-10ea-45b9-9415-0e9a3d201643",
      "name": "Dueño SmartBite",
      "username": "owner"
    },
    "items": [
      {
        "id": "f36ab915-b371-43cc-924b-9081739b4686",
        "product_id": "89c04027-59c0-4e4e-885e-fab292015dae",
        "product_name": "Hamburguesa Doble",
        "quantity": 2,
        "unit_price": 2000,
        "subtotal": 4000
      },
      {
        "id": "53b64b6c-1d48-4061-b137-3a2b9baf1edd",
        "product_id": "e9da7c23-05ff-4176-a8f3-883908636183",
        "product_name": "Papas Fritas",
        "quantity": 1,
        "unit_price": 800,
        "subtotal": 800
      }
    ]
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | Validación fallida (items vacío, UUID inválido, quantity ≤ 0) |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |
| 404 | Producto no encontrado o inactivo |

---

### Listar ventas · GET /sales

**Autenticación:** Bearer token · **Roles:** Todos

#### Query parameters

| Parámetro | Tipo | Descripción |
| --- | --- | --- |
| `status` | enum | Filtra por estado: `OPEN` \| `PAID_CASH` \| `PAID_YAPE` \| `PAID_PLIN` \| `PAID_AGORA` \| `CANCELLED` |
| `date` | string | Fecha en formato `YYYY-MM-DD` — devuelve solo las ventas de ese día |

```
GET /api/v1/sales?status=OPEN
GET /api/v1/sales?date=2026-04-16
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": [
    {
      "id": "c38b05a9-a3fe-4771-abb7-04011a56b0e1",
      "status": "PAID_YAPE",
      "total": 4800,
      "table_number": "5",
      "customer_name": "Juan",
      "created_at": "2026-04-16T22:14:19.198Z",
      "user": { "id": "...", "name": "Dueño SmartBite", "username": "owner" },
      "items": [ ... ]
    }
  ]
}
```

#### Errores

| Status | Causa | Mensaje |
| --- | --- | --- |
| 400 | `status` inválido | `"Estado inválido: INVALID"` |
| 400 | `date` mal formada (no `YYYY-MM-DD`) | `"Fecha inválida. Formato esperado: YYYY-MM-DD"` |
| 401 | Token ausente o inválido | — |

---

### Obtener venta · GET /sales/:id

**Autenticación:** Bearer token · **Roles:** Todos

```
GET /api/v1/sales/:id
Authorization: Bearer <token>
```

#### Errores

| Status | Causa | Mensaje |
| --- | --- | --- |
| 400 | UUID mal formado | `"Validation failed (uuid is expected)"` |
| 401 | Token ausente o inválido | — |
| 404 | Venta no encontrada | `"Venta no encontrada"` |

---

### Cobrar venta · PATCH /sales/:id/pay

Cambia el estado de `OPEN` a `PAID_*` y descuenta el stock de insumos según las recetas de cada producto. Operación atómica — si falla el descuento de stock, el estado no cambia.

**Autenticación:** Bearer token · **Roles:** OWNER, CASHIER

#### Request body

| Campo | Tipo | Requerido | Validación | Descripción |
| --- | --- | --- | --- | --- |
| `payment_method` | enum | ✅ | `CASH`\|`YAPE`\|`PLIN`\|`AGORA` | Método de pago |

```json
{ "payment_method": "YAPE" }
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "id": "c38b05a9-a3fe-4771-abb7-04011a56b0e1",
    "status": "PAID_YAPE"
  }
}
```

#### Errores

| Status | Causa | Mensaje |
| --- | --- | --- |
| 400 | UUID mal formado | `"Validation failed (uuid is expected)"` |
| 400 | `payment_method` inválido | `"Invalid option: expected one of \"CASH\"\|\"YAPE\"\|\"PLIN\"\|\"AGORA\""` |
| 401 | Token ausente o inválido | — |
| 403 | Rol sin permiso | — |
| 404 | Venta no encontrada | `"Venta no encontrada"` |
| 422 | Venta no está en estado `OPEN` | `"La venta ya está en estado: PAID_YAPE"` |

---

### Cancelar venta · PATCH /sales/:id/cancel

Cancela una venta `OPEN`. **No revierte el stock** — la venta no fue cobrada, no hubo descuento.

**Autenticación:** Bearer token · **Roles:** OWNER, CASHIER

```
PATCH /api/v1/sales/:id/cancel
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "id": "259e3942-21d5-463c-8cec-3bf62eaf0279",
    "status": "CANCELLED"
  }
}
```

#### Errores

| Status | Causa | Mensaje |
| --- | --- | --- |
| 400 | UUID mal formado | `"Validation failed (uuid is expected)"` |
| 401 | Token ausente o inválido | — |
| 403 | Rol sin permiso | — |
| 404 | Venta no encontrada | `"Venta no encontrada"` |
| 422 | Venta no está en estado `OPEN` | `"La venta ya está en estado: CANCELLED"` |

---

## Gastos

> `amount` retorna como **number**.
> El filtro `category` es **case-insensitive**.

### Registrar gasto · POST /expenses

**Autenticación:** Bearer token · **Roles:** OWNER, CASHIER

#### Request body

| Campo | Tipo | Requerido | Validación | Descripción |
| --- | --- | --- | --- | --- |
| `description` | string | ✅ | mín. 1 · máx. 200 | Descripción del gasto |
| `amount` | number | ✅ | > 0 | Monto |
| `category` | string | ✅ | mín. 1 · máx. 50 | Categoría (ej: `Insumos`, `Servicios`) |

```json
{
  "description": "Compra de papas",
  "amount": 1200,
  "category": "Insumos"
}
```

#### Respuesta exitosa · `201 Created`

```json
{
  "data": {
    "id": "ff4185ff-31ad-43e7-a0e7-988bf1ba8edd",
    "description": "Compra de papas",
    "amount": 1200,
    "category": "Insumos",
    "created_at": "2026-04-16T22:15:18.934Z",
    "user_id": "e510d36a-10ea-45b9-9415-0e9a3d201643"
  }
}
```

#### Errores

| Status | Causa |
| --- | --- |
| 400 | Validación fallida |
| 401 | Token ausente o inválido |
| 403 | Rol sin permiso |

---

### Listar gastos · GET /expenses

**Autenticación:** Bearer token · **Roles:** OWNER, CASHIER

#### Query parameters

| Parámetro | Tipo | Descripción |
| --- | --- | --- |
| `date` | string | Fecha `YYYY-MM-DD` |
| `category` | string | Filtro case-insensitive por categoría |

```
GET /api/v1/expenses?date=2026-04-16&category=Insumos
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": [
    {
      "id": "ff4185ff-31ad-43e7-a0e7-988bf1ba8edd",
      "description": "Compra de papas",
      "amount": 1200,
      "category": "Insumos",
      "created_at": "2026-04-16T22:15:18.934Z",
      "user_id": "e510d36a-10ea-45b9-9415-0e9a3d201643"
    }
  ]
}
```

#### Errores

| Status | Causa | Mensaje |
| --- | --- | --- |
| 400 | `date` mal formada (no `YYYY-MM-DD`) | `"Fecha inválida. Formato esperado: YYYY-MM-DD"` |
| 401 | Token ausente o inválido | — |
| 403 | Rol sin permiso | — |

---

### Obtener gasto · GET /expenses/:id

**Autenticación:** Bearer token · **Roles:** OWNER, CASHIER

```
GET /api/v1/expenses/:id
Authorization: Bearer <token>
```

#### Errores

| Status | Causa | Mensaje |
| --- | --- | --- |
| 400 | UUID mal formado | `"Validation failed (uuid is expected)"` |
| 401 | Token ausente o inválido | — |
| 403 | Rol sin permiso | — |
| 404 | Gasto no encontrado | `"Gasto no encontrado"` |

---

### Eliminar gasto · DELETE /expenses/:id

Hard delete — el gasto se elimina permanentemente.

**Autenticación:** Bearer token · **Roles:** OWNER

```
DELETE /api/v1/expenses/:id
Authorization: Bearer <token>
```

#### Respuesta exitosa · `200 OK`

```json
{
  "data": {
    "id": "5375ee66-1c6b-4d06-bf47-5089f4cacfc4",
    "deleted": true
  }
}
```

#### Errores

| Status | Causa | Mensaje |
| --- | --- | --- |
| 400 | UUID mal formado | `"Validation failed (uuid is expected)"` |
| 401 | Token ausente o inválido | — |
| 403 | Rol sin permiso | — |
| 404 | Gasto no encontrado | `"Gasto no encontrado"` |

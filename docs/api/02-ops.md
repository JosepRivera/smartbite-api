# Gestión operativa · docs/api/02-ops.md

> Operaciones diarias del negocio: productos, insumos y recetas.
>
> **Ventas y gastos:** no implementados todavía.
>
> **Formato de respuestas:** ver `01-auth.md#formato-de-respuestas` — éxito en `data: {}`, validación en `errors: []`.

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

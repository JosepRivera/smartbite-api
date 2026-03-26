# ADR-0012 — Vistas SQL para consultas de alto costo

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** REP-1, REP-3

---

## Contexto

REP-1 (dashboard) y REP-3 (rentabilidad) requieren consultas que agregan
datos de múltiples tablas con JOINs complejos. Estas consultas se ejecutan
frecuentemente — REP-1 en tiempo real cada vez que el dueño abre el
dashboard — y recalcularlas en cada request es ineficiente.

## Vistas definidas

### `v_daily_summary`
Usada por REP-1. Agrega los totales del día actual: ventas por estado de
pago, suma de gastos y ganancia estimada. Evita recalcular JOINs entre
`sales`, `sale_items` y `expenses` en cada request del dashboard.

```sql
CREATE OR REPLACE VIEW v_daily_summary AS
SELECT
  COALESCE(SUM(CASE WHEN s.status = 'PAID_CASH'  THEN s.total ELSE 0 END), 0) AS cash_income,
  COALESCE(SUM(CASE WHEN s.status IN ('PAID_YAPE','PAID_PLIN','PAID_AGORA') THEN s.total ELSE 0 END), 0) AS digital_income,
  COALESCE(SUM(CASE WHEN s.status != 'CANCELLED' AND s.status != 'OPEN' THEN s.total ELSE 0 END), 0) AS total_income,
  COUNT(CASE WHEN s.status = 'OPEN' THEN 1 END) AS open_orders,
  COUNT(CASE WHEN s.status != 'CANCELLED' AND s.status != 'OPEN' THEN 1 END) AS paid_orders
FROM sales s
WHERE s.created_at::date = CURRENT_DATE;
```

### `v_product_profitability`
Usada por REP-3. Calcula el costo unitario de cada producto desde sus
recetas e insumos, y lo cruza con el precio de venta para obtener el
margen. Sin esta vista, REP-3 requiere un JOIN entre `products`, `recipes`
e `ingredients` que se recalcula en cada consulta.

```sql
CREATE OR REPLACE VIEW v_product_profitability AS
SELECT
  p.id,
  p.name,
  p.category,
  p.price AS sale_price,
  COALESCE(SUM(r.quantity * i.cost_per_unit), 0) AS unit_cost,
  p.price - COALESCE(SUM(r.quantity * i.cost_per_unit), 0) AS unit_margin,
  CASE
    WHEN p.price > 0
    THEN ROUND(((p.price - COALESCE(SUM(r.quantity * i.cost_per_unit), 0)) / p.price * 100)::numeric, 2)
    ELSE 0
  END AS margin_percentage
FROM products p
LEFT JOIN recipes r ON r.product_id = p.id
LEFT JOIN ingredients i ON i.id = r.ingredient_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.category, p.price;
```

> Nota: `ingredients` necesita un campo `cost_per_unit` para esta vista.
> Se añade en la migración correspondiente a OPS-2.

## Cómo se crean

Las vistas se crean automáticamente via Docker al levantar el entorno.
Ver `decisions/0010-docker-sql-init.md` y `prisma/sql/01_views.sql`.

En `schema.prisma` se declaran como `view` para obtener tipado en Prisma:

```prisma
view DailySummary {
  cashIncome    Decimal @map("cash_income")
  digitalIncome Decimal @map("digital_income")
  totalIncome   Decimal @map("total_income")
  openOrders    Int     @map("open_orders")
  paidOrders    Int     @map("paid_orders")

  @@map("v_daily_summary")
}

view ProductProfitability {
  id               String  @id
  name             String
  category         String
  salePrice        Decimal @map("sale_price")
  unitCost         Decimal @map("unit_cost")
  unitMargin       Decimal @map("unit_margin")
  marginPercentage Decimal @map("margin_percentage")

  @@map("v_product_profitability")
}
```

## Decisión

Se crean **dos vistas SQL** en PostgreSQL para REP-1 y REP-3. Se inicializan
via Docker automáticamente y se declaran en `schema.prisma` para tipado.

## Consecuencias

- `DashboardService` consulta `v_daily_summary` directamente con `prisma.dailySummary.findFirst()`.
- `ReportsService` consulta `v_product_profitability` con `prisma.productProfitability.findMany()`.
- Las vistas son de solo lectura. Prisma no puede hacer writes sobre ellas.
- Si el schema cambia (ej: se añade un campo), hay que actualizar el SQL de la vista y hacer `pnpm clean` + `pnpm dev:build`.
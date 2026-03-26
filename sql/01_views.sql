-- prisma/sql/01_views.sql
-- Vistas SQL de SmartBite
-- Este archivo se ejecuta automáticamente cuando Docker crea el contenedor
-- por primera vez (docker-entrypoint-initdb.d).
-- Usar CREATE OR REPLACE para que sea idempotente.

-- ─────────────────────────────────────────────
-- Vista: v_daily_summary
-- Usada por: REP-1 Dashboard
-- Agrega los totales del día actual sin recalcular JOINs en cada request.
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_daily_summary AS
SELECT
  COALESCE(SUM(CASE WHEN status = 'PAID_CASH'  THEN total ELSE 0 END), 0)                                          AS cash_income,
  COALESCE(SUM(CASE WHEN status IN ('PAID_YAPE','PAID_PLIN','PAID_AGORA') THEN total ELSE 0 END), 0)               AS digital_income,
  COALESCE(SUM(CASE WHEN status NOT IN ('CANCELLED','OPEN') THEN total ELSE 0 END), 0)                             AS total_income,
  COUNT(CASE WHEN status = 'OPEN'      THEN 1 END)                                                                  AS open_orders,
  COUNT(CASE WHEN status NOT IN ('CANCELLED','OPEN') THEN 1 END)                                                    AS paid_orders
FROM sales
WHERE created_at::date = CURRENT_DATE;


-- ─────────────────────────────────────────────
-- Vista: v_product_profitability
-- Usada por: REP-3 Rentabilidad
-- Calcula margen unitario de cada producto activo cruzando precio,
-- receta y costo de insumos.
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_product_profitability AS
SELECT
  p.id,
  p.name,
  p.category,
  p.price                                                                                    AS sale_price,
  COALESCE(SUM(r.quantity * i.cost_per_unit), 0)                                            AS unit_cost,
  p.price - COALESCE(SUM(r.quantity * i.cost_per_unit), 0)                                  AS unit_margin,
  CASE
    WHEN p.price > 0
    THEN ROUND(
      ((p.price - COALESCE(SUM(r.quantity * i.cost_per_unit), 0)) / p.price * 100)::numeric,
      2
    )
    ELSE 0
  END                                                                                         AS margin_percentage
FROM products p
LEFT JOIN recipes r       ON r.product_id    = p.id
LEFT JOIN ingredients i   ON i.id            = r.ingredient_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.category, p.price;
-- prisma/sql/03_indexes.sql
-- Índices parciales y especiales de SmartBite
-- Estos índices no pueden crearse completamente via Prisma schema
-- y se gestionan aquí para evitar pasos manuales.
-- Usar IF NOT EXISTS para que sean idempotentes.

-- ─────────────────────────────────────────────
-- Índice parcial para OPS-7 Alertas de stock bajo
-- Optimiza la consulta que busca insumos con stock <= min_stock
-- sin escanear toda la tabla ingredients.
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ingredients_low_stock
  ON ingredients (stock)
  WHERE stock <= min_stock;


-- ─────────────────────────────────────────────
-- Índice parcial para órdenes OPEN del día
-- OPS-6 y el dashboard consultan frecuentemente órdenes
-- en estado OPEN. Este índice evita escanear órdenes cerradas.
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sales_open_today
  ON sales (created_at, table_number)
  WHERE status = 'OPEN';
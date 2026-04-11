-- ═══════════════════════════════════════════════════════════════════
-- SmartBite — Setup inicial para Supabase
-- ═══════════════════════════════════════════════════════════════════
-- Cómo usar:
--   1. Creá tu proyecto en supabase.com
--   2. Abrí SQL Editor en el dashboard
--   3. Pegá y ejecutá este archivo completo
--   4. Copiá las vars de entorno de Settings → API en tu .env
--
-- IMPORTANTE: Corré esto SOLO UNA VEZ en un proyecto nuevo.
--             Es idempotente (CREATE IF NOT EXISTS, CREATE OR REPLACE).
-- ═══════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE role_enum AS ENUM ('OWNER', 'CASHIER', 'WAITER', 'COOK');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sale_status_enum AS ENUM ('OPEN', 'PAID_CASH', 'PAID_YAPE', 'PAID_PLIN', 'PAID_AGORA', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_source_enum AS ENUM ('YAPE', 'PLIN', 'AGORA');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ─────────────────────────────────────────────
-- USERS (perfil de app — vinculado a auth.users de Supabase)
-- SIN campo password — Supabase Auth lo gestiona.
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  username    TEXT        NOT NULL UNIQUE,
  role        role_enum   NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Nota: id NO tiene DEFAULT — viene de auth.users via Supabase Auth.

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);


-- ─────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT          NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  category    TEXT          NOT NULL,
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_category  ON products (category);


-- ─────────────────────────────────────────────
-- INGREDIENTS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ingredients (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT           NOT NULL,
  unit          TEXT           NOT NULL,
  stock         DECIMAL(10,3)  NOT NULL DEFAULT 0,
  min_stock     DECIMAL(10,3)  NOT NULL DEFAULT 0,
  cost_per_unit DECIMAL(10,4)  NOT NULL,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingredients_stock ON ingredients (stock);


-- ─────────────────────────────────────────────
-- RECIPES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS recipes (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID           NOT NULL REFERENCES products(id)    ON DELETE CASCADE,
  ingredient_id UUID           NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  quantity      DECIMAL(10,4)  NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_recipes_product_ingredient ON recipes (product_id, ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipes_product_id ON recipes (product_id);


-- ─────────────────────────────────────────────
-- SALES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sales (
  id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  status        sale_status_enum  NOT NULL DEFAULT 'OPEN',
  total         DECIMAL(10,2)     NOT NULL,
  table_number  VARCHAR(10),
  customer_name TEXT,
  user_id       UUID              NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_by    UUID              REFERENCES users(id) ON DELETE SET NULL,
  cancelled_by  UUID              REFERENCES users(id) ON DELETE SET NULL,
  cancelled_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_status       ON sales (status);
CREATE INDEX IF NOT EXISTS idx_sales_table_number ON sales (table_number);
CREATE INDEX IF NOT EXISTS idx_sales_user_id      ON sales (user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at   ON sales (created_at);


-- ─────────────────────────────────────────────
-- SALE_ITEMS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sale_items (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id     UUID          NOT NULL REFERENCES sales(id)    ON DELETE CASCADE,
  product_id  UUID          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER       NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id    ON sale_items (sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items (product_id);


-- ─────────────────────────────────────────────
-- EXPENSES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT          NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  category    TEXT          NOT NULL,
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses (created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id    ON expenses (user_id);


-- ─────────────────────────────────────────────
-- CASH_CLOSES (inmutable — sin UPDATE ni DELETE a nivel BD)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cash_closes (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  date            DATE          NOT NULL,
  cash_income     DECIMAL(10,2) NOT NULL DEFAULT 0,
  digital_income  DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_income    DECIMAL(10,2) NOT NULL,
  total_expenses  DECIMAL(10,2) NOT NULL DEFAULT 0,
  net_profit      DECIMAL(10,2) NOT NULL,
  closed_by       UUID          NOT NULL REFERENCES users(id)       ON DELETE RESTRICT,
  parent_close_id UUID          REFERENCES cash_closes(id)          ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Solo un cierre "normal" (sin parent) por día
CREATE UNIQUE INDEX IF NOT EXISTS uq_cash_closes_date_normal
  ON cash_closes (date)
  WHERE parent_close_id IS NULL;


-- ─────────────────────────────────────────────
-- PAYMENT_NOTIFICATIONS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_notifications (
  id              UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id TEXT                 NOT NULL UNIQUE,
  amount          DECIMAL(10,2)        NOT NULL,
  sender_name     TEXT                 NOT NULL,
  source          payment_source_enum  NOT NULL,
  raw_text        VARCHAR(500)         NOT NULL,
  is_reviewed     BOOLEAN              NOT NULL DEFAULT false,
  reviewed_by     UUID                 REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ          NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_notifications_notification_id ON payment_notifications (notification_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_is_reviewed     ON payment_notifications (is_reviewed);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_created_at      ON payment_notifications (created_at);


-- ─────────────────────────────────────────────
-- DEVICE_TOKENS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS device_tokens (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  api_key_hash  TEXT        NOT NULL UNIQUE,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  registered_by UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  last_used_at  TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_is_active ON device_tokens (is_active);


-- ─────────────────────────────────────────────
-- REFERENCE_BASELINES
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reference_baselines (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  day_of_week INTEGER       NOT NULL,
  quantity    DECIMAL(10,2) NOT NULL,
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_reference_baselines_product_day ON reference_baselines (product_id, day_of_week);


-- ─────────────────────────────────────────────
-- DAILY_PRODUCTION_PLANS
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_production_plans (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  date              DATE         NOT NULL,
  product_id        UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity          DECIMAL(10,2) NOT NULL,
  prediction_source VARCHAR(50)  NOT NULL,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_daily_production_plans_date_product ON daily_production_plans (date, product_id);
CREATE INDEX IF NOT EXISTS idx_daily_production_plans_date ON daily_production_plans (date);


-- ─────────────────────────────────────────────
-- ÍNDICES PARCIALES (no expresables en Prisma schema)
-- ─────────────────────────────────────────────

-- OPS-7: stock bajo
CREATE INDEX IF NOT EXISTS idx_ingredients_low_stock
  ON ingredients (stock)
  WHERE stock <= min_stock;

-- Órdenes OPEN del día (OPS-6 y dashboard)
CREATE INDEX IF NOT EXISTS idx_sales_open_today
  ON sales (created_at, table_number)
  WHERE status = 'OPEN';


-- ─────────────────────────────────────────────
-- VISTAS SQL
-- ─────────────────────────────────────────────

CREATE OR REPLACE VIEW v_daily_summary AS
SELECT
  COALESCE(SUM(CASE WHEN status = 'PAID_CASH' THEN total ELSE 0 END), 0)                          AS cash_income,
  COALESCE(SUM(CASE WHEN status IN ('PAID_YAPE','PAID_PLIN','PAID_AGORA') THEN total ELSE 0 END), 0) AS digital_income,
  COALESCE(SUM(CASE WHEN status NOT IN ('CANCELLED','OPEN') THEN total ELSE 0 END), 0)             AS total_income,
  COUNT(CASE WHEN status = 'OPEN' THEN 1 END)                                                       AS open_orders,
  COUNT(CASE WHEN status NOT IN ('CANCELLED','OPEN') THEN 1 END)                                   AS paid_orders
FROM sales
WHERE created_at::date = CURRENT_DATE;

CREATE OR REPLACE VIEW v_product_profitability AS
SELECT
  p.id,
  p.name,
  p.category,
  p.price                                                                      AS sale_price,
  COALESCE(SUM(r.quantity * i.cost_per_unit), 0)                              AS unit_cost,
  p.price - COALESCE(SUM(r.quantity * i.cost_per_unit), 0)                    AS unit_margin,
  CASE
    WHEN p.price > 0
    THEN ROUND(
      ((p.price - COALESCE(SUM(r.quantity * i.cost_per_unit), 0)) / p.price * 100)::numeric,
      2
    )
    ELSE 0
  END                                                                           AS margin_percentage
FROM products p
LEFT JOIN recipes r     ON r.product_id    = p.id
LEFT JOIN ingredients i ON i.id            = r.ingredient_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.category, p.price;


-- ─────────────────────────────────────────────
-- INMUTABILIDAD DE CASH_CLOSES
-- Revocamos UPDATE y DELETE a los roles de Supabase.
-- service_role (NestJS via admin client) conserva todos los permisos.
-- Capa 2 de seguridad (Capa 1: la API solo expone POST).
-- ─────────────────────────────────────────────

REVOKE UPDATE, DELETE ON cash_closes FROM authenticated;
REVOKE UPDATE, DELETE ON cash_closes FROM anon;


-- ─────────────────────────────────────────────
-- RLS — Row Level Security
-- Supabase activa RLS por defecto. Lo desactivamos en todas las tablas
-- porque la seguridad la gestiona NestJS (JwtGuard + RolesGuard).
-- Si en el futuro usás el cliente de Supabase desde kotlin directo
-- a la BD, activá RLS y configurá policies.
-- ─────────────────────────────────────────────

ALTER TABLE users                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE products               DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients            DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipes                DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales                  DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items             DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses               DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closes            DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_notifications  DISABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens          DISABLE ROW LEVEL SECURITY;
ALTER TABLE reference_baselines    DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_production_plans DISABLE ROW LEVEL SECURITY;

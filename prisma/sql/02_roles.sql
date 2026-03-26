-- prisma/sql/02_roles.sql
-- Permisos de base de datos para SmartBite
-- Garantiza la inmutabilidad del cierre de caja a nivel de BD,
-- independientemente de la API. Ver decisions/0005-cash-close-immutability.md
--
-- Este archivo se ejecuta automáticamente cuando Docker crea el contenedor
-- por primera vez (docker-entrypoint-initdb.d).

-- ─────────────────────────────────────────────
-- Inmutabilidad de cash_closes
--
-- El usuario de la aplicación NO puede hacer UPDATE ni DELETE
-- sobre la tabla cash_closes. Esto es la segunda capa de protección:
--   Capa 1: La API solo expone POST (sin PUT, PATCH ni DELETE).
--   Capa 2: Este REVOKE impide modificaciones aunque alguien bypasee la API.
--
-- Si se necesita corregir un cierre, se crea un nuevo registro con
-- parent_close_id apuntando al original. El original nunca se toca.
-- ─────────────────────────────────────────────
DO $$
BEGIN
  -- Solo ejecutar si el rol existe (idempotente en reinicios)
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = current_user) THEN
    EXECUTE format(
      'REVOKE UPDATE, DELETE ON cash_closes FROM %I',
      current_user
    );
  END IF;
END
$$;
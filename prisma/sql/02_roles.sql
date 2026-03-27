-- prisma/sql/02_roles.sql
-- Permisos de base de datos para SmartBite
-- Garantiza la inmutabilidad del cierre de caja a nivel de BD.
-- Ver decisions/0005-cash-close-immutability.md
--
-- Este archivo se ejecuta DESPUÉS de prisma migrate deploy
-- desde el command del app-dev en docker-compose.yml.
-- Las tablas ya existen cuando este script corre.

-- ─────────────────────────────────────────────
-- Inmutabilidad de cash_closes
-- El usuario de la app NO puede hacer UPDATE ni DELETE.
--   Capa 1: La API solo expone POST.
--   Capa 2: Este REVOKE impide modificaciones aunque alguien bypasee la API.
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = current_user) THEN
    EXECUTE format(
      'REVOKE UPDATE, DELETE ON cash_closes FROM %I',
      current_user
    );
  END IF;
END
$$;
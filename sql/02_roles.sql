-- prisma/sql/02_roles.sql
-- Permisos de base de datos para SmartBite
-- Garantiza la inmutabilidad del cierre de caja a nivel de BD,
-- independientemente de la API. Ver decisions/0005-cash-close-immutability.md

-- El usuario de la aplicación (definido en DATABASE_URL) NO puede
-- hacer UPDATE ni DELETE sobre cash_closes.
-- Esto complementa la restricción a nivel de API (solo POST existe).

-- Revocar permisos de modificación sobre cash_closes al rol de la app.
-- Reemplazar 'smartbite_user' con el valor de POSTGRES_USER en .env
DO $$
BEGIN
  -- Solo ejecutar si el rol existe
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = current_user) THEN
    EXECUTE format(
      'REVOKE UPDATE, DELETE ON cash_closes FROM %I',
      current_user
    );
  END IF;
END
$$;
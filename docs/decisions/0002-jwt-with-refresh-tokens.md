# ADR-0002 — JWT con refresh tokens sobre sesiones en servidor

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** AUTH-1

---

## Contexto

El sistema necesita autenticación para una app multiplataforma (web y móvil Android). Los usuarios pueden tener múltiples sesiones activas simultáneas desde distintos dispositivos.

## Alternativas evaluadas

**Sesiones en servidor (session-based auth)**
- El servidor guarda el estado de la sesión en memoria o en Redis.
- Simple de implementar pero requiere infraestructura adicional (Redis) para soportar múltiples instancias del servidor.
- No es adecuado para apps móviles donde el cliente no maneja cookies de forma nativa.

**OAuth 2.0 con proveedor externo (Google, Auth0)**
- Delega la autenticación a un tercero.
- Adecuado para apps con registro público, no para un sistema donde el dueño crea las cuentas de sus empleados manualmente.
- Añade dependencia externa innecesaria para este caso de uso.

**JWT stateless con refresh tokens**
- El servidor no guarda estado de sesión. El access token contiene toda la información necesaria para autorizar una request.
- El access token tiene vida corta (15 minutos) para limitar el impacto de una filtración.
- El refresh token tiene vida larga (7 días) y permite renovar el access token sin requerir que el usuario vuelva a ingresar su contraseña.
- Los refresh tokens se guardan hasheados en BD con `revoked_at` para soportar logout y revocación.
- Funciona de forma nativa en apps móviles Flutter sin cookies.

## Decisión

Se usa **JWT stateless con refresh tokens**. Es el estándar de la industria para APIs REST consumidas por apps móviles, no requiere infraestructura adicional y soporta múltiples sesiones simultáneas de forma natural.

## Consecuencias

- Los access tokens expiran en 15 minutos. Flutter debe renovarlos automáticamente usando el refresh token antes de que expiren.
- Los refresh tokens se guardan en la tabla `refresh_tokens` con `token_hash` y `revoked_at`.
- El logout invalida el refresh token seteando `revoked_at`, no elimina el registro.
- Si un refresh token es comprometido, el dueño puede revocarlo desde la gestión de sesiones.
- No se usa Redis ni ningún almacén de sesiones externo.
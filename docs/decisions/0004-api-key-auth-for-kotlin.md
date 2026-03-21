# ADR-0004 — API Key fija sobre JWT para autenticar el listener Kotlin

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** PAG-1

---

## Contexto

La app Kotlin corre en segundo plano en el celular del negocio y necesita autenticarse con el backend NestJS al enviar cada notificación de pago. La app no tiene pantalla de login ni interacción humana directa.

## Alternativas evaluadas

**JWT del dueño guardado en la app Kotlin**
- El dueño inicia sesión una vez y el token se guarda en la app Kotlin.
- El JWT expira en 15 minutos, lo que requiere lógica de renovación con refresh token dentro de la app Kotlin.
- Añade complejidad innecesaria a una app de background que no representa a un usuario humano.
- Si el dueño cambia su contraseña, la app Kotlin deja de funcionar hasta que el dueño vuelva a autenticarla manualmente.

**OAuth 2.0 client credentials**
- Estándar para autenticación machine-to-machine.
- Sobredimensionado para este caso: un solo dispositivo por negocio que hace POSTs simples.
- Requiere implementar un servidor de autorización OAuth o usar uno externo.

**API Key fija con hash en BD**
- Una clave aleatoria larga generada en el registro del dispositivo.
- Se guarda hasheada en BD con bcrypt. El valor real solo lo conoce la app Kotlin.
- Se almacena cifrada en `EncryptedSharedPreferences` de Android.
- Nunca expira automáticamente. Solo se invalida si el dueño la revoca explícitamente.
- El registro se hace una sola vez escaneando un QR desde Flutter. Sin intervención posterior.
- Rate limit de 20 requests por minuto por `device_id` como capa adicional de seguridad.

## Decisión

Se usa **API Key fija** autenticada vía header `X-API-Key`. Es el patrón correcto para autenticación de dispositivos físicos (machine-to-machine) donde no hay un usuario humano interactuando. Lo usan Stripe, Twilio y GitHub para exactamente este tipo de caso de uso.

## Consecuencias

- La API Key se genera en `POST /devices/register` y se retorna una sola vez.
- Se guarda en BD como hash bcrypt en la tabla `device_tokens`.
- La app Kotlin la guarda en `EncryptedSharedPreferences`, nunca en `SharedPreferences` plano.
- Si el celular del negocio se pierde, el dueño revoca el dispositivo desde Flutter con `POST /devices/:id/revoke`. La clave queda inválida inmediatamente.
- No hay rotación automática de la clave. La complejidad no está justificada para este caso de uso.
# Integración Payment Listener (PAG-1)

Documentación técnica de la app Android Kotlin que intercepta
notificaciones de Yape, Plin y Ágora y las envía al backend NestJS.

---

## Visión general

La app Kotlin corre en segundo plano en el celular del negocio usando
`NotificationListenerService`. Cuando llega una notificación de Yape,
Plin o Ágora, la app extrae el monto y el nombre del remitente y hace
un POST al backend con una API Key.

El cajero consulta las notificaciones recibidas en Flutter como referencia
visual. El flujo de confirmación siempre lo hace el cajero manualmente —
no hay matching automático entre notificaciones y órdenes.

---

## Flujo completo de un pago digital

```
Cliente paga por Yape desde su celular
        ↓
Notificación push llega al celular del negocio
        ↓
App Kotlin intercepta la notificación (NotificationListenerService)
        ↓
Kotlin parsea: monto + nombre del remitente
        ↓
POST /api/v1/payments/notifications  (header: X-API-Key)
        ↓
NestJS valida la API Key, guarda en payment_notifications
        ↓
Cliente se acerca a caja y muestra el comprobante en su celular
        ↓
Cajero filtra notificaciones por fuente (Yape/Plin/Ágora) en Flutter
        ↓
Cajero verifica que el nombre en la notificación coincide con el comprobante
        ↓
Cajero busca la orden por ID de ticket o número de mesa
        ↓
Cajero marca la orden como PAID_YAPE / PAID_PLIN / PAID_AGORA
        ↓
Sistema descuenta el stock automáticamente
```

---

## Registro del dispositivo

El dueño registra el celular listener desde Flutter en el módulo de
dispositivos. El flujo es:

1. El dueño abre Flutter → «Dispositivos» → «Registrar nuevo dispositivo».
2. Flutter llama a `POST /api/v1/devices/register` y recibe la API Key generada.
3. Flutter muestra un QR que codifica la API Key y la URL del backend.
4. El dueño abre la app Kotlin en el celular listener y escanea el QR.
5. La app Kotlin guarda la API Key en `EncryptedSharedPreferences` automáticamente.
6. La app Kotlin activa `NotificationListenerService` y queda lista.

> **El dueño solo necesita hacer esto una vez.** La API Key no expira
> automáticamente. Solo se invalida si el dueño la revoca manualmente.

### Esquemas de uso

**Celular dedicado en el negocio (recomendado)**
Un Android fijo en caja con Yape, Plin y Ágora instaladas. Siempre
encendido durante el horario de atención. Configuración más estable.

**Celular del dueño**
El dueño registra su propio celular si tiene las apps instaladas. Funciona
igual, pero puede haber interrupciones cuando el dueño no está en el local.
Válido como opción de arranque.

---

## Revocación de dispositivo

Si el celular del negocio se pierde o se compromete:

1. El dueño abre Flutter → «Dispositivos» → selecciona el dispositivo → «Revocar».
2. Flutter llama a `POST /api/v1/devices/:id/revoke`.
3. NestJS marca `is_active = false` en `device_tokens`.
4. Cualquier POST con esa API Key recibe `401 Unauthorized` de inmediato.

---

## Patrones de parseo

Cada billetera tiene un formato de notificación diferente. Los patrones
regex para extraer monto y nombre se almacenan en el backend y son
actualizables sin publicar una nueva versión de la app Kotlin.

Ejemplos de formato de notificación:

```
Yape:   "Juan Pérez te yapeo S/ 25.00"
Plin:   "Recibiste S/ 18.50 de María García"
Ágora:  "Pago recibido: S/ 12.00 - Carlos López"
```

Si una billetera cambia su formato, solo se actualiza el patrón en el
servidor. La app Kotlin descarga los patrones actualizados en cada inicio.

---

## Idempotencia

Cada notificación tiene un `notification_id` único generado por la app
Kotlin (hash del contenido + timestamp). El backend rechaza duplicados
con `409 Conflict` para evitar registros dobles si la app reintenta.

---

## Seguridad

- La API Key se transmite en el header `X-API-Key`, nunca en el body ni en la URL.
- Se guarda hasheada con bcrypt en la tabla `device_tokens`. El valor en texto plano solo existe en el celular del negocio.
- En el celular se guarda en `EncryptedSharedPreferences`, cifrado con AES-256.
- Rate limit: máximo 20 requests por minuto por `device_id`. Superar el límite retorna `429 Too Many Requests`.

---

## Endpoint del backend

```
POST /api/v1/payments/notifications
Header: X-API-Key: <api_key>

Body:
{
  "notificationId": "abc123",
  "amount": 25.00,
  "senderName": "Juan Pérez",
  "source": "YAPE"
}

Response 201:
{
  "data": {
    "id": "uuid",
    "amount": 25.00,
    "senderName": "Juan Pérez",
    "source": "YAPE",
    "isReviewed": false,
    "createdAt": "2025-03-21T15:42:00.000Z"
  }
}
```

---

## Stack Kotlin

| Librería                            | Para qué se usa                                                      |
| ----------------------------------- | -------------------------------------------------------------------- |
| `NotificationListenerService` (SDK) | Intercepta notificaciones del sistema                                |
| `OkHttp 4`                          | POST al backend en segundo plano                                     |
| `kotlinx.serialization`             | Serializar el payload JSON                                           |
| `EncryptedSharedPreferences`        | API Key cifrada en el dispositivo                                    |
| `ML Kit Barcode Scanning`           | Escanear el QR de Flutter para guardar la API Key                    |
| `Foreground Service` (SDK)          | Mantener la app activa. Android 8+ requiere notificación persistente |
| `kotlinx.coroutines`                | POST asíncrono sin bloquear el hilo principal                        |
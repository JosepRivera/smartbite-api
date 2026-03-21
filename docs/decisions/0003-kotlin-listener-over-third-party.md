# ADR-0003 — App Kotlin propia sobre servicios de terceros para pagos digitales

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** PAG-1

---

## Contexto

El negocio recibe pagos por Yape, Plin y Ágora. El sistema necesita detectar estos pagos automáticamente para notificar al cajero sin que tenga que revisar el celular manualmente cada vez.

## Alternativas evaluadas

**BiPe Alerta y servicios similares**
- Servicios de terceros que leen los SMS o notificaciones del celular del negocio y envían un webhook al backend.
- Costo mensual recurrente (S/ 30–80 aprox.).
- Dependencia de que el servicio siga existiendo y funcionando.
- No se tiene control sobre los patrones de parseo si una billetera cambia su formato.
- Introduce una dependencia externa crítica en el flujo de cobro.

**Webhooks oficiales de Yape/Plin**
- Yape y Plin no tienen APIs públicas ni webhooks disponibles para negocios pequeños al momento del desarrollo.
- Solo disponibles para grandes comercios con integración formal, fuera del alcance de las mypes objetivo.

**App Android nativa con NotificationListenerService**
- Android expone una API del sistema (`NotificationListenerService`) que permite a una app leer las notificaciones de otras apps instaladas en el mismo dispositivo.
- Sin costo mensual ni dependencia de terceros.
- Control total sobre los patrones de parseo por billetera.
- Los patrones son configurables desde el backend sin necesidad de actualizar la app.
- Es propiedad intelectual del proyecto.

## Decisión

Se desarrolla una **app Android nativa en Kotlin** que usa `NotificationListenerService` para interceptar notificaciones de Yape, Plin y Ágora y enviarlas al backend NestJS. Es la solución más adecuada para el segmento objetivo (mypes peruanas) porque no tiene costo recurrente y no depende de terceros.

## Consecuencias

- La app Kotlin es una APK separada que se instala en el celular del negocio (no en el celular del cliente).
- Requiere que el dueño active el permiso especial de acceso a notificaciones en la configuración de Android. Este permiso no se puede otorgar desde código.
- El onboarding del dispositivo se hace escaneando un QR generado por Flutter.
- Los patrones de parseo de cada billetera se almacenan en el backend y son actualizables sin liberar una nueva versión de la app Kotlin.
- Las notificaciones de pago son solo informativas para el cajero. El cobro siempre lo confirma el cajero manualmente.
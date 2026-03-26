# ADR-0007 — Estrategia de fallback para Claude API

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** IA-1, IA-2, IA-3, VOZ-1

---

## Contexto

Claude API es una dependencia externa crítica usada en cuatro funcionalidades del sistema. Cualquier fallo de disponibilidad, timeout o error de la API puede afectar la experiencia del usuario. El sistema necesita una estrategia clara de degradación que no rompa el flujo operativo del negocio.

## Principio general

Las funcionalidades de IA son mejoras sobre el flujo base, no el flujo base en sí. El negocio debe poder operar (registrar ventas, cobrar, cerrar caja) aunque Claude API no esté disponible.

## Estrategia por funcionalidad

**IA-1 — Asistente conversacional (Text-to-SQL)**
Si Claude API falla o hace timeout, se muestra el mensaje: "El asistente no está disponible en este momento. Intenta en unos minutos." La app no rompe. El dueño puede consultar los reportes normales mientras tanto.

**IA-2 — Predicción de demanda (ajuste contextual)**
El cron job de las 6 a.m. ejecuta Holt-Winters localmente sin depender de Claude API. Si el ajuste contextual de Claude falla, se usa la predicción base de Holt-Winters sin factor de ajuste. El plan de producción siempre está disponible antes de las 7 a.m.

**IA-3 — Recomendador de compras (narración)**
El motor MRP calcula los números localmente. Si Claude API falla al generar la narración en lenguaje natural, se muestra la lista de compras en formato tabla directamente, sin narración. La información es la misma, solo cambia la presentación.

**VOZ-1 — Voice-to-Form (extracción de entidades)**

VOZ-1 depende de dos APIs externas en serie: Groq Whisper primero, Claude API después.
Se definen tres escenarios de fallo independientes:

- **Solo Claude API falla (Groq Whisper OK):** La transcripción del audio existe pero no se pueden extraer los campos del formulario. Se muestra la transcripción cruda de Whisper en pantalla. El usuario lee la transcripción y llena el formulario manualmente. La transcripción nunca se pierde.

- **Solo Groq Whisper falla (Claude API OK):** No existe transcripción, por lo que Claude no tiene nada que procesar. Se muestra el mensaje: "No se pudo transcribir el audio. Intenta de nuevo o ingresa manualmente." El formulario queda vacío y disponible para llenado manual. El audio grabado se descarta.

- **Ambas APIs fallan:** Mismo comportamiento que el caso anterior. Sin transcripción, sin extracción. El formulario siempre está disponible como alternativa. El audio grabado se descarta.

En ningún escenario se reintenta en background ni se guarda el audio para procesamiento posterior. La voz es un atajo de velocidad, no el único camino de entrada.

## Decisión

Cada funcionalidad tiene un **fallback específico** que garantiza que el flujo operativo del negocio no se interrumpe. Ninguna funcionalidad de IA es un punto único de fallo del sistema.

## Consecuencias

- Los timeouts de Claude API se configuran en 10 segundos para IA-1 y VOZ-1 (interactivos) y en 30 segundos para IA-2 e IA-3 (batch).
- Los timeouts de Groq Whisper se configuran en 15 segundos (transcripción de audio corto).
- Los errores de Claude API y Groq Whisper se loguean en el servidor pero no se propagan como errores 500 al cliente.
- Flutter muestra estados de carga y mensajes de fallback específicos por funcionalidad y por escenario de fallo.
- El cron job de IA-2 no falla silenciosamente: si tanto Holt-Winters como Claude fallan, se loguea el error y se mantiene el plan del día anterior.
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
El cron job de las 6 am ejecuta Holt-Winters localmente sin depender de Claude API. Si el ajuste contextual de Claude falla, se usa la predicción base de Holt-Winters sin factor de ajuste. El plan de producción siempre está disponible antes de las 7 am.

**IA-3 — Recomendador de compras (narración)**
El motor MRP calcula los números localmente. Si Claude API falla al generar la narración en lenguaje natural, se muestra la lista de compras en formato tabla directamente, sin narración. La información es la misma, solo cambia la presentación.

**VOZ-1 — Voice-to-Form (extracción de entidades)**
Groq Whisper transcribe el audio de forma independiente a Claude API. Si Claude falla al extraer las entidades del formulario, se muestra la transcripción cruda de Whisper en un campo de texto. El usuario puede leer la transcripción y llenar el formulario manualmente. La transcripción nunca se pierde.

## Decisión

Cada funcionalidad tiene un **fallback específico** que garantiza que el flujo operativo del negocio no se interrumpe. Ninguna funcionalidad de IA es un punto único de fallo del sistema.

## Consecuencias

- Los timeouts de Claude API se configuran en 10 segundos para IA-1 y VOZ-1 (interactivos) y en 30 segundos para IA-2 e IA-3 (batch).
- Los errores de Claude API se loguean en el servidor pero no se propagan como errores 500 al cliente.
- Flutter muestra estados de carga y mensajes de fallback específicos por funcionalidad.
- El cron job de IA-2 no falla silenciosamente: si tanto Holt-Winters como Claude fallan, se loguea el error y se mantiene el plan del día anterior.
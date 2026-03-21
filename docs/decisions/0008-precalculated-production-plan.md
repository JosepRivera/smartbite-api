# ADR-0008 — Plan de producción precalculado sobre cálculo en tiempo real

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** IA-4

---

## Contexto

El plan de producción diaria (IA-4) necesita estar disponible para todos los roles (cocinero, cajero, mozo, dueño) desde el inicio del turno. Se basa en la predicción de IA-2 que ejecuta Holt-Winters y llama a Claude API para el ajuste contextual.

## Alternativas evaluadas

**Cálculo en tiempo real por request**
- Cada vez que un usuario abre la pantalla del plan de producción, el servidor ejecuta Holt-Winters y llama a Claude API.
- Latencia alta: Holt-Winters + llamada a Claude API puede tomar 3–8 segundos.
- Si Claude API está lenta o no disponible, la pantalla no carga.
- Si 5 usuarios abren la pantalla al mismo tiempo al inicio del turno, se generan 5 llamadas simultáneas a Claude API.
- Costo innecesario en tokens de Claude API por cada visualización.

**Precálculo con cron job diario**
- Un cron job a las 6 am ejecuta el cálculo una sola vez y guarda el resultado en la tabla `daily_production_plans`.
- Todos los clientes leen el plan precalculado desde la BD. Latencia de milisegundos.
- El plan siempre está disponible aunque Claude API no funcione (usa la predicción base de Holt-Winters).
- Un solo token de Claude API consumido por día, no uno por cada request.
- Si el cron job falla, se mantiene el plan del día anterior y se loguea el error.

## Decisión

Se usa **cron job diario a las 6 am** con `@Cron('0 6 * * *')` de `@nestjs/schedule`. El resultado se guarda en `daily_production_plans`. Los clientes solo hacen `GET /production-plans/today` que lee directamente de la BD.

## Consecuencias

- El plan de producción siempre está disponible antes de las 7 am, sin importar la carga del sistema.
- `GET /production-plans/today` es un endpoint de solo lectura sin lógica de IA. Responde en milisegundos.
- Si el dueño quiere regenerar el plan manualmente (por ejemplo, tras corregir datos), existe `POST /production-plans/regenerate` protegido con rol `OWNER`.
- El cron job loguea su ejecución con timestamp, duración y resultado para facilitar el debugging.
- El módulo `@nestjs/schedule` se inicializa en `AppModule`.
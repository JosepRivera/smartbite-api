# ADR-0006 — Holt-Winters implementado desde cero sobre librerías externas

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** IA-2

---

## Contexto

El sistema necesita predecir la demanda diaria de productos para generar el plan de producción (IA-4). El algoritmo Holt-Winters (suavizamiento exponencial triple) es el método estadístico adecuado porque detecta tendencia y estacionalidad semanal en series de tiempo cortas.

## Alternativas evaluadas

**Librerías de estadística externas (statsmodels vía Python microservicio, ml-regression, etc.)**
- Requieren mantener un microservicio Python o añadir dependencias pesadas al proyecto NestJS.
- Caja negra: si el algoritmo produce resultados incorrectos, es difícil debuggear.
- Añaden complejidad de infraestructura (un servicio más que desplegar y mantener).
- Para una pre-tesis, delegar el algoritmo central a una librería externa reduce el valor académico del proyecto.

**Claude API para predicción directa**
- Enviar el historial de ventas a Claude y pedirle una predicción.
- No reproducible ni determinista: la misma entrada puede producir distintas salidas.
- Costoso en tokens si se ejecuta diariamente para todos los productos.
- No es un algoritmo estadístico formal que se pueda validar con métricas como MAPE.

**Implementación propia en NestJS**
- El algoritmo Holt-Winters es matemáticamente bien definido y relativamente simple de implementar.
- Total control sobre los parámetros de suavizamiento (alpha, beta, gamma).
- Debuggeable: cada paso del cálculo es inspeccionable.
- Alto valor académico: demuestra comprensión del algoritmo, no solo uso de librerías.
- Claude API se usa únicamente para el ajuste contextual (feriados, fechas especiales) sobre la predicción base, no para la predicción en sí.

## Decisión

Se implementa **Holt-Winters desde cero en NestJS** sin librerías externas. Claude API se usa como capa de ajuste contextual sobre la predicción estadística base. El cron job de las 6 am calcula y guarda el plan en `daily_production_plans`; los clientes leen el plan precalculado.

## Consecuencias

- El código del algoritmo vive en `src/ai/holt-winters.service.ts`.
- Se necesitan mínimo 14 días de datos reales para detectar el patrón semanal. Con menos datos se usan los promedios de `reference_baselines`.
- La validación del algoritmo se hace con train/test split sobre el seeder: 5 meses para entrenar, 1 mes para validar. El umbral aceptable es MAPE < 20%.
- Claude API solo recibe la predicción numérica base y la fecha, devuelve un factor de ajuste multiplicativo. No recibe el historial completo de ventas.
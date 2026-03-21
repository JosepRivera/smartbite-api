# ADR-0005 — Inmutabilidad del cierre de caja

- **Estado:** Aceptado
- **Fecha:** 2025
- **Módulo:** REP-4

---

## Contexto

El cierre de caja diario es el registro financiero más importante del sistema. Una vez generado debe ser confiable e inalterable, igual que un ticket fiscal. Si se pudiera modificar después, el dueño no podría confiar en que los registros históricos son correctos.

## El problema de 3FN

Los campos `total_income` y `net_profit` de la tabla `cash_closes` son atributos derivados:
```
total_income = cash_income + digital_income
net_profit   = total_income - total_expenses
```

Esto viola la Tercera Forma Normal (3FN) porque estos atributos dependen de otros atributos no clave de la misma fila en lugar de depender únicamente de la PK. En teoría deberían calcularse en la query y no guardarse.

## Por qué se persisten de todas formas

Si `total_income` y `net_profit` se calcularan en tiempo real, quedarían desincronizados si en el futuro se corrigieran ventas o gastos de ese día con OPS-6. El valor del cierre cambiaría retroactivamente, lo cual destruye la confiabilidad del registro histórico.

Al persistirlos en el momento del cierre, estos valores quedan congelados en el instante del cálculo. El cierre refleja exactamente el estado financiero del negocio en ese momento, independientemente de correcciones posteriores.

## Implementación de la inmutabilidad

La inmutabilidad se implementa en dos niveles:

**Nivel de API:** El endpoint de cierres solo expone `POST /cash-closes` para crear. No existe `PUT`, `PATCH` ni `DELETE`.

**Nivel de base de datos:** El rol de la aplicación en PostgreSQL no tiene permisos `UPDATE` ni `DELETE` sobre la tabla `cash_closes`. Aunque alguien bypasee la API, la BD rechaza la modificación.

**Correcciones post-cierre:** Si el dueño detecta un error en un cierre ya generado, se crea un nuevo registro de ajuste con el campo `parent_close_id` apuntando al cierre original. El cierre original nunca se toca.

## Decisión

Se persisten `total_income` y `net_profit` de forma deliberada violando 3FN para garantizar la integridad del registro histórico inmutable. La inmutabilidad se implementa a nivel de API y a nivel de permisos de base de datos.

## Consecuencias

- La tabla `cash_closes` nunca tiene registros modificados, solo registros nuevos.
- Solo puede existir un cierre por fecha (`UNIQUE` sobre `date`).
- Los reportes históricos son siempre consistentes con el estado del negocio en el momento del cierre.
- Si hay un error en un cierre, se documenta con un cierre de ajuste, no con una modificación.
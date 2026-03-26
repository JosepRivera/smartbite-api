# SmartBite — Estrategia de Tests

> **Filosofía:** testear lo que puede romper el negocio, no todo.
> Cada test se crea al terminar la feature correspondiente.
> Los tests los genera OpenCode / Claude con este doc como contexto.

---

## Stack de testing

| Herramienta               | Uso                                                     |
| ------------------------- | ------------------------------------------------------- |
| Vitest                    | Runner para unitarios y e2e                             |
| `@nestjs/testing`         | `Test.createTestingModule()` para aislar módulos NestJS |
| Supertest                 | HTTP assertions en e2e                                  |
| `docker-compose.test.yml` | BD aislada para e2e (no contamina dev)                  |

Comandos:
```bash
pnpm test          # unitarios
pnpm test:watch    # unitarios en watch
pnpm test:cov      # cobertura (solo services)
pnpm test:e2e      # e2e en Docker
pnpm test:e2e:down # limpia contenedores e2e
```

---

## Tests Unitarios

> Ubicación: `src/**/__tests__/**/*.spec.ts`
> Sin BD. Usan mocks de PrismaService y SDKs externos.
> Se crean al terminar cada feature de la semana indicada.

---

### AUTH — Semana 1

#### `AuthService`

| #        | Caso                                | Qué verificar                                                                       |
| -------- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| U-AUTH-1 | `register()` hashea el password     | `users.password` nunca se guarda en texto plano — comparar con `bcrypt.compare()`   |
| U-AUTH-2 | `login()` usuario inexistente → 401 | Busca en `users` por `username`, si no existe lanza `UnauthorizedException`         |
| U-AUTH-3 | `login()` password incorrecto → 401 | `bcrypt.compare(input, users.password)` → false → `UnauthorizedException`           |
| U-AUTH-4 | `login()` OK → devuelve tokens      | Retorna `{ accessToken, refreshToken }`, guarda hash en `refresh_tokens.token_hash` |
| U-AUTH-5 | `refresh()` token revocado → 401    | `refresh_tokens.revoked_at IS NOT NULL` → `UnauthorizedException`                   |
| U-AUTH-6 | `refresh()` rota el token           | Marca `refresh_tokens.revoked_at`, crea nuevo registro en `refresh_tokens`          |
| U-AUTH-7 | `logout()` revoca el token          | Setea `refresh_tokens.revoked_at = now()` en el registro correcto                   |

**Mocks:** `PrismaService` (`user.findUnique`, `refreshToken.create`, `refreshToken.update`)

---

### OPS — Semanas 2 y 3

#### `SalesService` — el más crítico del proyecto

| #         | Caso                                         | Qué verificar                                                                                                       |
| --------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| U-SALES-1 | `createSale()` crea en estado OPEN           | `sales.status = 'OPEN'`, `sales.user_id` asignado                                                                   |
| U-SALES-2 | `paySale()` descuenta stock al cobrar        | `ingredients.stock` se reduce según `recipes.quantity × sale_items.quantity`                                        |
| U-SALES-3 | `paySale()` → stock no cambia al crear orden | Entre `createSale()` y `paySale()`, `ingredients.stock` no se modifica                                              |
| U-SALES-4 | `paySale()` sobre orden ya pagada → 409      | `sales.status != 'OPEN'` → `ConflictException`                                                                      |
| U-SALES-5 | `paySale()` stock insuficiente → 422         | `ingredients.stock < cantidad_requerida` → `UnprocessableEntityException`                                           |
| U-SALES-6 | `cancelSale()` no descuenta stock            | `sales.status = 'CANCELLED'`, `sales.cancelled_by` y `sales.cancelled_at` seteados, `ingredients.stock` sin cambios |
| U-SALES-7 | `updateSale()` guarda auditoría (OPS-6)      | `sales.updated_by` y `sales.updated_at` quedan seteados correctamente                                               |

**Mocks:** `PrismaService` con `$transaction` mock, `sale.findUnique`, `ingredient.update`, `saleItem.findMany`

#### `IngredientsService`

| #       | Caso                                 | Qué verificar                                                              |
| ------- | ------------------------------------ | -------------------------------------------------------------------------- |
| U-ING-1 | `getLowStock()` filtra correctamente | Solo devuelve registros donde `ingredients.stock <= ingredients.min_stock` |
| U-ING-2 | `updateStock()` no permite negativo  | Si el nuevo valor < 0 → `BadRequestException`                              |

#### `CashCloseService`

| #        | Caso                          | Qué verificar                                                                                                                                      |
| -------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| U-CASH-1 | Calcula totales correctamente | `cash_closes.cash_income` = suma de `sales.total` donde `status = 'PAID_CASH'`; `total_expenses` = suma de `expenses.amount`; ambos del día actual |
| U-CASH-2 | Solo existe método `create()` | El service no tiene método `update()` ni `delete()` — verificar que no existen como métodos públicos                                               |

---

### IA — Semanas 5 y 6

#### `DemandService`

| #       | Caso                                         | Qué verificar                                                                                                 |
| ------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| U-DEM-1 | ≥ 14 días de datos → usa Holt-Winters        | Lee historial de `sales` agrupado por día, corre algoritmo propio                                             |
| U-DEM-2 | < 14 días → fallback a `reference_baselines` | Lee `reference_baselines` por `product_id` y `day_of_week` en lugar de calcular                               |
| U-DEM-3 | Claude API falla → devuelve predicción base  | `AnthropicService` mock lanza error → función retorna resultado sin factor de ajuste, no propaga la excepción |

**Mocks:** `PrismaService` (`sale.groupBy`, `referenceBaseline.findMany`), `AnthropicService` mock que lanza `Error`

#### `MrpService`

| #       | Caso                                        | Qué verificar                                                                                          |
| ------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| U-MRP-1 | Calcula cantidad a comprar                  | `(demanda_predicha × recipes.quantity) - ingredients.stock` redondeado hacia arriba                    |
| U-MRP-2 | Stock suficiente → no aparece en lista      | Si `ingredients.stock >= cantidad_requerida`, el ingrediente no se incluye en la recomendación         |
| U-MRP-3 | Claude falla → devuelve tabla sin narración | `AnthropicService` mock lanza error → retorna `{ items: [...], narration: null }` sin lanzar excepción |

#### `ProductionPlansService`

| #        | Caso                              | Qué verificar                                                                                                         |
| -------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| U-PROD-1 | Cron está configurado             | El método tiene `@Cron("0 6 * * *")` y llama a `generateDailyPlan()`                                                  |
| U-PROD-2 | `getDailyPlan()` lee precalculado | Lee de `daily_production_plans` donde `date = hoy`, no recalcula en el request                                        |
| U-PROD-3 | `prediction_source` se guarda     | `daily_production_plans.prediction_source` refleja si usó `holt_winters`, `holt_winters_base` o `reference_baselines` |

---

### VOZ-1 — Semana 7

#### `VoiceService`

| #       | Caso                               | Qué verificar                                                                                            |
| ------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| U-VOZ-1 | Groq falla → error claro           | `GroqService` mock lanza error → retorna `{ transcription: null, fields: null }` con mensaje descriptivo |
| U-VOZ-2 | Claude falla → transcripción cruda | `AnthropicService` mock lanza error → retorna `{ transcription: "texto de whisper", fields: null }`      |
| U-VOZ-3 | Ambas OK → campos extraídos        | Mocks devuelven datos válidos → retorna `{ transcription: "...", fields: { ... } }` pre-rellenado        |

**Mocks:** `GroqService`, `AnthropicService`

---

## Tests E2E

> Ubicación: `test/**/*.e2e-spec.ts`
> Levantan BD real con `docker-compose.test.yml`.
> `fileParallelism: false` — corren en serie para evitar conflictos de BD.
> Se crean al terminar el bloque de semanas indicado.

---

### Flujo de autenticación completo — después de Semana 1

| #        | Request                                                       | Esperado                                                                             |
| -------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| E-AUTH-1 | `POST /api/v1/auth/login` con `username` y `password` válidos | 200 + `{ accessToken, refreshToken }`                                                |
| E-AUTH-2 | `GET /api/v1/products` sin header `Authorization`             | 401                                                                                  |
| E-AUTH-3 | `POST /api/v1/auth/refresh` con refreshToken válido           | 200 + nuevos tokens; el token anterior queda con `refresh_tokens.revoked_at` seteado |
| E-AUTH-4 | `POST /api/v1/auth/logout` → luego usar el mismo accessToken  | 401 en siguiente request                                                             |
| E-AUTH-5 | Endpoint de `OWNER` con token de `CASHIER`                    | 403                                                                                  |

---

### Flujo de venta completo — después de Semana 3

| #         | Request                                                       | Esperado                                                                                    |
| --------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| E-SALES-1 | `POST /api/v1/sales` con `items: [{ productId, quantity }]`   | 201 + `sales.status = 'OPEN'`; `ingredients.stock` sin cambios                              |
| E-SALES-2 | `POST /api/v1/sales/:id/pay` con `paymentMethod: 'PAID_CASH'` | 200 + `sales.status = 'PAID_CASH'`; `ingredients.stock` descontado según `recipes.quantity` |
| E-SALES-3 | `POST /api/v1/sales/:id/pay` sobre orden ya pagada            | 409 Conflict                                                                                |
| E-SALES-4 | `POST /api/v1/sales` cuya receta excede `ingredients.stock`   | 422 Unprocessable Entity                                                                    |

---

### Inmutabilidad del cierre de caja — después de Semana 4

| #        | Request                                                      | Esperado                                                                                                      |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| E-CASH-1 | `POST /api/v1/cash-closes`                                   | 201 + registro en `cash_closes` con `cash_income`, `digital_income`, `total_expenses`, `net_profit` correctos |
| E-CASH-2 | `PUT /api/v1/cash-closes/:id`                                | 405 Method Not Allowed                                                                                        |
| E-CASH-3 | `DELETE /api/v1/cash-closes/:id`                             | 405 Method Not Allowed                                                                                        |
| E-CASH-4 | `UPDATE cash_closes SET net_profit = 0` con el rol de la app | Error de permisos PostgreSQL (garantizado por `02_roles.sql`)                                                 |

---

### Pagos digitales PAG-1 — después de Semanas 8-9

| #       | Request                                                              | Esperado                                                                |
| ------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| E-PAG-1 | `POST /api/v1/payments/notify` con `X-API-Key` válida + body Yape    | 201 + `sales.status = 'PAID_YAPE'`; registro en `payment_notifications` |
| E-PAG-2 | `POST /api/v1/payments/notify` con API Key inválida                  | 401                                                                     |
| E-PAG-3 | `POST /api/v1/payments/notify` con `device_tokens.is_active = false` | 401                                                                     |

---

## Smoke test del seeder — Semana 10

> Verifica que `pnpm db:seed` generó datos mínimos para la demo.

```typescript
// test/smoke/seeder.smoke.ts
it('seed genera datos mínimos', async () => {
  const [users, products, sales, ingredients] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.sale.count(),
    prisma.ingredient.count(),
  ]);

  expect(users).toBeGreaterThan(0);
  expect(products).toBeGreaterThan(0);
  expect(ingredients).toBeGreaterThan(0);
  expect(sales).toBeGreaterThan(180); // ~6 meses de datos sintéticos
});
```

---

## Lo que NO testeamos (y por qué)

| Cosa                                      | Razón                                                              |
| ----------------------------------------- | ------------------------------------------------------------------ |
| Controllers                               | Son pass-through a services; el e2e los cubre via HTTP real        |
| DTOs / validaciones Zod                   | nestjs-zod valida en runtime; el e2e los cubre con requests reales |
| Prisma queries directas                   | Son código de terceros; confiamos en su propio test suite          |
| Text-to-SQL resultado exacto (IA-1)       | No determinístico; se valida manualmente con casos reales          |
| Resultado numérico exacto de Holt-Winters | La precisión matemática se verifica con datos del seeder           |
| Lógica Kotlin (PAG-1)                     | Codebase separado con sus propios tests                            |
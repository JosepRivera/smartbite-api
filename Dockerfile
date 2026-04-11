# syntax=docker/dockerfile:1

# ─── Base ─────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.31.0 --activate
WORKDIR /app

# ─── Desarrollo y Testing ─────────────────────────────────────────────────────
# Usado por: docker-compose.dev.yml (target: dev)
#            docker-compose.test.yml (target: dev)
FROM base AS dev
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN --mount=type=cache,id=pnpm-smartbite,target=/pnpm/store \
    pnpm install --frozen-lockfile

RUN pnpm prisma generate

COPY . .

EXPOSE 3000
EXPOSE 9229

# ─── Build (compilación para producción) ──────────────────────────────────────
FROM dev AS builder
RUN pnpm build

# ─── Producción ───────────────────────────────────────────────────────────────
# Build: docker build --target prod -t smartbite-api .
# El comando startup aplica migrations antes de levantar:
#   pnpm prisma migrate deploy && node dist/main.js
FROM base AS prod
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN --mount=type=cache,id=pnpm-smartbite,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]

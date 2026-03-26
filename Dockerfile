# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────
# Base: Node + pnpm
# ─────────────────────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate
WORKDIR /app

# ─────────────────────────────────────────────
# Dev: instala deps, genera cliente Prisma y
# copia el código fuente.
# El comando final lo inyecta docker-compose.yml
# (migrate deploy + start:dev).
# ─────────────────────────────────────────────
FROM base AS dev

# 1. Copiar manifests primero para aprovechar caché de Docker.
#    Si package.json o pnpm-lock.yaml no cambian, pnpm install
#    no se vuelve a ejecutar en el siguiente build.
COPY package.json pnpm-lock.yaml ./

# 2. Copiar schema de Prisma antes de instalar para que
#    postinstall (prisma generate) tenga el schema disponible.
COPY prisma ./prisma/

# 3. Instalar dependencias con caché de pnpm montada.
#    --frozen-lockfile garantiza reproducibilidad.
RUN --mount=type=cache,id=pnpm-smartbite,target=/pnpm/store \
    pnpm install --frozen-lockfile

# 4. Generar el cliente de Prisma.
#    Se regenera en el command de docker-compose también,
#    pero tenerlo aquí acelera el primer arranque.
RUN pnpm prisma generate

# 5. Copiar el resto del código fuente.
#    Esto invalida el caché, pero solo si el código cambió.
#    Los pasos anteriores (deps + generate) quedan cacheados.
COPY . .

EXPOSE 3000
EXPOSE 9229
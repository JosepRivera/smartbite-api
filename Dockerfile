# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.31.0 --activate
WORKDIR /app

FROM base AS dev
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN --mount=type=cache,id=pnpm-smartbite,target=/pnpm/store \
    pnpm install --frozen-lockfile

# DATABASE_URL placeholder: prisma generate lee el schema pero no conecta a la BD.
# Sin esto, el build falla en CI donde no hay .env ni BD disponible.
RUN DATABASE_URL="postgresql://x:x@localhost:5432/x" pnpm prisma generate

COPY . .

EXPOSE 3000
EXPOSE 9229
# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.31.0 --activate
WORKDIR /app

FROM base AS dev
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN --mount=type=cache,id=pnpm-smartbite,target=/pnpm/store \
    pnpm install --frozen-lockfile

RUN pnpm prisma generate

COPY . .

EXPOSE 3000
EXPOSE 9229
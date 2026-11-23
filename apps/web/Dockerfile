FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS dependencies
COPY package.json bun.lock tsconfig.base.json biome.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/core/package.json ./packages/core/
COPY apps/web/package.json ./apps/web/
RUN bun install --frozen-lockfile

# Stage 2: Build Nuxt application
FROM dependencies AS builder
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/
WORKDIR /app/apps/web
RUN bun run build

# Stage 3: Runner
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/apps/web/.output ./apps/web/.output

EXPOSE 3000
USER bun

CMD ["bun", "apps/web/.output/server/index.mjs"]

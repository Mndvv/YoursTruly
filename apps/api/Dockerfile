FROM oven/bun:1-alpine AS base
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS dependencies
COPY package.json bun.lock tsconfig.base.json biome.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/core/package.json ./packages/core/
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/
RUN bun install --frozen-lockfile

# Stage 2: Copy source code
FROM dependencies AS builder
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Stage 3: Runner
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app /app

EXPOSE 4000
USER bun

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:4000/health').then(r => process.exit(r.ok ? 0 : 1))"

CMD ["bun", "apps/api/src/index.ts"]

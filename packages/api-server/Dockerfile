# API Server Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8

# ======================
# Dependencies Stage
# ======================
FROM base AS dependencies

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy package files
COPY packages/api-server/package.json ./packages/api-server/
COPY packages/db/package.json ./packages/db/
COPY prisma/schema.prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ======================
# Builder Stage
# ======================
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages

# Copy source code
COPY packages/api-server ./packages/api-server
COPY packages/db ./packages/db
COPY prisma ./prisma
COPY tsconfig.json ./

# Generate Prisma client
RUN cd prisma && npx prisma generate

# Build
RUN cd packages/api-server && pnpm build

# ======================
# Production Stage
# ======================
FROM base AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api-server/dist ./dist
COPY --from=builder /app/packages/api-server/package.json ./
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/server.js"]

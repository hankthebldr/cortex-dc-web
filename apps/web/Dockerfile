# Cortex DC Web - Production Dockerfile
# Multi-stage build for Next.js 14 App Router with monorepo support

# ======================
# Base Stage
# ======================
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8

# Set working directory
WORKDIR /app

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

# ======================
# Dependencies Stage
# ======================
FROM base AS dependencies

# Copy root workspace configuration
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy all package.json files
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/utils/package.json ./packages/utils/
COPY packages/ai/package.json ./packages/ai/
COPY packages/commands/package.json ./packages/commands/
COPY packages/content/package.json ./packages/content/
COPY packages/integrations/package.json ./packages/integrations/
COPY packages/terminal/package.json ./packages/terminal/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies
RUN pnpm install --frozen-lockfile --prefer-offline

# ======================
# Builder Stage
# ======================
FROM base AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/pnpm-workspace.yaml ./
COPY --from=dependencies /app/package.json ./
COPY --from=dependencies /app/turbo.json ./
COPY --from=dependencies /app/tsconfig.json ./

# Copy all source code
COPY packages ./packages
COPY apps/web ./apps/web

# Build arguments for Next.js public env vars
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_KEYCLOAK_REALM=cortex
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=cortex-web
ARG NEXT_PUBLIC_STORAGE_MODE=minio
ARG NEXT_PUBLIC_MINIO_ENDPOINT
ARG NEXT_PUBLIC_MINIO_BUCKET=cortex-storage
ARG NEXT_PUBLIC_APP_NAME="Cortex DC"
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ENVIRONMENT=production
ARG NEXT_PUBLIC_ENABLE_ANALYTICS=true
ARG NEXT_PUBLIC_ENABLE_AI_FEATURES=true
ARG NEXT_PUBLIC_ENABLE_POV_MANAGEMENT=true
ARG NEXT_PUBLIC_ENABLE_TRR_WORKFLOWS=true
ARG NEXT_PUBLIC_ENABLE_CONTENT_LIBRARY=true

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_DEPLOYMENT_MODE=$NEXT_PUBLIC_DEPLOYMENT_MODE \
    NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL \
    NEXT_PUBLIC_KEYCLOAK_REALM=$NEXT_PUBLIC_KEYCLOAK_REALM \
    NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=$NEXT_PUBLIC_KEYCLOAK_CLIENT_ID \
    NEXT_PUBLIC_STORAGE_MODE=$NEXT_PUBLIC_STORAGE_MODE \
    NEXT_PUBLIC_MINIO_ENDPOINT=$NEXT_PUBLIC_MINIO_ENDPOINT \
    NEXT_PUBLIC_MINIO_BUCKET=$NEXT_PUBLIC_MINIO_BUCKET \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT \
    NEXT_PUBLIC_ENABLE_ANALYTICS=$NEXT_PUBLIC_ENABLE_ANALYTICS \
    NEXT_PUBLIC_ENABLE_AI_FEATURES=$NEXT_PUBLIC_ENABLE_AI_FEATURES \
    NEXT_PUBLIC_ENABLE_POV_MANAGEMENT=$NEXT_PUBLIC_ENABLE_POV_MANAGEMENT \
    NEXT_PUBLIC_ENABLE_TRR_WORKFLOWS=$NEXT_PUBLIC_ENABLE_TRR_WORKFLOWS \
    NEXT_PUBLIC_ENABLE_CONTENT_LIBRARY=$NEXT_PUBLIC_ENABLE_CONTENT_LIBRARY \
    NODE_ENV=production

# Build shared packages first
RUN pnpm --filter "@cortex/utils" build && \
    pnpm --filter "@cortex/db" build

# Build Next.js application
RUN pnpm --filter "@cortex-dc/web" build

# ======================
# Production Stage
# ======================
FROM base AS production

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))" || exit 1

# Start the Next.js application
CMD ["pnpm", "--filter", "@cortex-dc/web", "start"]

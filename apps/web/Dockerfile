# Frontend (Next.js) Dockerfile
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
COPY apps/web/package.json ./apps/web/
COPY packages/*/package.json ./packages/*/

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
COPY apps/web ./apps/web
COPY packages ./packages
COPY tsconfig.json ./

# Build Next.js app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_KEYCLOAK_URL
ARG NEXT_PUBLIC_KEYCLOAK_REALM
ARG NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
ARG NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_KEYCLOAK_URL=$NEXT_PUBLIC_KEYCLOAK_URL
ENV NEXT_PUBLIC_KEYCLOAK_REALM=$NEXT_PUBLIC_KEYCLOAK_REALM
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=$NEXT_PUBLIC_KEYCLOAK_CLIENT_ID
ENV NEXT_PUBLIC_DEPLOYMENT_MODE=$NEXT_PUBLIC_DEPLOYMENT_MODE

RUN cd apps/web && pnpm build

# ======================
# Production Stage
# ======================
FROM base AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)}).on('error', () => process.exit(1))"

# Start Next.js
CMD ["node", "apps/web/.next/standalone/server.js"]

# Multi-stage build for Firebase Functions as K8s Microservice
# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY tsconfig.json ./

# Copy dataconnect-generated for file: dependency
COPY src/dataconnect-generated ./src/dataconnect-generated

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy rest of source code
COPY src ./src

# Build TypeScript
RUN pnpm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runtime

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Copy dataconnect-generated for file: dependency
COPY src/dataconnect-generated ./src/dataconnect-generated

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile

# Copy built artifacts from builder
COPY --from=builder --chown=nodejs:nodejs /app/lib ./lib

# Set user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0

# Start command
CMD ["node", "lib/server.js"]

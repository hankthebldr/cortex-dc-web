# Cortex DC - Containerization Guide

## Overview

This guide covers the migration from Firebase-based static hosting to a fully containerized, Kubernetes-native self-hosted deployment.

## Table of Contents

1. [Architecture Changes](#architecture-changes)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Building the Container](#building-the-container)
5. [Deployment Options](#deployment-options)
6. [Migration from Firebase](#migration-from-firebase)
7. [Troubleshooting](#troubleshooting)

---

## Architecture Changes

### Before (Firebase Mode)
```
┌─────────────────┐
│   Next.js Web   │
│  (Static Export)│
├─────────────────┤
│ Firebase Client │
│   - Auth        │
│   - Firestore   │
│   - Storage     │
└─────────────────┘
        ↓
  Firebase Cloud
```

### After (Containerized/K8s Mode)
```
┌──────────────────┐
│   Next.js Web    │
│  (SSR + API)     │
├──────────────────┤
│  Auth Context    │
│  (API-based)     │
└──────────────────┘
        ↓
┌──────────────────┐
│   API Routes     │
│  /api/auth/*     │
└──────────────────┘
        ↓
┌──────────────────────────────────┐
│     Backend Services             │
├──────────────────────────────────┤
│ PostgreSQL  │ Keycloak │ MinIO   │
│ Redis       │ NATS     │ K8s     │
└──────────────────────────────────┘
```

### Key Changes

#### 1. **Authentication**
- **Before**: Firebase Client SDK (`firebase/auth`)
- **After**: Custom auth client using Next.js API routes
  - Session-based with HTTP-only cookies
  - JWT token verification
  - Keycloak/OIDC integration via AuthAdapter

#### 2. **Rendering Mode**
- **Before**: Static export (`output: 'export'`)
- **After**: Server-side rendering with dynamic routes
  - Supports API routes
  - Enables server components
  - Better SEO and performance

#### 3. **Client/Server Separation**
- **Before**: All Firebase code bundled for client
- **After**: Strict client/server separation
  - Server packages excluded from client bundle
  - API routes handle server-side operations
  - Browser-safe utilities for client code

#### 4. **Root Layout**
- **Before**: Client component (`'use client'`)
- **After**: Server component with client provider wrapper
  - Improves initial page load
  - Enables metadata API
  - Better streaming support

---

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development)
- pnpm 8+ (for local development)

### Option 1: Docker Compose (Recommended for Testing)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/cortex-dc-web.git
cd cortex-dc-web

# 2. Copy environment file
cp .env.self-hosted.example .env.self-hosted

# 3. (Optional) Edit environment variables
nano .env.self-hosted

# 4. Start all services
docker-compose -f docker-compose.self-hosted.yml up -d

# 5. Wait for services to be healthy (30-60 seconds)
docker-compose -f docker-compose.self-hosted.yml ps

# 6. Access the application
# - Web UI: http://localhost:3000
# - Keycloak Admin: http://localhost:8180 (admin/admin_password)
# - MinIO Console: http://localhost:9001 (minioadmin/minioadmin_password)
```

### Option 2: Build and Run Web Only

```bash
# Build the Docker image
docker build -t cortex-web:latest -f apps/web/Dockerfile .

# Run with environment variables
docker run -d \
  --name cortex-web \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8080 \
  -e NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted \
  -e DATABASE_URL=postgresql://user:pass@host:5432/cortex \
  cortex-web:latest
```

---

## Environment Configuration

### Development Mode

For local development with Next.js dev server:

```bash
# Copy the development environment template
cp apps/web/.env.local.example apps/web/.env.local

# Edit with your values
nano apps/web/.env.local
```

**Key variables for development:**
```bash
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
DATABASE_URL=postgresql://cortex:password@localhost:5432/cortex
```

### Production Mode

For containerized deployment:

```bash
# Copy the production environment template
cp apps/web/.env.production.example .env.production

# Edit with secure production values
nano .env.production
```

**Critical production variables:**
```bash
# MUST CHANGE THESE IN PRODUCTION
JWT_SECRET=<openssl rand -base64 32>
SESSION_SECRET=<openssl rand -base64 32>
POSTGRES_PASSWORD=<secure-password>
KEYCLOAK_CLIENT_SECRET=<keycloak-secret>
MINIO_ROOT_PASSWORD=<secure-password>
REDIS_PASSWORD=<secure-password>
```

### Environment Variable Categories

#### 1. Build-time Variables (NEXT_PUBLIC_*)
These are baked into the client bundle at build time:
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_KEYCLOAK_URL` - Keycloak auth server
- `NEXT_PUBLIC_DEPLOYMENT_MODE` - Deployment mode flag
- `NEXT_PUBLIC_STORAGE_MODE` - Storage backend (minio/firebase)

#### 2. Runtime Variables (Server-only)
These are only available to server-side code:
- `DATABASE_URL` - PostgreSQL connection string
- `KEYCLOAK_CLIENT_SECRET` - OAuth client secret
- `JWT_SECRET` - JWT signing key
- `SESSION_SECRET` - Session encryption key
- `REDIS_URL` - Cache connection string

---

## Building the Container

### Single-stage Build

```bash
# Build from repository root
docker build \
  -t cortex-web:latest \
  -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  --build-arg NEXT_PUBLIC_KEYCLOAK_URL=https://auth.yourdomain.com \
  .
```

### Multi-architecture Build

For deployment to ARM-based servers (like AWS Graviton):

```bash
# Enable buildx
docker buildx create --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t your-registry/cortex-web:latest \
  -f apps/web/Dockerfile \
  --push \
  .
```

### Build Arguments Reference

| Argument | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | http://localhost:8080 | Backend API endpoint |
| `NEXT_PUBLIC_DEPLOYMENT_MODE` | self-hosted | Deployment mode |
| `NEXT_PUBLIC_KEYCLOAK_URL` | - | Keycloak auth server URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | cortex | Keycloak realm name |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | cortex-web | OAuth client ID |
| `NEXT_PUBLIC_STORAGE_MODE` | minio | Storage backend |
| `NEXT_PUBLIC_MINIO_ENDPOINT` | - | MinIO endpoint URL |
| `NEXT_PUBLIC_APP_URL` | - | Public application URL |

---

## Deployment Options

### Docker Compose (Development/Testing)

Perfect for local development and testing the full stack:

```bash
# Start all services
docker-compose -f docker-compose.self-hosted.yml up -d

# View logs
docker-compose -f docker-compose.self-hosted.yml logs -f frontend

# Stop all services
docker-compose -f docker-compose.self-hosted.yml down

# Remove volumes (fresh start)
docker-compose -f docker-compose.self-hosted.yml down -v
```

**What gets deployed:**
- PostgreSQL (port 5432)
- Keycloak (port 8180)
- MinIO (ports 9000, 9001)
- Redis (port 6379)
- NATS (ports 4222, 8222)
- Next.js Frontend (port 3000)

### Kubernetes (Production)

For production deployments, see the Kubernetes manifests in `/kubernetes`:

```bash
# Create namespace
kubectl create namespace cortex

# Apply configurations
kubectl apply -f kubernetes/web-deployment.yaml
kubectl apply -f kubernetes/web-service.yaml
kubectl apply -f kubernetes/web-ingress.yaml

# Check status
kubectl get pods -n cortex
kubectl logs -f deployment/cortex-web -n cortex
```

### Cloud Providers

#### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit \
  --tag gcr.io/PROJECT_ID/cortex-web \
  -f apps/web/Dockerfile .

# Deploy to Cloud Run
gcloud run deploy cortex-web \
  --image gcr.io/PROJECT_ID/cortex-web \
  --platform managed \
  --region us-central1 \
  --set-env-vars NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

#### AWS ECS/Fargate

```bash
# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.REGION.amazonaws.com
docker build -t cortex-web -f apps/web/Dockerfile .
docker tag cortex-web:latest ACCOUNT.dkr.ecr.REGION.amazonaws.com/cortex-web:latest
docker push ACCOUNT.dkr.ecr.REGION.amazonaws.com/cortex-web:latest

# Deploy via ECS task definition
aws ecs update-service --cluster cortex --service cortex-web --force-new-deployment
```

---

## Migration from Firebase

### Step 1: Update Environment Configuration

```bash
# 1. Copy self-hosted environment template
cp .env.self-hosted.example .env.production

# 2. Update deployment mode
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
```

### Step 2: Set Up Infrastructure

```bash
# Option A: Use Docker Compose
docker-compose -f docker-compose.self-hosted.yml up -d postgres keycloak minio redis nats

# Option B: Use existing infrastructure
# - Point DATABASE_URL to your PostgreSQL
# - Configure Keycloak realm and client
# - Set up MinIO buckets
```

### Step 3: Configure Keycloak

1. Access Keycloak Admin Console: http://localhost:8180
2. Log in with admin credentials
3. Create realm `cortex`
4. Create client `cortex-web`:
   - Client Protocol: openid-connect
   - Access Type: public
   - Valid Redirect URIs: http://localhost:3000/*
   - Web Origins: http://localhost:3000
5. Create client `cortex-api`:
   - Client Protocol: openid-connect
   - Access Type: confidential
   - Copy the client secret to environment variable

### Step 4: Migrate Data (if needed)

```bash
# Export from Firebase
# Use Firebase Admin SDK or Firestore export

# Import to PostgreSQL
# Use migration scripts in /scripts
```

### Step 5: Build and Deploy

```bash
# Build the container
docker build -t cortex-web:latest -f apps/web/Dockerfile .

# Run with docker-compose
docker-compose -f docker-compose.self-hosted.yml up -d frontend

# Or deploy to Kubernetes
kubectl apply -f kubernetes/
```

### Step 6: Test the Migration

1. **Authentication**:
   - Visit http://localhost:3000/login
   - Create a test user in Keycloak
   - Test login flow

2. **API Routes**:
   - Check http://localhost:3000/api/health
   - Test /api/auth/me endpoint

3. **Database**:
   - Verify PostgreSQL connection
   - Test CRUD operations

4. **Storage**:
   - Upload a file
   - Verify MinIO bucket access

---

## Troubleshooting

### Build Failures

#### Error: "Cannot find module '@cortex/db'"

**Cause**: Monorepo packages not built before web app.

**Solution**:
```bash
# Build packages in order
pnpm --filter "@cortex/utils" build
pnpm --filter "@cortex/db" build
pnpm --filter "@cortex-dc/web" build
```

#### Error: "Module not found: Can't resolve 'fs'"

**Cause**: Server-only packages imported in client code.

**Solution**: Check `next.config.js` has proper webpack fallbacks:
```javascript
config.resolve.fallback = {
  fs: false,
  net: false,
  tls: false,
};
```

### Runtime Errors

#### Error: "Firebase app not available"

**Cause**: Firebase initialization code being called in self-hosted mode.

**Solution**: Ensure `DEPLOYMENT_MODE=self-hosted` is set and check adapter factory usage.

#### Error: "Failed to fetch /api/auth/me"

**Cause**: API routes not accessible or authentication failing.

**Solution**:
1. Check container logs: `docker logs cortex-frontend`
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Check Keycloak is running and accessible
4. Verify JWT_SECRET matches between services

#### Error: "CORS policy blocked"

**Cause**: CORS origins not configured correctly.

**Solution**: Add proper origins to `CORS_ALLOWED_ORIGINS`:
```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Container Issues

#### Container exits immediately

**Check logs**:
```bash
docker logs cortex-frontend
```

**Common causes**:
1. Missing required environment variables
2. Database not accessible
3. Build artifacts missing

#### Health check failing

**Check health endpoint**:
```bash
curl http://localhost:3000/api/health
```

**Verify**:
1. Container is running: `docker ps`
2. Port is exposed: `docker port cortex-frontend`
3. Application started: `docker logs cortex-frontend`

### Performance Issues

#### Slow startup time

**Causes**:
- Large node_modules in container
- Unnecessary build artifacts

**Optimizations**:
1. Use multi-stage builds (already implemented)
2. Use .dockerignore properly
3. Enable BuildKit: `DOCKER_BUILDKIT=1`

#### High memory usage

**Solution**: Limit container resources:
```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

---

## Best Practices

### Security

1. **Never commit secrets**: Use environment variables and secret management
2. **Use HTTPS in production**: Configure SSL/TLS for all services
3. **Rotate credentials regularly**: JWT secrets, DB passwords, API keys
4. **Limit CORS origins**: Don't use wildcards in production
5. **Run as non-root**: Container already configured with unprivileged user

### Performance

1. **Enable caching**: Use Redis for session and API caching
2. **Use CDN**: Serve static assets from CDN
3. **Optimize images**: Use Next.js Image component
4. **Enable compression**: Gzip/Brotli in reverse proxy

### Monitoring

1. **Health checks**: Implement /api/health, /api/readyz, /api/healthz
2. **Logging**: Use structured JSON logging
3. **Metrics**: Expose Prometheus metrics
4. **Alerts**: Configure alerts for container failures

### Deployment

1. **Use tags**: Don't use `latest`, use semantic versioning
2. **Rolling updates**: Deploy with zero downtime
3. **Rollback plan**: Keep previous versions for quick rollback
4. **Test in staging**: Always test in staging environment first

---

## Next Steps

- [ ] Set up Kubernetes ingress with SSL
- [ ] Configure monitoring with Prometheus/Grafana
- [ ] Implement database migrations
- [ ] Set up automated backups
- [ ] Configure CI/CD pipeline
- [ ] Load test the deployment
- [ ] Set up disaster recovery

---

## Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

---

**Last Updated**: 2025-10-14
**Version**: 1.0.0

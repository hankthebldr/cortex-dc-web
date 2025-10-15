# Local Testing Guide - Cortex DC Platform

**Last Updated**: 2025-10-15
**Purpose**: Comprehensive guide for local development and testing across all deployment modes

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Modes](#deployment-modes)
3. [Using the Makefile](#using-the-makefile)
4. [Docker Compose Setup](#docker-compose-setup)
5. [Kubernetes Local Testing](#kubernetes-local-testing)
6. [Testing Workflows](#testing-workflows)
7. [Troubleshooting](#troubleshooting)
8. [Architecture Overview](#architecture-overview)

---

## Quick Start

### Option 1: Firebase Mode (Fastest)

```bash
# One command to rule them all
make quick-start-firebase
```

This will:
- Install dependencies
- Setup Firebase environment
- Start Firebase emulators
- Launch web app on http://localhost:3000

### Option 2: Self-Hosted Mode (Production-like)

```bash
# Setup and start infrastructure
make quick-start-self-hosted
```

This will:
- Install dependencies
- Setup self-hosted environment
- Start PostgreSQL, Keycloak, MinIO, Redis, NATS
- Launch web app on http://localhost:3000

### Option 3: Manual Setup

```bash
# 1. Install dependencies
make install

# 2. Choose your deployment mode
make setup-firebase        # OR
make setup-self-hosted

# 3. Start services
make dev-firebase          # Firebase mode OR
make dev-full             # Self-hosted mode
```

---

## Deployment Modes

### Firebase Mode

**Use when:**
- Quick development iteration
- Testing Firebase-specific features
- Don't need full backend stack

**Services:**
- Firebase Auth Emulator (port 9099)
- Firestore Emulator (port 8080)
- Firebase Storage Emulator (port 9199)
- Firebase Emulator UI (port 4040)
- Next.js Web App (port 3000)

**Start:**
```bash
make setup-firebase
make emulators              # In one terminal
make dev                   # In another terminal
```

**Environment:**
```bash
DEPLOYMENT_MODE=firebase
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

---

### Self-Hosted Mode

**Use when:**
- Testing production architecture
- Validating migration from Firebase
- Full system integration testing

**Services:**
- PostgreSQL (port 5432)
- Keycloak (port 8180)
- MinIO (port 9000, console 9001)
- Redis (port 6379)
- NATS (port 4222)
- Next.js Web App (port 3000)
- Optional: API Server (port 8080)
- Optional: Functions Service (port 8081)

**Start:**
```bash
make setup-self-hosted
make docker-up              # Infrastructure
make dev                   # Web app
```

**Environment:**
```bash
DEPLOYMENT_MODE=self-hosted
DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex
KEYCLOAK_URL=http://localhost:8180
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
REDIS_URL=redis://:redis_password@localhost:6379
```

---

### Full Stack Mode (All Services in Docker)

**Use when:**
- Testing complete containerized deployment
- Simulating production environment
- K8s validation before deployment

**Start:**
```bash
make docker-up-full
```

This starts ALL services in Docker including web and functions.

**With Monitoring:**
```bash
make docker-up-monitoring
```

Adds Prometheus (port 9090) and Grafana (port 3001).

---

## Using the Makefile

### View All Commands

```bash
make help
```

### Common Development Commands

```bash
# Development
make dev                    # Start Next.js dev server
make dev-firebase          # Firebase emulators + web
make dev-full              # Docker stack + web

# Testing
make test                  # Run unit tests
make test-e2e              # Run E2E tests
make test-e2e-ui           # E2E tests with Playwright UI
make seed-e2e              # Seed test users

# Building
make build                 # Build all packages
make build-web             # Build web app only
make build-db              # Build database package

# Validation
make type-check            # TypeScript checking
make lint                  # Linting
make validate              # All checks (type + lint + test)

# Docker
make docker-up             # Start infrastructure
make docker-down           # Stop all services
make docker-logs           # View all logs
make docker-ps             # Service status
make health-check          # Check all service health

# Kubernetes
make k8s-deploy            # Deploy to K8s
make k8s-status            # Check deployment
make k8s-logs              # View logs

# Database
make db-seed               # Seed test data
make db-reset              # Reset database (destructive!)

# Cleanup
make clean                 # Clean build artifacts
```

---

## Docker Compose Setup

### File Structure

The project has multiple Docker Compose files for different purposes:

1. **`docker-compose.yml`** - Main production-like stack
   - All self-hosted services
   - Resource limits defined
   - Health checks configured
   - Monitoring support (profiles)

2. **`docker-compose.self-hosted.yml`** - Simpler self-hosted setup
   - Core services only
   - No monitoring
   - Lighter resource usage

3. **`docker-compose.dev.yml`** - Development setup
   - Firebase-focused
   - Hot reload support
   - Volume mounts for live code

### Starting Services

#### Basic Infrastructure
```bash
make docker-up
# OR
docker-compose up -d postgres keycloak minio redis nats
```

#### Full Stack
```bash
make docker-up-full
# OR
docker-compose --profile full up -d
```

#### With Monitoring
```bash
make docker-up-monitoring
# OR
docker-compose --profile full --profile monitoring up -d
```

### Stopping Services

```bash
# Stop all services
make docker-down

# Stop and remove volumes (DESTRUCTIVE!)
make docker-down-volumes
```

### Service Access Points

| Service | URL/Port | Credentials |
|---------|----------|-------------|
| **Web App** | http://localhost:3000 | - |
| **PostgreSQL** | localhost:5432 | cortex / cortex_secure_password |
| **Keycloak Admin** | http://localhost:8180 | admin / admin_password |
| **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin_password |
| **MinIO API** | localhost:9000 | minioadmin / minioadmin_password |
| **Redis** | localhost:6379 | Password: redis_password |
| **NATS** | localhost:4222 | No auth |
| **NATS Monitoring** | http://localhost:8222 | - |
| **API Server** | http://localhost:8080 | - |
| **Functions** | http://localhost:8081 | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3001 | admin / admin |
| **Firebase Emulator UI** | http://localhost:4040 | - |

### Viewing Logs

```bash
# All services
make docker-logs

# Specific service
docker-compose logs -f web
docker-compose logs -f postgres
docker-compose logs -f keycloak

# Follow logs from multiple services
docker-compose logs -f web functions api-server
```

### Checking Service Health

```bash
# Via Makefile
make health-check

# Via docker-compose
make docker-ps
# OR
docker-compose ps

# Manual health check
curl http://localhost:3000/api/health
curl http://localhost:8080/health
curl http://localhost:8081/health
```

---

## Kubernetes Local Testing

### Prerequisites

1. **Install kubectl**
   ```bash
   brew install kubectl  # macOS
   ```

2. **Install a local Kubernetes cluster** (choose one):
   - **Minikube**: Full-featured local cluster
     ```bash
     brew install minikube
     minikube start --cpus=4 --memory=8192
     ```

   - **kind**: Kubernetes in Docker
     ```bash
     brew install kind
     kind create cluster --name cortex
     ```

   - **Docker Desktop**: Built-in K8s
     - Enable in Docker Desktop settings

### Deploy to Local Kubernetes

```bash
# Deploy everything
make k8s-deploy

# Check status
make k8s-status

# View logs
make k8s-logs

# Port forward to access locally
make k8s-port-forward
# OR
kubectl port-forward svc/cortex-web 3000:3000 -n cortex-dc
```

### Kubernetes Resources

The project includes Kustomize manifests in:
- `kubernetes/` - Main application resources
- `functions/k8s/` - Functions microservice

**Key resources:**
- Deployments (web, functions, postgres, keycloak, minio, redis)
- Services (ClusterIP, LoadBalancer)
- StatefulSets (postgres, redis, minio)
- ConfigMaps (environment configuration)
- Secrets (credentials)
- Ingress (routing)
- HorizontalPodAutoscaler (scaling)
- PodDisruptionBudget (availability)

### Updating K8s Deployment

```bash
# 1. Make code changes

# 2. Build new Docker images
docker build -t cortex-web:v1.1 -f apps/web/Dockerfile .
docker build -t cortex-functions:v1.1 -f functions/Dockerfile ./functions

# 3. Update kustomization.yaml with new tags

# 4. Apply changes
make k8s-deploy

# 5. Watch rollout
kubectl rollout status deployment/cortex-web -n cortex-dc
```

### Deleting K8s Resources

```bash
make k8s-delete
```

---

## Testing Workflows

### E2E Testing

#### Setup
```bash
# 1. Start your preferred deployment mode
make dev-firebase      # OR
make dev-full

# 2. Seed test users
make seed-e2e

# 3. Run E2E tests
make test-e2e

# Or run with UI
make test-e2e-ui
```

#### Test Users
- `admin@cortex.com` / `admin123` (admin role)
- `user@cortex.com` / `user123` (user role)
- `viewer@cortex.com` / `viewer123` (viewer role)
- `test@example.com` / `test123` (generic test)

#### Quick Test Workflow
```bash
# One command for full E2E test
make quick-test
```

### Unit Testing

```bash
# All tests
make test

# Specific package
pnpm --filter "@cortex/db" test
pnpm --filter "@cortex-dc/ui" test
```

### Type Checking

```bash
# All packages
make type-check

# Specific package
pnpm --filter "@cortex/db" type-check
```

### Linting

```bash
# Check issues
make lint

# Auto-fix
make lint-fix
```

### Pre-Commit Validation

```bash
# Run all checks
make validate
# OR
make pre-commit
```

---

## Troubleshooting

### Port Already in Use

**Problem**: "Port 3000 is already in use"

**Solutions:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use a different port
PORT=3001 make dev
```

### Docker Services Won't Start

**Problem**: Services fail health checks

**Solutions:**
```bash
# Check logs
make docker-logs

# Check service status
make docker-ps

# Restart specific service
docker-compose restart postgres

# Full restart
make docker-down
make docker-up
```

### Database Connection Errors

**Problem**: "Cannot connect to database"

**Solutions:**
```bash
# 1. Check if PostgreSQL is running
docker-compose ps postgres

# 2. Check logs
docker-compose logs postgres

# 3. Verify connection
docker-compose exec postgres psql -U cortex -d cortex -c "SELECT 1"

# 4. Reset database if needed
make db-reset
```

### Keycloak Not Accessible

**Problem**: "Connection refused" to Keycloak

**Solutions:**
```bash
# 1. Wait for Keycloak to fully start (can take 60s)
docker-compose logs -f keycloak

# 2. Check health
curl http://localhost:8180/health/ready

# 3. Restart Keycloak
docker-compose restart keycloak
```

### Firebase Emulators Not Starting

**Problem**: Emulators fail to start

**Solutions:**
```bash
# 1. Kill existing emulators
make emulators-kill

# 2. Check for port conflicts
lsof -i :4040 -i :8080 -i :9099

# 3. Clear emulator data
rm -rf .firebase

# 4. Restart
make emulators
```

### Module Resolution Errors

**Problem**: "Cannot find module '@cortex/db'"

**Solutions:**
```bash
# 1. Build db package
make build-db

# 2. Reinstall dependencies
make clean
make install

# 3. Check workspace links
pnpm list --depth=0
```

### Next.js Build Errors

**Problem**: Build fails with type errors

**Solutions:**
```bash
# 1. Clean Next.js cache
rm -rf .next
rm -rf apps/web/.next

# 2. Rebuild
make build-web

# 3. Check types
make type-check
```

---

## Architecture Overview

### Service Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                     Web App (Next.js)                    │
│                    localhost:3000                        │
└─────────┬──────────────────────────────────────┬────────┘
          │                                       │
          ├───────────────────┐                  │
          │                   │                  │
          ▼                   ▼                  ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│   PostgreSQL     │  │  Keycloak    │  │    MinIO     │
│   (Database)     │  │   (Auth)     │  │  (Storage)   │
│  localhost:5432  │  │localhost:8180│  │localhost:9000│
└──────────────────┘  └──────────────┘  └──────────────┘
          │                   │                  │
          ▼                   ▼                  ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
│      Redis       │  │     NATS     │  │  Functions   │
│     (Cache)      │  │   (Queue)    │  │ (Microservice│
│  localhost:6379  │  │localhost:4222│  │localhost:8081│
└──────────────────┘  └──────────────┘  └──────────────┘
```

### Adapter Pattern

The codebase uses an adapter pattern for deployment flexibility:

```typescript
// Automatically selects correct implementation based on DEPLOYMENT_MODE
import { getDatabase, getAuth, getStorage } from '@cortex/db';

const db = getDatabase();      // Firestore OR PostgreSQL
const auth = getAuth();        // Firebase Auth OR Keycloak
const storage = getStorage();  // Firebase Storage OR MinIO
```

### Data Flow

```
User Request → Next.js → Adapter Factory → Implementation
                ↓            ↓                    ↓
           SSR/API     getDatabase()      Firestore/PostgreSQL
                        getAuth()         Firebase/Keycloak
                        getStorage()      Firebase/MinIO
```

---

## Best Practices

### Development Workflow

1. **Use the Makefile** - Simplifies complex commands
2. **Start with Firebase mode** - Fastest feedback loop
3. **Test in self-hosted** - Before K8s deployment
4. **Run validation** - `make validate` before commits
5. **Check health** - `make health-check` regularly

### Testing Workflow

1. **Seed data first** - `make seed-e2e`
2. **Run tests locally** - Before CI
3. **Use test fixtures** - Reusable test data
4. **Clean between runs** - Avoid flaky tests

### Docker Best Practices

1. **Use profiles** - Only start needed services
2. **Monitor resources** - `docker stats`
3. **Clean regularly** - `docker system prune`
4. **Check logs** - When debugging
5. **Health checks** - Ensure services are ready

### Kubernetes Best Practices

1. **Test locally first** - Minikube/kind
2. **Use kustomize** - Environment-specific config
3. **Monitor resources** - Resource limits defined
4. **Check readiness** - Before declaring success
5. **Use namespaces** - Isolate environments

---

## Quick Reference

### Essential Commands

```bash
# Setup
make install setup-self-hosted

# Start
make docker-up dev

# Test
make seed-e2e test-e2e

# Check
make health-check docker-ps

# Stop
make docker-down

# Clean
make clean
```

### Port Reference

| Port | Service | Mode |
|------|---------|------|
| 3000 | Web App | All |
| 3001 | Grafana | Monitoring |
| 4040 | Firebase Emulator UI | Firebase |
| 4222 | NATS | Self-hosted |
| 5432 | PostgreSQL | Self-hosted |
| 6379 | Redis | Self-hosted |
| 8080 | Firestore Emulator | Firebase |
| 8080 | API Server | Self-hosted (full) |
| 8081 | Functions | Self-hosted (full) |
| 8180 | Keycloak | Self-hosted |
| 8222 | NATS Monitoring | Self-hosted |
| 9000 | MinIO API | Self-hosted |
| 9001 | MinIO Console | Self-hosted |
| 9090 | Prometheus | Monitoring |
| 9099 | Firebase Auth Emulator | Firebase |
| 9199 | Firebase Storage Emulator | Firebase |

---

## Next Steps

- **New to the project?** → Start with `make quick-start-firebase`
- **Testing migration?** → Use `make quick-start-self-hosted`
- **Deploying to K8s?** → Follow Kubernetes section
- **Contributing?** → Run `make validate` before commits

For more documentation:
- **CLAUDE.md** - Project overview
- **ARCHITECTURE_DOCUMENTATION.md** - System architecture
- **E2E_TESTING_NO_FIREBASE.md** - E2E testing guide
- **KUBERNETES_QUICK_START.md** - K8s deployment
- **SELF_HOSTED_QUICK_START.md** - Self-hosted setup

---

**Last Updated**: 2025-10-15
**Maintained by**: Cortex DC Development Team

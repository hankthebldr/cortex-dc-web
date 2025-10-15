# Quick Start Guide - Cortex DC Web Platform

**Goal**: Get the Cortex DC platform running locally in under 5 minutes.

---

## Prerequisites

- **Docker Desktop** (running)
- **Node.js** >= 18
- **pnpm** >= 8 (or will be installed automatically)

---

## Option 1: One-Command Bootstrap (Recommended)

```bash
make demo
```

**What it does**:
1. Checks prerequisites
2. Prompts for deployment mode (Firebase or Self-hosted)
3. Installs dependencies
4. Starts required services
5. Builds packages
6. Provides next steps

**Then**:
```bash
pnpm dev
```

Navigate to **http://localhost:3000**

---

## Option 2: Manual Setup (Self-Hosted)

### Step 1: Start Infrastructure

```bash
docker-compose up -d postgres keycloak minio minio-init redis nats
```

**Services**:
- PostgreSQL: localhost:5432 (user: cortex, password: cortex_secure_password)
- Keycloak: http://localhost:8180 (admin/admin_password)
- MinIO: http://localhost:9001 (minioadmin/minioadmin_password)
- Redis: localhost:6379
- NATS: localhost:4222

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Configure Environment

```bash
cat > .env.local <<EOF
DEPLOYMENT_MODE=self-hosted
DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=cortex
KEYCLOAK_CLIENT_ID=cortex-web
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin_password
REDIS_URL=redis://:redis_password@localhost:6379
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF
```

### Step 4: Build Packages

```bash
pnpm --filter "@cortex/utils" build
pnpm --filter "@cortex/db" build
```

### Step 5: Start Web Server

```bash
pnpm dev
```

### Step 6: Seed Test Users (Optional)

In a new terminal:
```bash
pnpm run seed:e2e
```

### Step 7: Open Browser

Navigate to **http://localhost:3000**

---

## Option 3: Firebase Mode

### Step 1: Start Firebase Emulators

```bash
firebase emulators:start --import=./emulator-data --export-on-exit
```

Or:
```bash
make emulators
```

### Step 2: Configure Environment

```bash
cat > .env.local <<EOF
DEPLOYMENT_MODE=firebase
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
EOF
```

### Step 3: Install & Build

```bash
pnpm install
pnpm --filter "@cortex/utils" build
pnpm --filter "@cortex/db" build
```

### Step 4: Start Web Server

```bash
pnpm dev
```

### Step 5: Seed Test Users (Optional)

```bash
pnpm run seed:e2e:firebase
```

### Step 6: Open Browser

- **Web App**: http://localhost:3000
- **Emulator UI**: http://localhost:4040

---

## Troubleshooting

### "Docker daemon is not running"
```bash
# Start Docker Desktop
open -a Docker
```

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### "pnpm: command not found"
```bash
npm install -g pnpm@8
```

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### "Firebase emulators won't start"
```bash
# Kill existing emulators
firebase emulators:kill
make emulators-kill

# Restart
firebase emulators:start
```

### Build errors
```bash
# Clean and reinstall
make clean
pnpm install
pnpm run build
```

---

## Useful Commands

### Development
```bash
make dev                 # Start Next.js dev server only
make dev-firebase        # Start Firebase emulators + web
make dev-full            # Start Docker services + web
```

### Testing
```bash
make test                # Run unit tests
make test-e2e            # Run E2E tests
make test-e2e-ui         # Run E2E tests with Playwright UI
```

### Type Checking & Linting
```bash
make type-check          # TypeScript type checking
make lint                # Run linters
make lint-fix            # Fix linting issues
make validate            # Run all checks (type, lint, test)
```

### Docker Compose
```bash
make docker-up           # Start core services
make docker-up-full      # Start all services (including web)
make docker-down         # Stop all services
make docker-logs         # View logs
make docker-ps           # Show service status
```

### Kubernetes (After Terraform Setup)
```bash
make k8s-deploy          # Deploy to Kubernetes
make k8s-status          # Check pod status
make k8s-logs            # View logs
make k8s-port-forward    # Port forward web service
```

### Database
```bash
make db-seed             # Seed database with test data
make db-reset            # Reset database (destructive!)
```

### Health Checks
```bash
make health-check        # Check health of all services
make check-ports         # Check if ports are available
```

---

## Default Test Users

After running `pnpm run seed:e2e` or `pnpm run seed:e2e:firebase`:

| Email | Password | Role |
|-------|----------|------|
| admin@cortex.com | admin123 | Admin |
| user@cortex.com | user123 | User |
| viewer@cortex.com | viewer123 | Viewer |

---

## Service URLs

### Self-Hosted Mode
- **Web App**: http://localhost:3000
- **Keycloak**: http://localhost:8180
- **MinIO Console**: http://localhost:9001
- **Prometheus**: http://localhost:9090 (if monitoring enabled)
- **Grafana**: http://localhost:3001 (if monitoring enabled)

### Firebase Mode
- **Web App**: http://localhost:3000
- **Emulator UI**: http://localhost:4040
- **Firestore Emulator**: http://localhost:8080
- **Auth Emulator**: http://localhost:9099
- **Storage Emulator**: http://localhost:9199

---

## Environment Variables

### Required (Self-Hosted)
- `DEPLOYMENT_MODE=self-hosted`
- `DATABASE_URL` - PostgreSQL connection string
- `KEYCLOAK_URL` - Keycloak server URL
- `MINIO_ENDPOINT` - MinIO endpoint
- `REDIS_URL` - Redis connection string

### Required (Firebase)
- `DEPLOYMENT_MODE=firebase`
- `FIREBASE_AUTH_EMULATOR_HOST` - Auth emulator host
- `FIRESTORE_EMULATOR_HOST` - Firestore emulator host
- `FIREBASE_STORAGE_EMULATOR_HOST` - Storage emulator host

### Optional
- `LOG_LEVEL` - Logging level (debug, info, warn, error)
- `NODE_ENV` - Environment (development, production)
- `NEXT_TELEMETRY_DISABLED` - Disable Next.js telemetry

---

## Next Steps

1. ✅ **Explore the UI**: Create projects, POVs, and TRRs
2. ✅ **Run E2E Tests**: `make test-e2e`
3. ✅ **Check Documentation**: See [`CLAUDE.md`](./CLAUDE.md) for full guide
4. ✅ **View Architecture**: See [`ARCHITECTURE_K8S_READY.md`](./ARCHITECTURE_K8S_READY.md)
5. ✅ **Deploy to K8s**: See [`terraform/README.md`](./terraform/README.md)

---

## Getting Help

- **Documentation**: Check [`CLAUDE.md`](./CLAUDE.md)
- **Troubleshooting**: See [`LOCAL_TESTING_GUIDE.md`](./LOCAL_TESTING_GUIDE.md)
- **Architecture**: See [`ARCHITECTURE_K8S_READY.md`](./ARCHITECTURE_K8S_READY.md)
- **Issues**: Check logs with `docker-compose logs` or `make docker-logs`
- **Makefile Help**: Run `make help` to see all available commands

---

**Happy Coding!** 🚀

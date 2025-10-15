# Self-Hosted Cortex DC - Quick Start Guide

**Version:** 1.0
**Last Updated:** October 13, 2025
**Target Audience:** DevOps, System Administrators

---

## Overview

This guide helps you deploy Cortex DC Platform using containerized, self-hosted services instead of Firebase. This approach provides:

✅ **Data Sovereignty** - All data stays on your infrastructure
✅ **Cost Control** - No per-request charges
✅ **Customization** - Full control over configuration
✅ **Kubernetes-Ready** - Production-grade orchestration
✅ **On-Premise Support** - Deploy anywhere

---

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 20.10+ | Container runtime |
| Docker Compose | 2.0+ | Local multi-container orchestration |
| Node.js | 20+ | Application runtime |
| pnpm | 8+ | Package manager |
| kubectl | 1.25+ | Kubernetes CLI (for K8s deployment) |
| helm | 3.10+ | Kubernetes package manager (optional) |

### System Requirements

**Minimum:**
- CPU: 4 cores
- RAM: 8 GB
- Disk: 50 GB

**Recommended (Production):**
- CPU: 8+ cores
- RAM: 16+ GB
- Disk: 200+ GB SSD

---

## Quick Start: Docker Compose (Development/Testing)

### Step 1: Clone and Setup

```bash
# Navigate to project directory
cd /path/to/cortex-dc-web

# Create environment file
cp .env.self-hosted.example .env.self-hosted

# Edit with your values
nano .env.self-hosted
```

### Step 2: Update Environment Variables

**IMPORTANT**: Change these default passwords!

```bash
# In .env.self-hosted
POSTGRES_PASSWORD=your_secure_password_here
KEYCLOAK_ADMIN_PASSWORD=your_admin_password_here
MINIO_ROOT_PASSWORD=your_minio_password_here
REDIS_PASSWORD=your_redis_password_here
```

### Step 3: Start Services

```bash
# Start all infrastructure services
docker-compose -f docker-compose.self-hosted.yml up -d

# Check status
docker-compose -f docker-compose.self-hosted.yml ps

# View logs
docker-compose -f docker-compose.self-hosted.yml logs -f
```

### Step 4: Verify Services

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Keycloak Admin | http://localhost:8180 | admin / (from .env) |
| MinIO Console | http://localhost:9001 | (from .env) |
| PostgreSQL | localhost:5432 | cortex / (from .env) |
| Redis | localhost:6379 | (password from .env) |
| NATS Monitor | http://localhost:8222 | No auth |

**Test PostgreSQL:**
```bash
docker exec -it cortex-postgres psql -U cortex -d cortex -c "\dt"
```

**Expected output:** Lists tables (users, povs, trrs)

---

## Keycloak Configuration

### Step 1: Access Keycloak Admin

1. Navigate to http://localhost:8180
2. Log in with admin credentials from `.env.self-hosted`
3. Click "Administration Console"

### Step 2: Create Cortex Realm

```bash
# Or use Keycloak CLI
docker exec -it cortex-keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8180 \
  --realm master \
  --user admin \
  --password ${KEYCLOAK_ADMIN_PASSWORD}

docker exec -it cortex-keycloak /opt/keycloak/bin/kcadm.sh create realms \
  -s realm=cortex \
  -s enabled=true
```

### Step 3: Create Clients

**Client 1: cortex-api (Backend)**
- Client ID: `cortex-api`
- Client Protocol: `openid-connect`
- Access Type: `confidential`
- Valid Redirect URIs: `http://localhost:8080/*`
- Web Origins: `http://localhost:8080`

**Client 2: cortex-web (Frontend)**
- Client ID: `cortex-web`
- Client Protocol: `openid-connect`
- Access Type: `public`
- Valid Redirect URIs: `http://localhost:3000/*`
- Web Origins: `http://localhost:3000`

### Step 4: Create Test Users

1. Go to Realm: `cortex` → Users
2. Click "Add user"
3. Create users:
   - **Admin User**
     - Username: `admin@cortex.local`
     - Email: `admin@cortex.local`
     - Email Verified: ON
     - Set Password: Choose password
     - Temporary: OFF
   - **Regular User**
     - Username: `user@cortex.local`
     - Email: `user@cortex.local`
     - Email Verified: ON
     - Set Password: Choose password
     - Temporary: OFF

### Step 5: Add Custom User Attributes (Role)

1. Select user → Attributes tab
2. Add attribute:
   - Key: `role`
   - Value: `admin` or `user`
3. Save

---

## Database Setup with Prisma

### Step 1: Install Prisma

```bash
pnpm add -w prisma @prisma/client
```

### Step 2: Generate Prisma Client

```bash
# Generate Prisma client from schema
npx prisma generate

# Apply database migrations
npx prisma db push
```

### Step 3: Verify Database Schema

```bash
# Connect to PostgreSQL
docker exec -it cortex-postgres psql -U cortex -d cortex

# List tables
\dt

# Describe users table
\d users
```

---

## Building and Running the Application

### Option A: Development Mode

```bash
# Start infrastructure
docker-compose -f docker-compose.self-hosted.yml up -d

# Set environment
export $(cat .env.self-hosted | xargs)

# Run database migrations
npx prisma db push

# Start API server (when implemented)
# pnpm --filter "@cortex/api-server" dev

# Start frontend
pnpm --filter "@cortex-dc/web" dev
```

### Option B: Production Mode (Docker)

**Coming Soon:** Requires implementation of:
- `packages/api-server/Dockerfile`
- `apps/web/Dockerfile` (production build)

```bash
# Build and start all services
docker-compose -f docker-compose.self-hosted.yml up -d --build

# Access application
open http://localhost:3000
```

---

## Kubernetes Deployment (Production)

### Prerequisites

- Kubernetes cluster (v1.25+)
- kubectl configured
- Helm 3 (optional)
- Ingress controller installed (nginx/traefik)
- Cert-manager for SSL (optional)

### Step 1: Create Secrets

```bash
# Create namespace
kubectl apply -f kubernetes/namespaces/namespace.yaml

# Create secrets
kubectl create secret generic cortex-secrets \
  --namespace=cortex \
  --from-literal=postgres-password=YOUR_POSTGRES_PASSWORD \
  --from-literal=keycloak-admin-password=YOUR_KEYCLOAK_PASSWORD \
  --from-literal=keycloak-client-secret=YOUR_CLIENT_SECRET \
  --from-literal=minio-root-password=YOUR_MINIO_PASSWORD \
  --from-literal=redis-password=YOUR_REDIS_PASSWORD \
  --from-literal=jwt-secret=YOUR_JWT_SECRET_MIN_32_CHARS \
  --from-literal=database-url=postgresql://cortex:YOUR_PASSWORD@cortex-postgres:5432/cortex \
  --from-literal=redis-url=redis://:YOUR_REDIS_PASSWORD@cortex-redis:6379
```

### Step 2: Deploy Infrastructure

```bash
# Apply configurations
kubectl apply -f kubernetes/config/configmap.yaml

# Deploy PostgreSQL
kubectl apply -f kubernetes/database/postgres-deployment.yaml

# Wait for PostgreSQL to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n cortex --timeout=300s

# Deploy remaining services
kubectl apply -f kubernetes/auth/    # Keycloak
kubectl apply -f kubernetes/storage/ # MinIO
kubectl apply -f kubernetes/cache/   # Redis

# Deploy application (when Dockerfiles are ready)
# kubectl apply -f kubernetes/api/
# kubectl apply -f kubernetes/frontend/
```

### Step 3: Setup Ingress

```bash
# Deploy ingress
kubectl apply -f kubernetes/ingress/ingress.yaml

# Get ingress IP
kubectl get ingress -n cortex
```

### Step 4: Configure DNS

Point your domains to the ingress IP:
- `cortex.yourdomain.com` → Frontend
- `api.cortex.yourdomain.com` → API
- `auth.cortex.yourdomain.com` → Keycloak

---

## Data Migration from Firebase

### Export Firebase Data

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export Firestore data
firebase firestore:export gs://your-bucket/firestore-export

# Download exported data
gsutil -m cp -r gs://your-bucket/firestore-export .
```

### Import to PostgreSQL

Create migration script:

```typescript
// scripts/migrate-firebase-to-postgres.ts
import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function migrateFirestoreToPostgres() {
  // Load Firebase export
  const firestoreData = JSON.parse(
    fs.readFileSync('./firestore-export/data.json', 'utf-8')
  );

  // Migrate users
  for (const user of firestoreData.users) {
    await prisma.user.create({
      data: {
        keycloakId: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role || 'user',
      },
    });
  }

  // Migrate POVs
  for (const pov of firestoreData.povs) {
    await prisma.pOV.create({
      data: {
        id: pov.id,
        name: pov.name,
        customer: pov.customer,
        industry: pov.industry,
        description: pov.description,
        status: pov.status,
        priority: pov.priority,
        startDate: pov.startDate ? new Date(pov.startDate) : null,
        endDate: pov.endDate ? new Date(pov.endDate) : null,
        assignedTo: pov.assignedTo,
        objectives: pov.objectives,
        successCriteria: pov.successCriteria,
        createdBy: pov.createdBy,
      },
    });
  }

  // Migrate TRRs
  for (const trr of firestoreData.trrs) {
    await prisma.tRR.create({
      data: {
        id: trr.id,
        name: trr.name,
        description: trr.description,
        projectName: trr.projectName,
        projectId: trr.projectId,
        linkedPovId: trr.linkedPovId,
        dueDate: trr.dueDate ? new Date(trr.dueDate) : null,
        assignedTo: trr.assignedTo,
        status: trr.status,
        priority: trr.priority,
        scope: trr.scope,
        technicalRequirements: trr.technicalRequirements,
        findings: trr.findings,
        recommendations: trr.recommendations,
        completionPercentage: trr.completionPercentage,
        createdBy: trr.createdBy,
      },
    });
  }

  console.log('Migration completed successfully!');
}

migrateFirestoreToPostgres()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run migration:
```bash
npx tsx scripts/migrate-firebase-to-postgres.ts
```

---

## Monitoring and Maintenance

### View Logs

**Docker Compose:**
```bash
# All services
docker-compose -f docker-compose.self-hosted.yml logs -f

# Specific service
docker-compose -f docker-compose.self-hosted.yml logs -f postgres
```

**Kubernetes:**
```bash
# All pods in namespace
kubectl logs -f -n cortex --all-containers=true -l app=cortex

# Specific service
kubectl logs -f -n cortex -l app=postgres
```

### Database Backups

**PostgreSQL Backup:**
```bash
# Docker Compose
docker exec cortex-postgres pg_dump -U cortex cortex > backup_$(date +%Y%m%d).sql

# Kubernetes
kubectl exec -n cortex cortex-postgres-0 -- pg_dump -U cortex cortex > backup_$(date +%Y%m%d).sql
```

**MinIO Backup:**
```bash
# Using mc (MinIO client)
mc mirror minio/cortex-documents ./backups/documents
```

### Health Checks

```bash
# PostgreSQL
docker exec cortex-postgres pg_isready -U cortex

# Redis
docker exec cortex-redis redis-cli ping

# MinIO
curl http://localhost:9000/minio/health/live
```

---

## Troubleshooting

### Issue: PostgreSQL won't start

**Solution:**
```bash
# Check logs
docker-compose logs postgres

# Reset volume (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
```

### Issue: Keycloak can't connect to database

**Solution:**
```bash
# Ensure PostgreSQL is healthy first
docker-compose ps

# Restart Keycloak
docker-compose restart keycloak
```

### Issue: Application can't authenticate

**Solution:**
1. Verify Keycloak realm exists
2. Check client configuration
3. Verify environment variables match
4. Check Keycloak logs for errors

### Issue: MinIO buckets not created

**Solution:**
```bash
# Manually create buckets
docker exec -it cortex-minio-init sh
mc mb minio/cortex-documents
mc mb minio/cortex-uploads
mc mb minio/cortex-exports
```

---

## Security Best Practices

### 1. Change Default Passwords ✅
Update all passwords in `.env.self-hosted`

### 2. Enable SSL/TLS ✅
```yaml
# In docker-compose for production
services:
  minio:
    environment:
      MINIO_USE_SSL: "true"
```

### 3. Network Isolation ✅
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No external access
```

### 4. Resource Limits ✅
Always set memory and CPU limits

### 5. Regular Backups ✅
Automate daily backups

### 6. Update Images ✅
```bash
docker-compose pull
docker-compose up -d
```

---

## Performance Tuning

### PostgreSQL Optimization

```sql
-- In PostgreSQL container
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '10MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';
```

### Redis Optimization

```bash
# In redis.conf or docker command
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

---

## Next Steps

1. ✅ Infrastructure deployed
2. ⏳ Implement API server package
3. ⏳ Create production Dockerfiles
4. ⏳ Migrate authentication to Keycloak
5. ⏳ Update frontend to use new auth
6. ⏳ Migrate data from Firebase
7. ⏳ Load testing
8. ⏳ Production deployment

---

## Support and Resources

- **Architecture Doc:** `CONTAINERIZED_ARCHITECTURE.md`
- **Docker Compose:** `docker-compose.self-hosted.yml`
- **Prisma Schema:** `prisma/schema.prisma`
- **Kubernetes Manifests:** `kubernetes/`
- **Issue Tracker:** GitHub Issues

---

**Document Status:** v1.0 - Ready for Use
**Last Updated:** October 13, 2025
**Maintainer:** DevOps Team

# Complete Self-Hosted Deployment Guide

**Last Updated:** October 13, 2025
**Migration Status:** ✅ 100% Complete
**Deployment Ready:** Yes

This guide walks you through deploying the Cortex DC Web Platform in self-hosted mode with all services running in Docker containers.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 Minutes)](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Service Configuration](#service-configuration)
5. [Data Migration](#data-migration)
6. [Testing & Verification](#testing--verification)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker** (v24.0+) and **Docker Compose** (v2.20+)
- **Node.js** (v20+) and **pnpm** (v8+)
- **Git**
- **PostgreSQL Client** (psql) - Optional, for database access
- **kubectl** - Optional, for Kubernetes deployment

### System Requirements

**Minimum (Development):**
- 4 CPU cores
- 8 GB RAM
- 20 GB disk space

**Recommended (Production):**
- 8+ CPU cores
- 16+ GB RAM
- 100+ GB SSD storage

---

## Quick Start (5 Minutes)

Get the self-hosted stack running in 5 minutes:

```bash
# 1. Clone the repository (if not already)
git clone https://github.com/your-org/cortex-dc-web.git
cd cortex-dc-web

# 2. Install dependencies
pnpm install

# 3. Copy environment configuration
cp .env.self-hosted.example .env.self-hosted

# 4. Generate secure passwords
export POSTGRES_PASSWORD=$(openssl rand -base64 32)
export KEYCLOAK_ADMIN_PASSWORD=$(openssl rand -base64 32)
export MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)

# Update .env.self-hosted with generated passwords
sed -i "s/cortex_secure_password_change_me/${POSTGRES_PASSWORD}/g" .env.self-hosted
sed -i "s/admin_password_change_me/${KEYCLOAK_ADMIN_PASSWORD}/g" .env.self-hosted
sed -i "s/minioadmin_password_change_me/${MINIO_ROOT_PASSWORD}/g" .env.self-hosted
sed -i "s/your-jwt-secret-minimum-32-characters-here/${JWT_SECRET}/g" .env.self-hosted

# 5. Start all services
docker-compose -f docker-compose.self-hosted.yml up -d

# 6. Wait for services to be healthy (about 60 seconds)
docker-compose -f docker-compose.self-hosted.yml ps

# 7. Check service health
curl http://localhost:8080/health    # API Server
curl http://localhost:9000/minio/health/live    # MinIO

# 8. Access the services
echo "PostgreSQL: postgresql://cortex:${POSTGRES_PASSWORD}@localhost:5432/cortex"
echo "Keycloak Admin: http://localhost:8180 (admin/${KEYCLOAK_ADMIN_PASSWORD})"
echo "MinIO Console: http://localhost:9001 (minioadmin/${MINIO_ROOT_PASSWORD})"
echo "API Server: http://localhost:8080"
```

**Services are now running!** 🎉

Continue to [Service Configuration](#service-configuration) to set up Keycloak.

---

## Detailed Setup

### Step 1: Environment Configuration

Create your environment file:

```bash
cp .env.self-hosted.example .env.self-hosted
```

Edit `.env.self-hosted` and update these critical values:

```bash
# Database
POSTGRES_PASSWORD=<strong-password>
DATABASE_URL=postgresql://cortex:<strong-password>@localhost:5432/cortex

# Keycloak
KEYCLOAK_ADMIN_PASSWORD=<admin-password>
KEYCLOAK_CLIENT_SECRET=<client-secret>

# MinIO
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=<minio-password>

# Security
JWT_SECRET=<minimum-32-characters>
SESSION_SECRET=<minimum-32-characters>

# AI (Optional - for Gemini features)
GEMINI_API_KEY=<your-gemini-api-key>
```

### Step 2: Start Infrastructure Services

Start PostgreSQL, Keycloak, MinIO, Redis, and NATS:

```bash
docker-compose -f docker-compose.self-hosted.yml up -d postgres keycloak minio redis nats
```

Wait for services to be healthy:

```bash
# Check PostgreSQL
docker-compose -f docker-compose.self-hosted.yml exec postgres pg_isready -U cortex

# Check Keycloak (may take 30-60 seconds)
curl -f http://localhost:8180/health || echo "Waiting for Keycloak..."

# Check MinIO
curl -f http://localhost:9000/minio/health/live
```

### Step 3: Initialize Database

The database schema is automatically created by the init script. Verify it:

```bash
# Connect to PostgreSQL
docker-compose -f docker-compose.self-hosted.yml exec postgres psql -U cortex -d cortex

# List tables
\dt

# Expected output:
# users, povs, trrs, organizations, notifications, activity_logs, user_settings
```

### Step 4: Configure Keycloak

#### Access Keycloak Admin Console

1. Open http://localhost:8180
2. Click "Administration Console"
3. Login with credentials from `.env.self-hosted`:
   - Username: `admin`
   - Password: `<KEYCLOAK_ADMIN_PASSWORD>`

#### Create Cortex Realm

1. Click the realm dropdown (top-left)
2. Click "Create Realm"
3. Name: `cortex`
4. Click "Create"

#### Create Clients

**API Client (cortex-api):**

1. Go to Clients → Create Client
2. Client ID: `cortex-api`
3. Client authentication: ON
4. Authorization: ON
5. Valid redirect URIs: `http://localhost:8080/*`
6. Web origins: `http://localhost:8080`
7. Save

**Web Client (cortex-web):**

1. Go to Clients → Create Client
2. Client ID: `cortex-web`
3. Client authentication: OFF (public client)
4. Standard flow: ON
5. Direct access grants: ON
6. Valid redirect URIs: `http://localhost:3000/*`
7. Web origins: `http://localhost:3000`
8. Save

#### Get Client Secret

1. Go to Clients → cortex-api → Credentials
2. Copy the "Client secret"
3. Update `.env.self-hosted`:
   ```bash
   KEYCLOAK_CLIENT_SECRET=<copied-secret>
   ```

#### Create Test User

1. Go to Users → Add User
2. Username: `test@example.com`
3. Email: `test@example.com`
4. Email verified: ON
5. Save

6. Go to Credentials tab
7. Set password: `Test1234!`
8. Temporary: OFF
9. Save

### Step 5: Start API Server

Start the API server:

```bash
# Option A: Using Docker
docker-compose -f docker-compose.self-hosted.yml up -d api-server

# Option B: Using pnpm (development)
pnpm --filter "@cortex-dc/api-server" dev
```

Verify API health:

```bash
curl http://localhost:8080/health
# Response: {"status":"healthy","timestamp":"..."}

curl http://localhost:8080/ready
# Response: {"ready":true,"database":"connected","timestamp":"..."}
```

### Step 6: Start Frontend

Start the Next.js frontend:

```bash
# Development mode
pnpm --filter "@cortex-dc/web" dev

# Production build
pnpm --filter "@cortex-dc/web" build
pnpm --filter "@cortex-dc/web" start
```

Access the application:
- Frontend: http://localhost:3000
- API: http://localhost:8080

---

## Service Configuration

### PostgreSQL

**Connection Details:**
```
Host: localhost
Port: 5432
Database: cortex
User: cortex
Password: <from .env.self-hosted>
```

**Connection String:**
```bash
postgresql://cortex:<password>@localhost:5432/cortex
```

**Management:**
```bash
# Access psql
docker-compose -f docker-compose.self-hosted.yml exec postgres psql -U cortex -d cortex

# Backup database
docker-compose -f docker-compose.self-hosted.yml exec postgres pg_dump -U cortex cortex > backup.sql

# Restore database
docker-compose -f docker-compose.self-hosted.yml exec -T postgres psql -U cortex cortex < backup.sql
```

### Keycloak

**Access:**
- Admin Console: http://localhost:8180
- Realm: http://localhost:8180/realms/cortex

**Key Configuration:**
```bash
# Realm: cortex
# Clients: cortex-api (confidential), cortex-web (public)
# Users: Create in Keycloak admin console
```

**Export Realm Configuration:**
```bash
docker-compose -f docker-compose.self-hosted.yml exec keycloak \
  /opt/keycloak/bin/kc.sh export \
  --dir /tmp/keycloak-export \
  --realm cortex
```

### MinIO

**Access:**
- S3 API: http://localhost:9000
- Web Console: http://localhost:9001

**Credentials:**
```
Access Key: minioadmin (or from MINIO_ACCESS_KEY)
Secret Key: <from .env.self-hosted>
```

**Create Bucket:**
```bash
# Install MinIO client
brew install minio/stable/mc  # macOS
# or
wget https://dl.min.io/client/mc/release/linux-amd64/mc

# Configure
mc alias set local http://localhost:9000 minioadmin <password>

# Create bucket
mc mb local/cortex-storage

# Set public policy (for downloads)
mc anonymous set download local/cortex-storage
```

**Or via Web Console:**
1. Go to http://localhost:9001
2. Login with MinIO credentials
3. Click "Buckets" → "Create Bucket"
4. Name: `cortex-storage`
5. Click "Create"

### Redis

**Access:**
```bash
# CLI access
docker-compose -f docker-compose.self-hosted.yml exec redis redis-cli

# Test connection
redis-cli -h localhost -p 6379 ping
# Response: PONG
```

**Monitoring:**
```bash
# Monitor commands
docker-compose -f docker-compose.self-hosted.yml exec redis redis-cli monitor

# Check info
docker-compose -f docker-compose.self-hosted.yml exec redis redis-cli info
```

### NATS

**Access:**
- Client: nats://localhost:4222
- Monitoring: http://localhost:8222

**Test Connection:**
```bash
# Install NATS CLI
brew install nats-io/nats-tools/nats  # macOS

# Subscribe to test topic
nats sub test

# Publish message (in another terminal)
nats pub test "Hello NATS"
```

---

## Data Migration

### Migrate from Firebase to PostgreSQL

If you have existing data in Firebase, run the migration script:

```bash
# 1. Export Firebase data (optional, for backup)
firebase firestore:export ./firestore-backup

# 2. Set Firebase credentials
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-service-account.json

# 3. Run migration script
npx tsx scripts/migrate-firebase-to-postgres.ts
```

**Expected Output:**
```
🚀 Starting Firebase to PostgreSQL migration...

✓ Connected to PostgreSQL

📊 Migrating Users...
  ✓ Migrated user: user1@example.com
  ✓ Migrated user: user2@example.com
  ...

📋 Migrating POVs...
  ✓ Migrated POV: Customer ABC POV
  ...

📝 Migrating TRRs...
  ✓ Migrated TRR: TRR-2024-001
  ...

============================================================
📊 MIGRATION SUMMARY
============================================================

Users:
  ✓ Migrated: 15
  ✗ Failed: 0

POVs:
  ✓ Migrated: 23
  ✗ Failed: 0

TRRs:
  ✓ Migrated: 45
  ✗ Failed: 0

Total:
  ✓ Migrated: 83
  ✗ Failed: 0
============================================================

✅ Migration completed successfully!
```

### Verify Migration

```bash
# Check user count
docker-compose -f docker-compose.self-hosted.yml exec postgres \
  psql -U cortex -d cortex -c "SELECT COUNT(*) FROM users;"

# Check POV count
docker-compose -f docker-compose.self-hosted.yml exec postgres \
  psql -U cortex -d cortex -c "SELECT COUNT(*) FROM povs;"

# Check TRR count
docker-compose -f docker-compose.self-hosted.yml exec postgres \
  psql -U cortex -d cortex -c "SELECT COUNT(*) FROM trrs;"
```

---

## Testing & Verification

### Health Checks

```bash
# API Server
curl http://localhost:8080/health
# Expected: {"status":"healthy","timestamp":"..."}

# Database connectivity
curl http://localhost:8080/ready
# Expected: {"ready":true,"database":"connected","timestamp":"..."}

# MinIO
curl http://localhost:9000/minio/health/live
# Expected: (200 OK)

# Keycloak
curl http://localhost:8180/health
# Expected: {"status":"UP"}
```

### API Endpoint Testing

```bash
# 1. Get Keycloak token
TOKEN=$(curl -X POST http://localhost:8180/realms/cortex/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=cortex-web" \
  -d "grant_type=password" \
  -d "username=test@example.com" \
  -d "password=Test1234!" \
  | jq -r '.access_token')

echo "Token: $TOKEN"

# 2. Test user endpoint
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Create POV
curl -X POST http://localhost:8080/api/povs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test POV",
    "customer": "Test Customer",
    "industry": "Technology",
    "description": "Test POV for verification"
  }'

# 4. List POVs
curl http://localhost:8080/api/povs \
  -H "Authorization: Bearer $TOKEN"
```

### Storage Testing

```bash
# Test file upload
curl -X POST http://localhost:8080/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.md"

# List files
curl http://localhost:8080/api/files \
  -H "Authorization: Bearer $TOKEN"
```

### Performance Testing

```bash
# Install Apache Bench
brew install httpd  # macOS
# or
sudo apt-get install apache2-utils  # Ubuntu

# Load test API
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/povs
```

---

## Production Deployment

### Docker Compose (Small Scale)

For single-server deployments:

```bash
# 1. Update .env.self-hosted with production values
# 2. Use production-optimized compose file
docker-compose -f docker-compose.self-hosted.yml -f docker-compose.prod.yml up -d

# 3. Enable SSL/TLS (recommended: use Nginx/Traefik reverse proxy)
# 4. Set up backups (see Backup section)
# 5. Configure monitoring (see Monitoring section)
```

### Kubernetes (Large Scale)

For multi-node production deployments:

```bash
# 1. Apply namespace
kubectl apply -f kubernetes/namespaces/

# 2. Create secrets
kubectl create secret generic cortex-secrets \
  --from-literal=postgres-password=<strong-password> \
  --from-literal=keycloak-admin-password=<admin-password> \
  --from-literal=minio-secret-key=<minio-password> \
  --from-literal=jwt-secret=<jwt-secret> \
  -n cortex

# 3. Apply ConfigMaps
kubectl apply -f kubernetes/config/

# 4. Deploy database
kubectl apply -f kubernetes/database/

# 5. Deploy services
kubectl apply -f kubernetes/services/

# 6. Check deployment status
kubectl get pods -n cortex
kubectl get services -n cortex

# 7. Access services (if using NodePort)
kubectl get svc -n cortex
```

### Backup Strategy

**Automated Backups:**

```bash
# PostgreSQL backup script
#!/bin/bash
BACKUP_DIR=/backups/postgres
DATE=$(date +%Y%m%d_%H%M%S)

docker-compose -f docker-compose.self-hosted.yml exec -T postgres \
  pg_dump -U cortex cortex | gzip > ${BACKUP_DIR}/cortex_${DATE}.sql.gz

# Keep last 7 days
find ${BACKUP_DIR} -name "cortex_*.sql.gz" -mtime +7 -delete
```

**Cron Job:**
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

### Monitoring

**Prometheus & Grafana:**

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

**Start monitoring:**
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Access:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001

---

## Troubleshooting

### Common Issues

#### PostgreSQL Connection Failed

```bash
# Check PostgreSQL is running
docker-compose -f docker-compose.self-hosted.yml ps postgres

# Check logs
docker-compose -f docker-compose.self-hosted.yml logs postgres

# Test connection
docker-compose -f docker-compose.self-hosted.yml exec postgres pg_isready -U cortex
```

#### Keycloak Not Starting

```bash
# Check logs
docker-compose -f docker-compose.self-hosted.yml logs keycloak

# Common issue: PostgreSQL not ready
# Solution: Wait 30-60 seconds for PostgreSQL to initialize

# Restart Keycloak
docker-compose -f docker-compose.self-hosted.yml restart keycloak
```

#### API Server Cannot Connect to Database

```bash
# Verify DATABASE_URL in .env.self-hosted
# Check if PostgreSQL is accessible
docker-compose -f docker-compose.self-hosted.yml exec postgres \
  psql -U cortex -d cortex -c "SELECT 1;"

# Check API server logs
docker-compose -f docker-compose.self-hosted.yml logs api-server
```

#### MinIO Bucket Not Found

```bash
# Create bucket manually
mc alias set local http://localhost:9000 minioadmin <password>
mc mb local/cortex-storage

# Or via Docker
docker-compose -f docker-compose.self-hosted.yml exec minio \
  mc mb /data/cortex-storage
```

### Debug Mode

Enable debug logging:

```bash
# Update .env.self-hosted
LOG_LEVEL=debug
NODE_ENV=development

# Restart services
docker-compose -f docker-compose.self-hosted.yml restart
```

### Clean Start

If you need to start fresh:

```bash
# Stop and remove all containers
docker-compose -f docker-compose.self-hosted.yml down -v

# Remove data volumes
docker volume rm cortex-dc-web_postgres_data
docker volume rm cortex-dc-web_minio_data
docker volume rm cortex-dc-web_redis_data

# Start again
docker-compose -f docker-compose.self-hosted.yml up -d
```

---

## Service URLs Summary

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend (Web) | http://localhost:3000 | Keycloak user |
| API Server | http://localhost:8080 | JWT token |
| PostgreSQL | postgresql://localhost:5432/cortex | cortex / <password> |
| Keycloak Admin | http://localhost:8180 | admin / <admin-password> |
| Keycloak Realm | http://localhost:8180/realms/cortex | - |
| MinIO Console | http://localhost:9001 | minioadmin / <password> |
| MinIO API | http://localhost:9000 | API keys |
| Redis | redis://localhost:6379 | <password> |
| NATS | nats://localhost:4222 | - |
| NATS Monitoring | http://localhost:8222 | - |

---

## Next Steps

1. **Configure Users:** Create users in Keycloak admin console
2. **Set Up Teams:** Create organizations and assign users
3. **Import Content:** Import existing POVs, TRRs, and content
4. **Customize:** Configure branding, themes, and settings
5. **Monitor:** Set up monitoring and alerting
6. **Scale:** Deploy to Kubernetes for production

---

## Support & Resources

**Documentation:**
- [Migration Complete](./MIGRATION_COMPLETE.md)
- [Containerized Architecture](./CONTAINERIZED_ARCHITECTURE.md)
- [Firebase Services Migration](./FIREBASE_SERVICES_MIGRATION_PHASE_2.md)

**Troubleshooting:**
- Check service logs: `docker-compose -f docker-compose.self-hosted.yml logs <service>`
- Verify health checks
- Check environment variables

**Getting Help:**
- GitHub Issues: [Report issues](https://github.com/your-org/cortex-dc-web/issues)
- Documentation: All `.md` files in the root directory

---

**Deployment Status:** ✅ Ready for Production
**Last Updated:** October 13, 2025
**Migration Progress:** 100% Complete

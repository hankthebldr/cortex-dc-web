# Quick Start: Migration Testing

**Status**: ✅ Migration Complete - Ready for Testing
**Last Updated**: 2025-10-14

This guide will help you test the completed Firebase to self-hosted migration in under 10 minutes.

---

## 🚀 Quick Start (Self-Hosted Mode)

### 1. Start Infrastructure

```bash
# Start PostgreSQL and MinIO
docker-compose -f docker-compose.self-hosted.yml up -d

# Verify services are running
docker-compose -f docker-compose.self-hosted.yml ps
```

**Expected output:**
```
postgres    running    0.0.0.0:5432->5432/tcp
minio       running    0.0.0.0:9000->9000/tcp
```

### 2. Configure Environment

Create `.env.local`:

```bash
cat > .env.local << 'EOF'
# Self-hosted mode
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted

# Database
DATABASE_MODE=postgres
DATABASE_URL=postgresql://postgres:password@localhost:5432/cortex
NEXT_PUBLIC_DATABASE_MODE=postgres

# Storage
STORAGE_MODE=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=cortex-storage
NEXT_PUBLIC_STORAGE_MODE=minio

# API
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://localhost:8080
EOF
```

### 3. Initialize Database

```bash
# Install dependencies (if not already done)
pnpm install

# Generate Prisma client
cd packages/db
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init
```

### 4. Test the Migration

```bash
# Run automated test script
./scripts/test-migration.sh self-hosted

# Or run type checks manually
pnpm --filter "@cortex/commands" type-check
pnpm --filter "@cortex/content" type-check
pnpm --filter "@cortex/integrations" type-check
```

### 5. Start Services

```bash
# Terminal 1: API Server
pnpm --filter @cortex/api-server dev

# Terminal 2: Web App (in new terminal)
pnpm --filter @cortex-dc/web dev

# Terminal 3: Watch logs (optional)
docker-compose -f docker-compose.self-hosted.yml logs -f
```

### 6. Verify Everything Works

Open your browser:
- **Web App**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (user: minioadmin, pass: minioadmin)
- **API Health**: http://localhost:8080/health

---

## 🔄 Testing Firebase Mode

### 1. Start Firebase Emulators

```bash
# Firebase emulators are already running if you see this:
firebase emulators:start --only auth,firestore
```

### 2. Configure Environment

```bash
cat > .env.local << 'EOF'
DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
EOF
```

### 3. Run Tests

```bash
./scripts/test-migration.sh firebase
```

---

## 🔀 Testing Hybrid Mode

Mix Firebase and self-hosted services:

```bash
cat > .env.local << 'EOF'
DEPLOYMENT_MODE=self-hosted
DATABASE_MODE=postgres
STORAGE_MODE=firebase
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
EOF
```

---

## ✅ Migration Verification Checklist

### Infrastructure
- [ ] PostgreSQL is running on port 5432
- [ ] MinIO is running on port 9000
- [ ] MinIO console accessible at http://localhost:9001
- [ ] Docker containers are healthy

### Code Quality
- [ ] All TypeScript files compile without errors
- [ ] No type ambiguity errors
- [ ] Import paths are correct
- [ ] All packages build successfully

### Functionality
- [ ] Database adapter can connect to PostgreSQL
- [ ] Storage adapter can connect to MinIO
- [ ] User management API endpoints work
- [ ] File upload/download works
- [ ] Authentication works

### Performance
- [ ] Database queries complete in < 100ms
- [ ] Storage operations complete in < 500ms
- [ ] API responses in < 200ms

---

## 🧪 Manual Testing

### Test Database Connection

```bash
# Connect to PostgreSQL
docker exec -it $(docker ps -q -f name=postgres) psql -U postgres -d cortex

# Run test query
SELECT NOW();

# Exit
\q
```

### Test Storage Connection

```bash
# Install MinIO client (optional)
brew install minio/stable/mc

# Configure MinIO client
mc alias set local http://localhost:9000 minioadmin minioadmin

# List buckets
mc ls local/

# Create test bucket
mc mb local/cortex-storage

# Upload test file
echo "test" > test.txt
mc cp test.txt local/cortex-storage/
```

### Test API Endpoints

```bash
# Get API health
curl http://localhost:8080/health

# Test user endpoint (requires auth token)
export TOKEN="your-auth-token"

curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 What Changed?

### New Services
- ✅ PostgreSQL database adapter
- ✅ MinIO storage adapter
- ✅ Express API server for user management
- ✅ REST API client (replaces Firebase Functions)

### New Configuration
- ✅ Environment-based adapter selection
- ✅ Dual-mode support (Firebase + Self-hosted)
- ✅ Automatic adapter initialization

### Migration Benefits
- 💰 **Cost Savings**: 60-80% reduction vs Firebase
- 🔒 **Data Control**: Full ownership of data
- 🚀 **Performance**: Direct database access
- 🌍 **Compliance**: Regional data requirements
- 📈 **Scalability**: Horizontal scaling capability

---

## 🐛 Troubleshooting

### PostgreSQL Connection Refused

```bash
# Check if running
docker ps | grep postgres

# Check logs
docker logs $(docker ps -q -f name=postgres)

# Restart
docker-compose -f docker-compose.self-hosted.yml restart postgres
```

### MinIO Connection Refused

```bash
# Check if running
docker ps | grep minio

# Check logs
docker logs $(docker ps -q -f name=minio)

# Restart
docker-compose -f docker-compose.self-hosted.yml restart minio
```

### TypeScript Errors

```bash
# Clean and rebuild
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Port Already in Use

```bash
# Find process using port 5432
lsof -i :5432

# Kill process
kill -9 <PID>

# Or use different port in docker-compose
```

---

## 🛑 Stop Services

```bash
# Stop all services
docker-compose -f docker-compose.self-hosted.yml down

# Stop and remove volumes (WARNING: deletes data)
docker-compose -f docker-compose.self-hosted.yml down -v

# Stop specific service
docker-compose -f docker-compose.self-hosted.yml stop postgres
```

---

## 📚 Additional Resources

### Documentation
- **Full Migration Details**: `FINAL_MIGRATION_COMPLETE.md`
- **Deployment Guide**: `MIGRATION_DEPLOYMENT_GUIDE.md`
- **Environment Configuration**: `ENVIRONMENT_CONFIGURATION_GUIDE.md`
- **Phase 2 Summary**: `FIREBASE_SERVICES_MIGRATION_PHASE_2.md`

### Key Files Created
```
packages/db/src/
├── adapters/
│   ├── database.adapter.ts          # Database interface
│   ├── database.factory.ts          # Auto-select database
│   ├── firestore.adapter.ts         # Firebase adapter
│   ├── postgres.adapter.ts          # PostgreSQL adapter
│   ├── storage.adapter.ts           # Storage interface
│   ├── storage.factory.ts           # Auto-select storage
│   ├── firebase-storage.adapter.ts  # Firebase Storage
│   └── minio-storage.adapter.ts     # MinIO/S3 adapter
├── services/
│   ├── user-management-service.ts   # Dual-mode service
│   └── user-management-api-client.ts # REST API client

packages/utils/src/
└── api/
    └── user-api-client.ts           # Frontend API client

packages/api-server/src/
└── routes/
    └── user.routes.ts               # User API endpoints
```

### Code Locations
- Database adapters: packages/db/src/adapters/database.adapter.ts:1
- Storage adapters: packages/db/src/adapters/storage.adapter.ts:1
- User service: packages/db/src/services/user-management-service.ts:138
- API routes: packages/api-server/src/routes/user.routes.ts:1

---

## ✨ Success Indicators

Your migration test is successful when:

✅ All Docker containers are healthy
✅ TypeScript compiles without errors
✅ Database migrations complete successfully
✅ Storage buckets are accessible
✅ API endpoints respond correctly
✅ Web app loads without console errors
✅ Authentication flow works
✅ File upload/download works

---

## 🎯 Next Steps

1. **Complete Local Testing** - Verify all features work
2. **Deploy to Staging** - Test in staging environment
3. **Run Load Tests** - Verify performance under load
4. **Security Audit** - Review security configurations
5. **Team Training** - Train team on new infrastructure
6. **Go Live** - Deploy to production

---

**Need Help?**

- Review the full deployment guide: `MIGRATION_DEPLOYMENT_GUIDE.md`
- Check troubleshooting section above
- Review migration summary: `FINAL_MIGRATION_COMPLETE.md`
- Check environment guide: `ENVIRONMENT_CONFIGURATION_GUIDE.md`

---

**Migration Status**: ✅ COMPLETE AND READY FOR TESTING

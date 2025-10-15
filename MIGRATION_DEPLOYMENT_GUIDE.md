# Migration Deployment Guide

**Status**: Migration Complete - Ready for Deployment Testing
**Date**: 2025-10-14
**Migration**: Firebase to Self-Hosted Infrastructure

## Overview

This guide provides step-by-step instructions for deploying and testing the completed Firebase to self-hosted migration. All code is complete and TypeScript compilation is clean.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Testing](#local-testing)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Options](#deployment-options)
5. [Testing Checklist](#testing-checklist)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- Node.js 18+
- Docker Desktop
- Docker Compose
- pnpm 8.15+
- PostgreSQL client (for database testing)
- MinIO client (optional, for storage testing)

### Required Services
- PostgreSQL 14+ database
- MinIO S3-compatible storage
- Redis (optional, for caching)

### Environment Files Needed
- `.env.local` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

---

## Local Testing

### Step 1: Start Infrastructure Services

```bash
# Start PostgreSQL, MinIO, and other services
docker-compose up -d postgres minio redis

# Verify services are running
docker-compose ps

# Check logs
docker-compose logs -f
```

**Expected Output:**
```
postgres  | database system is ready to accept connections
minio     | MinIO Object Storage Server
redis     | Ready to accept connections
```

### Step 2: Configure Environment Variables

Create `.env.local` in the root directory:

```bash
# Deployment Mode
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted

# Database Configuration
DATABASE_MODE=postgres
DATABASE_URL=postgresql://postgres:password@localhost:5432/cortex
NEXT_PUBLIC_DATABASE_MODE=postgres

# Storage Configuration
STORAGE_MODE=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=cortex-storage
NEXT_PUBLIC_STORAGE_MODE=minio

# API Server Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://localhost:8080

# Firebase Configuration (for hybrid mode fallback)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### Step 3: Initialize Database

```bash
# Generate Prisma client
pnpm --filter @cortex/db prisma generate

# Run migrations
pnpm --filter @cortex/db prisma migrate dev

# Seed database (optional)
pnpm --filter @cortex/db prisma db seed
```

### Step 4: Start Application Services

```bash
# Terminal 1: Start API server
pnpm --filter @cortex/api-server dev

# Terminal 2: Start web application
pnpm --filter @cortex-dc/web dev

# Terminal 3: Watch logs
docker-compose logs -f postgres minio
```

### Step 5: Verify Services

```bash
# Check API health
curl http://localhost:8080/health

# Check database connection
curl http://localhost:8080/api/health/db

# Check storage connection
curl http://localhost:8080/api/health/storage
```

---

## Environment Configuration

### Firebase Mode (Default)

Use Firebase for all services:

```bash
DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
```

**Services Used:**
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Functions

### Self-Hosted Mode

Use self-hosted infrastructure:

```bash
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
DATABASE_MODE=postgres
STORAGE_MODE=minio
```

**Services Used:**
- PostgreSQL database
- MinIO storage
- Express API server
- Custom authentication

### Hybrid Mode

Mix Firebase and self-hosted services:

```bash
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
DATABASE_MODE=postgres
STORAGE_MODE=firebase
```

**Use Cases:**
- Gradual migration
- Cost optimization
- Regional compliance

---

## Deployment Options

### Option 1: Docker Compose (Recommended for Testing)

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services Included:**
- PostgreSQL database
- MinIO storage
- Redis cache
- API server
- Web application

### Option 2: Kubernetes

```bash
# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/minio/
kubectl apply -f k8s/api-server/
kubectl apply -f k8s/web/

# Check status
kubectl get pods -n cortex-dc

# View logs
kubectl logs -f -n cortex-dc deployment/api-server
```

### Option 3: Cloud Deployment

#### AWS Deployment

```bash
# Database: RDS PostgreSQL
# Storage: S3
# Compute: ECS/EKS
# Load Balancer: ALB

# Set environment variables
export DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/cortex
export STORAGE_MODE=s3
export AWS_S3_BUCKET=cortex-storage
export AWS_REGION=us-east-1
```

#### Google Cloud Deployment

```bash
# Database: Cloud SQL PostgreSQL
# Storage: Cloud Storage
# Compute: Cloud Run/GKE
# Load Balancer: Cloud Load Balancing

# Set environment variables
export DATABASE_URL=postgresql://user:pass@cloud-sql-proxy:5432/cortex
export STORAGE_MODE=gcs
export GCS_BUCKET=cortex-storage
export GCP_PROJECT_ID=your-project-id
```

---

## Testing Checklist

### Phase 1: Infrastructure Testing

- [ ] PostgreSQL database is accessible
- [ ] MinIO storage is accessible
- [ ] Redis cache is accessible
- [ ] Network connectivity between services
- [ ] SSL/TLS certificates are valid
- [ ] Firewall rules are configured

### Phase 2: Service Testing

#### Database Adapter Testing

```bash
# Test database connection
pnpm --filter @cortex/db test:connection

# Test CRUD operations
pnpm --filter @cortex/db test:crud

# Test transactions
pnpm --filter @cortex/db test:transactions

# Test query performance
pnpm --filter @cortex/db test:performance
```

#### Storage Adapter Testing

```bash
# Test storage connection
pnpm test:storage:connection

# Test file upload
curl -X POST http://localhost:8080/api/storage/upload \
  -F "file=@test.txt" \
  -H "Authorization: Bearer $TOKEN"

# Test file download
curl http://localhost:8080/api/storage/download/test.txt \
  -H "Authorization: Bearer $TOKEN"

# Test file deletion
curl -X DELETE http://localhost:8080/api/storage/test.txt \
  -H "Authorization: Bearer $TOKEN"
```

#### API Testing

```bash
# Test user creation
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "test@example.com",
    "displayName": "Test User",
    "role": "user"
  }'

# Test user retrieval
curl http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Test user update
curl -X PUT http://localhost:8080/api/users/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "displayName": "Updated Name"
  }'
```

### Phase 3: Application Testing

- [ ] User registration works
- [ ] User login works
- [ ] User profile updates work
- [ ] File upload/download works
- [ ] Dashboard loads correctly
- [ ] POV creation works
- [ ] TRR management works
- [ ] Search functionality works
- [ ] Analytics tracking works

### Phase 4: Performance Testing

```bash
# Load testing with Apache Bench
ab -n 1000 -c 10 http://localhost:8080/api/health

# Database query performance
pnpm --filter @cortex/db benchmark

# Storage operation performance
pnpm test:storage:benchmark

# End-to-end performance
pnpm test:e2e:performance
```

### Phase 5: Security Testing

- [ ] Authentication tokens are validated
- [ ] Authorization checks are enforced
- [ ] SQL injection protection works
- [ ] XSS protection is enabled
- [ ] CSRF protection is enabled
- [ ] Rate limiting is configured
- [ ] Secrets are not exposed in logs

---

## Rollback Procedures

### Immediate Rollback (Emergency)

If critical issues are discovered:

```bash
# 1. Switch back to Firebase mode
# Update .env files:
DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase

# 2. Restart services
docker-compose restart

# Or for Kubernetes:
kubectl rollout undo deployment/api-server -n cortex-dc
kubectl rollout undo deployment/web -n cortex-dc

# 3. Verify services are running
curl http://localhost:8080/health
```

### Gradual Rollback

Roll back individual services:

```bash
# Roll back database only
DATABASE_MODE=firestore
NEXT_PUBLIC_DATABASE_MODE=firestore

# Roll back storage only
STORAGE_MODE=firebase
NEXT_PUBLIC_STORAGE_MODE=firebase

# Keep API changes
DEPLOYMENT_MODE=self-hosted
```

### Data Recovery

If data needs to be recovered:

```bash
# Restore from PostgreSQL backup
pg_restore -h localhost -U postgres -d cortex backup.dump

# Restore from MinIO backup
mc mirror backup/cortex-storage minio/cortex-storage

# Verify data integrity
pnpm --filter @cortex/db verify:data
```

---

## Troubleshooting

### Database Connection Issues

**Symptom**: Cannot connect to PostgreSQL

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection manually
psql postgresql://postgres:password@localhost:5432/cortex

# Common fixes:
# 1. Verify DATABASE_URL is correct
# 2. Check if PostgreSQL port 5432 is exposed
# 3. Verify firewall rules allow connection
# 4. Check if database exists: CREATE DATABASE cortex;
```

### Storage Connection Issues

**Symptom**: Cannot connect to MinIO

```bash
# Check if MinIO is running
docker-compose ps minio

# Check MinIO logs
docker-compose logs minio

# Test connection with MinIO client
mc alias set local http://localhost:9000 minioadmin minioadmin
mc ls local/

# Common fixes:
# 1. Verify MINIO_ENDPOINT is correct
# 2. Check credentials MINIO_ACCESS_KEY and MINIO_SECRET_KEY
# 3. Verify bucket exists: mc mb local/cortex-storage
# 4. Check network connectivity
```

### API Server Issues

**Symptom**: API server not responding

```bash
# Check API server logs
docker-compose logs api-server

# Check if port 8080 is available
lsof -i :8080

# Test health endpoint
curl -v http://localhost:8080/health

# Common fixes:
# 1. Verify NEXT_PUBLIC_API_URL is set correctly
# 2. Check if services are initialized
# 3. Review environment variables
# 4. Check for TypeScript compilation errors
```

### Authentication Issues

**Symptom**: Auth tokens not working

```bash
# Check Firebase configuration
echo $NEXT_PUBLIC_FIREBASE_API_KEY

# Verify token generation
curl -X POST http://localhost:8080/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"uid": "test-user"}'

# Common fixes:
# 1. Verify Firebase credentials are correct
# 2. Check if Firebase Auth is enabled
# 3. Verify token expiration settings
# 4. Check CORS configuration
```

### Build/Compilation Issues

**Symptom**: TypeScript errors or build failures

```bash
# Clean build artifacts
pnpm clean
rm -rf node_modules
rm pnpm-lock.yaml

# Reinstall dependencies
pnpm install

# Type check all packages
pnpm type-check

# Build all packages
pnpm build

# Common fixes:
# 1. Clear TypeScript cache: rm -rf */tsconfig.tsbuildinfo
# 2. Update dependencies: pnpm update
# 3. Check for missing type declarations
# 4. Verify package.json exports are correct
```

---

## Next Steps

### Immediate Actions (Day 1)

1. ✅ Complete local testing with Docker Compose
2. ✅ Verify all API endpoints work correctly
3. ✅ Test database migrations
4. ✅ Test storage operations
5. ✅ Run end-to-end tests

### Short Term (Week 1)

1. Deploy to staging environment
2. Run performance benchmarks
3. Conduct security audit
4. Load test with production-like data
5. Train team on new infrastructure

### Medium Term (Month 1)

1. Monitor production metrics
2. Optimize database queries
3. Fine-tune caching strategies
4. Implement automated backups
5. Set up monitoring and alerting

### Long Term (Quarter 1)

1. Decommission Firebase services
2. Optimize infrastructure costs
3. Implement advanced features
4. Scale infrastructure as needed
5. Document lessons learned

---

## Support Resources

### Documentation
- Main Migration Guide: `FINAL_MIGRATION_COMPLETE.md`
- Environment Guide: `ENVIRONMENT_CONFIGURATION_GUIDE.md`
- Phase 2 Details: `FIREBASE_SERVICES_MIGRATION_PHASE_2.md`

### Code Locations
- Database Adapters: `packages/db/src/adapters/`
- Storage Adapters: `packages/db/src/adapters/`
- API Routes: `packages/api-server/src/routes/`
- Frontend Clients: `packages/utils/src/api/`

### Key Services
- User Management: `packages/db/src/services/user-management-service.ts`
- Storage: `packages/utils/src/storage/cloud-store-service.ts`
- Database: `packages/db/src/adapters/database.factory.ts`
- API Client: `packages/utils/src/api/user-api-client.ts`

---

## Success Criteria

✅ **Migration is successful when:**

- All services run in self-hosted mode without errors
- Database operations complete within acceptable time (< 100ms)
- Storage operations complete within acceptable time (< 500ms)
- API endpoints respond correctly (< 200ms)
- Zero data loss during migration
- Authentication works correctly
- All tests pass
- Production monitoring shows stable metrics
- Team is trained and comfortable with new infrastructure

---

**Last Updated**: 2025-10-14
**Version**: 1.0
**Status**: Ready for Testing

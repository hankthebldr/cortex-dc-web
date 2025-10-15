# Environment Configuration Guide

**Cortex DC Web Platform - Complete Configuration Reference**

This guide explains all environment variables for the Cortex DC Web Platform, covering both Firebase and self-hosted deployment modes.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Deployment Modes](#deployment-modes)
- [Firebase Configuration](#firebase-configuration)
- [Self-Hosted Configuration](#self-hosted-configuration)
- [Hybrid Configurations](#hybrid-configurations)
- [Service-Specific Variables](#service-specific-variables)
- [Complete Variable Reference](#complete-variable-reference)

---

## Quick Start

### Firebase Mode (Default)

```bash
# .env.local
DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain

GEMINI_API_KEY=your-gemini-api-key
```

### Self-Hosted Mode

```bash
# .env.local
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted

# Database
DATABASE_URL=postgresql://cortex:password@localhost:5432/cortex

# Authentication
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=cortex
KEYCLOAK_CLIENT_ID=cortex-web

# Storage
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# API
API_URL=http://localhost:8080

# AI
GEMINI_API_KEY=your-gemini-api-key
```

---

## Deployment Modes

The `DEPLOYMENT_MODE` environment variable controls which adapters are used:

| Mode | Database | Authentication | Storage | Functions |
|------|----------|----------------|---------|-----------|
| `firebase` | Firestore | Firebase Auth | Firebase Storage | Firebase Functions |
| `self-hosted` | PostgreSQL | Keycloak | MinIO/S3 | Express API |

### How Adapter Selection Works

```typescript
// Automatic selection based on DEPLOYMENT_MODE
const db = getDatabase();      // Firestore or PostgreSQL
const auth = getAuth();        // Firebase Auth or Keycloak
const storage = getStorage();  // Firebase Storage or MinIO
```

The factory pattern automatically selects the correct implementation:

1. Check `DEPLOYMENT_MODE` environment variable
2. Fall back to checking specific service variables (e.g., `DATABASE_URL`)
3. Default to Firebase if no configuration is found

---

## Firebase Configuration

### Required Variables

```bash
# Deployment mode
DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase

# Firebase Project Configuration
# Get these from Firebase Console > Project Settings > General
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAbc123...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Firebase Admin SDK (Server-Side)

For migration scripts and server-side operations:

```bash
# Path to service account JSON file
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json

# Or inline JSON (base64 encoded)
FIREBASE_SERVICE_ACCOUNT=<base64-encoded-json>
```

### Firebase Emulators (Development)

```bash
# Enable emulators
USE_FIREBASE_EMULATORS=true

# Emulator hosts
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
```

---

## Self-Hosted Configuration

### Complete Self-Hosted Setup

```bash
#============================================
# Deployment Mode
#============================================
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted

#============================================
# PostgreSQL Database
#============================================
DATABASE_URL=postgresql://cortex:password@localhost:5432/cortex

# Connection pool settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_CONNECTION_TIMEOUT=5000

# Prisma configuration
PRISMA_HIDE_UPDATE_MESSAGE=true
PRISMA_TELEMETRY_DISABLED=true

#============================================
# Keycloak Authentication
#============================================
# Server-side Keycloak URL
KEYCLOAK_URL=http://keycloak:8180
KEYCLOAK_REALM=cortex
KEYCLOAK_CLIENT_ID=cortex-web
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Public Keycloak URL (accessible from browser)
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=cortex
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=cortex-web

#============================================
# MinIO Storage (S3-Compatible)
#============================================
# Server-side MinIO URL
MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=cortex-storage
MINIO_USE_SSL=false
MINIO_REGION=us-east-1

# Public MinIO URL (accessible from browser)
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
NEXT_PUBLIC_MINIO_BUCKET=cortex-storage

# Storage mode override (optional)
STORAGE_MODE=minio
NEXT_PUBLIC_STORAGE_MODE=minio

#============================================
# Express API Server
#============================================
# Server-side API URL
API_URL=http://api-server:8080

# Public API URL (accessible from browser)
NEXT_PUBLIC_API_URL=http://localhost:8080

# API Server configuration
API_PORT=8080
API_TIMEOUT=30000

#============================================
# Redis Cache (Optional)
#============================================
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=
REDIS_DB=0

# Cache TTL settings (seconds)
CACHE_TTL_SHORT=300
CACHE_TTL_MEDIUM=3600
CACHE_TTL_LONG=86400

#============================================
# NATS Message Queue (Optional)
#============================================
NATS_URL=nats://nats:4222
NATS_USER=
NATS_PASSWORD=
```

### Docker Compose Environment

When running with Docker Compose, use internal service names:

```bash
# docker-compose.env
DEPLOYMENT_MODE=self-hosted

# Internal service URLs (container-to-container)
DATABASE_URL=postgresql://cortex:password@postgres:5432/cortex
KEYCLOAK_URL=http://keycloak:8180
MINIO_ENDPOINT=http://minio:9000
API_URL=http://api-server:8080
REDIS_URL=redis://redis:6379
NATS_URL=nats://nats:4222

# Public URLs (browser-to-host)
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
```

### Kubernetes Environment

When running in Kubernetes, use internal DNS names:

```bash
# kubernetes-config.env
DEPLOYMENT_MODE=self-hosted

# Internal service URLs (using Kubernetes DNS)
DATABASE_URL=postgresql://cortex:password@cortex-postgres.cortex.svc.cluster.local:5432/cortex
KEYCLOAK_URL=http://cortex-keycloak.cortex.svc.cluster.local:8180
MINIO_ENDPOINT=http://cortex-minio.cortex.svc.cluster.local:9000
API_URL=http://cortex-api.cortex.svc.cluster.local:8080
REDIS_URL=redis://cortex-redis.cortex.svc.cluster.local:6379

# Public URLs (via Ingress)
NEXT_PUBLIC_API_URL=https://api.cortex-dc.example.com
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.cortex-dc.example.com
NEXT_PUBLIC_MINIO_ENDPOINT=https://storage.cortex-dc.example.com
```

---

## Hybrid Configurations

You can mix Firebase and self-hosted services for gradual migration:

### Example 1: Self-Hosted Database, Firebase Auth & Storage

```bash
# Use self-hosted database
DEPLOYMENT_MODE=self-hosted
DATABASE_URL=postgresql://cortex:password@localhost:5432/cortex

# Override auth to use Firebase
AUTH_MODE=firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...

# Override storage to use Firebase
STORAGE_MODE=firebase
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
```

### Example 2: Firebase Database, Self-Hosted Storage

```bash
# Use Firebase database
DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Override storage to use MinIO
STORAGE_MODE=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

---

## Service-Specific Variables

### Database Variables

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=true
DATABASE_CONNECTION_TIMEOUT=5000

# Or Firestore
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIRESTORE_DATABASE_ID=(default)
```

### Authentication Variables

```bash
# Keycloak
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=cortex
KEYCLOAK_CLIENT_ID=cortex-web
KEYCLOAK_CLIENT_SECRET=your-secret

# Or Firebase Auth
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
```

### Storage Variables

```bash
# MinIO/S3
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=cortex-storage
MINIO_USE_SSL=false

# Or Firebase Storage
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
```

### AI Service Variables

```bash
# Gemini AI (works with both modes)
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

AI_MODEL=gemini-2.5-flash
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2048
```

---

## Complete Variable Reference

### Core Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEPLOYMENT_MODE` | Yes | `firebase` | Deployment mode: `firebase` or `self-hosted` |
| `NEXT_PUBLIC_DEPLOYMENT_MODE` | Yes | `firebase` | Public deployment mode for frontend |
| `NODE_ENV` | No | `development` | Node environment: `development`, `production`, `test` |
| `PORT` | No | `3000` | Frontend port |
| `API_PORT` | No | `8080` | API server port |

### Database Configuration

| Variable | Required (Self-Hosted) | Description |
|----------|------------------------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DATABASE_POOL_MIN` | No | Minimum connection pool size (default: 2) |
| `DATABASE_POOL_MAX` | No | Maximum connection pool size (default: 10) |
| `DATABASE_SSL` | No | Enable SSL for database connection |
| `DATABASE_CONNECTION_TIMEOUT` | No | Connection timeout in milliseconds |
| `PRISMA_HIDE_UPDATE_MESSAGE` | No | Hide Prisma update messages |
| `PRISMA_TELEMETRY_DISABLED` | No | Disable Prisma telemetry |

### Authentication Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| **Keycloak (Self-Hosted)** | | |
| `KEYCLOAK_URL` | Yes | Keycloak server URL |
| `KEYCLOAK_REALM` | Yes | Keycloak realm name |
| `KEYCLOAK_CLIENT_ID` | Yes | Keycloak client ID |
| `KEYCLOAK_CLIENT_SECRET` | Yes | Keycloak client secret |
| `NEXT_PUBLIC_KEYCLOAK_URL` | Yes | Public Keycloak URL |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Yes | Public realm name |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Yes | Public client ID |
| **Firebase Auth** | | |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |

### Storage Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| **MinIO/S3 (Self-Hosted)** | | |
| `MINIO_ENDPOINT` | Yes | MinIO server URL |
| `MINIO_ACCESS_KEY` | Yes | MinIO access key |
| `MINIO_SECRET_KEY` | Yes | MinIO secret key |
| `MINIO_BUCKET` | Yes | MinIO bucket name |
| `MINIO_USE_SSL` | No | Enable SSL for MinIO |
| `MINIO_REGION` | No | S3 region (default: us-east-1) |
| `NEXT_PUBLIC_MINIO_ENDPOINT` | Yes | Public MinIO URL |
| **Firebase Storage** | | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Firebase storage bucket |

### API Configuration

| Variable | Required (Self-Hosted) | Description |
|----------|------------------------|-------------|
| `API_URL` | Yes | Internal API server URL |
| `NEXT_PUBLIC_API_URL` | Yes | Public API URL |
| `API_PORT` | No | API server port (default: 8080) |
| `API_TIMEOUT` | No | API request timeout (default: 30000ms) |

### AI Services

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes (for AI) | Google Gemini API key |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Yes (for AI) | Public Gemini API key |
| `AI_MODEL` | No | AI model name (default: gemini-2.5-flash) |
| `AI_TEMPERATURE` | No | AI temperature (default: 0.7) |
| `AI_MAX_TOKENS` | No | Max tokens (default: 2048) |

### External Integrations

| Variable | Required | Description |
|----------|----------|-------------|
| **BigQuery** | | |
| `BIGQUERY_PROJECT_ID` | Optional | GCP project ID |
| `BIGQUERY_DATASET_ID` | Optional | BigQuery dataset |
| `BIGQUERY_CREDENTIALS` | Optional | Path to credentials file |
| **XSIAM** | | |
| `XSIAM_API_URL` | Optional | XSIAM API URL |
| `XSIAM_API_KEY` | Optional | XSIAM API key |
| `XSIAM_API_KEY_ID` | Optional | XSIAM API key ID |

### Cache & Queue

| Variable | Required | Description |
|----------|----------|-------------|
| `REDIS_URL` | Optional | Redis connection URL |
| `REDIS_PASSWORD` | Optional | Redis password |
| `REDIS_DB` | Optional | Redis database number |
| `CACHE_TTL_SHORT` | Optional | Short cache TTL (seconds) |
| `CACHE_TTL_MEDIUM` | Optional | Medium cache TTL (seconds) |
| `CACHE_TTL_LONG` | Optional | Long cache TTL (seconds) |
| `NATS_URL` | Optional | NATS server URL |

### Security

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No | JWT expiration (default: 24h) |
| `SESSION_SECRET` | Yes | Session secret (min 32 chars) |
| `SESSION_MAX_AGE` | No | Session max age (milliseconds) |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window |

### Monitoring & Logging

| Variable | Required | Description |
|----------|----------|-------------|
| `LOG_LEVEL` | No | Log level: debug, info, warn, error |
| `LOG_FORMAT` | No | Log format: json, pretty |
| `SENTRY_DSN` | Optional | Sentry error tracking DSN |
| `SENTRY_ENVIRONMENT` | Optional | Sentry environment name |
| `METRICS_PORT` | Optional | Prometheus metrics port |
| `METRICS_ENABLED` | Optional | Enable metrics collection |

---

## Environment File Examples

### Development (Local)

```bash
# .env.local
DEPLOYMENT_MODE=firebase
NODE_ENV=development

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

USE_FIREBASE_EMULATORS=true
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

### Staging (Self-Hosted)

```bash
# .env.staging
DEPLOYMENT_MODE=self-hosted
NODE_ENV=staging

DATABASE_URL=postgresql://cortex:...@staging-db:5432/cortex
KEYCLOAK_URL=https://auth-staging.example.com
MINIO_ENDPOINT=https://storage-staging.example.com
API_URL=https://api-staging.example.com

NEXT_PUBLIC_API_URL=https://api-staging.example.com
NEXT_PUBLIC_KEYCLOAK_URL=https://auth-staging.example.com
```

### Production (Kubernetes)

```bash
# .env.production
DEPLOYMENT_MODE=self-hosted
NODE_ENV=production

DATABASE_URL=postgresql://cortex:...@prod-db.internal:5432/cortex
KEYCLOAK_URL=http://keycloak.cortex.svc.cluster.local:8180
MINIO_ENDPOINT=http://minio.cortex.svc.cluster.local:9000
API_URL=http://api.cortex.svc.cluster.local:8080

NEXT_PUBLIC_API_URL=https://api.cortex-dc.com
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.cortex-dc.com
NEXT_PUBLIC_MINIO_ENDPOINT=https://storage.cortex-dc.com
```

---

## Validation & Troubleshooting

### Validate Configuration

```bash
# Check which adapters will be used
node -e "
const mode = process.env.DEPLOYMENT_MODE || 'firebase';
console.log('Deployment Mode:', mode);
console.log('Database:', mode === 'self-hosted' ? 'PostgreSQL' : 'Firestore');
console.log('Auth:', mode === 'self-hosted' ? 'Keycloak' : 'Firebase Auth');
console.log('Storage:', mode === 'self-hosted' ? 'MinIO' : 'Firebase Storage');
"
```

### Common Issues

**Issue: "Database adapter not found"**
- Ensure `DATABASE_URL` is set for self-hosted mode
- Check PostgreSQL connection string format

**Issue: "Auth adapter initialization failed"**
- Verify Keycloak URL is accessible
- Check client ID and secret are correct
- Ensure realm name matches

**Issue: "Storage adapter not initialized"**
- Verify MinIO endpoint is accessible
- Check access key and secret key
- Ensure bucket exists or auto-create is enabled

**Issue: "Mixed mode not working"**
- Explicit mode overrides (AUTH_MODE, STORAGE_MODE) take precedence
- Check for conflicting environment variables

---

## Best Practices

1. **Never commit `.env.local` or `.env` files** - Use `.env.example` templates
2. **Use secrets management in production** - Don't hardcode sensitive values
3. **Separate public and private variables** - Use `NEXT_PUBLIC_` prefix only when needed
4. **Validate required variables on startup** - Fail fast if configuration is invalid
5. **Use different configurations per environment** - Development, staging, production
6. **Document custom variables** - Add comments for non-standard configuration
7. **Rotate secrets regularly** - Especially API keys and passwords
8. **Use environment-specific files** - `.env.development`, `.env.production`, etc.

---

## Additional Resources

- [Firebase Configuration Documentation](https://firebase.google.com/docs/web/setup)
- [Keycloak Configuration Guide](https://www.keycloak.org/docs/latest/server_admin/)
- [MinIO Configuration Reference](https://min.io/docs/minio/linux/reference/minio-server/minio-server.html)
- [PostgreSQL Environment Variables](https://www.postgresql.org/docs/current/libpq-envars.html)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Last Updated:** October 13, 2025
**Migration Status:** Phase 2 Complete - All Services Migrated
**Supported Modes:** Firebase, Self-Hosted, Hybrid

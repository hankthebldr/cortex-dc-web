# Firebase to GCP Native Services Migration Strategy

## Executive Summary

This document outlines the strategy to migrate from Firebase-specific services to GCP-native services for production deployment on GKE, with centralized `.env` configuration management.

---

## Migration Overview

### Current Architecture (Firebase-Centric)
```
Firebase Hosting → Firebase Functions → Firestore + Firebase Auth + Firebase Storage
```

### Target Architecture (GCP-Native on GKE)
```
GKE Load Balancer → GKE Ingress → Next.js App + Node.js API → Cloud SQL/Firestore + Cloud Identity + Cloud Storage
```

---

## Service Migration Map

| Firebase Service | GCP Native Alternative | Migration Complexity |
|------------------|------------------------|---------------------|
| Firebase Hosting | GKE + Cloud Load Balancer | Medium |
| Firebase Functions | Cloud Run or GKE Deployment | Low |
| Firebase Authentication | Cloud Identity Platform | Medium |
| Firestore | Firestore (keep) or Cloud SQL | Low/High |
| Firebase Storage | Cloud Storage | Low |
| Firebase Extensions | Custom Cloud Functions | Medium |

---

## Phase 1: Environment Configuration

### Migration to `.env` from Firebase Config

#### Current Setup
```javascript
// Firebase config embedded in code
const firebaseConfig = {
  apiKey: "hardcoded-value",
  authDomain: "cortex-dc-portal.firebaseapp.com",
  // ...
};
```

#### Target Setup
```bash
# .env.production
# Authentication
AUTH_PROVIDER=gcp-identity
AUTH_DOMAIN=cortex-dc.henryreed.ai
AUTH_PROJECT_ID=cortex-dc-portal

# Database
DATABASE_TYPE=firestore  # or postgres
DATABASE_URL=projects/cortex-dc-portal/databases/(default)
DATABASE_CONNECTION_POOL_MAX=10

# Storage
STORAGE_PROVIDER=gcs
STORAGE_BUCKET=cortex-dc-storage
STORAGE_CDN_URL=https://storage.googleapis.com/cortex-dc-storage

# API Configuration
API_BASE_URL=https://api.cortex-dc.henryreed.ai
API_TIMEOUT=30000
API_RATE_LIMIT=100

# Services
GEMINI_API_KEY=
OPENAI_API_KEY=
BIGQUERY_PROJECT_ID=cortex-dc-portal
BIGQUERY_DATASET=cortex_analytics

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_AI_FEATURES=true
ENABLE_BIGQUERY_EXPORT=true

# Security
SESSION_SECRET=
JWT_SECRET=
CORS_ORIGINS=https://cortex-dc.henryreed.ai

# GCP Configuration
GCP_PROJECT_ID=cortex-dc-portal
GCP_REGION=us-central1
GCP_SERVICE_ACCOUNT_KEY=  # Base64 encoded
```

---

## Phase 2: Service-by-Service Migration

### 1. Authentication Migration

#### Option A: Keep Firestore Auth (Recommended for MVP)
```typescript
// packages/db/src/auth/auth-service.ts
import { getAuth } from 'firebase-admin/auth';

export class AuthService {
  private auth = getAuth();

  async verifyToken(token: string) {
    return this.auth.verifyIdToken(token);
  }
}
```

**Pros**: No code changes, fully compatible
**Cons**: Still dependent on Firebase

#### Option B: Cloud Identity Platform (Future)
```typescript
// packages/db/src/auth/identity-service.ts
import { IdentityToolkitClient } from '@google-cloud/identity-toolkit';

export class IdentityService {
  private client = new IdentityToolkitClient({
    projectId: process.env.GCP_PROJECT_ID
  });

  async verifyToken(token: string) {
    const response = await this.client.verifyToken({ idToken: token });
    return response;
  }
}
```

**Pros**: Full GCP integration, better scalability
**Cons**: Requires code refactoring

### 2. Database Migration

#### Option A: Keep Firestore (Recommended)
```typescript
// packages/db/src/firestore-service.ts
import { Firestore } from '@google-cloud/firestore';

export class FirestoreService {
  private db = new Firestore({
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY
  });

  async getDocument(collection: string, id: string) {
    return this.db.collection(collection).doc(id).get();
  }
}
```

**Configuration**:
```bash
# .env
DATABASE_TYPE=firestore
FIRESTORE_PROJECT_ID=cortex-dc-portal
FIRESTORE_DATABASE_ID=(default)
```

#### Option B: Cloud SQL (PostgreSQL)
```typescript
// packages/db/src/postgres-service.ts
import { Pool } from 'pg';

export class PostgresService {
  private pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    max: parseInt(process.env.DATABASE_CONNECTION_POOL_MAX || '10')
  });

  async query(sql: string, params: any[]) {
    return this.pool.query(sql, params);
  }
}
```

**Configuration**:
```bash
# .env
DATABASE_TYPE=postgres
DATABASE_HOST=/cloudsql/cortex-dc-portal:us-central1:cortex-db  # Unix socket for Cloud SQL Proxy
DATABASE_PORT=5432
DATABASE_NAME=cortex_dc
DATABASE_USER=cortex_app
DATABASE_PASSWORD=  # From Secret Manager
DATABASE_SSL=true
```

### 3. Storage Migration

#### Cloud Storage Implementation
```typescript
// packages/db/src/storage/storage-service.ts
import { Storage } from '@google-cloud/storage';

export class StorageService {
  private storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY
  });

  private bucket = this.storage.bucket(process.env.STORAGE_BUCKET!);

  async uploadFile(path: string, file: Buffer, metadata?: any) {
    const blob = this.bucket.file(path);
    await blob.save(file, { metadata });

    // Generate signed URL for access
    const [url] = await blob.getSignedUrl({
      action: 'read',
      expires: Date.now() + 3600 * 1000 // 1 hour
    });

    return url;
  }

  async downloadFile(path: string) {
    const blob = this.bucket.file(path);
    const [contents] = await blob.download();
    return contents;
  }
}
```

**Configuration**:
```bash
# .env
STORAGE_PROVIDER=gcs
STORAGE_BUCKET=cortex-dc-storage
STORAGE_CDN_URL=https://storage.googleapis.com/cortex-dc-storage
STORAGE_MAX_FILE_SIZE=52428800  # 50MB
```

---

## Phase 3: Backend Service Architecture

### Unified Backend API Service

Create a single backend service that consolidates all Firebase Functions:

```
packages/backend/
├── src/
│   ├── index.ts                    # Express server
│   ├── routes/
│   │   ├── auth.routes.ts          # Authentication endpoints
│   │   ├── data.routes.ts          # Data CRUD operations
│   │   ├── ai.routes.ts            # AI/Gemini endpoints
│   │   ├── export.routes.ts        # BigQuery export
│   │   └── health.routes.ts        # Health checks
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT validation
│   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   └── error.middleware.ts     # Error handling
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── database.service.ts
│   │   ├── storage.service.ts
│   │   ├── ai.service.ts
│   │   └── analytics.service.ts
│   └── config/
│       └── env.config.ts           # Environment configuration
├── Dockerfile
└── package.json
```

#### Implementation

```typescript
// packages/backend/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.config';
import authRoutes from './routes/auth.routes';
import dataRoutes from './routes/data.routes';
import aiRoutes from './routes/ai.routes';
import exportRoutes from './routes/export.routes';
import healthRoutes from './routes/health.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigins.split(','),
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(config.apiRateLimit) // limit each IP
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/data', authMiddleware, dataRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/export', authMiddleware, exportRoutes);

// Error handling
app.use(errorMiddleware);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Backend API listening on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`GCP Project: ${config.gcpProjectId}`);
});
```

```typescript
// packages/backend/src/config/env.config.ts
import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load .env file
dotenvConfig();

// Environment variable schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().default('8080'),

  // GCP
  GCP_PROJECT_ID: z.string(),
  GCP_REGION: z.string().default('us-central1'),
  GCP_SERVICE_ACCOUNT_KEY: z.string().optional(),

  // Database
  DATABASE_TYPE: z.enum(['firestore', 'postgres']).default('firestore'),
  DATABASE_URL: z.string().optional(),
  DATABASE_HOST: z.string().optional(),
  DATABASE_PORT: z.string().optional(),
  DATABASE_NAME: z.string().optional(),
  DATABASE_USER: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),

  // Storage
  STORAGE_PROVIDER: z.enum(['gcs', 'local']).default('gcs'),
  STORAGE_BUCKET: z.string(),

  // Authentication
  AUTH_PROVIDER: z.enum(['firebase', 'gcp-identity']).default('firebase'),
  AUTH_DOMAIN: z.string(),
  JWT_SECRET: z.string(),
  SESSION_SECRET: z.string(),

  // API
  API_BASE_URL: z.string().url(),
  API_TIMEOUT: z.string().default('30000'),
  API_RATE_LIMIT: z.string().default('100'),
  CORS_ORIGINS: z.string(),

  // AI Services
  GEMINI_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // BigQuery
  BIGQUERY_PROJECT_ID: z.string().optional(),
  BIGQUERY_DATASET: z.string().optional(),

  // Feature Flags
  ENABLE_ANALYTICS: z.string().default('true'),
  ENABLE_AI_FEATURES: z.string().default('true'),
  ENABLE_BIGQUERY_EXPORT: z.string().default('false'),
});

// Parse and validate environment variables
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const config = {
  // Server
  nodeEnv: parsed.data.NODE_ENV,
  port: parseInt(parsed.data.PORT),

  // GCP
  gcpProjectId: parsed.data.GCP_PROJECT_ID,
  gcpRegion: parsed.data.GCP_REGION,
  gcpServiceAccountKey: parsed.data.GCP_SERVICE_ACCOUNT_KEY,

  // Database
  databaseType: parsed.data.DATABASE_TYPE,
  databaseUrl: parsed.data.DATABASE_URL,
  databaseHost: parsed.data.DATABASE_HOST,
  databasePort: parsed.data.DATABASE_PORT ? parseInt(parsed.data.DATABASE_PORT) : undefined,
  databaseName: parsed.data.DATABASE_NAME,
  databaseUser: parsed.data.DATABASE_USER,
  databasePassword: parsed.data.DATABASE_PASSWORD,

  // Storage
  storageProvider: parsed.data.STORAGE_PROVIDER,
  storageBucket: parsed.data.STORAGE_BUCKET,

  // Authentication
  authProvider: parsed.data.AUTH_PROVIDER,
  authDomain: parsed.data.AUTH_DOMAIN,
  jwtSecret: parsed.data.JWT_SECRET,
  sessionSecret: parsed.data.SESSION_SECRET,

  // API
  apiBaseUrl: parsed.data.API_BASE_URL,
  apiTimeout: parseInt(parsed.data.API_TIMEOUT),
  apiRateLimit: parsed.data.API_RATE_LIMIT,
  corsOrigins: parsed.data.CORS_ORIGINS,

  // AI
  geminiApiKey: parsed.data.GEMINI_API_KEY,
  openaiApiKey: parsed.data.OPENAI_API_KEY,

  // BigQuery
  bigQueryProjectId: parsed.data.BIGQUERY_PROJECT_ID,
  bigQueryDataset: parsed.data.BIGQUERY_DATASET,

  // Feature Flags
  enableAnalytics: parsed.data.ENABLE_ANALYTICS === 'true',
  enableAiFeatures: parsed.data.ENABLE_AI_FEATURES === 'true',
  enableBigQueryExport: parsed.data.ENABLE_BIGQUERY_EXPORT === 'true',
};
```

---

## Phase 4: Frontend Configuration

### Next.js Environment Configuration

```typescript
// apps/web/src/lib/config.ts
import { z } from 'zod';

// Public environment variables (available in browser)
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_STORAGE_CDN_URL: z.string().url(),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('false'),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
});

// Server-side environment variables
const serverEnvSchema = z.object({
  // API Keys (never exposed to client)
  AUTH_PROJECT_ID: z.string(),
  SESSION_SECRET: z.string(),
  JWT_SECRET: z.string(),
});

// Parse public env vars
const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_AUTH_DOMAIN: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  NEXT_PUBLIC_STORAGE_CDN_URL: process.env.NEXT_PUBLIC_STORAGE_CDN_URL,
  NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
});

// Parse server env vars (only available server-side)
const serverEnv = typeof window === 'undefined'
  ? serverEnvSchema.parse({
      AUTH_PROJECT_ID: process.env.AUTH_PROJECT_ID,
      SESSION_SECRET: process.env.SESSION_SECRET,
      JWT_SECRET: process.env.JWT_SECRET,
    })
  : null;

export const config = {
  ...publicEnv,
  ...(serverEnv || {}),
};
```

---

## Phase 5: CI/CD Integration

### Updated GitHub Actions Workflow

```yaml
# .github/workflows/deploy-gke.yml
name: Deploy to GKE

on:
  push:
    branches: [main, develop]
  workflow_dispatch:

env:
  GCP_PROJECT_ID: cortex-dc-portal
  GKE_CLUSTER: cortex-dc-cluster
  GKE_ZONE: us-central1-a

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create .env.production
        run: |
          cat << EOF > .env.production
          # Generated by CI/CD
          NODE_ENV=production

          # GCP
          GCP_PROJECT_ID=${{ secrets.GCP_PROJECT_ID }}
          GCP_REGION=${{ secrets.GCP_REGION }}

          # Database
          DATABASE_TYPE=${{ secrets.DATABASE_TYPE }}
          DATABASE_URL=${{ secrets.DATABASE_URL }}

          # Storage
          STORAGE_PROVIDER=gcs
          STORAGE_BUCKET=${{ secrets.STORAGE_BUCKET }}

          # Authentication
          AUTH_PROVIDER=${{ secrets.AUTH_PROVIDER }}
          AUTH_DOMAIN=${{ secrets.AUTH_DOMAIN }}
          JWT_SECRET=${{ secrets.JWT_SECRET }}
          SESSION_SECRET=${{ secrets.SESSION_SECRET }}

          # API
          API_BASE_URL=${{ secrets.API_BASE_URL }}
          CORS_ORIGINS=${{ secrets.CORS_ORIGINS }}

          # AI Services
          GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
          OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }}

          # BigQuery
          BIGQUERY_PROJECT_ID=${{ secrets.BIGQUERY_PROJECT_ID }}
          BIGQUERY_DATASET=${{ secrets.BIGQUERY_DATASET }}

          # Feature Flags
          ENABLE_ANALYTICS=true
          ENABLE_AI_FEATURES=true
          ENABLE_BIGQUERY_EXPORT=true
          EOF

      - name: Create Kubernetes ConfigMap from .env
        run: |
          kubectl create configmap cortex-env-config \
            --from-env-file=.env.production \
            --namespace=cortex-dc \
            --dry-run=client \
            -o yaml | kubectl apply -f -

      - name: Build Docker image with .env
        run: |
          docker build \
            --build-arg ENV_FILE=.env.production \
            -f Dockerfile.backend \
            -t gcr.io/$GCP_PROJECT_ID/cortex-backend:${{ github.sha }} \
            .

      - name: Deploy with Helm
        run: |
          helm upgrade --install cortex-dc ./helm/cortex-dc \
            --namespace cortex-dc \
            --set backend.image.tag=${{ github.sha }} \
            --set backend.envFrom[0].configMapRef.name=cortex-env-config
```

### Kubernetes ConfigMap Integration

```yaml
# helm/cortex-dc/templates/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cortex-backend
spec:
  template:
    spec:
      containers:
      - name: backend
        image: {{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}
        envFrom:
        # Load all environment variables from ConfigMap
        - configMapRef:
            name: cortex-env-config
        # Override with secrets
        - secretRef:
            name: cortex-secrets
        ports:
        - containerPort: 8080
```

---

## Phase 6: Secret Management

### Google Secret Manager Integration

```typescript
// packages/backend/src/config/secrets.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

class SecretManager {
  private client = new SecretManagerServiceClient();

  async getSecret(name: string): Promise<string> {
    const [version] = await this.client.accessSecretVersion({
      name: `projects/${process.env.GCP_PROJECT_ID}/secrets/${name}/versions/latest`
    });

    return version.payload?.data?.toString() || '';
  }

  async loadSecrets() {
    const secrets = await Promise.all([
      this.getSecret('jwt-secret'),
      this.getSecret('session-secret'),
      this.getSecret('database-password'),
      this.getSecret('gemini-api-key'),
    ]);

    return {
      jwtSecret: secrets[0],
      sessionSecret: secrets[1],
      databasePassword: secrets[2],
      geminiApiKey: secrets[3],
    };
  }
}

export const secretManager = new SecretManager();
```

### Create Secrets in GCP

```bash
# Create secrets
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your-session-secret" | gcloud secrets create session-secret --data-file=-
echo -n "your-db-password" | gcloud secrets create database-password --data-file=-
echo -n "your-gemini-key" | gcloud secrets create gemini-api-key --data-file=-

# Grant access to service account
gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:cortex-dc-sa@cortex-dc-portal.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Phase 7: Migration Execution Plan

### Week 1: Preparation
- [ ] Create `.env.example` with all required variables
- [ ] Document all Firebase dependencies
- [ ] Create GCP service accounts
- [ ] Set up Google Secret Manager

### Week 2: Backend Migration
- [ ] Create unified backend service
- [ ] Migrate Firebase Functions to Express routes
- [ ] Implement database abstraction layer
- [ ] Test backend service locally

### Week 3: Frontend Migration
- [ ] Update API client to use new backend
- [ ] Remove Firebase SDK dependencies
- [ ] Implement environment configuration
- [ ] Test frontend locally

### Week 4: Deployment
- [ ] Deploy backend to GKE
- [ ] Deploy frontend to GKE
- [ ] Configure load balancer
- [ ] Run integration tests

### Week 5: Validation
- [ ] Performance testing
- [ ] Security audit
- [ ] Load testing
- [ ] User acceptance testing

---

## Rollback Plan

### Emergency Rollback to Firebase

1. **DNS Rollback**: Point domain back to Firebase Hosting
2. **Code Rollback**: Deploy previous Firebase Functions
3. **Database**: Firestore data remains unchanged
4. **Estimated Time**: 5 minutes

---

## Cost Comparison

| Service | Firebase Cost | GKE Cost | Savings |
|---------|---------------|----------|---------|
| Hosting | $0 (free tier) | $50/month (GKE) | -$50 |
| Functions | $200/month | $100/month (included in GKE) | +$100 |
| Database | $150/month | $150/month | $0 |
| Total | $350/month | $300/month | **+$50/month** |

**Additional Benefits**:
- Better control and customization
- Improved performance
- Easier scaling
- Better monitoring

---

## Success Metrics

- **Uptime**: 99.9% availability
- **Response Time**: <200ms P95
- **Error Rate**: <0.1%
- **Cost**: Within 10% of current spend
- **Migration Time**: <30 days

---

**Next Steps**: Review this document and approve migration strategy before implementation.

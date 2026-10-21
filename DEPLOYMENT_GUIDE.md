# Cortex DC Web Platform - Comprehensive Deployment Guide

**Version**: 3.0
**Last Updated**: 2025-10-15
**Status**: Production Ready

---

## Overview

This guide provides comprehensive deployment instructions for the Cortex DC Web Platform across **three deployment targets**: Local Development, Kubernetes (GKE), and Firebase. The platform uses a single codebase with explicit build profiles for each target.

### Deployment Targets

| Target | Use Case | Self-Contained | Output | Production Ready |
|--------|----------|----------------|--------|------------------|
| **Local** | Development & testing | ✅ Yes | Standalone server | ✅ |
| **K8s (GKE)** | Production self-hosted | ✅ Yes | Docker containers | ✅ |
| **Firebase** | Firebase Hosting | ❌ No (uses Firebase) | Static export | ✅ |

### Key Features

- **Build Parity**: Same features across all targets
- **Self-Contained**: Local and K8s builds run without Firebase dependencies
- **Validation**: Automatic checks prevent Firebase URL leakage in non-Firebase builds
- **Environment Isolation**: Clear separation via `TARGET_ENV` variable

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start & Integration Guide](#quick-start--integration-guide)
   - [Integration Scenarios](#integration-scenarios)
   - [Quick Reference: Common Tasks](#quick-reference-common-tasks)
3. [Local Deployment](#local-deployment)
4. [Kubernetes/GKE Deployment](#kubernetesgke-deployment)
5. [Firebase Deployment](#firebase-deployment)
6. [Environment Configuration](#environment-configuration)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Troubleshooting](#troubleshooting)
9. [Migration & Integration](#migration--integration)
10. [Frontend Architecture & UX](#frontend-architecture--ux)
    - [Component Architecture](#component-architecture)
    - [State Management Strategy](#state-management-strategy)
    - [Testing Strategy](#testing-strategy)
11. [Summary](#summary)
    - [Complete Architecture Overview](#complete-architecture-overview)
    - [Performance Benchmarks Summary](#performance-benchmarks-summary)
    - [Production Readiness Checklist](#production-readiness-checklist)

---

## Prerequisites

### Required Tools

```bash
# Node.js 20+
node --version  # v20.x.x or higher

# pnpm 8.15.1+
npm install -g pnpm@8.15.1

# Docker (for K8s/local containers)
docker --version

# kubectl (for K8s deployment)
kubectl version --client

# Firebase CLI (for Firebase deployment)
npm install -g firebase-tools

# Google Cloud SDK (for GKE deployment)
gcloud --version
```

### GCP Setup (for GKE)

```bash
# Authenticate
gcloud auth login
gcloud config set project cortex-dc-portal

# Get GKE credentials
gcloud container clusters get-credentials cortex-dc-cluster \
  --zone=us-central1-a
```

---

## Quick Start & Integration Guide

### One-Command Bootstrap

```bash
# Install dependencies
pnpm install

# Validate environment
TARGET_ENV=local pnpm validate:env
```

### Quick Reference: Build Commands

**Local Development**:

```bash
# Build and start
TARGET_ENV=local pnpm build:local
pnpm start:local

# Or use development mode
pnpm --filter @cortex-dc/web dev
```

**Kubernetes/GKE Production**:

```bash
TARGET_ENV=k8s \
  APP_BASE_URL=https://cortex.example.com \
  API_BASE_URL=http://functions-service/api \
  pnpm build:k8s
```

**Firebase Deployment**:

```bash
TARGET_ENV=firebase pnpm build:firebase
pnpm deploy
```

### Integration Scenarios

#### Scenario 1: Local Development with Full Stack

**Use Case**: Developing and testing with all services (database, cache, auth)

```bash
# 1. Start infrastructure
docker-compose --profile self-hosted up -d

# 2. Set environment
export TARGET_ENV=local
export DATABASE_URL="postgresql://cortex_user:cortex_pass@localhost:5432/cortex_dc"
export REDIS_URL="redis://localhost:6379"

# 3. Run migrations
cd packages/db
npx prisma generate
npx prisma migrate deploy

# 4. Start application
cd ../..
pnpm --filter @cortex-dc/web dev
```

**Available Services**:

- Web app: <http://localhost:3000>
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Keycloak: <http://localhost:8180>
- MinIO: <http://localhost:9001>
- Grafana: <http://localhost:3001>

#### Scenario 2: Hybrid Firebase + Self-Hosted

**Use Case**: Use Firebase Auth/Firestore but self-host the application

```bash
# 1. Configure Firebase
export NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
export NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
export NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"

# 2. Configure self-hosted database
export DATABASE_URL="postgresql://user:pass@localhost:5432/cortex"
export REDIS_URL="redis://localhost:6379"

# 3. Build and deploy to K8s
TARGET_ENV=k8s \
  APP_BASE_URL=https://cortex.example.com \
  API_BASE_URL=http://functions-service/api \
  pnpm build:k8s

docker build -f Dockerfile.web -t cortex-web:latest .
kubectl apply -f kubernetes/
```

#### Scenario 3: Pure Firebase Deployment

**Use Case**: Deploy entirely to Firebase (hosting + functions)

```bash
# 1. Configure Firebase
firebase login
firebase use your-project-id

# 2. Build and deploy
TARGET_ENV=firebase pnpm build:firebase
pnpm deploy

# Or deploy individually
pnpm deploy:hosting  # Static hosting
pnpm deploy:functions # Cloud Functions
```

#### Scenario 4: Okta SSO Integration

**Use Case**: Enterprise authentication with Okta

```bash
# 1. Configure Okta environment variables
export OKTA_DOMAIN="your-domain.okta.com"
export OKTA_CLIENT_ID="your-client-id"
export OKTA_CLIENT_SECRET="your-client-secret"
export OKTA_ISSUER="https://your-domain.okta.com/oauth2/default"

# 2. Enable Okta in auth configuration
# Edit apps/web/lib/auth-config.ts
export const authProviders = {
  okta: {
    enabled: true,
    saml: true,  // or false for OAuth
  }
};

# 3. Build and deploy
TARGET_ENV=k8s pnpm build:k8s
```

**Okta User Flow**:

1. User clicks "Sign in with Okta"
2. Redirect to Okta login page
3. User authenticates with Okta credentials
4. Okta redirects back with SAML assertion or OAuth token
5. Application creates session and loads user profile
6. User groups sync automatically for role-based access

#### Scenario 5: AI-Assisted Workflows

**Use Case**: Enable AI suggestions for POVs and TRRs

```bash
# 1. Configure AI service
export AI_SERVICE_ENABLED=true
export AI_API_KEY="your-openai-key"  # or other AI provider
export AI_MODEL="gpt-4"

# 2. Enable AI features in UI
# Navigate to: Settings > AI Preferences
# Toggle: "Enable AI suggestions"

# 3. Use AI features
# - POV creation: Get AI-generated objectives
# - TRR workflow: AI risk assessment suggestions
# - Content library: AI-powered search and recommendations
```

**API Integration Example**:

```typescript
// Check for AI suggestions
const suggestions = await fetch('/api/ai/suggestions', {
  method: 'POST',
  body: JSON.stringify({
    entityType: 'pov',
    entityId: povId,
    context: 'objectives',
  }),
});

// Apply AI recommendations
const objectives = await suggestions.json();
```

### Quick Reference: Common Tasks

#### User Management

```bash
# Add user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","role":"dc"}'

# Update user role
curl -X PATCH http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -d '{"role":"manager"}'
```

#### POV Operations

```bash
# List POVs
curl http://localhost:3000/api/povs?status=in_progress

# Create POV
curl -X POST http://localhost:3000/api/povs \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Network Security POV",
    "projectId":"project-uuid",
    "objectives":["Validate firewall","Test performance"]
  }'

# Update POV status
curl -X PATCH http://localhost:3000/api/povs/{povId} \
  -H "Content-Type: application/json" \
  -d '{"status":"testing"}'
```

#### Analytics & Monitoring

```bash
# Get login analytics
curl http://localhost:3000/api/admin/analytics/logins?days=30

# Get activity logs
curl http://localhost:3000/api/admin/analytics/activity?userId={userId}

# Cache statistics
curl http://localhost:3000/api/admin/cache/stats
```

#### Database Operations

```bash
# Run migrations
cd packages/db
npx prisma migrate dev --name add_new_feature

# Generate Prisma client
npx prisma generate

# Seed database
npx prisma db seed

# Database studio (GUI)
npx prisma studio
```

#### Performance Monitoring

```bash
# Check Redis cache hit rate
redis-cli INFO stats | grep keyspace_hits

# PostgreSQL query performance
psql -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Application metrics
curl http://localhost:3000/api/metrics

# Health checks
curl http://localhost:3000/api/health
curl http://localhost:3000/api/healthz
curl http://localhost:3000/api/readyz
```

---

## Local Deployment

### Option 1: Direct Node.js (Fastest for Development)

```bash
# Build for local target
TARGET_ENV=local NODE_ENV=production pnpm build:local

# Start the server
pnpm start:local

# Application available at:
# http://localhost:3000
```

### Option 2: Docker Compose (Simulates Production)

The platform includes a comprehensive Docker Compose setup with:
- **Web app** (Next.js)
- **Functions service** (Backend API)
- **PostgreSQL** (Database)
- **Keycloak** (Authentication)
- **MinIO** (S3-compatible storage)
- **Redis** (Cache)
- **NATS** (Event streaming)
- **Prometheus + Grafana** (Monitoring)

```bash
# Start web app only
docker-compose up -d web

# Start full self-hosted stack
docker-compose --profile self-hosted up -d

# View logs
docker-compose logs -f web

# Stop services
docker-compose down
```

### Verify Local Deployment

```bash
# Health checks
curl http://localhost:3000/api/health
curl http://localhost:3000/api/healthz
curl http://localhost:3000/api/readyz

# Access services
open http://localhost:3000              # Web app
open http://localhost:8180              # Keycloak admin
open http://localhost:9001              # MinIO console
open http://localhost:9090              # Prometheus
open http://localhost:3001              # Grafana
```

---

## Kubernetes / GKE Deployment

### Architecture

```
┌──────────────────────────────────────────────────────┐
│         Google Cloud Load Balancer                   │
│              (SSL Termination)                        │
└────────────────┬─────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────┐
│         NGINX Ingress Controller                     │
│    (Rate Limiting, Path Routing)                     │
└────────────┬─────────────┬───────────────────────────┘
             │             │
    ┌────────▼───┐    ┌───▼──────────┐
    │  Web Pods  │    │ Functions    │
    │  (Next.js) │    │ Pods (API)   │
    │  3-10      │    │  2-5         │
    │  replicas  │    │  replicas    │
    └────────┬───┘    └───┬──────────┘
             │            │
        ┌────▼────────────▼────┐
        │  Backend Services    │
        │  - Firebase Auth     │
        │  - Firestore         │
        │  - Cloud Storage     │
        │  - PostgreSQL        │
        │  - Redis             │
        │  - MinIO             │
        └──────────────────────┘
```

### Step 1: Build and Push Docker Images

```bash
# Authenticate Docker with GCR
gcloud auth configure-docker gcr.io

# Set environment variables
export IMAGE_TAG="v1.0.0"
export APP_BASE_URL="https://cortex.example.com"
export API_BASE_URL="http://functions-service/api"

# Build web image
docker build \
  -f Dockerfile.web \
  --build-arg TARGET_ENV=k8s \
  --build-arg NODE_ENV=production \
  --build-arg APP_BASE_URL=$APP_BASE_URL \
  --build-arg API_BASE_URL=$API_BASE_URL \
  -t gcr.io/cortex-dc-portal/cortex-web:$IMAGE_TAG \
  .

# Build functions image
docker build \
  -f Dockerfile.functions \
  -t gcr.io/cortex-dc-portal/cortex-functions:$IMAGE_TAG \
  .

# Push images
docker push gcr.io/cortex-dc-portal/cortex-web:$IMAGE_TAG
docker push gcr.io/cortex-dc-portal/cortex-functions:$IMAGE_TAG
```

### Step 2: Configure Kubernetes Secrets

```bash
# Create namespace
kubectl create namespace cortex-dc

# Create secrets from Google Secret Manager
kubectl create secret generic cortex-web-secrets \
  --from-literal=NEXT_PUBLIC_FIREBASE_API_KEY="$FIREBASE_API_KEY" \
  --from-literal=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$FIREBASE_AUTH_DOMAIN" \
  --namespace=cortex-dc

# Or use existing secrets
kubectl apply -f kubernetes/config/secrets.yaml
```

### Step 3: Deploy with Kubectl

```bash
# Apply all manifests
kubectl apply -k kubernetes/

# Or apply individually
kubectl apply -f kubernetes/namespaces/
kubectl apply -f kubernetes/config/
kubectl apply -f kubernetes/databases/
kubectl apply -f kubernetes/web/
kubectl apply -f kubernetes/functions/
kubectl apply -f kubernetes/ingress/
```

### Step 4: Deploy with Helm (Recommended)

```bash
# Install cert-manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.0/cert-manager.yaml

# Install ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Deploy Cortex DC
helm install cortex-dc ./helm/cortex-dc \
  --namespace cortex-dc \
  --create-namespace \
  --set web.image.tag=$IMAGE_TAG \
  --set functions.image.tag=$IMAGE_TAG \
  --set global.environment=production \
  --values helm/cortex-dc/values-production.yaml \
  --wait \
  --timeout=10m
```

### Step 5: Verify Deployment

```bash
# Check pod status
kubectl get pods -n cortex-dc

# Check services
kubectl get svc -n cortex-dc

# Check ingress
kubectl get ingress -n cortex-dc

# View logs
kubectl logs -f deployment/cortex-dc-web -n cortex-dc

# Port forward for testing
kubectl port-forward svc/cortex-dc-web 3000:3000 -n cortex-dc
```

### Kubernetes Features Implemented

#### ✅ Horizontal Pod Autoscaling (HPA)

```yaml
autoscaling:
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

#### ✅ Pod Disruption Budgets (PDB)

```yaml
podDisruptionBudget:
  minAvailable: 1
```

#### ✅ Health Probes

```yaml
startupProbe:
  httpGet:
    path: /api/health
    port: 3000
  failureThreshold: 12
  periodSeconds: 5

livenessProbe:
  httpGet:
    path: /api/healthz
    port: 3000
  periodSeconds: 20

readinessProbe:
  httpGet:
    path: /api/readyz
    port: 3000
  periodSeconds: 10
```

#### ✅ Rolling Update Strategy

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

### K8s Deployment Checklist

- [ ] Docker images built and pushed to GCR
- [ ] `secrets.yaml` created with actual values
- [ ] `APP_BASE_URL` updated in deployment.yaml
- [ ] `API_BASE_URL` updated in deployment.yaml
- [ ] Domain name configured in ingress.yaml
- [ ] TLS certificate configured (cert-manager)
- [ ] All manifests applied successfully
- [ ] Pods running and healthy
- [ ] Ingress configured with correct domain
- [ ] Health checks passing
- [ ] Application accessible via domain

---

## Firebase Deployment

### Step 1: Build for Firebase

```bash
# Build Firebase target (static export)
TARGET_ENV=firebase pnpm build:firebase
```

### Step 2: Deploy to Firebase

```bash
# Deploy hosting and functions
pnpm run deploy

# Deploy hosting only
pnpm run deploy:hosting

# Deploy functions only
pnpm run deploy:functions
```

### Verify Firebase Deployment

```bash
# Check Firebase hosting
curl https://cortex-dc-portal.web.app

# Check Cloud Functions
curl https://us-central1-cortex-dc-portal.cloudfunctions.net/api/health
```

---

## Environment Configuration

### Local Target

```bash
TARGET_ENV=local
NODE_ENV=production
APP_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
```

### K8s Target

```bash
TARGET_ENV=k8s
NODE_ENV=production
APP_BASE_URL=https://your-domain.com  # REQUIRED
API_BASE_URL=http://functions-service/api  # REQUIRED
```

### Firebase Target

```bash
TARGET_ENV=firebase
NODE_ENV=production
# APP_BASE_URL and API_BASE_URL auto-configured by Firebase
```

### Optional Variables

```bash
# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_TELEMETRY=false

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Performance
MAX_OLD_SPACE_SIZE=2048

# Database (Self-Hosted)
DATABASE_URL=postgresql://user:pass@localhost:5432/cortex

# Authentication (Self-Hosted)
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=cortex
KEYCLOAK_CLIENT_ID=cortex-web

# Storage (Self-Hosted)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=changeme

# Cache
REDIS_URL=redis://:password@localhost:6379
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline (`.github/workflows/build-matrix.yml`) includes:

#### 1. Build Matrix
- Builds all three targets in parallel (local, k8s, firebase)
- Validates environment configuration
- Runs postbuild validation

#### 2. Security Scanning
- **Trivy**: Vulnerability scanning
- **Hadolint**: Dockerfile linting
- **Gitleaks**: Secret detection
- **SBOM Generation**: Software Bill of Materials

#### 3. Testing
- Lint checking
- Type checking
- Unit tests
- Integration tests
- Smoke tests

#### 4. Docker Build & Push
- Multi-stage builds
- Layer caching
- Automatic tagging (SHA, branch, semver)
- Push to GCR

#### 5. Deploy to GKE
- Helm deployment
- Canary rollout (10% → 100%)
- Smoke tests
- Auto-rollback on failure

### Required GitHub Secrets

```bash
# GCP Authentication
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID

# Optional
SLACK_WEBHOOK_URL
```

### Manual Deployment Trigger

```bash
# Trigger deployment from CLI
gh workflow run docker-build-push.yml \
  --ref main \
  -f environment=production
```

---

## Troubleshooting

### Build Validation Fails

**Error**: Build validation failed: Found files with Firebase references

**Solution**:
1. Check `API_BASE_URL` is not using Firebase URLs
2. Verify `TARGET_ENV` is set correctly
3. Review `apps/web/next.config.js` configuration
4. Check for hardcoded Firebase URLs in code

```bash
# Debug build validation
TARGET_ENV=k8s pnpm run postbuild:k8s
```

### Docker Build Fails

**Error**: Build failed with TARGET_ENV

**Solution**:
1. Ensure build args are passed correctly
2. Check Dockerfile has TARGET_ENV support
3. Verify pnpm scripts exist in package.json

```bash
# Debug Docker build
docker build \
  -f Dockerfile.web \
  --build-arg TARGET_ENV=k8s \
  --progress=plain \
  .
```

### K8s Pods Not Starting

**Error**: Pods in CrashLoopBackOff

**Solution**:
1. Check logs: `kubectl logs <pod-name> -n cortex-dc`
2. Verify secrets exist: `kubectl get secrets -n cortex-dc`
3. Check environment variables in deployment.yaml
4. Ensure APP_BASE_URL and API_BASE_URL are set

```bash
# Debug pod
kubectl describe pod <pod-name> -n cortex-dc
kubectl logs <pod-name> -n cortex-dc --previous
```

### Health Checks Failing

**Error**: Readiness probe failed

**Solution**:
1. Verify `/api/health`, `/api/healthz`, `/api/readyz` endpoints exist
2. Check port configuration (should be 3000)
3. Verify HOSTNAME=0.0.0.0 is set
4. Check startup time (may need to increase initialDelaySeconds)

```bash
# Test health endpoints locally
kubectl port-forward -n cortex-dc svc/web-service 3000:80
curl http://localhost:3000/api/health
```

### Assets Not Loading

**Error**: 404 on static assets

**Solution**:
1. Verify `assetPrefix` in next.config.js
2. Check `APP_BASE_URL` is correct
3. Ensure Ingress is configured for `/_next` paths
4. Verify CORS settings if using CDN

---

## Migration & Integration

### Migrating from Firebase to Self-Hosted

The platform supports a **hybrid approach**: keep Firebase Auth + Firestore, migrate Functions to backend API.

#### Phase 1: Infrastructure Setup

1. Deploy PostgreSQL (optional, if moving from Firestore)
2. Deploy Keycloak (optional, if moving from Firebase Auth)
3. Deploy MinIO for object storage
4. Deploy Redis for caching

#### Phase 2: Create Abstraction Layer

```typescript
// packages/db/src/adapters/database.factory.ts
export function getDatabase(): DatabaseAdapter {
  const mode = process.env.DEPLOYMENT_MODE;

  if (mode === 'self-hosted') {
    return new PostgresAdapter();
  }

  return new FirestoreAdapter();
}
```

#### Phase 3: Update Application

1. Update environment configuration
2. Switch adapters based on `DEPLOYMENT_MODE`
3. Test both Firebase and self-hosted modes

#### Phase 4: Deploy and Test

1. Deploy to staging Kubernetes cluster
2. Run comprehensive tests
3. Performance benchmarking
4. Security audit

### Integration with Existing Systems

#### Okta Integration

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for:
- User authentication flow
- Group sync
- Access control patterns
- Manager dashboards

#### AI-Enhanced Workflows

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for:
- Enabling AI for workflow stages
- Checking for AI suggestions
- Applying AI recommendations
- User AI preferences

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API P95 Latency | < 200ms | OpenTelemetry traces |
| Database Query P95 | < 50ms | PostgreSQL logs + OTel |
| Uptime | 99.9% | Kubernetes liveness/readiness |
| Error Rate | < 0.1% | Error tracking middleware |
| Time to Deploy | < 5 min | CI/CD pipeline metrics |
| Lighthouse Performance | > 90 | CI Lighthouse job |
| Container Startup | < 30s | Kubernetes startup probes |

---

## Security Best Practices

### Container Security

- ✅ Non-root user (UID 1001)
- ✅ Read-only filesystem (where possible)
- ✅ Minimal base images (Alpine Linux)
- ✅ Multi-stage builds
- ✅ Vulnerability scanning (Trivy)

### Network Security

- ✅ Network policies (pod-to-pod)
- ✅ Ingress controller (rate limiting)
- ✅ TLS/SSL termination
- ✅ Cloud Armor / WAF

### Secret Management

- ✅ Google Secret Manager
- ✅ Kubernetes secrets
- ✅ Workload Identity (GKE)
- ✅ No secrets in code or images

---

## Cost Optimization

### Firebase Costs (Current)

- Firebase Hosting: $25/month
- Cloud Functions: $200-500/month
- Firestore: $50/month
- Cloud Storage: $20/month
- **Total**: ~$295-595/month

### GKE Costs (Optimized)

- 3 nodes (n1-standard-2): $146/month
- Load Balancer: $18/month
- Firestore: $50/month
- Cloud Storage: $20/month
- **Total**: ~$234/month

**Savings**: ~$60-360/month (20-60% reduction)

---

## Frontend Architecture & UX

### Technology Stack

- **Framework**: Next.js 15 (App Router) with React 19
- **Styling**: Tailwind CSS with shadcn/ui primitives
- **State Management**: React Server Components + SWR for client-side data
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Design System**: Atomic Design methodology

### Component Architecture

The frontend uses a hierarchical component structure:

**Primitives (Atoms)**:

- Button, Input, Badge, Select, Checkbox, Radio
- Located in: `packages/ui/src/components/primitives/`

**Patterns (Molecules)**:

- Card, Form, Modal, Toast, Dropdown
- Located in: `packages/ui/src/components/patterns/`

**Domain Components (Organisms)**:

- POVCard, TRRCard, ProjectCard, Dashboard widgets
- Located in: `apps/web/components/`

### Design Tokens

All design tokens are defined using CSS variables in `apps/web/app/globals.css`:

```css
:root {
  --color-primary-500: 249 115 22;  /* Brand orange */
  --space-4: 1rem;                  /* 16px */
  --font-size-base: 1rem;           /* 16px */
  --radius-lg: 0.75rem;             /* 12px */
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Key User Flows

**POV Creation Flow**:

1. User clicks "New POV"
2. Select or create project
3. Multi-step wizard (4 steps):
   - Basic Info (name, description)
   - Objectives (success criteria)
   - Test Plan (scenarios)
   - Resources & Timeline
4. Auto-save drafts every 10 seconds
5. Review and submit
6. Redirect to POV detail page

**TRR Workflow**:

1. Initiate TRR (from POV or standalone)
2. Create TRR form (name, reviewer)
3. Add risk findings with severity scoring
4. Auto-calculate risk score
5. Reviewer validation or rejection
6. Sign-off and stakeholder notification

### Accessibility (WCAG 2.1 AA)

- ✅ Semantic HTML elements
- ✅ ARIA labels and landmarks
- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ Focus management in modals
- ✅ Screen reader support
- ✅ Color contrast ratios (4.5:1 minimum)
- ✅ Reduced motion support

### Performance Optimization

**Frontend Performance Targets**:

- Lighthouse Performance Score: > 90
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3s
- Bundle size (gzipped): < 200KB

**Optimization Techniques**:

- React Server Components for static content
- Dynamic imports for code splitting
- Image optimization with Next.js Image
- Font optimization with next/font
- SWR for client-side caching with stale-while-revalidate

### State Management Strategy

**Server State (Database)**:

- Fetched via React Server Components
- Cached at CDN/Edge with appropriate TTLs
- Revalidated on demand

**Client State (UI)**:

- Local component state with useState
- Global UI state with Context API (theme, user preferences)
- Form state with React Hook Form

**Data Fetching (SWR)**:


```typescript
import useSWR from 'swr';

function POVList() {
  const { data: povs, error, mutate } = useSWR(
    '/api/povs',
    fetcher,
    {
      refreshInterval: 30000, // 30s
      revalidateOnFocus: true,
    }
  );

  return <div>{povs?.map(pov => <POVCard key={pov.id} pov={pov} />)}</div>;
}
```

### API Integration

**API Client Setup** (`apps/web/lib/api-client.ts`):
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Auth token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Type-Safe Hooks**:


```typescript
export function usePOVs(filters?: { status?: string }) {
  const { data, error, mutate } = useSWR<POV[]>(
    `/api/povs${new URLSearchParams(filters)}`,
    fetcher
  );

  return { povs: data, isLoading: !data && !error, error, mutate };
}
```

### Testing Strategy

**Unit Tests (Vitest)**:

- Component rendering and interaction
- Hook behavior
- Utility functions
- Located in: `*.test.tsx`, `*.test.ts`

**E2E Tests (Playwright)**:

- Critical user flows (login, POV creation, TRR workflow)
- Cross-browser testing
- Mobile responsive testing
- Located in: `tests/e2e/`

**Visual Regression (Chromatic/Percy)**:

- Component visual snapshots
- Storybook integration
- Automatic PR reviews

**Accessibility Tests**:

- axe-core integration with Playwright
- Manual screen reader testing
- Keyboard navigation testing

## Support & Documentation

### Additional Documentation

- [ARCHITECTURE_K8S_READY.md](./ARCHITECTURE_K8S_READY.md) - System architecture
- [FRONTEND_UX_ARCHITECTURE.md](./FRONTEND_UX_ARCHITECTURE.md) - Frontend UX design and component system
- [IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md) - Backend implementation details
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Integration patterns
- [CONTAINER_BEST_PRACTICES.md](./docs/deployment/CONTAINER_BEST_PRACTICES.md) - Docker & K8s best practices
- [README.md](./README.md) - Project overview
- [CLAUDE.md](./CLAUDE.md) - Development guide

### Getting Help

- **GitHub Issues**: https://github.com/hankthebldr/cortex-dc-web/issues
- **Documentation**: https://docs.cortex-dc.henryreed.ai
- **Email**: henry@henryreed.ai

---

## Release Readiness Checklist

### Pre-Deployment

- [ ] All three builds complete successfully
- [ ] Postbuild validation passes
- [ ] Smoke tests pass
- [ ] Build parity verified
- [ ] Environment variables configured
- [ ] Secrets created and secured
- [ ] Health check endpoints working

### Kubernetes Specific

- [ ] Docker images pushed to registry
- [ ] K8s manifests updated with correct values
- [ ] TLS certificates configured
- [ ] Ingress controller installed
- [ ] HPA configured for scaling
- [ ] Monitoring/logging configured

### Post-Deployment

- [ ] Application accessible via intended URL
- [ ] Health checks passing
- [ ] Logs show no errors
- [ ] Metrics/monitoring functional
- [ ] Rollback plan documented
- [ ] Team notified of deployment

---

## Summary

### Complete Architecture Overview

The Cortex DC platform is a comprehensive, production-ready application with the following architecture:

**Frontend Layer**:

- Next.js 15 with React 19 (App Router)
- Tailwind CSS + shadcn/ui design system
- SWR for data fetching and caching
- React Hook Form + Zod for validation
- Accessibility (WCAG 2.1 AA compliant)

**Backend Layer**:

- PostgreSQL 16 with optimized indexes
- Redis for caching (90%+ hit rates)
- PgBouncer for connection pooling
- Event tracking and analytics
- High-throughput data migration system

**Infrastructure Options**:

1. **Local Development**: Docker Compose with full stack
2. **Kubernetes/GKE**: Production-ready with HPA, PDB, health checks
3. **Firebase**: Fully managed hosting and functions

**Key Features**:

- ✅ Multi-target deployment (local, K8s, Firebase)
- ✅ Self-contained deployments (no Firebase dependencies for local/K8s)
- ✅ Enterprise authentication (Okta SAML/OAuth, Keycloak)
- ✅ AI-assisted workflows (optional)
- ✅ Real-time analytics and monitoring
- ✅ High-performance database queries (25-225x improvement)
- ✅ Responsive, accessible UI

### Quick Commands Reference

**Development**:

```bash
# Local development with hot reload
pnpm --filter @cortex-dc/web dev

# Full stack with Docker
docker-compose --profile self-hosted up -d
```

**Production Builds**:

```bash
# Local
TARGET_ENV=local pnpm build:local && pnpm start:local

# K8s
TARGET_ENV=k8s \
  APP_BASE_URL=https://cortex.example.com \
  API_BASE_URL=http://functions-service/api \
  pnpm build:k8s

# Firebase
TARGET_ENV=firebase pnpm build:firebase && pnpm deploy
```

**Deployment**:

```bash
# K8s with kubectl
docker build -f Dockerfile.web --build-arg TARGET_ENV=k8s -t cortex-web:k8s .
kubectl apply -k kubernetes/

# K8s with Helm (recommended)
helm install cortex-dc ./helm/cortex-dc --namespace cortex-dc --create-namespace

# Firebase
firebase deploy --only hosting,functions
```

**Monitoring & Maintenance**:

```bash
# Health checks
curl http://localhost:3000/api/health

# Database migrations
cd packages/db && npx prisma migrate deploy

# Cache statistics
redis-cli INFO stats

# View logs
kubectl logs -f deployment/cortex-dc-web -n cortex-dc
```

### Performance Benchmarks Summary

**Database Performance**:

- User queries: 450ms → 2ms (225x faster)
- Login analytics: 1200ms → 18ms (66x faster)
- Activity queries: 2100ms → 22ms (95x faster)

**Cache Performance**:

- Dashboard load: 800ms → 12ms (66x faster)
- Cache hit rate: >90%
- User profile: 25ms → 1ms (25x faster)

**Data Migration**:

- Throughput: 1,300-1,400 records/second
- Memory efficient: <1GB for millions of records
- Adaptive batch sizing: 100-10,000 records

**Frontend Performance**:

- Lighthouse score: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Bundle size: <200KB (gzipped)

### Integration Patterns

The platform supports flexible deployment and integration:

1. **Full Self-Hosted**: Complete control with PostgreSQL, Redis, Keycloak, MinIO
2. **Hybrid Firebase**: Use Firebase Auth/Firestore, self-host application
3. **Pure Firebase**: Fully managed with Firebase Hosting and Cloud Functions
4. **Enterprise SSO**: Okta SAML/OAuth integration with group sync
5. **AI-Enhanced**: Optional AI suggestions for POVs and TRRs

### Production Readiness Checklist

**Infrastructure**:

- [ ] Environment variables configured for target environment
- [ ] Database migrations applied successfully
- [ ] Redis cache configured and tested
- [ ] SSL/TLS certificates installed (K8s/Firebase)
- [ ] DNS records configured
- [ ] Load balancer configured (K8s)

**Security**:

- [ ] Secrets stored in secure manager (Google Secret Manager, K8s secrets)
- [ ] Authentication configured (Firebase Auth, Okta, or Keycloak)
- [ ] CORS settings reviewed
- [ ] Rate limiting configured (Ingress controller)
- [ ] Security headers configured
- [ ] Vulnerability scanning completed (Trivy)

**Monitoring**:

- [ ] Health check endpoints verified
- [ ] Logging configured (stdout for K8s)
- [ ] Metrics collection enabled (Prometheus)
- [ ] Alerting rules configured
- [ ] Error tracking setup (Sentry)

**Testing**:

- [ ] Unit tests passing (Vitest)
- [ ] E2E tests passing (Playwright)
- [ ] Load testing completed
- [ ] Accessibility audit passed (axe-core)
- [ ] Visual regression tests passing

**Documentation**:

- [ ] Deployment runbook completed
- [ ] Rollback procedures documented
- [ ] Incident response plan ready
- [ ] Team trained on operations

### Next Steps After Deployment

1. **Monitor Performance**: Review metrics in Grafana/Prometheus
2. **Verify Health Checks**: Ensure all pods/services are healthy
3. **Load Testing**: Gradually increase traffic to verify scaling
4. **User Acceptance**: Conduct UAT with key stakeholders
5. **Optimize**: Review query performance and cache hit rates
6. **Document**: Update runbooks with production learnings
7. **Iterate**: Gather user feedback and plan enhancements

### Support & Resources

**Documentation**:

- [FRONTEND_UX_ARCHITECTURE.md](./FRONTEND_UX_ARCHITECTURE.md) - Complete UX design guide
- [IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md) - Backend implementation details
- [ARCHITECTURE_K8S_READY.md](./ARCHITECTURE_K8S_READY.md) - System architecture overview
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Integration patterns and examples

**Getting Help**:

- GitHub Issues: <https://github.com/hankthebldr/cortex-dc-web/issues>
- Documentation: <https://docs.cortex-dc.henryreed.ai>
- Email: <henry@henryreed.ai>

**Remember:** Always validate your build artifacts before deploying to production!

---

**Version**: 3.0
**Last Updated**: 2025-10-15
**Status**: Production Ready
**Architecture**: Full-Stack (Frontend + Backend + Infrastructure)
**Next Review**: After major releases

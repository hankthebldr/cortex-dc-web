# Deployment Guide: Multi-Target Build System

This document provides comprehensive deployment instructions for the Cortex DC Web Platform across three deployment targets: **Local**, **Kubernetes (K8s)**, and **Firebase**.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Local Deployment](#local-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Firebase Deployment](#firebase-deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [CI/CD](#cicd)

---

## Overview

The Cortex DC Web Platform supports three deployment targets with a single codebase:

| Target | Use Case | Self-Contained | Output |
|--------|----------|----------------|--------|
| **Local** | Development & testing | ✅ Yes | Standalone server |
| **K8s** | Production self-hosted | ✅ Yes | Docker container |
| **Firebase** | Firebase Hosting | ❌ No (uses Firebase) | Static export |

### Key Features

- **Build Parity**: Same features across all targets
- **Self-Contained**: Local and K8s builds run without Firebase
- **Validation**: Automatic checks prevent Firebase dependencies in non-Firebase builds
- **Environment Isolation**: Clear separation via `TARGET_ENV` variable

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Source Code                             │
│                   (Single Codebase)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌──────────┐
   │ Local  │  │   K8s   │  │ Firebase │
   │ Build  │  │  Build  │  │  Build   │
   └───┬────┘  └────┬────┘  └────┬─────┘
       │            │             │
       ▼            ▼             ▼
   Node.js    Docker Image   Static Site
   Server     (Container)   (Firebase CDN)
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8.15.1+
- Docker (for K8s/local containers)
- kubectl (for K8s deployment)
- Firebase CLI (for Firebase deployment)

### Install Dependencies

```bash
pnpm install
```

### Validate Environment

```bash
# Check environment configuration
TARGET_ENV=local pnpm validate:env
TARGET_ENV=k8s APP_BASE_URL=https://example.com API_BASE_URL=https://api.example.com pnpm validate:env
TARGET_ENV=firebase pnpm validate:env
```

---

## Local Deployment

### Option 1: Direct Node.js (Fastest for Development)

```bash
# Build for local target
TARGET_ENV=local pnpm build:local

# Start the server
pnpm start:local

# Application will be available at:
# http://localhost:3000
```

### Option 2: Docker Compose (Simulates Production)

```bash
# Build and start web app only
docker-compose -f docker-compose.local.yml up --build -d

# Start with full self-hosted stack (Postgres, Redis, MinIO)
docker-compose -f docker-compose.local.yml --profile self-hosted up --build -d

# View logs
docker-compose -f docker-compose.local.yml logs -f web

# Stop services
docker-compose -f docker-compose.local.yml down
```

### Verify Local Deployment

```bash
# Health checks
curl http://localhost:3000/api/health
curl http://localhost:3000/api/healthz
curl http://localhost:3000/api/readyz

# Homepage
curl http://localhost:3000/
```

---

## Kubernetes Deployment

### Step 1: Build Docker Image

```bash
# Set your environment variables
export APP_BASE_URL="https://cortex.example.com"
export API_BASE_URL="http://functions-service/api"
export IMAGE_TAG="v1.0.0"

# Build Docker image
docker build \
  -f Dockerfile.web \
  --build-arg TARGET_ENV=k8s \
  --build-arg NODE_ENV=production \
  --build-arg APP_BASE_URL=$APP_BASE_URL \
  --build-arg API_BASE_URL=$API_BASE_URL \
  -t gcr.io/cortex-dc-project/cortex-web:$IMAGE_TAG \
  .

# Push to registry
docker push gcr.io/cortex-dc-project/cortex-web:$IMAGE_TAG
```

### Step 2: Configure Kubernetes Manifests

```bash
# Navigate to K8s manifests
cd k8s/web

# Create secrets from template
cp secrets.yaml.template secrets.yaml

# Edit secrets.yaml with your actual values
# DO NOT commit secrets.yaml to version control!
vim secrets.yaml
```

Update the following in `deployment.yaml`:

```yaml
# Update APP_BASE_URL
- name: APP_BASE_URL
  value: "https://cortex.example.com"  # Your domain

# Update API_BASE_URL
- name: API_BASE_URL
  value: "http://functions-service/api"  # Your API service
```

Update the following in `ingress.yaml`:

```yaml
# Update host
- host: cortex.example.com  # Your domain

# Update TLS
tls:
- hosts:
  - cortex.example.com
  secretName: cortex-web-tls
```

### Step 3: Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml
kubectl apply -f serviceaccount.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml

# Or use kustomize
kubectl apply -k .
```

### Step 4: Verify K8s Deployment

```bash
# Check pods
kubectl get pods -n cortex-dc

# Check services
kubectl get svc -n cortex-dc

# Check ingress
kubectl get ingress -n cortex-dc

# View logs
kubectl logs -n cortex-dc -l app=cortex-web --tail=100 -f

# Port forward for local testing
kubectl port-forward -n cortex-dc svc/web-service 3000:80

# Test health endpoints
curl http://localhost:3000/api/health
```

### K8s Deployment Checklist

- [ ] Docker image built and pushed to registry
- [ ] `secrets.yaml` created from template with actual values
- [ ] `APP_BASE_URL` updated in deployment.yaml
- [ ] `API_BASE_URL` updated in deployment.yaml
- [ ] Domain name updated in ingress.yaml
- [ ] TLS certificate configured (cert-manager)
- [ ] All manifests applied to cluster
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

## Environment Variables

### Required Variables

#### Local Target

```bash
TARGET_ENV=local
NODE_ENV=production
APP_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
```

#### K8s Target

```bash
TARGET_ENV=k8s
NODE_ENV=production
APP_BASE_URL=https://your-domain.com  # REQUIRED
API_BASE_URL=http://functions-service/api  # REQUIRED
```

#### Firebase Target

```bash
TARGET_ENV=firebase
NODE_ENV=production
# APP_BASE_URL and API_BASE_URL are auto-configured by Firebase
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

# Firebase (if using Firebase backend)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## Troubleshooting

### Build Validation Fails

**Error:** Build validation failed: Found files with Firebase references

**Solution:**
1. Check `API_BASE_URL` is not using Firebase URLs
2. Verify `TARGET_ENV` is set correctly
3. Review `apps/web/next.config.js` configuration
4. Check for hardcoded Firebase URLs in code

```bash
# Debug build validation
TARGET_ENV=k8s pnpm run postbuild:k8s
```

### Docker Build Fails

**Error:** Build failed with TARGET_ENV

**Solution:**
1. Ensure build args are passed correctly
2. Check Dockerfile.web has TARGET_ENV support
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

**Error:** Pods in CrashLoopBackOff

**Solution:**
1. Check logs: `kubectl logs <pod-name> -n cortex-dc`
2. Verify secrets exist: `kubectl get secrets -n cortex-dc`
3. Check environment variables in deployment.yaml
4. Ensure APP_BASE_URL and API_BASE_URL are set

```bash
# Debug pod
kubectl describe pod <pod-name> -n cortex-dc
kubectl logs <pod-name> -n cortex-dc
```

### Health Checks Failing

**Error:** Readiness probe failed

**Solution:**
1. Verify `/api/health`, `/api/healthz`, `/api/readyz` endpoints exist
2. Check port configuration (should be 3000)
3. Verify HOSTNAME=0.0.0.0 is set
4. Check startup time (may need to increase initialDelaySeconds)

```bash
# Test health endpoints locally
kubectl port-forward -n cortex-dc svc/web-service 3000:80
curl http://localhost:3000/api/health
curl http://localhost:3000/api/healthz
curl http://localhost:3000/api/readyz
```

### Assets Not Loading

**Error:** 404 on static assets

**Solution:**
1. Verify `assetPrefix` in next.config.js
2. Check `APP_BASE_URL` is correct
3. Ensure Ingress is configured for `/_next` paths
4. Verify CORS settings if using CDN

### Environment Validation Fails

**Error:** Missing required environment variables

**Solution:**
1. Check all required variables are set
2. Verify `.env` files are loaded (if using)
3. Run validation script: `pnpm validate:env`

---

## CI/CD

### GitHub Actions

The repository includes a comprehensive CI/CD workflow (`build-matrix.yml`) that:

1. **Builds** all three targets in parallel
2. **Validates** build artifacts
3. **Runs smoke tests** on local and K8s builds
4. **Checks build parity** across targets
5. **Builds Docker image** (on push to main)
6. **Deploys to Firebase** (on push to main)

### Required Secrets

Configure these secrets in your GitHub repository:

```bash
GCP_SA_KEY              # GCP service account key for GCR push
FIREBASE_SERVICE_ACCOUNT # Firebase service account for deployment
GITHUB_TOKEN            # Automatically provided by GitHub
```

### Workflow Triggers

- **Push to** `master`, `main`, `develop`: Full build + deploy
- **Pull Request**: Build + test only
- **Manual**: `workflow_dispatch`

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

- [ ] Docker image pushed to registry
- [ ] K8s manifests updated with correct values
- [ ] TLS certificates configured
- [ ] Ingress controller installed
- [ ] HPA configured for scaling
- [ ] Monitoring/logging configured

### Firebase Specific

- [ ] Firebase project configured
- [ ] Hosting rules reviewed
- [ ] Functions deployed and tested
- [ ] Custom domain configured (if using)

### Post-Deployment

- [ ] Application accessible via intended URL
- [ ] Health checks passing
- [ ] Logs show no errors
- [ ] Metrics/monitoring functional
- [ ] Rollback plan documented
- [ ] Team notified of deployment

---

## Support

For issues, questions, or contributions:

- **GitHub Issues**: [https://github.com/your-org/cortex-dc-web/issues](https://github.com/your-org/cortex-dc-web/issues)
- **Documentation**: See `README.md` and `k8s/web/README.md`
- **Architecture**: See `ARCHITECTURE_K8S_READY.md`

---

## Summary

```bash
# Quick deployment commands

# Local
TARGET_ENV=local pnpm build:local && pnpm start:local

# K8s
docker build -f Dockerfile.web --build-arg TARGET_ENV=k8s -t cortex-web:k8s .
kubectl apply -k k8s/web/

# Firebase
TARGET_ENV=firebase pnpm build:firebase && pnpm run deploy
```

**Remember:** Always validate your build artifacts before deploying to production!

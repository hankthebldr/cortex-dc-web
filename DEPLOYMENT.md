# Cortex DC Web - GKE Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Local Development with Docker](#local-development-with-docker)
5. [GKE Deployment](#gke-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Security](#security)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)

---

## Overview

This document provides comprehensive instructions for deploying the Cortex Domain Consultant Web Platform to Google Kubernetes Engine (GKE) using Docker containers and Helm charts.

### Key Technologies

- **Container Runtime**: Docker
- **Orchestration**: Kubernetes (GKE)
- **Package Manager**: Helm 3
- **CI/CD**: GitHub Actions
- **Registry**: Google Container Registry (GCR)
- **Infrastructure**: Google Cloud Platform

---

## Prerequisites

### Required Tools

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Install kubectl
gcloud components install kubectl

# Install Helm 3
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Docker
# Follow instructions at https://docs.docker.com/get-docker/

# Install pnpm (for local development)
npm install -g pnpm@8.15.1
```

### GCP Setup

```bash
# Authenticate with GCP
gcloud auth login
gcloud config set project cortex-dc-portal

# Create GKE cluster (if not exists)
gcloud container clusters create cortex-dc-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --machine-type=e2-standard-4 \
  --disk-size=50GB \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=10 \
  --enable-autorepair \
  --enable-autoupgrade \
  --workload-pool=cortex-dc-portal.svc.id.goog \
  --enable-stackdriver-kubernetes \
  --addons=HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver

# Get cluster credentials
gcloud container clusters get-credentials cortex-dc-cluster \
  --zone=us-central1-a
```

### Service Account Setup

```bash
# Create service account for workload identity
gcloud iam service-accounts create cortex-dc-sa \
  --display-name="Cortex DC Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding cortex-dc-portal \
  --member="serviceAccount:cortex-dc-sa@cortex-dc-portal.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding cortex-dc-portal \
  --member="serviceAccount:cortex-dc-sa@cortex-dc-portal.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Bind Kubernetes service account to GCP service account
gcloud iam service-accounts add-iam-policy-binding cortex-dc-sa@cortex-dc-portal.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:cortex-dc-portal.svc.id.goog[cortex-dc/cortex-dc-sa]"
```

---

## Architecture

### Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Google Cloud Load Balancer              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Ingress Controller (nginx)                 │
│                      SSL Termination                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼──────────┐      ┌──────────▼─────────┐
│   Web Service    │      │  Functions Service  │
│  (Next.js App)   │◄─────┤   (Backend API)    │
│                  │      │                     │
│  Replicas: 3-10  │      │   Replicas: 2-5    │
│  Port: 3000      │      │   Port: 8080       │
│  HPA Enabled     │      │   HPA Enabled      │
└───────┬──────────┘      └──────────┬─────────┘
        │                            │
        └────────────┬───────────────┘
                     │
        ┌────────────▼──────────────┐
        │   Firebase Services       │
        │   - Authentication        │
        │   - Firestore            │
        │   - Storage              │
        │   - Cloud Functions      │
        └───────────────────────────┘
```

### Multi-Stage Build Process

```dockerfile
Stage 1: Dependencies (deps)
  └─> Install pnpm & production dependencies

Stage 2: Builder
  └─> Build TypeScript & Next.js app

Stage 3: Runner (Production)
  └─> Minimal runtime image
      - Non-root user (nextjs:nodejs)
      - dumb-init for signal handling
      - Health checks
      - Security hardening
```

---

## Local Development with Docker

### Build Images Locally

```bash
# Build web application
docker build -f Dockerfile.web -t cortex-web:local .

# Build functions
docker build -f Dockerfile.functions -t cortex-functions:local .
```

### Run with Docker Compose

```bash
# Create .env file
cp .env.example .env

# Edit .env with your Firebase credentials

# Start services
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop services
docker-compose down
```

### Access Services

- Web: http://localhost:3000
- Functions: http://localhost:8080
- Nginx Proxy: http://localhost

---

## GKE Deployment

### Step 1: Build and Push Images

```bash
# Authenticate Docker with GCR
gcloud auth configure-docker gcr.io

# Build and tag images
docker build -f Dockerfile.web \
  -t gcr.io/cortex-dc-portal/cortex-web:v1.0.0 .

docker build -f Dockerfile.functions \
  -t gcr.io/cortex-dc-portal/cortex-functions:v1.0.0 .

# Push images
docker push gcr.io/cortex-dc-portal/cortex-web:v1.0.0
docker push gcr.io/cortex-dc-portal/cortex-functions:v1.0.0
```

### Step 2: Configure Secrets

```bash
# Create namespace
kubectl create namespace cortex-dc

# Create secrets from Google Secret Manager
kubectl create secret generic cortex-web-secrets \
  --from-literal=NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key" \
  --from-literal=NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain" \
  --namespace=cortex-dc

kubectl create secret generic cortex-functions-secrets \
  --from-literal=FIREBASE_SERVICE_ACCOUNT="$(cat service-account.json)" \
  --namespace=cortex-dc
```

### Step 3: Deploy with Helm

```bash
# Add Helm repositories (if using external charts)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo add cert-manager https://charts.jetstack.io
helm repo update

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
  --set web.image.tag=v1.0.0 \
  --set functions.image.tag=v1.0.0 \
  --set global.environment=production \
  --values helm/cortex-dc/values-production.yaml \
  --wait \
  --timeout=10m
```

### Step 4: Verify Deployment

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

---

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline is defined in `.github/workflows/docker-build-push.yml` and includes:

#### 1. Security Scanning
- **Trivy**: Vulnerability scanning for filesystems and images
- **Hadolint**: Dockerfile linting
- **Gitleaks**: Secret detection

#### 2. Build & Test
- Lint checking
- Type checking
- Unit tests
- Package building

#### 3. Docker Build & Push
- Multi-platform builds
- Layer caching with GitHub Actions cache
- Automatic tagging (SHA, branch, semver)
- SBOM generation

#### 4. Deploy to GKE
- Helm deployment
- Rollout verification
- Smoke tests
- Slack notifications

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

# Notifications
SLACK_WEBHOOK_URL

# Security
GITLEAKS_LICENSE (optional)
```

### Manual Deployment Trigger

```bash
# Trigger deployment from CLI
gh workflow run docker-build-push.yml \
  --ref main \
  -f environment=production
```

---

## Security

### Container Security Best Practices

#### 1. Non-Root User
All containers run as non-root user (UID 1001):
```dockerfile
USER nextjs  # or USER functions
```

#### 2. Read-Only Filesystem
Security context prevents filesystem modifications:
```yaml
securityContext:
  readOnlyRootFilesystem: false  # false due to Next.js cache requirements
  allowPrivilegeEscalation: false
  capabilities:
    drop: [ALL]
```

#### 3. Minimal Base Image
Using Alpine Linux for smaller attack surface:
```dockerfile
FROM node:22-alpine
```

#### 4. Multi-Stage Builds
Separate build and runtime stages to minimize image size.

#### 5. Vulnerability Scanning
Automated scanning with Trivy in CI/CD pipeline.

### Network Security

#### Network Policies
```yaml
networkPolicy:
  enabled: true
  ingress:
    - from:
      - namespaceSelector:
          matchLabels:
            name: ingress-nginx
```

#### Pod Security Standards
```yaml
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1001
  seccompProfile:
    type: RuntimeDefault
```

### Secret Management

#### Google Secret Manager Integration
```bash
# Store secrets in Google Secret Manager
gcloud secrets create firebase-api-key \
  --data-file=- <<< "your-api-key"

# Access from pods via workload identity
```

#### External Secrets Operator (Optional)
```bash
# Install external-secrets
helm install external-secrets \
  external-secrets/external-secrets \
  --namespace external-secrets \
  --create-namespace
```

---

## Monitoring

### Prometheus & Grafana

#### Install kube-prometheus-stack
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace
```

#### Key Metrics
- HTTP request rate
- Response time (P50, P95, P99)
- Error rate (4xx, 5xx)
- CPU/Memory utilization
- Pod restarts
- HPA scaling events

### Logging

#### Structured Logging
```javascript
// Use structured JSON logs
console.log(JSON.stringify({
  level: 'info',
  message: 'Request processed',
  requestId: req.id,
  duration: elapsed,
  statusCode: res.statusCode
}));
```

#### Log Aggregation
- **Google Cloud Logging**: Automatic collection from GKE
- **Log Explorer**: Query and analyze logs

### Alerting

#### Critical Alerts
- High error rate (>5% for 5 minutes)
- Pod crash loops
- High memory usage (>90%)
- Certificate expiration

#### Alert Channels
- Slack webhook
- PagerDuty (for critical)
- Email notifications

---

## Troubleshooting

### Common Issues

#### 1. Image Pull Errors
```bash
# Check image exists
gcloud container images list --repository=gcr.io/cortex-dc-portal

# Verify service account has access
kubectl get sa cortex-dc-sa -n cortex-dc -o yaml
```

#### 2. Pod CrashLoopBackOff
```bash
# View pod logs
kubectl logs <pod-name> -n cortex-dc --previous

# Describe pod for events
kubectl describe pod <pod-name> -n cortex-dc

# Check resource limits
kubectl top pods -n cortex-dc
```

#### 3. Service Unreachable
```bash
# Check service endpoints
kubectl get endpoints -n cortex-dc

# Test internal connectivity
kubectl run curl-test --image=curlimages/curl --rm -i --restart=Never \
  -n cortex-dc -- curl -v http://cortex-dc-web:3000/api/health
```

#### 4. Ingress Not Working
```bash
# Check ingress status
kubectl get ingress -n cortex-dc
kubectl describe ingress cortex-dc-web -n cortex-dc

# Verify ingress controller
kubectl get pods -n ingress-nginx

# Check certificate
kubectl get certificate -n cortex-dc
```

### Debug Commands

```bash
# Get all resources
kubectl get all -n cortex-dc

# View events
kubectl get events -n cortex-dc --sort-by='.lastTimestamp'

# Shell into container
kubectl exec -it <pod-name> -n cortex-dc -- sh

# Port forward
kubectl port-forward svc/cortex-dc-web 3000:3000 -n cortex-dc

# View HPA status
kubectl get hpa -n cortex-dc

# Rollback deployment
helm rollback cortex-dc -n cortex-dc
```

### Performance Tuning

#### Resource Optimization
```yaml
resources:
  requests:
    cpu: 250m      # Guaranteed
    memory: 512Mi
  limits:
    cpu: 1000m     # Maximum
    memory: 1024Mi
```

#### HPA Tuning
```yaml
autoscaling:
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

---

## Backup & Disaster Recovery

### Database Backup
Firebase Firestore is automatically backed up by Google. Configure:
```bash
# Enable point-in-time recovery
gcloud firestore databases update \
  --project=cortex-dc-portal \
  --enable-point-in-time-recovery
```

### Helm Release Backup
```bash
# List releases
helm list -n cortex-dc

# Get release manifest
helm get manifest cortex-dc -n cortex-dc > backup-manifest.yaml

# Get values
helm get values cortex-dc -n cortex-dc > backup-values.yaml
```

### Configuration Backup
```bash
# Backup all configs
kubectl get all,cm,secret,ingress,pdb,hpa -n cortex-dc -o yaml > backup-all.yaml
```

---

## Cost Optimization

### Node Pool Optimization
```bash
# Use preemptible nodes for non-production
gcloud container node-pools create preemptible-pool \
  --cluster=cortex-dc-cluster \
  --zone=us-central1-a \
  --preemptible \
  --machine-type=e2-standard-4 \
  --num-nodes=2
```

### Resource Right-Sizing
- Monitor actual resource usage
- Adjust requests/limits based on metrics
- Use Vertical Pod Autoscaler (VPA)

### Cluster Autoscaling
```bash
# Enable cluster autoscaling
gcloud container clusters update cortex-dc-cluster \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=10 \
  --zone=us-central1-a
```

---

## Support & Contributing

For issues, questions, or contributions:

- **GitHub Issues**: https://github.com/hankthebldr/cortex-dc-web/issues
- **Documentation**: https://docs.cortex-dc.henryreed.ai
- **Email**: henry@henryreed.ai

---

## License

Copyright © 2025 Henry Reed. All rights reserved.

# Functions Microservice - Quick Start Guide

**5-Minute Setup** | **Production Ready** | **Complete Documentation Available**

---

## For Developers (Local Testing)

### Option 1: Node.js Development (Fastest)

```bash
cd functions

# Install dependencies
pnpm install

# Start development server with hot reload
pnpm run server:dev

# Test endpoints
curl http://localhost:8080/health
```

### Option 2: Docker Testing

```bash
cd functions

# Run automated Docker test
./scripts/docker-test.sh

# Or manually:
cp .env.docker.template .env.docker
# Edit .env.docker with your values
docker-compose up
```

---

## For DevOps (K8s Deployment)

### Prerequisites

```bash
# Authenticate
gcloud auth login
gcloud config set project cortex-dc-project
gcloud auth configure-docker gcr.io

# Get K8s credentials
gcloud container clusters get-credentials cortex-dc-cluster --region us-central1
```

### Deploy to Kubernetes

```bash
cd functions

# 1. Setup secrets (interactive)
./scripts/setup-secrets.sh

# 2. Build, push, and deploy (one command)
pnpm run deploy:k8s

# 3. Check status
pnpm run k8s:status

# 4. View logs
pnpm run k8s:logs
```

---

## Available Scripts

```bash
# Development
pnpm run build              # Compile TypeScript
pnpm run server:dev         # Dev server with hot reload

# Docker
pnpm run docker:build:tag   # Build with git SHA tag
pnpm run docker:push:tag    # Push to GCR
pnpm run docker:run         # Run container locally

# Kubernetes
pnpm run k8s:apply          # Deploy to K8s
pnpm run k8s:restart        # Restart deployment
pnpm run k8s:status         # Check pod status
pnpm run k8s:logs           # View logs

# All-in-one
pnpm run deploy:k8s         # Build + Push + Deploy
```

---

## Endpoints

Once deployed, the service exposes:

```bash
# Health checks
GET  /health        # Basic health check
GET  /healthz       # Kubernetes liveness probe
GET  /readyz        # Kubernetes readiness probe

# Monitoring
GET  /metrics       # Prometheus metrics

# Functions
POST /echo          # Echo test endpoint
GET  /environment   # Environment configuration
```

---

## Testing

```bash
# Local (Node.js)
curl http://localhost:8080/health

# Local (Docker)
curl http://localhost:8080/health

# Kubernetes (port forward)
kubectl port-forward -n cortex-dc svc/functions-service 8080:80
curl http://localhost:8080/health

# Production
curl https://functions.cortex-dc.com/health
```

---

## Troubleshooting

### Pod not starting?

```bash
kubectl get pods -n cortex-dc -l app=functions
kubectl describe pod <pod-name> -n cortex-dc
kubectl logs <pod-name> -n cortex-dc
```

### Build failing?

```bash
# Clean and rebuild
rm -rf lib node_modules
pnpm install
pnpm run build
```

### Docker not working?

```bash
# Check Docker is running
docker ps

# Rebuild without cache
docker build --no-cache -t functions-test .
```

---

## Documentation

- **Quick Start** - You are here!
- **[README.md](./README.md)** - Comprehensive guide
- **[KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md)** - Complete K8s deployment guide
- **[DOCKER_COMPOSE.md](./DOCKER_COMPOSE.md)** - Local testing with Docker Compose
- **[FUNCTIONS_MIGRATION_AUDIT.md](./FUNCTIONS_MIGRATION_AUDIT.md)** - Technical audit

---

## Common Tasks

### Update configuration

```bash
# Edit ConfigMap
kubectl edit configmap functions-config -n cortex-dc

# Or edit k8s/configmap.yaml and reapply
kubectl apply -k k8s/
```

### Update secrets

```bash
# Run setup script again
./scripts/setup-secrets.sh

# Or manually
kubectl edit secret functions-secrets -n cortex-dc
```

### Scale deployment

```bash
# Manual scaling
kubectl scale deployment/functions-microservice -n cortex-dc --replicas=5

# Check HPA status
kubectl get hpa -n cortex-dc
```

### Rollback deployment

```bash
# Rollback to previous version
kubectl rollout undo deployment/functions-microservice -n cortex-dc

# Check rollout status
kubectl rollout status deployment/functions-microservice -n cortex-dc
```

---

## Getting Help

1. Check logs: `pnpm run k8s:logs`
2. Check status: `pnpm run k8s:status`
3. Read documentation: [KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md)
4. Check issues: https://github.com/hankthebldr/cortex-dc-web/issues

---

**Ready to deploy?** Run `pnpm run deploy:k8s` from the `functions/` directory!

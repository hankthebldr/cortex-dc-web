# Quick Reference: Multi-Target Deployment

## 🚀 Quick Commands

### Build & Run

```bash
# Local Development
TARGET_ENV=local pnpm build:local && pnpm start:local

# Kubernetes Production
TARGET_ENV=k8s APP_BASE_URL=https://your-domain.com API_BASE_URL=https://api.your-domain.com pnpm build:k8s

# Firebase
TARGET_ENV=firebase pnpm build:firebase && pnpm deploy
```

### Validation

```bash
# Validate environment
TARGET_ENV=local pnpm validate:env

# Validate build artifacts
pnpm postbuild:k8s
pnpm postbuild:local
```

### Docker

```bash
# Build image
docker build -f Dockerfile.web --build-arg TARGET_ENV=k8s \
  --build-arg APP_BASE_URL=https://your-domain.com \
  -t cortex-web:latest .

# Run locally
docker run -p 3000:3000 -e APP_BASE_URL=http://localhost:3000 cortex-web:latest

# Docker Compose
docker-compose -f docker-compose.local.yml up -d
```

### Kubernetes

```bash
# Deploy
cd k8s/web
kubectl apply -k .

# Monitor
kubectl get pods -n cortex-dc
kubectl logs -n cortex-dc -l app=cortex-web -f

# Test health
kubectl port-forward -n cortex-dc svc/web-service 3000:80
curl http://localhost:3000/api/health
```

---

## 🔧 Environment Variables

### Required for K8s

```bash
TARGET_ENV=k8s
APP_BASE_URL=https://your-domain.com  # REQUIRED
API_BASE_URL=http://functions-service/api  # REQUIRED
NODE_ENV=production
```

### Optional

```bash
ENABLE_ANALYTICS=true
ENABLE_TELEMETRY=false
LOG_LEVEL=info
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `apps/web/next.config.js` | Next.js configuration with TARGET_ENV support |
| `Dockerfile.web` | Multi-target Docker build |
| `docker-compose.local.yml` | Local development environment |
| `k8s/web/` | Kubernetes manifests |
| `scripts/env/resolve-env.ts` | Environment validation |
| `scripts/build/validate-build.ts` | Build artifact validation |
| `.github/workflows/build-matrix.yml` | CI/CD pipeline |

---

## 🏗️ Build Targets

| Target | Use Case | Output | Self-Contained |
|--------|----------|--------|----------------|
| `local` | Development | Node server | ✅ Yes |
| `k8s` | Production | Docker image | ✅ Yes |
| `firebase` | Firebase Hosting | Static export | ❌ No |

---

## ✅ Health Checks

```bash
# Health endpoints
GET /api/health   # Basic health check
GET /api/healthz  # Liveness probe
GET /api/readyz   # Readiness probe
```

Expected response: `200 OK`

---

## 🔍 Troubleshooting

### Build fails with "Missing required environment variables"

```bash
# Run validation to see what's missing
TARGET_ENV=k8s pnpm validate:env
```

### Build validation fails (Firebase URLs found)

```bash
# Check environment variables
echo $APP_BASE_URL
echo $API_BASE_URL

# Ensure not using Firebase URLs for non-Firebase builds
```

### Docker image won't start

```bash
# Check logs
docker logs <container-id>

# Verify environment variables
docker inspect <container-id> | grep -A 20 Env
```

### K8s pods in CrashLoopBackOff

```bash
# Check logs
kubectl logs <pod-name> -n cortex-dc

# Check secrets exist
kubectl get secrets -n cortex-dc

# Describe pod for events
kubectl describe pod <pod-name> -n cortex-dc
```

---

## 📚 Documentation

- **Full Deployment Guide**: `DEPLOYMENT.md`
- **K8s Guide**: `k8s/web/README.md`
- **Refactoring Summary**: `DEPLOYMENT_REFACTORING_SUMMARY.md`
- **Main README**: `README.md`

---

## 🎯 Quick Start Checklist

### Local

- [ ] Run `pnpm install`
- [ ] Run `TARGET_ENV=local pnpm build:local`
- [ ] Run `pnpm start:local`
- [ ] Access `http://localhost:3000`

### Kubernetes

- [ ] Update `k8s/web/secrets.yaml` from template
- [ ] Update `APP_BASE_URL` in `deployment.yaml`
- [ ] Update domain in `ingress.yaml`
- [ ] Build and push Docker image
- [ ] Run `kubectl apply -k k8s/web/`
- [ ] Verify pods are running
- [ ] Test health endpoints

### Firebase

- [ ] Run `firebase login`
- [ ] Run `TARGET_ENV=firebase pnpm build:firebase`
- [ ] Run `pnpm deploy`
- [ ] Verify deployment at Firebase hosting URL

---

## 💡 Pro Tips

1. **Use validation early**: Run `pnpm validate:env` before building
2. **Check build artifacts**: Run postbuild validation before deploying
3. **Test locally first**: Use docker-compose.local.yml to test K8s-like environment
4. **Monitor health checks**: All three probes must pass in K8s
5. **Use staging**: Test K8s deployment in staging namespace first

---

## 🔗 Quick Links

- **CI/CD Status**: `.github/workflows/build-matrix.yml`
- **K8s Manifests**: `k8s/web/`
- **Docker Compose**: `docker-compose.local.yml`
- **Scripts**: `scripts/env/` and `scripts/build/`

---

## 📞 Support

See `DEPLOYMENT.md` for comprehensive troubleshooting and support information.

# Kubernetes Quick Start - Cortex DC Platform

Quick reference for deploying Cortex DC Platform to Kubernetes.

## Pre-flight Checklist

- [ ] Kubernetes cluster running (1.26+)
- [ ] `kubectl` configured and working
- [ ] Docker images built and pushed to registry
- [ ] Secrets created
- [ ] Domain/DNS configured
- [ ] SSL certificates ready

## Fast Track: Deploy in 5 Minutes

### 1. Create Secrets (2 min)

```bash
kubectl create namespace cortex-dc

kubectl create secret generic cortex-secrets \
  --from-literal=postgres-password="$(openssl rand -base64 32)" \
  --from-literal=redis-password="$(openssl rand -base64 32)" \
  --from-literal=minio-root-password="$(openssl rand -base64 32)" \
  --from-literal=keycloak-admin-password="$(openssl rand -base64 32)" \
  --namespace=cortex-dc
```

### 2. Build & Push Images (1 min)

```bash
export REGISTRY=gcr.io/YOUR-PROJECT

# Web
docker build -f apps/web/Dockerfile -t $REGISTRY/cortex-web:latest . && docker push $_

# Functions
docker build -f functions/Dockerfile -t $REGISTRY/functions-microservice:latest functions/ && docker push $_
```

### 3. Deploy Everything (2 min)

```bash
# Apply all manifests
kubectl apply -k kubernetes/
kubectl apply -k functions/k8s/

# Watch rollout
kubectl get pods -n cortex-dc -w
```

## Using Helm

```bash
helm install cortex-dc ./helm/cortex-dc --namespace cortex-dc
```

## Validation Commands

```bash
# Check pods
kubectl get pods -n cortex-dc

# Check services
kubectl get svc -n cortex-dc

# Check ingress
kubectl get ingress -n cortex-dc

# Test health endpoints
kubectl run curl --rm -it --restart=Never --image=curlimages/curl --namespace=cortex-dc -- \
  sh -c "curl http://cortex-web/api/health && curl http://functions-service/health"
```

## Common Tasks

### Scale Services

```bash
kubectl scale deployment cortex-web --replicas=10 -n cortex-dc
```

### Update Image

```bash
kubectl set image deployment/cortex-web web=$REGISTRY/cortex-web:v2.0.0 -n cortex-dc
```

### Rollback

```bash
kubectl rollout undo deployment/cortex-web -n cortex-dc
```

### Get Logs

```bash
kubectl logs -f -l app=cortex-web -n cortex-dc
```

### Port Forward

```bash
# Web app
kubectl port-forward svc/cortex-web 3000:80 -n cortex-dc

# Keycloak
kubectl port-forward svc/keycloak 8180:8180 -n cortex-dc

# MinIO
kubectl port-forward svc/minio-api 9000:9000 -n cortex-dc
```

## Cleanup

```bash
# Delete everything
kubectl delete namespace cortex-dc

# Or using Helm
helm uninstall cortex-dc --namespace cortex-dc
```

## Service Ports

| Service | Internal Port | External Port | Health Check |
|---------|---------------|---------------|--------------|
| Web | 3000 | 80 | `/api/health` |
| Functions | 8080 | 80 | `/health` |
| PostgreSQL | 5432 | - | - |
| Redis | 6379 | - | - |
| MinIO | 9000/9001 | - | `/minio/health/live` |
| Keycloak | 8180 | - | `/health/ready` |

## Resource Requirements

| Service | Min CPU | Min Memory | Max CPU | Max Memory |
|---------|---------|------------|---------|------------|
| Web | 500m | 512Mi | 1000m | 1Gi |
| Functions | 250m | 256Mi | 500m | 512Mi |
| PostgreSQL | 500m | 512Mi | 1000m | 2Gi |
| Redis | 100m | 128Mi | 500m | 512Mi |
| MinIO | 250m | 256Mi | 1000m | 1Gi |
| Keycloak | 500m | 512Mi | 1000m | 1Gi |

**Total Cluster Requirements**: ~3 nodes × 4 CPU / 16GB RAM

## Troubleshooting One-Liners

```bash
# Pod not starting
kubectl describe pod POD_NAME -n cortex-dc

# Application errors
kubectl logs POD_NAME -n cortex-dc --previous

# Network issues
kubectl get endpoints -n cortex-dc

# Resource issues
kubectl top pods -n cortex-dc

# Events
kubectl get events -n cortex-dc --sort-by='.lastTimestamp'
```

## Next Steps

1. Configure Keycloak: `kubectl port-forward svc/keycloak 8180:8180 -n cortex-dc`
2. Setup Ingress/DNS
3. Configure monitoring
4. Setup backups
5. Configure CI/CD

For detailed instructions, see [KUBERNETES_DEPLOYMENT_GUIDE.md](./KUBERNETES_DEPLOYMENT_GUIDE.md)

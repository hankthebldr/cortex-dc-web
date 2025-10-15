# Firebase Functions to Kubernetes Deployment Guide

## Overview

This guide documents the strategy and steps for deploying Firebase Functions as a standalone microservice in a Kubernetes cluster. The migration converts Firebase Cloud Functions to an Express-based HTTP server that can run in any containerized environment.

## Architecture

### Components

1. **Express Server** (`src/server.ts`)
   - Wraps Firebase Functions as HTTP endpoints
   - Provides health check endpoints for K8s probes
   - Includes metrics endpoint for Prometheus
   - Handles graceful shutdown (SIGTERM/SIGINT)

2. **Docker Container** (`Dockerfile`)
   - Multi-stage build (builder + runtime)
   - Node 22 Alpine base
   - Non-root user (nodejs:1001)
   - Health checks configured
   - Production-optimized

3. **Kubernetes Manifests** (`k8s/`)
   - Deployment with 3 replicas
   - Horizontal Pod Autoscaler (3-10 replicas)
   - Service (ClusterIP)
   - ConfigMap for configuration
   - Secrets for sensitive data
   - ServiceAccount with RBAC

## Prerequisites

### Required Tools

- Docker (v20+)
- kubectl (v1.28+)
- Node.js 22
- pnpm
- Google Cloud SDK (for GKE)

### GCP Setup

```bash
# Authenticate with GCP
gcloud auth login
gcloud config set project cortex-dc-project

# Configure Docker for GCR
gcloud auth configure-docker gcr.io

# Get K8s credentials (for GKE)
gcloud container clusters get-credentials cortex-dc-cluster --region us-central1
```

### Kubernetes Cluster

- Kubernetes 1.28+
- Sufficient resources (1 CPU, 1GB RAM per pod minimum)
- Ingress controller (for external access)
- Metrics server (for HPA)

## Building and Publishing

### 1. Build TypeScript

```bash
cd functions
pnpm install
pnpm run build
```

### 2. Build Docker Image

```bash
# Build with latest tag
pnpm run docker:build

# Build with git commit tag (recommended)
pnpm run docker:build:tag
```

This creates an image tagged with:
- `gcr.io/cortex-dc-project/functions-microservice:latest`
- `gcr.io/cortex-dc-project/functions-microservice:<git-sha>`

### 3. Push to Registry

```bash
# Push latest
pnpm run docker:push

# Push with git commit tag (recommended)
pnpm run docker:push:tag
```

### 4. Test Locally

```bash
# Create local environment file
cp .env.docker.template .env.docker
# Edit .env.docker with your values

# Run container locally
pnpm run docker:run

# Test endpoints
curl http://localhost:8080/health
curl http://localhost:8080/environment
curl -X POST http://localhost:8080/echo -H "Content-Type: application/json" -d '{"message":"test"}'
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Configure Secrets

Create secrets from the template:

```bash
cd k8s

# Copy template
cp secrets.yaml.template secrets.yaml

# Edit secrets.yaml with actual values
# IMPORTANT: Do not commit secrets.yaml

# Create GCP service account key secret
kubectl create secret generic functions-gcp-credentials \
  --from-file=key.json=/path/to/service-account-key.json \
  -n cortex-dc

# Create other secrets
kubectl apply -f secrets.yaml
```

Required secrets:
- `functions-secrets`: Environment variables (API keys, project IDs)
- `functions-gcp-credentials`: Service account JSON key

### 3. Deploy Using Kustomize

```bash
# Preview what will be deployed
kubectl kustomize k8s/

# Apply all resources
pnpm run k8s:apply

# Or manually:
kubectl apply -k k8s/
```

This deploys:
- Namespace
- ServiceAccount + RBAC
- ConfigMap
- Deployment (3 replicas)
- Service (ClusterIP)
- HorizontalPodAutoscaler

### 4. Verify Deployment

```bash
# Check pod status
pnpm run k8s:status

# Get detailed deployment info
pnpm run k8s:describe

# View logs
pnpm run k8s:logs

# Check all resources
kubectl get all -n cortex-dc -l app=functions
```

Expected output:
```
NAME                                       READY   STATUS    RESTARTS   AGE
pod/functions-microservice-xxx-xxx         1/1     Running   0          2m

NAME                                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)
service/functions-service            ClusterIP   10.x.x.x        <none>        80/TCP

NAME                                     READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/functions-microservice   3/3     3            3           2m
```

## Configuration

### Environment Variables (ConfigMap)

Configured in `k8s/configmap.yaml`:

- `app-version`: Application version
- `log-level`: Logging level (info, debug, error)
- `cors-origin`: Allowed CORS origins
- `enable-genkit`: Enable/disable Genkit AI features
- `enable-metrics`: Enable/disable Prometheus metrics

Update ConfigMap:
```bash
kubectl edit configmap functions-config -n cortex-dc
# Or edit k8s/configmap.yaml and reapply
```

### Secrets

Configured in `k8s/secrets.yaml`:

- `gcp-project-id`: Google Cloud Project ID
- `firebase-project-id`: Firebase Project ID
- `firebase-database-url`: Firebase Realtime Database URL
- `genai-api-key`: Google Generative AI API key

Update secrets:
```bash
kubectl edit secret functions-secrets -n cortex-dc
# Or update secrets.yaml and reapply
```

### Resource Limits

Configured in `k8s/deployment.yaml`:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

Adjust based on workload requirements.

### Autoscaling

Configured in `k8s/hpa.yaml`:

- **Min replicas**: 3
- **Max replicas**: 10
- **CPU target**: 70% utilization
- **Memory target**: 80% utilization

Update HPA:
```bash
kubectl edit hpa functions-hpa -n cortex-dc
```

## Monitoring

### Health Checks

The service exposes three health check endpoints:

- `GET /health` - Basic health check
- `GET /healthz` - Kubernetes liveness probe
- `GET /readyz` - Kubernetes readiness probe

Probe configuration in deployment:
```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /readyz
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Metrics

Prometheus metrics available at `GET /metrics`:

```
# HELP functions_up Service is up and running
# TYPE functions_up gauge
functions_up 1

# HELP functions_requests_total Total number of requests
# TYPE functions_requests_total counter
functions_requests_total{method="GET",path="/health"} 100

# HELP functions_request_duration_seconds Request duration
# TYPE functions_request_duration_seconds histogram
```

### Logs

View logs:
```bash
# Follow logs from all pods
pnpm run k8s:logs

# Or use kubectl directly
kubectl logs -n cortex-dc -l app=functions --tail=100 -f

# Logs from specific pod
kubectl logs -n cortex-dc <pod-name>
```

### Pod Metrics

```bash
# Get pod resource usage
kubectl top pods -n cortex-dc -l app=functions

# Get node resource usage
kubectl top nodes
```

## Updates and Rollouts

### Rolling Update

```bash
# Full deployment (build, push, restart)
pnpm run deploy:k8s

# Or step by step:
pnpm run build
pnpm run docker:build:tag
pnpm run docker:push:tag
pnpm run k8s:restart
```

### Restart Deployment

```bash
# Restart all pods
pnpm run k8s:restart

# Check rollout status
kubectl rollout status deployment/functions-microservice -n cortex-dc
```

### Rollback

```bash
# View rollout history
kubectl rollout history deployment/functions-microservice -n cortex-dc

# Rollback to previous version
kubectl rollout undo deployment/functions-microservice -n cortex-dc

# Rollback to specific revision
kubectl rollout undo deployment/functions-microservice -n cortex-dc --to-revision=2
```

### Scale Manually

```bash
# Scale to 5 replicas
kubectl scale deployment/functions-microservice -n cortex-dc --replicas=5

# View scaling status
kubectl get hpa -n cortex-dc
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n cortex-dc -l app=functions

# Describe pod to see events
kubectl describe pod <pod-name> -n cortex-dc

# Check pod logs
kubectl logs <pod-name> -n cortex-dc

# Check previous container logs (if crashed)
kubectl logs <pod-name> -n cortex-dc --previous
```

Common issues:
- **ImagePullBackOff**: Check image name and registry access
- **CrashLoopBackOff**: Check application logs for errors
- **Pending**: Check resource availability and node capacity

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n cortex-dc functions-service

# Test from within cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n cortex-dc -- \
  curl http://functions-service/health

# Port forward for local testing
kubectl port-forward -n cortex-dc svc/functions-service 8080:80
curl http://localhost:8080/health
```

### Configuration Issues

```bash
# Verify ConfigMap
kubectl get configmap functions-config -n cortex-dc -o yaml

# Verify Secrets (base64 encoded)
kubectl get secret functions-secrets -n cortex-dc -o yaml

# Decode secret value
kubectl get secret functions-secrets -n cortex-dc -o jsonpath='{.data.gcp-project-id}' | base64 -d
```

### Performance Issues

```bash
# Check resource usage
kubectl top pods -n cortex-dc -l app=functions

# Check HPA status
kubectl get hpa -n cortex-dc functions-hpa

# Describe HPA for metrics
kubectl describe hpa functions-hpa -n cortex-dc

# Check if HPA can get metrics
kubectl get --raw /apis/metrics.k8s.io/v1beta1/namespaces/cortex-dc/pods
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Functions to K8s

on:
  push:
    branches: [main]
    paths:
      - 'functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Google Cloud
        uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: cortex-dc-project

      - name: Configure Docker
        run: gcloud auth configure-docker gcr.io

      - name: Build and Push
        working-directory: functions
        run: |
          pnpm install
          pnpm run build
          pnpm run docker:build:tag
          pnpm run docker:push:tag

      - name: Get K8s Credentials
        run: |
          gcloud container clusters get-credentials cortex-dc-cluster \
            --region us-central1

      - name: Deploy to K8s
        working-directory: functions
        run: |
          pnpm run k8s:restart
          kubectl rollout status deployment/functions-microservice -n cortex-dc
```

## Security Best Practices

### 1. Image Security

- Use specific image tags (commit SHA) instead of `latest`
- Scan images for vulnerabilities: `docker scan gcr.io/cortex-dc-project/functions-microservice:latest`
- Use minimal base images (Alpine)
- Run as non-root user (nodejs:1001)

### 2. Secrets Management

- Never commit secrets to git
- Use Kubernetes Secrets for sensitive data
- Consider using external secret managers (GCP Secret Manager, HashiCorp Vault)
- Rotate secrets regularly

### 3. Network Security

- Use NetworkPolicies to restrict traffic
- Enable RBAC and least-privilege access
- Use TLS/SSL for external communication
- Implement API authentication

### 4. Pod Security

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  fsGroup: 1001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
```

## Migration Strategy

### Phase 1: Parallel Deployment (Current)

- Keep existing Firebase Functions running
- Deploy K8s microservice alongside
- Route subset of traffic to K8s (canary)
- Monitor performance and errors

### Phase 2: Traffic Migration

- Gradually increase traffic to K8s
- Use Ingress/Load Balancer traffic splitting
- Monitor metrics and logs
- Rollback if issues detected

### Phase 3: Complete Migration

- Route all traffic to K8s
- Keep Firebase Functions as backup
- Monitor for 1-2 weeks
- Decommission Firebase Functions

### Rollback Plan

If issues occur:
```bash
# Quick rollback to previous K8s version
kubectl rollout undo deployment/functions-microservice -n cortex-dc

# Or route traffic back to Firebase Functions
# (Update Ingress/Load Balancer configuration)
```

## Cost Optimization

### 1. Resource Requests/Limits

- Set appropriate CPU/memory requests based on actual usage
- Use limits to prevent resource exhaustion
- Monitor with `kubectl top pods`

### 2. Autoscaling

- Configure HPA for cost-effective scaling
- Set appropriate min/max replicas
- Use cluster autoscaling for node management

### 3. Image Optimization

- Use multi-stage builds to reduce image size
- Remove development dependencies in production
- Layer caching for faster builds

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Express.js Documentation](https://expressjs.com/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)

## Support

For issues or questions:
1. Check logs: `pnpm run k8s:logs`
2. Review pod status: `pnpm run k8s:status`
3. Describe deployment: `pnpm run k8s:describe`
4. Contact DevOps team

## Appendix

### Function Endpoints

After deployment, functions are available at:

- `GET /health` - Health check
- `GET /healthz` - Liveness probe
- `GET /readyz` - Readiness probe
- `GET /metrics` - Prometheus metrics
- `POST /echo` - Echo test endpoint
- `GET /environment` - Environment summary

### Quick Reference Commands

```bash
# Build and deploy
pnpm run deploy:k8s

# Check status
pnpm run k8s:status

# View logs
pnpm run k8s:logs

# Restart deployment
pnpm run k8s:restart

# Scale deployment
kubectl scale deployment/functions-microservice -n cortex-dc --replicas=5

# Delete deployment
pnpm run k8s:delete
```

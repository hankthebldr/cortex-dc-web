# Kubernetes Deployment Guide for Cortex DC Platform

This guide provides comprehensive instructions for deploying the Cortex DC Platform to Kubernetes, optimized for scale and production readiness.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Local Validation with Docker Compose](#local-validation-with-docker-compose)
- [Kubernetes Deployment](#kubernetes-deployment)
  - [Using Kubectl + Kustomize](#using-kubectl--kustomize)
  - [Using Helm](#using-helm)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Scaling and Performance](#scaling-and-performance)
- [Monitoring and Observability](#monitoring-and-observability)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

```bash
# Kubernetes CLI
kubectl version --client

# Helm (for Helm deployment)
helm version

# Docker (for building images)
docker --version

# Docker Compose (for local testing)
docker-compose --version

# kustomize (for kustomize deployment)
kubectl kustomize --help
```

### Kubernetes Cluster Requirements

- **Kubernetes Version**: 1.26+
- **Node Resources**:
  - Minimum: 3 nodes with 4 CPU / 16GB RAM each
  - Recommended: 5+ nodes with 8 CPU / 32GB RAM each
- **Storage**: Support for `ReadWriteOnce` PersistentVolumes
- **Ingress Controller**: NGINX Ingress or GKE Ingress
- **LoadBalancer**: For exposing services externally

### GKE-Specific Requirements (if using Google Cloud)

```bash
# Authenticate with GCP
gcloud auth login
gcloud config set project cortex-dc-project

# Create GKE cluster
gcloud container clusters create cortex-dc-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --machine-type=n1-standard-4 \
  --enable-autoscaling \
  --min-nodes=3 \
  --max-nodes=10 \
  --enable-autorepair \
  --enable-autoupgrade

# Get cluster credentials
gcloud container clusters get-credentials cortex-dc-cluster --zone=us-central1-a
```

## Architecture Overview

The Cortex DC Platform consists of the following components:

### Application Services

1. **Web Application** (`cortex-web`)
   - Next.js 14 frontend
   - Port: 3000
   - Auto-scaling: 3-20 replicas
   - Health checks: `/api/health`, `/api/healthz`, `/api/readyz`

2. **Functions Microservice** (`functions-microservice`)
   - Node.js 22 backend
   - Port: 8080
   - Auto-scaling: 3-10 replicas
   - Health checks: `/health`, `/healthz`, `/readyz`

### Backing Services

3. **PostgreSQL** (`cortex-postgres`)
   - Database for Keycloak and application data
   - Port: 5432
   - StatefulSet with persistent storage

4. **Redis** (`redis`)
   - Caching layer
   - Port: 6379
   - StatefulSet with persistent storage

5. **MinIO** (`minio`)
   - S3-compatible object storage
   - Ports: 9000 (API), 9001 (Console)
   - StatefulSet with persistent storage

6. **Keycloak** (`keycloak`)
   - Authentication and authorization
   - Port: 8180
   - Deployment with 2+ replicas

### Monitoring (Optional)

7. **Prometheus** - Metrics collection
8. **Grafana** - Metrics visualization

## Local Validation with Docker Compose

Before deploying to Kubernetes, validate the complete stack locally:

### 1. Basic Stack (Web + Functions)

```bash
# Start basic services
docker-compose up -d

# Check service health
docker-compose ps
docker-compose logs -f web
docker-compose logs -f functions

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost:8081/health
```

### 2. Full Self-Hosted Stack

```bash
# Start full stack with backing services
docker-compose --profile full up -d

# Check all services
docker-compose --profile full ps

# Verify services are healthy
curl http://localhost:3000/api/readyz
curl http://localhost:8080/health  # API server
curl http://localhost:8081/health  # Functions
curl http://localhost:8180/health/ready  # Keycloak
curl http://localhost:9000/minio/health/live  # MinIO
```

### 3. With Monitoring

```bash
# Start with monitoring enabled
docker-compose --profile full --profile monitoring up -d

# Access monitoring dashboards
open http://localhost:9090  # Prometheus
open http://localhost:3001  # Grafana (admin/admin)
```

### 4. Test Scaling

```bash
# Scale specific services
docker-compose --profile full up -d --scale functions=3

# Verify scaling
docker-compose ps | grep functions
```

### 5. Cleanup

```bash
# Stop all services
docker-compose --profile full --profile monitoring down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v
```

## Kubernetes Deployment

### Option 1: Using Kubectl + Kustomize

#### Step 1: Create Namespace

```bash
kubectl create namespace cortex-dc
kubectl config set-context --current --namespace=cortex-dc
```

#### Step 2: Create Secrets

```bash
# Generate strong passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
MINIO_ROOT_PASSWORD=$(openssl rand -base64 32)
KEYCLOAK_ADMIN_PASSWORD=$(openssl rand -base64 32)

# Create secrets
kubectl create secret generic cortex-secrets \
  --from-literal=postgres-username='cortex' \
  --from-literal=postgres-password="$POSTGRES_PASSWORD" \
  --from-literal=redis-password="$REDIS_PASSWORD" \
  --from-literal=minio-root-user='minioadmin' \
  --from-literal=minio-root-password="$MINIO_ROOT_PASSWORD" \
  --from-literal=keycloak-admin-username='admin' \
  --from-literal=keycloak-admin-password="$KEYCLOAK_ADMIN_PASSWORD" \
  --from-literal=keycloak-client-secret='CHANGE_ME_AFTER_KEYCLOAK_SETUP' \
  --namespace=cortex-dc

# Save passwords securely (DO NOT commit to version control)
cat > .secrets <<EOF
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD
KEYCLOAK_ADMIN_PASSWORD=$KEYCLOAK_ADMIN_PASSWORD
EOF
chmod 600 .secrets
```

#### Step 3: Build and Push Docker Images

```bash
# Configure your container registry
export REGISTRY=gcr.io/cortex-dc-project  # Or your registry

# Build web image
docker build -f apps/web/Dockerfile -t $REGISTRY/cortex-web:latest .
docker push $REGISTRY/cortex-web:latest

# Build functions image
cd functions
docker build -t $REGISTRY/functions-microservice:latest .
docker push $REGISTRY/functions-microservice:latest
cd ..
```

#### Step 4: Deploy with Kustomize

```bash
# Review the deployment
kubectl kustomize kubernetes/ | less

# Apply the deployment
kubectl apply -k kubernetes/

# Watch rollout
kubectl get pods -w
```

#### Step 5: Deploy Functions Separately

```bash
# Functions have their own k8s directory
kubectl apply -k functions/k8s/
```

### Option 2: Using Helm

#### Step 1: Create Namespace and Secrets

```bash
kubectl create namespace cortex-dc

# Create secrets (same as above)
# ... (use the same secret creation commands)
```

#### Step 2: Customize Values

```bash
# Create custom values file
cat > helm-values-custom.yaml <<EOF
global:
  namespace: cortex-dc
  deploymentMode: self-hosted
  domain: your-domain.com
  imageRegistry: gcr.io/your-project

web:
  replicaCount: 5
  config:
    apiUrl: https://api.your-domain.com
    keycloakUrl: https://auth.your-domain.com

functions:
  replicaCount: 3

monitoring:
  enabled: true
  prometheus:
    enabled: true
  grafana:
    enabled: true
EOF
```

#### Step 3: Install with Helm

```bash
# Install the chart
helm install cortex-dc ./helm/cortex-dc \
  --namespace cortex-dc \
  --values helm-values-custom.yaml

# Check status
helm status cortex-dc --namespace cortex-dc

# Watch resources
kubectl get all -n cortex-dc
```

#### Step 4: Upgrade Deployment

```bash
# Update images or configuration
helm upgrade cortex-dc ./helm/cortex-dc \
  --namespace cortex-dc \
  --values helm-values-custom.yaml

# Rollback if needed
helm rollback cortex-dc --namespace cortex-dc
```

## Post-Deployment Configuration

### 1. Verify All Pods are Running

```bash
kubectl get pods -n cortex-dc
kubectl get svc -n cortex-dc
kubectl get ingress -n cortex-dc
```

### 2. Initialize MinIO Buckets

```bash
# Check if init job completed
kubectl get jobs -n cortex-dc

# If needed, run manually
kubectl run minio-init --rm -it --restart=Never \
  --image=minio/mc:latest \
  --namespace=cortex-dc \
  -- sh -c "mc alias set minio http://minio-api:9000 minioadmin YOUR_PASSWORD && \
    mc mb minio/cortex-documents && \
    mc mb minio/cortex-uploads && \
    mc mb minio/cortex-exports"
```

### 3. Configure Keycloak

```bash
# Get Keycloak admin password
kubectl get secret cortex-secrets -n cortex-dc \
  -o jsonpath='{.data.keycloak-admin-password}' | base64 -d

# Port-forward to access Keycloak UI
kubectl port-forward svc/keycloak 8180:8180 -n cortex-dc

# Open browser
open http://localhost:8180

# Configure:
# 1. Create 'cortex' realm
# 2. Create client 'cortex-web'
# 3. Create client 'cortex-api'
# 4. Configure client secrets and update cortex-secrets
```

### 4. Configure Ingress/Load Balancer

#### For GKE:

```bash
# Reserve static IP
gcloud compute addresses create cortex-web-ip --global

# Get IP address
gcloud compute addresses describe cortex-web-ip --global

# Update DNS records to point to this IP
# Then update ingress in kubernetes/web/ingress.yaml
```

#### For NGINX Ingress:

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Update ingress class in kubernetes/web/ingress.yaml to "nginx"
```

### 5. Configure SSL/TLS

#### For GKE (Managed Certificates):

```bash
# Certificates are automatically managed via ManagedCertificate resource
# Check status:
kubectl describe managedcertificate cortex-web-cert -n cortex-dc
```

#### For Cert-Manager:

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Update ingress with cert-manager annotations
```

## Scaling and Performance

### Horizontal Pod Autoscaling (HPA)

```bash
# Check HPA status
kubectl get hpa -n cortex-dc

# Manually scale (temporary)
kubectl scale deployment cortex-web --replicas=10 -n cortex-dc

# Update HPA limits
kubectl edit hpa cortex-web-hpa -n cortex-dc
```

### Vertical Pod Autoscaling (VPA)

```bash
# Install VPA (if not available)
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler
./hack/vpa-up.sh

# Create VPA for a deployment
kubectl apply -f - <<EOF
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: cortex-web-vpa
  namespace: cortex-dc
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cortex-web
  updatePolicy:
    updateMode: "Auto"
EOF
```

### Resource Optimization

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n cortex-dc

# Get resource requests/limits
kubectl describe deployment cortex-web -n cortex-dc | grep -A 5 Resources
```

## Monitoring and Observability

### Enable Prometheus + Grafana

```bash
# Deploy monitoring stack (if using Helm)
helm upgrade cortex-dc ./helm/cortex-dc \
  --namespace cortex-dc \
  --set monitoring.enabled=true \
  --set monitoring.prometheus.enabled=true \
  --set monitoring.grafana.enabled=true
```

### Access Monitoring Dashboards

```bash
# Prometheus
kubectl port-forward svc/prometheus 9090:9090 -n cortex-dc
open http://localhost:9090

# Grafana
kubectl port-forward svc/grafana 3001:3000 -n cortex-dc
open http://localhost:3001
# Login: admin / (get from secrets)
```

### Key Metrics to Monitor

1. **Application Metrics**
   - Request rate and latency
   - Error rate (4xx, 5xx)
   - Pod restarts
   - Resource utilization (CPU, memory)

2. **Infrastructure Metrics**
   - Node resource utilization
   - Disk I/O
   - Network throughput
   - Pod scheduling failures

3. **Business Metrics**
   - Active users
   - POV/TRR creation rate
   - API response times

### Logging

```bash
# View logs
kubectl logs -f deployment/cortex-web -n cortex-dc
kubectl logs -f deployment/functions-microservice -n cortex-dc

# Stream logs from all pods
kubectl logs -f -l app=cortex-web -n cortex-dc --all-containers=true

# For centralized logging, consider:
# - ELK Stack (Elasticsearch, Logstash, Kibana)
# - EFK Stack (Elasticsearch, Fluentd, Kibana)
# - Loki + Grafana
# - Cloud-native solutions (GCP Cloud Logging, AWS CloudWatch)
```

## Troubleshooting

### Common Issues

#### 1. Pods Not Starting

```bash
# Check pod status
kubectl get pods -n cortex-dc

# Describe pod for events
kubectl describe pod <pod-name> -n cortex-dc

# Check logs
kubectl logs <pod-name> -n cortex-dc --previous
```

#### 2. ImagePullBackOff

```bash
# Check image exists
docker pull gcr.io/cortex-dc-project/cortex-web:latest

# Verify image pull secrets (if needed)
kubectl get secrets -n cortex-dc
```

#### 3. CrashLoopBackOff

```bash
# Check application logs
kubectl logs <pod-name> -n cortex-dc

# Common causes:
# - Missing environment variables
# - Failed health checks
# - Application errors
# - Missing secrets/configmaps
```

#### 4. Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n cortex-dc

# Test service internally
kubectl run test --rm -it --restart=Never \
  --image=busybox \
  --namespace=cortex-dc \
  -- wget -O- http://cortex-web

# Check ingress
kubectl describe ingress cortex-web-ingress -n cortex-dc
```

#### 5. Database Connection Issues

```bash
# Check PostgreSQL is running
kubectl get pods -l app=postgres -n cortex-dc

# Test database connection
kubectl run psql --rm -it --restart=Never \
  --image=postgres:16-alpine \
  --namespace=cortex-dc \
  --env="PGPASSWORD=$POSTGRES_PASSWORD" \
  -- psql -h cortex-postgres -U cortex -d cortex -c '\dt'
```

#### 6. Out of Memory (OOM) Kills

```bash
# Check for OOM kills
kubectl get events -n cortex-dc | grep OOM

# Increase memory limits
kubectl edit deployment cortex-web -n cortex-dc
# Update resources.limits.memory
```

### Health Check Debugging

```bash
# Test health endpoints
kubectl run curl --rm -it --restart=Never \
  --image=curlimages/curl \
  --namespace=cortex-dc \
  -- curl -v http://cortex-web:80/api/health

# Check probe configuration
kubectl describe pod <pod-name> -n cortex-dc | grep -A 10 Probes
```

### Performance Debugging

```bash
# Profile CPU usage
kubectl top pods -n cortex-dc --containers

# Check slow queries (PostgreSQL)
kubectl exec -it postgres-0 -n cortex-dc -- \
  psql -U cortex -d cortex -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Check Redis stats
kubectl exec -it redis-0 -n cortex-dc -- redis-cli -a $REDIS_PASSWORD INFO stats
```

## Best Practices

### 1. Security

- ✅ Use strong, randomly generated passwords for all services
- ✅ Enable RBAC and principle of least privilege
- ✅ Use network policies to restrict pod-to-pod communication
- ✅ Enable pod security policies
- ✅ Scan images for vulnerabilities regularly
- ✅ Rotate secrets periodically
- ✅ Use TLS for all external communication

### 2. High Availability

- ✅ Run multiple replicas of stateless services (3+)
- ✅ Configure Pod Disruption Budgets
- ✅ Spread pods across multiple availability zones
- ✅ Use anti-affinity rules to avoid single points of failure
- ✅ Configure proper health checks
- ✅ Implement graceful shutdown handlers

### 3. Resource Management

- ✅ Set resource requests and limits for all containers
- ✅ Use HPA for automatic scaling
- ✅ Monitor resource usage and adjust as needed
- ✅ Use node affinity for workload placement
- ✅ Implement resource quotas per namespace

### 4. Disaster Recovery

- ✅ Regular backups of PostgreSQL data
- ✅ Regular backups of MinIO buckets
- ✅ Document recovery procedures
- ✅ Test disaster recovery regularly
- ✅ Use persistent volumes with snapshots
- ✅ Maintain infrastructure as code

### 5. CI/CD Integration

```bash
# Example GitHub Actions workflow
# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build and push images
        run: |
          docker build -t ${{ secrets.REGISTRY }}/cortex-web:${{ github.sha }} .
          docker push ${{ secrets.REGISTRY }}/cortex-web:${{ github.sha }}

      - name: Deploy to K8s
        run: |
          kubectl set image deployment/cortex-web \
            web=${{ secrets.REGISTRY }}/cortex-web:${{ github.sha }} \
            -n cortex-dc
```

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [GKE Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)
- [Project CLAUDE.md](./CLAUDE.md) - Development guide

## Support

For issues or questions:
1. Check the [troubleshooting section](#troubleshooting)
2. Review application logs
3. Open an issue in the project repository

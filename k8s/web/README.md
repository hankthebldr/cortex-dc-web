# Kubernetes Manifests for Cortex DC Web App

This directory contains Kubernetes manifests for deploying the Cortex DC web application to a Kubernetes cluster.

## Quick Start

### 1. Create Secrets

```bash
# Copy the template
cp secrets.yaml.template secrets.yaml

# Edit secrets.yaml and replace placeholder values
# DO NOT commit secrets.yaml to version control!
```

### 2. Update Configuration

Edit the following files to match your environment:

- `deployment.yaml`: Update `APP_BASE_URL` and `API_BASE_URL`
- `ingress.yaml`: Update domain name from `cortex.example.com` to your actual domain
- `serviceaccount.yaml`: Update GCP service account annotation if using GKE Workload Identity

### 3. Apply Manifests

```bash
# Create namespace first
kubectl apply -f namespace.yaml

# Apply all manifests
kubectl apply -f .

# Or use kustomize
kubectl apply -k .
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n cortex-dc

# Check services
kubectl get svc -n cortex-dc

# Check ingress
kubectl get ingress -n cortex-dc

# View logs
kubectl logs -n cortex-dc -l app=cortex-web --tail=100 -f

# Test health endpoints
kubectl port-forward -n cortex-dc svc/web-service 3000:80
curl http://localhost:3000/api/health
curl http://localhost:3000/api/healthz
curl http://localhost:3000/api/readyz
```

## Configuration

### Environment Variables

Required environment variables are configured in:
- `configmap.yaml` - Non-sensitive configuration
- `secrets.yaml` - Sensitive credentials (created from template)
- `deployment.yaml` - Deployment-specific overrides

### URLs Configuration

**IMPORTANT**: Update these URLs in `deployment.yaml`:

```yaml
- name: APP_BASE_URL
  value: "https://your-domain.com"  # Your public domain
- name: API_BASE_URL
  value: "http://functions-service/api"  # Internal API service URL
```

### TLS/SSL

The ingress is configured to use cert-manager for automatic TLS certificates:

```bash
# Install cert-manager (if not already installed)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
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
```

## Resource Management

### Scaling

The deployment uses Horizontal Pod Autoscaler (HPA) for automatic scaling:

- **Min replicas**: 3
- **Max replicas**: 10
- **CPU target**: 70%
- **Memory target**: 80%

To manually scale:

```bash
kubectl scale deployment/web-app -n cortex-dc --replicas=5
```

### Resource Limits

Current resource configuration per pod:

- **Requests**: 500m CPU, 512Mi memory
- **Limits**: 1000m CPU, 1Gi memory

Adjust in `deployment.yaml` based on your workload.

## Health Checks

The deployment uses three types of probes:

1. **Startup Probe** (`/api/health`): Checks if container has started
2. **Liveness Probe** (`/api/healthz`): Restarts container if unhealthy
3. **Readiness Probe** (`/api/readyz`): Removes pod from service if not ready

## Monitoring

### Prometheus Metrics

The pods are annotated for Prometheus scraping:

```yaml
prometheus.io/scrape: "true"
prometheus.io/port: "3000"
prometheus.io/path: "/api/metrics"
```

### Viewing Metrics

```bash
# Port forward and access metrics
kubectl port-forward -n cortex-dc svc/web-service 3000:80
curl http://localhost:3000/api/metrics
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n cortex-dc

# View pod events
kubectl describe pod <pod-name> -n cortex-dc

# Check logs
kubectl logs <pod-name> -n cortex-dc

# Check if secrets exist
kubectl get secrets -n cortex-dc
```

### Ingress Not Working

```bash
# Check ingress status
kubectl describe ingress web-ingress -n cortex-dc

# Verify ingress controller is running
kubectl get pods -n ingress-nginx

# Check TLS certificate
kubectl get certificate -n cortex-dc
kubectl describe certificate cortex-web-tls -n cortex-dc
```

### Performance Issues

```bash
# Check resource usage
kubectl top pods -n cortex-dc

# Check HPA status
kubectl get hpa -n cortex-dc
kubectl describe hpa web-hpa -n cortex-dc

# View detailed metrics
kubectl get --raw /apis/metrics.k8s.io/v1beta1/namespaces/cortex-dc/pods
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k .

# Or delete individual resources
kubectl delete -f .

# Delete namespace (WARNING: This deletes everything in the namespace)
kubectl delete namespace cortex-dc
```

## Advanced Configuration

### Using Kustomize Overlays

Create environment-specific overlays:

```bash
mkdir -p overlays/dev overlays/staging overlays/prod

# overlays/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
bases:
- ../../base
patchesStrategicMerge:
- deployment-patch.yaml
images:
- name: gcr.io/cortex-dc-project/cortex-web
  newTag: v1.0.0
```

Deploy with:

```bash
kubectl apply -k overlays/prod
```

### Blue-Green Deployment

1. Deploy new version with different label
2. Test new version
3. Update service selector to point to new version
4. Remove old deployment

### Canary Deployment

Use a service mesh like Istio or configure weighted routing in your ingress controller.

## Security

### Pod Security

Pods are configured with security best practices:

- Run as non-root user (UID 1001)
- Read-only root filesystem (where possible)
- Drop all capabilities
- seccomp profile enabled

### Network Policies

Consider adding NetworkPolicies to restrict pod-to-pod communication:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-network-policy
  namespace: cortex-dc
spec:
  podSelector:
    matchLabels:
      app: cortex-web
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
```

## Further Reading

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)

# Firebase Functions Microservice

Cortex DC Firebase Functions deployed as a standalone Kubernetes microservice.

## Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Run development server
pnpm run server:dev

# Test endpoints
curl http://localhost:8080/health
```

### Docker Development

```bash
# Create environment file
cp .env.docker.template .env.docker
# Edit .env.docker with your values

# Build image
pnpm run docker:build

# Run container
pnpm run docker:run

# Test
curl http://localhost:8080/health
```

### Kubernetes Deployment

```bash
# Build and deploy to K8s
pnpm run deploy:k8s

# Check status
pnpm run k8s:status

# View logs
pnpm run k8s:logs
```

## Project Structure

```
functions/
├── src/
│   ├── index.ts              # Firebase Functions handlers
│   ├── server.ts             # Express server wrapper
│   ├── genkit-sample.ts      # Genkit AI integration
│   └── dataconnect-generated/
├── k8s/                      # Kubernetes manifests
│   ├── deployment.yaml       # Deployment configuration
│   ├── service.yaml          # Service definitions
│   ├── configmap.yaml        # Configuration
│   ├── secrets.yaml.template # Secrets template
│   ├── hpa.yaml              # Horizontal Pod Autoscaler
│   ├── serviceaccount.yaml   # RBAC configuration
│   ├── namespace.yaml        # Namespace definition
│   └── kustomization.yaml    # Kustomize configuration
├── Dockerfile                # Container image definition
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── KUBERNETES_DEPLOYMENT.md  # Detailed deployment guide
```

## Available Scripts

### Development
- `pnpm run build` - Compile TypeScript
- `pnpm run build:watch` - Watch mode compilation
- `pnpm run server` - Run production server
- `pnpm run server:dev` - Run development server with watch mode
- `pnpm run lint` - Lint code

### Firebase (Legacy)
- `pnpm run serve` - Run Firebase emulator
- `pnpm run deploy` - Deploy to Firebase Functions

### Docker
- `pnpm run docker:build` - Build Docker image (latest tag)
- `pnpm run docker:build:tag` - Build with git commit tag
- `pnpm run docker:push` - Push image to registry
- `pnpm run docker:push:tag` - Push with git commit tag
- `pnpm run docker:run` - Run container locally

### Kubernetes
- `pnpm run k8s:apply` - Deploy to K8s cluster
- `pnpm run k8s:delete` - Delete K8s resources
- `pnpm run k8s:restart` - Restart deployment
- `pnpm run k8s:status` - Check pod status
- `pnpm run k8s:logs` - View logs
- `pnpm run k8s:describe` - Describe deployment
- `pnpm run deploy:k8s` - Full deployment (build + push + restart)

### Genkit AI
- `pnpm run genkit:start` - Start Genkit development server

## Endpoints

### Health Checks
- `GET /health` - Basic health check
- `GET /healthz` - Kubernetes liveness probe
- `GET /readyz` - Kubernetes readiness probe

### Monitoring
- `GET /metrics` - Prometheus metrics

### Functions
- `POST /echo` - Echo test endpoint
- `GET /environment` - Environment configuration summary

## Configuration

### Environment Variables

Required environment variables:

```bash
NODE_ENV=production          # Environment (development|production)
PORT=8080                    # Server port
HOST=0.0.0.0                # Server host

# GCP/Firebase
GOOGLE_CLOUD_PROJECT=...     # GCP project ID
FIREBASE_PROJECT_ID=...      # Firebase project ID
FIREBASE_DATABASE_URL=...    # Firebase database URL
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

# Genkit AI
GOOGLE_GENAI_API_KEY=...     # Google Generative AI API key

# Optional
CORS_ORIGIN=...              # Allowed CORS origins
LOG_LEVEL=info               # Logging level
APP_VERSION=1.0.0            # Application version
```

### Kubernetes Configuration

- **ConfigMap**: Non-sensitive configuration (see `k8s/configmap.yaml`)
- **Secrets**: Sensitive data (see `k8s/secrets.yaml.template`)

## Deployment

### Prerequisites

- Docker (v20+)
- kubectl (v1.28+)
- Node.js 22
- pnpm
- Access to GCP/GCR

### Quick Deploy

```bash
# Authenticate with GCP
gcloud auth login
gcloud config set project cortex-dc-project
gcloud auth configure-docker gcr.io

# Get K8s credentials
gcloud container clusters get-credentials cortex-dc-cluster --region us-central1

# Create secrets (first time only)
cd k8s
cp secrets.yaml.template secrets.yaml
# Edit secrets.yaml with actual values
kubectl apply -f secrets.yaml
cd ..

# Deploy
pnpm run deploy:k8s
```

See [KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md) for detailed deployment guide.

## Architecture

### Migration Strategy

This microservice converts Firebase Cloud Functions to a standalone Express server that runs in Kubernetes:

1. **Firebase Functions** (`src/index.ts`) - Original function handlers
2. **Express Server** (`src/server.ts`) - HTTP server wrapper
3. **Docker Container** - Containerized application
4. **Kubernetes** - Orchestration and scaling

### Benefits

- **Portability**: Run anywhere (K8s, Docker, bare metal)
- **Scalability**: Horizontal pod autoscaling
- **Reliability**: Health checks, rolling updates, self-healing
- **Observability**: Prometheus metrics, structured logging
- **Cost**: More control over resource allocation

## Monitoring

### Logs

```bash
# Follow logs
pnpm run k8s:logs

# Specific pod
kubectl logs -n cortex-dc <pod-name>
```

### Metrics

```bash
# Pod resource usage
kubectl top pods -n cortex-dc -l app=functions

# Access metrics endpoint
curl http://<service-ip>/metrics
```

### Health Checks

```bash
# Health check
curl http://<service-ip>/health

# Liveness probe
curl http://<service-ip>/healthz

# Readiness probe
curl http://<service-ip>/readyz
```

## Troubleshooting

### Pod not starting

```bash
kubectl get pods -n cortex-dc -l app=functions
kubectl describe pod <pod-name> -n cortex-dc
kubectl logs <pod-name> -n cortex-dc
```

### Connection issues

```bash
# Port forward for testing
kubectl port-forward -n cortex-dc svc/functions-service 8080:80
curl http://localhost:8080/health
```

### Configuration issues

```bash
# Check ConfigMap
kubectl get configmap functions-config -n cortex-dc -o yaml

# Check Secrets
kubectl get secret functions-secrets -n cortex-dc -o yaml
```

## Development Workflow

1. Make changes to `src/` files
2. Test locally: `pnpm run server:dev`
3. Build: `pnpm run build`
4. Test with Docker: `pnpm run docker:build && pnpm run docker:run`
5. Deploy to K8s: `pnpm run deploy:k8s`
6. Monitor: `pnpm run k8s:logs`

## CI/CD

The functions microservice can be automatically deployed on push to main:

```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Functions
on:
  push:
    branches: [main]
    paths: ['functions/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy
        run: cd functions && pnpm run deploy:k8s
```

## Security

- Non-root container user (nodejs:1001)
- Secrets stored in Kubernetes Secrets
- RBAC configured
- Resource limits enforced
- Network policies (optional)
- Security context applied

## Support

For detailed information, see:
- [KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md) - Complete deployment guide
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Firebase Functions](https://firebase.google.com/docs/functions)

## License

Private - Cortex DC Internal Use Only

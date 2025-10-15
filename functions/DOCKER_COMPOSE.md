# Docker Compose Local Testing

This directory contains Docker Compose configurations for local testing and development.

## Quick Start

### Basic Setup

```bash
# 1. Create environment file
cp .env.docker.template .env.docker
# Edit .env.docker with your values

# 2. Start services
docker-compose up

# 3. Test endpoints
curl http://localhost:8080/health
```

### With Monitoring (Prometheus + Grafana)

```bash
# Start with monitoring stack
docker-compose --profile monitoring up

# Access services:
# - Functions: http://localhost:8080
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3000 (admin/admin)
```

### Development Mode

```bash
# Start with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Changes to src/ will automatically reload the server
```

## Services

### Functions Microservice

- **Port**: 8080
- **Health Check**: http://localhost:8080/health
- **Metrics**: http://localhost:8080/metrics
- **Logs**: `docker-compose logs -f functions`

### Prometheus (Optional)

- **Port**: 9090
- **UI**: http://localhost:9090
- **Targets**: http://localhost:9090/targets
- **Profile**: monitoring

### Grafana (Optional)

- **Port**: 3000
- **UI**: http://localhost:3000
- **Default Login**: admin / admin
- **Profile**: monitoring

## Commands

### Start Services

```bash
# Start in foreground
docker-compose up

# Start in background (detached)
docker-compose up -d

# Start with monitoring
docker-compose --profile monitoring up -d

# Start development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Stop Services

```bash
# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f functions

# Last 100 lines
docker-compose logs --tail=100 functions
```

### Rebuild

```bash
# Rebuild and restart
docker-compose up --build

# Force rebuild (no cache)
docker-compose build --no-cache
docker-compose up
```

### Service Management

```bash
# Restart service
docker-compose restart functions

# Stop specific service
docker-compose stop functions

# Start specific service
docker-compose start functions

# Scale service (multiple instances)
docker-compose up --scale functions=3
```

## Configuration

### Environment Variables

Edit `.env.docker`:

```bash
NODE_ENV=production
PORT=8080
GOOGLE_CLOUD_PROJECT=your-project-id
FIREBASE_PROJECT_ID=your-firebase-project
GOOGLE_GENAI_API_KEY=your-api-key
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### Service Account Key

For local testing with Firebase Admin:

1. Download service account key from Firebase Console
2. Save as `service-account-key.json`
3. Uncomment volume mount in `docker-compose.yml`:

```yaml
volumes:
  - ./service-account-key.json:/var/secrets/google/key.json:ro
```

### Prometheus Configuration

Edit `monitoring/prometheus.yml` to add more scrape targets:

```yaml
scrape_configs:
  - job_name: 'functions'
    static_configs:
      - targets: ['functions:8080']
```

### Grafana Dashboards

Add custom dashboards to `monitoring/grafana/dashboards/`.

## Testing

### Manual Testing

```bash
# Start services
docker-compose up -d

# Health check
curl http://localhost:8080/health

# Echo test
curl -X POST http://localhost:8080/echo \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# Environment info
curl http://localhost:8080/environment

# Metrics
curl http://localhost:8080/metrics
```

### Automated Testing

```bash
# Run test script
./scripts/docker-test.sh
```

## Development Workflow

### Option 1: Hot Reload with Docker Compose

```bash
# Start in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Edit files in src/
# Server automatically reloads on changes
```

### Option 2: Local Development

```bash
# Run locally without Docker
./scripts/local-test.sh

# Or manually:
pnpm run build:watch  # Terminal 1
pnpm run server:dev   # Terminal 2
```

## Monitoring

### View Metrics in Prometheus

1. Start with monitoring: `docker-compose --profile monitoring up -d`
2. Open Prometheus: http://localhost:9090
3. Try queries:
   - `functions_up` - Service status
   - `functions_requests_total` - Request count
   - `rate(functions_requests_total[5m])` - Request rate

### View Metrics in Grafana

1. Open Grafana: http://localhost:3000
2. Login: admin / admin
3. Data source is auto-configured (Prometheus)
4. Create dashboard or import existing

### View Logs

```bash
# Follow logs
docker-compose logs -f functions

# Filter by level (if structured logging)
docker-compose logs functions | grep ERROR

# Export logs
docker-compose logs --no-color functions > functions.log
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs functions

# Check environment
docker-compose config

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Port Already in Use

```bash
# Change port in docker-compose.yml
ports:
  - "8081:8080"  # Use 8081 instead

# Or stop conflicting service
lsof -ti:8080 | xargs kill
```

### Permission Issues

```bash
# Fix ownership (if needed)
sudo chown -R $USER:$USER .

# Clear volumes
docker-compose down -v
```

### Health Check Failing

```bash
# Check service is responding
docker-compose exec functions curl http://localhost:8080/health

# Check container logs
docker-compose logs functions

# Restart service
docker-compose restart functions
```

### Memory Issues

```bash
# Check resource usage
docker stats

# Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 1G
```

## Production Considerations

⚠️ **Do not use docker-compose for production deployments**

Use Kubernetes manifests in `k8s/` directory instead.

Docker Compose is designed for:
- ✅ Local development
- ✅ Integration testing
- ✅ CI/CD testing
- ❌ Production deployments (use Kubernetes)

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker-compose down -v --rmi all --remove-orphans
docker system prune -a
```

## Next Steps

After local testing:

1. **Test passed** → Deploy to Kubernetes:
   ```bash
   pnpm run deploy:k8s
   ```

2. **Issues found** → Debug and fix:
   - Check logs: `docker-compose logs -f functions`
   - Shell access: `docker-compose exec functions sh`
   - Rebuild: `docker-compose up --build`

## Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

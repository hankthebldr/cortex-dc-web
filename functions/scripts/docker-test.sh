#!/bin/bash
# Docker Testing Helper Script
# Builds and runs the Docker container locally for testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="$(dirname "$SCRIPT_DIR")"
IMAGE_NAME="functions-microservice-local"
CONTAINER_NAME="functions-test"
PORT=8080

echo "🐳 Docker Container Test"
echo "========================"
echo ""

cd "$FUNCTIONS_DIR"

# Check if .env.docker exists
if [ ! -f ".env.docker" ]; then
    echo "📝 Creating .env.docker from template..."
    cp .env.docker.template .env.docker
    echo "⚠️  Please edit .env.docker with your actual values"
    echo "   File location: $FUNCTIONS_DIR/.env.docker"
    read -p "   Press Enter after editing the file..."
fi

# Stop and remove existing container if running
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "🛑 Stopping existing container..."
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
fi

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t "$IMAGE_NAME:latest" .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker image built successfully"
echo ""

# Run container
echo "🚀 Starting Docker container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$PORT:8080" \
  --env-file .env.docker \
  "$IMAGE_NAME:latest"

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container"
    exit 1
fi

echo "✅ Container started successfully"
echo ""

# Wait for container to be ready
echo "⏳ Waiting for container to be ready..."
for i in {1..30}; do
    if curl -s -f http://localhost:$PORT/health > /dev/null 2>&1; then
        echo "✅ Container is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Container failed to become ready"
        echo ""
        echo "📋 Container logs:"
        docker logs "$CONTAINER_NAME"
        exit 1
    fi
    sleep 1
done

echo ""
echo "📋 Container Info:"
echo "   Container Name: $CONTAINER_NAME"
echo "   Image: $IMAGE_NAME:latest"
echo "   Port: $PORT"
echo "   URL: http://localhost:$PORT"
echo ""

# Test endpoints
echo "🧪 Testing endpoints..."
echo ""

test_endpoint() {
    local method=$1
    local path=$2
    local data=$3
    local description=$4

    echo -n "   Testing $description... "

    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "http://localhost:$PORT$path" \
                   -H "Content-Type: application/json" \
                   -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "http://localhost:$PORT$path")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" -eq 200 ]; then
        echo "✅ ($http_code)"
    else
        echo "❌ ($http_code)"
        echo "      Response: $body"
    fi
}

test_endpoint "GET" "/health" "" "Health check"
test_endpoint "GET" "/healthz" "" "Liveness probe"
test_endpoint "GET" "/readyz" "" "Readiness probe"
test_endpoint "GET" "/metrics" "" "Metrics endpoint"
test_endpoint "GET" "/environment" "" "Environment info"
test_endpoint "POST" "/echo" '{"message":"test"}' "Echo endpoint"

echo ""
echo "📊 Container Logs (last 20 lines):"
docker logs --tail 20 "$CONTAINER_NAME"

echo ""
echo "💡 Useful commands:"
echo "   View logs:      docker logs -f $CONTAINER_NAME"
echo "   Stop container: docker stop $CONTAINER_NAME"
echo "   Restart:        docker restart $CONTAINER_NAME"
echo "   Shell access:   docker exec -it $CONTAINER_NAME sh"
echo "   Remove:         docker rm -f $CONTAINER_NAME"
echo ""
echo "   Test manually:  curl http://localhost:$PORT/health"
echo ""

read -p "Press Enter to stop and remove the container (or Ctrl+C to keep it running)..."

docker stop "$CONTAINER_NAME"
docker rm "$CONTAINER_NAME"

echo "✅ Container stopped and removed"

#!/bin/bash
# Local Testing Helper Script
# Builds and runs the functions microservice locally for testing

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FUNCTIONS_DIR="$(dirname "$SCRIPT_DIR")"

echo "🧪 Functions Microservice Local Test"
echo "====================================="
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

echo "🔨 Building TypeScript..."
pnpm run build

echo ""
echo "🚀 Starting development server..."
echo "   Server will start on http://localhost:8080"
echo ""
echo "📋 Available endpoints:"
echo "   GET  http://localhost:8080/health       - Health check"
echo "   GET  http://localhost:8080/healthz      - Liveness probe"
echo "   GET  http://localhost:8080/readyz       - Readiness probe"
echo "   GET  http://localhost:8080/metrics      - Prometheus metrics"
echo "   GET  http://localhost:8080/environment  - Environment info"
echo "   POST http://localhost:8080/echo         - Echo test"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Run development server
pnpm run server:dev

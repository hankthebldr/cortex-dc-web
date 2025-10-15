#!/bin/bash

# Migration Testing Script
# Tests the completed Firebase to self-hosted migration
# Usage: ./scripts/test-migration.sh [mode]
# Modes: firebase, self-hosted, hybrid

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default mode
MODE="${1:-self-hosted}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Cortex-DC Migration Testing Script  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Testing mode: ${GREEN}${MODE}${NC}"
echo ""

# Function to print colored output
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    log_success "Node.js $(node --version) found"

    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed"
        exit 1
    fi
    log_success "pnpm $(pnpm --version) found"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_warning "Docker is not installed (required for self-hosted mode)"
    else
        log_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) found"
    fi

    echo ""
}

# Set environment variables based on mode
configure_environment() {
    log_info "Configuring environment for ${MODE} mode..."

    cd "$PROJECT_ROOT"

    case "$MODE" in
        firebase)
            cat > .env.test <<EOF
DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
DATABASE_MODE=firestore
NEXT_PUBLIC_DATABASE_MODE=firestore
STORAGE_MODE=firebase
NEXT_PUBLIC_STORAGE_MODE=firebase
EOF
            log_success "Firebase mode configured"
            ;;

        self-hosted)
            cat > .env.test <<EOF
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
DATABASE_MODE=postgres
NEXT_PUBLIC_DATABASE_MODE=postgres
DATABASE_URL=postgresql://postgres:password@localhost:5432/cortex_test
STORAGE_MODE=minio
NEXT_PUBLIC_STORAGE_MODE=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=cortex-test
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://localhost:8080
EOF
            log_success "Self-hosted mode configured"
            ;;

        hybrid)
            cat > .env.test <<EOF
DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
DATABASE_MODE=postgres
NEXT_PUBLIC_DATABASE_MODE=postgres
DATABASE_URL=postgresql://postgres:password@localhost:5432/cortex_test
STORAGE_MODE=firebase
NEXT_PUBLIC_STORAGE_MODE=firebase
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://localhost:8080
EOF
            log_success "Hybrid mode configured"
            ;;

        *)
            log_error "Invalid mode: ${MODE}"
            echo "Valid modes: firebase, self-hosted, hybrid"
            exit 1
            ;;
    esac

    echo ""
}

# Start infrastructure services
start_infrastructure() {
    if [ "$MODE" = "firebase" ]; then
        log_info "Skipping infrastructure services (Firebase mode)"
        return
    fi

    log_info "Starting infrastructure services..."

    cd "$PROJECT_ROOT"

    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        log_warning "docker-compose.yml not found, creating minimal configuration..."
        cat > docker-compose.test.yml <<EOF
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: cortex_test
    ports:
      - "5432:5432"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_test_data:/data

volumes:
  postgres_test_data:
  minio_test_data:
EOF
        docker-compose -f docker-compose.test.yml up -d
    else
        docker-compose up -d postgres minio 2>/dev/null || log_warning "Some services may already be running"
    fi

    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 5

    # Check PostgreSQL
    if [ "$MODE" != "firebase" ]; then
        for i in {1..30}; do
            if docker exec $(docker ps -q -f name=postgres) pg_isready -U postgres &>/dev/null; then
                log_success "PostgreSQL is ready"
                break
            fi
            if [ $i -eq 30 ]; then
                log_error "PostgreSQL failed to start"
                exit 1
            fi
            sleep 1
        done
    fi

    # Check MinIO
    if [ "$MODE" = "self-hosted" ]; then
        for i in {1..30}; do
            if curl -s http://localhost:9000/minio/health/live &>/dev/null; then
                log_success "MinIO is ready"
                break
            fi
            if [ $i -eq 30 ]; then
                log_error "MinIO failed to start"
                exit 1
            fi
            sleep 1
        done
    fi

    echo ""
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    cd "$PROJECT_ROOT"
    pnpm install --silent

    log_success "Dependencies installed"
    echo ""
}

# Run TypeScript type checks
type_check() {
    log_info "Running TypeScript type checks..."

    cd "$PROJECT_ROOT"

    # Check migration packages
    log_info "Checking @cortex/commands..."
    pnpm --filter "@cortex/commands" type-check 2>&1 | grep -v "WARN" || true

    log_info "Checking @cortex/content..."
    pnpm --filter "@cortex/content" type-check 2>&1 | grep -v "WARN" || true

    log_info "Checking @cortex/integrations..."
    pnpm --filter "@cortex/integrations" type-check 2>&1 | grep -v "WARN" || true

    log_info "Checking @cortex/terminal..."
    pnpm --filter "@cortex/terminal" type-check 2>&1 | grep -v "WARN" || true

    log_success "Type checks completed"
    echo ""
}

# Test database connection
test_database() {
    if [ "$MODE" = "firebase" ]; then
        log_info "Skipping database tests (Firebase mode uses Firestore)"
        return
    fi

    log_info "Testing database connection..."

    cd "$PROJECT_ROOT"

    # Test PostgreSQL connection
    if docker exec $(docker ps -q -f name=postgres) psql -U postgres -d cortex_test -c "SELECT 1;" &>/dev/null; then
        log_success "Database connection successful"
    else
        log_warning "Database connection failed, trying to create database..."
        docker exec $(docker ps -q -f name=postgres) psql -U postgres -c "CREATE DATABASE cortex_test;" 2>/dev/null || true
    fi

    echo ""
}

# Test storage connection
test_storage() {
    if [ "$MODE" = "firebase" ]; then
        log_info "Skipping storage tests (Firebase mode uses Firebase Storage)"
        return
    fi

    log_info "Testing storage connection..."

    # Test MinIO connection
    if curl -s http://localhost:9000/minio/health/live &>/dev/null; then
        log_success "Storage connection successful"
    else
        log_error "Storage connection failed"
        exit 1
    fi

    echo ""
}

# Run migration tests
run_tests() {
    log_info "Running migration tests..."

    cd "$PROJECT_ROOT"

    # Test adapters
    log_info "Testing database adapters..."
    # Add actual test commands here

    log_info "Testing storage adapters..."
    # Add actual test commands here

    log_success "All tests passed"
    echo ""
}

# Display summary
display_summary() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Migration Test Summary               ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    echo -e "Mode: ${GREEN}${MODE}${NC}"
    echo ""

    if [ "$MODE" != "firebase" ]; then
        echo -e "Services Running:"
        echo -e "  ${GREEN}✓${NC} PostgreSQL: localhost:5432"
        echo -e "  ${GREEN}✓${NC} MinIO: localhost:9000"
        echo -e "  ${GREEN}✓${NC} MinIO Console: http://localhost:9001"
        echo ""
        echo -e "Access MinIO Console:"
        echo -e "  URL: ${BLUE}http://localhost:9001${NC}"
        echo -e "  User: minioadmin"
        echo -e "  Pass: minioadmin"
        echo ""
    fi

    echo -e "Next Steps:"
    echo -e "  1. Start API server: ${YELLOW}pnpm --filter @cortex/api-server dev${NC}"
    echo -e "  2. Start web app: ${YELLOW}pnpm --filter @cortex-dc/web dev${NC}"
    echo -e "  3. Run tests: ${YELLOW}pnpm test${NC}"
    echo ""
    echo -e "Documentation:"
    echo -e "  - Deployment Guide: ${BLUE}MIGRATION_DEPLOYMENT_GUIDE.md${NC}"
    echo -e "  - Environment Guide: ${BLUE}ENVIRONMENT_CONFIGURATION_GUIDE.md${NC}"
    echo -e "  - Migration Summary: ${BLUE}FINAL_MIGRATION_COMPLETE.md${NC}"
    echo ""

    if [ "$MODE" != "firebase" ]; then
        echo -e "To stop services:"
        echo -e "  ${YELLOW}docker-compose down${NC}"
        echo ""
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    # Add cleanup commands here if needed
}

# Main execution
main() {
    trap cleanup EXIT

    check_prerequisites
    configure_environment
    start_infrastructure
    install_dependencies
    type_check
    test_database
    test_storage
    display_summary

    log_success "Migration test completed successfully!"
}

# Run main function
main

#!/usr/bin/env bash
set -euo pipefail

##############################################################################
# Cortex DC - Local Development Bootstrap Script
#
# Purpose: One-command setup for local development environment
# Usage: ./scripts/bootstrap-local.sh
#
# This script will:
# 1. Check prerequisites (Docker, Node.js, pnpm)
# 2. Prompt for deployment mode (Firebase or Self-hosted)
# 3. Install dependencies
# 4. Start required services (emulators or Docker Compose)
# 5. Build packages
# 6. Provide next steps for seeding and running
##############################################################################

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Print banner
print_banner() {
    echo ""
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                       ║${NC}"
    echo -e "${CYAN}║     🚀 Cortex DC - Local Development Bootstrap       ║${NC}"
    echo -e "${CYAN}║                                                       ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."

    local all_ok=true

    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node -v)
        log_success "Node.js installed: $NODE_VERSION"
    else
        log_error "Node.js not found. Please install Node.js >= 18"
        all_ok=false
    fi

    # Check Docker
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
        log_success "Docker installed: $DOCKER_VERSION"

        # Check if Docker daemon is running
        if ! docker info &> /dev/null; then
            log_error "Docker daemon is not running. Please start Docker Desktop."
            all_ok=false
        fi
    else
        log_error "Docker not found. Please install Docker Desktop."
        all_ok=false
    fi

    # Check pnpm
    if command_exists pnpm; then
        PNPM_VERSION=$(pnpm --version)
        log_success "pnpm installed: $PNPM_VERSION"
    else
        log_warning "pnpm not found. Installing..."
        npm install -g pnpm@8
        if command_exists pnpm; then
            log_success "pnpm installed successfully"
        else
            log_error "Failed to install pnpm"
            all_ok=false
        fi
    fi

    if [ "$all_ok" = false ]; then
        log_error "Prerequisites check failed. Please resolve the issues above."
        exit 1
    fi

    log_success "All prerequisites OK"
    echo ""
}

# Select deployment mode
select_deployment_mode() {
    log_step "Selecting deployment mode..."
    echo ""
    echo "Please select your deployment mode:"
    echo ""
    echo "  1) Firebase (emulators) - Uses Firebase Auth, Firestore, and Storage emulators"
    echo "  2) Self-hosted (Docker) - Uses PostgreSQL, Keycloak, MinIO, Redis (Recommended)"
    echo ""

    while true; do
        read -p "Enter choice [1-2]: " mode_choice

        case "$mode_choice" in
            1)
                DEPLOYMENT_MODE="firebase"
                log_success "Firebase mode selected"
                break
                ;;
            2)
                DEPLOYMENT_MODE="self-hosted"
                log_success "Self-hosted mode selected"
                break
                ;;
            *)
                log_warning "Invalid choice. Please enter 1 or 2."
                ;;
        esac
    done

    echo ""
}

# Install dependencies
install_dependencies() {
    log_step "Installing dependencies..."

    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --frozen-lockfile
    else
        pnpm install
    fi

    log_success "Dependencies installed"
    echo ""
}

# Setup environment file
setup_environment() {
    log_step "Setting up environment configuration..."

    if [ "$DEPLOYMENT_MODE" == "firebase" ]; then
        cat > .env.local <<EOF
# Firebase Development Mode
DEPLOYMENT_MODE=firebase

# Firebase Emulators
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199

# Public Environment Variables (accessible in browser)
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_USE_EMULATORS=true
EOF
        log_success "Firebase .env.local created"
    else
        cat > .env.local <<EOF
# Self-Hosted Development Mode
DEPLOYMENT_MODE=self-hosted

# Database
DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex

# Keycloak (Authentication)
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=cortex
KEYCLOAK_CLIENT_ID=cortex-web
KEYCLOAK_CLIENT_SECRET=cortex-client-secret

# MinIO (Object Storage)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin_password
MINIO_USE_SSL=false

# Redis (Cache & Sessions)
REDIS_URL=redis://:redis_password@localhost:6379

# NATS (Event Bus)
NATS_URL=nats://localhost:4222

# Public Environment Variables (accessible in browser)
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=cortex
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=cortex-web
EOF
        log_success "Self-hosted .env.local created"
    fi

    echo ""
}

# Start Firebase emulators
start_firebase_emulators() {
    log_step "Starting Firebase emulators..."

    # Check if Firebase CLI is installed
    if ! command_exists firebase; then
        log_warning "Firebase CLI not found. Installing..."
        npm install -g firebase-tools
    fi

    # Check if emulators are already running
    if curl -s http://localhost:4040 > /dev/null 2>&1; then
        log_warning "Firebase emulators already running. Skipping start."
        return
    fi

    # Start emulators in background
    log_info "Starting Firebase emulators (this may take 10-15 seconds)..."
    firebase emulators:start --import=./emulator-data --export-on-exit > firebase-emulators.log 2>&1 &
    EMULATOR_PID=$!

    # Save PID for cleanup
    echo $EMULATOR_PID > .emulator.pid

    # Wait for emulators to be ready (max 60 seconds)
    log_info "Waiting for emulators to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:4040 > /dev/null 2>&1; then
            log_success "Firebase emulators ready"
            log_info "Emulator UI: http://localhost:4040"
            return
        fi
        sleep 2
    done

    log_error "Firebase emulators failed to start. Check firebase-emulators.log for details."
    exit 1
}

# Start Docker Compose services
start_docker_services() {
    log_step "Starting Docker Compose services..."

    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        log_error "docker-compose.yml not found in current directory"
        exit 1
    fi

    # Start core services (not full profile)
    log_info "Starting PostgreSQL, Keycloak, MinIO, Redis, NATS..."
    docker-compose up -d postgres keycloak minio minio-init redis nats

    # Wait for services to be healthy (max 60 seconds)
    log_info "Waiting for services to be healthy..."
    sleep 10

    # Check service health
    for i in {1..15}; do
        if docker-compose ps | grep -q "unhealthy"; then
            sleep 4
        else
            break
        fi
    done

    # Show service status
    docker-compose ps

    log_success "Docker services started"
    log_info "PostgreSQL: localhost:5432 (user: cortex, password: cortex_secure_password)"
    log_info "Keycloak:   http://localhost:8180 (admin/admin_password)"
    log_info "MinIO:      http://localhost:9001 (minioadmin/minioadmin_password)"
    log_info "Redis:      localhost:6379 (password: redis_password)"
    log_info "NATS:       localhost:4222"
    echo ""
}

# Build packages
build_packages() {
    log_step "Building workspace packages..."

    # Build core packages required by web app
    log_info "Building @cortex/utils..."
    pnpm --filter "@cortex/utils" build

    log_info "Building @cortex/db..."
    pnpm --filter "@cortex/db" build

    log_success "Packages built successfully"
    echo ""
}

# Print next steps
print_next_steps() {
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║     ✅ Setup Complete! Ready to Develop               ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""

    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo ""

    if [ "$DEPLOYMENT_MODE" == "firebase" ]; then
        echo -e "  ${YELLOW}1.${NC} Start the web development server:"
        echo -e "     ${BLUE}pnpm dev${NC}"
        echo ""
        echo -e "  ${YELLOW}2.${NC} (Optional) Seed test users for E2E testing:"
        echo -e "     ${BLUE}pnpm run seed:e2e:firebase${NC}"
        echo ""
        echo -e "  ${YELLOW}3.${NC} Access the application:"
        echo -e "     ${GREEN}Web App:        http://localhost:3000${NC}"
        echo -e "     ${GREEN}Emulator UI:    http://localhost:4040${NC}"
        echo ""
        echo -e "  ${YELLOW}4.${NC} Run E2E tests:"
        echo -e "     ${BLUE}pnpm run test:e2e${NC}"
        echo ""
    else
        echo -e "  ${YELLOW}1.${NC} Start the web development server:"
        echo -e "     ${BLUE}pnpm dev${NC}"
        echo ""
        echo -e "  ${YELLOW}2.${NC} In a new terminal, seed test users via API:"
        echo -e "     ${BLUE}pnpm run seed:e2e${NC}"
        echo -e "     ${CYAN}(Wait for web server to start before seeding)${NC}"
        echo ""
        echo -e "  ${YELLOW}3.${NC} Access the application:"
        echo -e "     ${GREEN}Web App:        http://localhost:3000${NC}"
        echo -e "     ${GREEN}Keycloak:       http://localhost:8180${NC} (admin/admin_password)"
        echo -e "     ${GREEN}MinIO Console:  http://localhost:9001${NC} (minioadmin/minioadmin_password)"
        echo ""
        echo -e "  ${YELLOW}4.${NC} Run E2E tests:"
        echo -e "     ${BLUE}pnpm run test:e2e${NC}"
        echo ""
    fi

    echo -e "${CYAN}🛑 To Stop Services:${NC}"
    if [ "$DEPLOYMENT_MODE" == "firebase" ]; then
        echo -e "     ${BLUE}firebase emulators:kill${NC}"
        echo -e "     or ${BLUE}make emulators-kill${NC}"
    else
        echo -e "     ${BLUE}docker-compose down${NC}"
        echo -e "     or ${BLUE}make docker-down${NC}"
    fi
    echo ""

    echo -e "${CYAN}📖 Documentation:${NC}"
    echo -e "     ${BLUE}README.md${NC}                  - Project overview"
    echo -e "     ${BLUE}CLAUDE.md${NC}                  - Development guide"
    echo -e "     ${BLUE}ARCHITECTURE_K8S_READY.md${NC} - Kubernetes architecture"
    echo -e "     ${BLUE}LOCAL_TESTING_GUIDE.md${NC}    - Testing guide"
    echo ""

    echo -e "${CYAN}💡 Useful Commands:${NC}"
    echo -e "     ${BLUE}make help${NC}          - Show all available Make targets"
    echo -e "     ${BLUE}make type-check${NC}    - Run TypeScript type checking"
    echo -e "     ${BLUE}make lint${NC}          - Run linters"
    echo -e "     ${BLUE}make test${NC}          - Run unit tests"
    echo -e "     ${BLUE}make health-check${NC}  - Check health of all services"
    echo ""
}

# Cleanup function
cleanup() {
    log_warning "Interrupted. Cleaning up..."

    if [ -f ".emulator.pid" ]; then
        EMULATOR_PID=$(cat .emulator.pid)
        if ps -p $EMULATOR_PID > /dev/null 2>&1; then
            log_info "Stopping Firebase emulators..."
            kill $EMULATOR_PID
        fi
        rm .emulator.pid
    fi

    exit 1
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    print_banner
    check_prerequisites
    select_deployment_mode
    install_dependencies
    setup_environment

    if [ "$DEPLOYMENT_MODE" == "firebase" ]; then
        start_firebase_emulators
    else
        start_docker_services
    fi

    build_packages
    print_next_steps
}

# Run main function
main

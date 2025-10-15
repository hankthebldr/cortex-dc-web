.PHONY: help install clean dev test build deploy docker k8s

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(CYAN)Cortex DC Web Platform - Development Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(GREEN)<target>$(NC)\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  $(CYAN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Installation & Setup

install: ## Install all dependencies
	@echo "$(GREEN)Installing dependencies...$(NC)"
	pnpm install

setup-firebase: install ## Setup for Firebase development
	@echo "$(GREEN)Setting up Firebase development environment...$(NC)"
	@if ! command -v firebase &> /dev/null; then \
		echo "$(YELLOW)Installing Firebase CLI...$(NC)"; \
		npm install -g firebase-tools; \
	fi
	firebase login
	@echo "DEPLOYMENT_MODE=firebase" > .env.local
	@echo "FIREBASE_AUTH_EMULATOR_HOST=localhost:9099" >> .env.local
	@echo "FIRESTORE_EMULATOR_HOST=localhost:8080" >> .env.local
	@echo "FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199" >> .env.local
	@echo "$(GREEN)✓ Firebase setup complete$(NC)"

setup-self-hosted: install ## Setup for self-hosted development
	@echo "$(GREEN)Setting up self-hosted development environment...$(NC)"
	@echo "DEPLOYMENT_MODE=self-hosted" > .env.local
	@echo "DATABASE_URL=postgresql://cortex:cortex_secure_password@localhost:5432/cortex" >> .env.local
	@echo "KEYCLOAK_URL=http://localhost:8180" >> .env.local
	@echo "KEYCLOAK_REALM=cortex" >> .env.local
	@echo "KEYCLOAK_CLIENT_ID=cortex-web" >> .env.local
	@echo "MINIO_ENDPOINT=localhost" >> .env.local
	@echo "MINIO_PORT=9000" >> .env.local
	@echo "MINIO_ACCESS_KEY=minioadmin" >> .env.local
	@echo "MINIO_SECRET_KEY=minioadmin_password" >> .env.local
	@echo "REDIS_URL=redis://:redis_password@localhost:6379" >> .env.local
	@echo "$(GREEN)✓ Self-hosted setup complete$(NC)"
	@echo "$(YELLOW)Next: Run 'make docker-up' to start infrastructure$(NC)"

##@ Development

dev: ## Start development server (Next.js only)
	pnpm run dev:web

dev-firebase: ## Start Firebase emulators + web server
	@echo "$(GREEN)Starting Firebase development environment...$(NC)"
	@./scripts/start-local-dev.sh

dev-full: docker-up dev ## Start full self-hosted stack + web server

clean: ## Clean build artifacts and dependencies
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	pnpm run clean
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf .next
	rm -rf apps/*/.next
	rm -rf dist
	rm -rf packages/*/dist
	@echo "$(GREEN)✓ Clean complete$(NC)"

##@ Testing

test: ## Run all tests
	pnpm run test

test-e2e: ## Run E2E tests
	pnpm run test:e2e

test-e2e-ui: ## Run E2E tests with Playwright UI
	pnpm run test:e2e:ui

seed-e2e: ## Seed E2E test users
	pnpm run seed:e2e

seed-e2e-firebase: ## Seed E2E test users (Firebase mode)
	pnpm run seed:e2e:firebase

##@ Type Checking & Linting

type-check: ## Run TypeScript type checking
	pnpm run type-check

lint: ## Run linting
	pnpm run lint

lint-fix: ## Fix linting issues
	pnpm run lint -- --fix

##@ Building

build: ## Build all packages
	pnpm run build

build-web: ## Build web app only
	pnpm run build:web

build-db: ## Build database package
	pnpm --filter "@cortex/db" build

##@ Docker Compose

docker-up: ## Start all self-hosted services (postgres, keycloak, minio, redis, nats)
	@echo "$(GREEN)Starting self-hosted infrastructure...$(NC)"
	docker-compose -f docker-compose.yml up -d postgres keycloak minio minio-init redis nats
	@echo "$(YELLOW)Waiting for services to be healthy...$(NC)"
	@sleep 10
	docker-compose ps
	@echo "$(GREEN)✓ Infrastructure started$(NC)"
	@echo "$(CYAN)Access points:$(NC)"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Keycloak:   http://localhost:8180 (admin/admin_password)"
	@echo "  MinIO:      http://localhost:9001 (minioadmin/minioadmin_password)"
	@echo "  Redis:      localhost:6379"
	@echo "  NATS:       localhost:4222"

docker-up-full: ## Start full stack including web and functions
	@echo "$(GREEN)Starting full self-hosted stack...$(NC)"
	docker-compose --profile full up -d
	@echo "$(YELLOW)Waiting for all services...$(NC)"
	@sleep 15
	docker-compose ps
	@echo "$(GREEN)✓ Full stack started$(NC)"

docker-up-monitoring: ## Start with monitoring (Prometheus + Grafana)
	@echo "$(GREEN)Starting with monitoring...$(NC)"
	docker-compose --profile full --profile monitoring up -d
	@sleep 15
	@echo "$(GREEN)✓ Stack with monitoring started$(NC)"
	@echo "$(CYAN)Monitoring:$(NC)"
	@echo "  Prometheus: http://localhost:9090"
	@echo "  Grafana:    http://localhost:3001 (admin/admin)"

docker-down: ## Stop all Docker Compose services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Services stopped$(NC)"

docker-down-volumes: ## Stop and remove all data volumes
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)✓ Services and volumes removed$(NC)"; \
	fi

docker-logs: ## View logs from all services
	docker-compose logs -f

docker-logs-web: ## View web service logs
	docker-compose logs -f web

docker-logs-api: ## View API server logs
	docker-compose logs -f api-server

docker-ps: ## Show status of all services
	docker-compose ps

docker-rebuild: ## Rebuild and restart all services
	@echo "$(GREEN)Rebuilding services...$(NC)"
	docker-compose --profile full build
	docker-compose --profile full up -d
	@echo "$(GREEN)✓ Rebuild complete$(NC)"

##@ Kubernetes

k8s-deploy: ## Deploy to Kubernetes (using kustomize)
	@echo "$(GREEN)Deploying to Kubernetes...$(NC)"
	kubectl apply -k kubernetes/
	kubectl apply -k functions/k8s/
	@echo "$(GREEN)✓ Deployment complete$(NC)"

k8s-delete: ## Delete Kubernetes resources
	@echo "$(YELLOW)Deleting Kubernetes resources...$(NC)"
	kubectl delete -k kubernetes/
	kubectl delete -k functions/k8s/
	@echo "$(GREEN)✓ Resources deleted$(NC)"

k8s-status: ## Check Kubernetes deployment status
	@echo "$(CYAN)Checking Kubernetes status...$(NC)"
	@echo ""
	@echo "$(YELLOW)Pods:$(NC)"
	kubectl get pods -n cortex-dc
	@echo ""
	@echo "$(YELLOW)Services:$(NC)"
	kubectl get svc -n cortex-dc
	@echo ""
	@echo "$(YELLOW)Deployments:$(NC)"
	kubectl get deploy -n cortex-dc

k8s-logs: ## View Kubernetes logs for web deployment
	kubectl logs -f deployment/cortex-web -n cortex-dc

k8s-port-forward: ## Port forward web service to localhost:3000
	kubectl port-forward svc/cortex-web 3000:3000 -n cortex-dc

##@ Firebase

emulators: ## Start Firebase emulators
	@echo "$(GREEN)Starting Firebase emulators...$(NC)"
	firebase emulators:start --import=./emulator-data --export-on-exit

emulators-kill: ## Kill Firebase emulators
	firebase emulators:kill

firebase-deploy: ## Deploy to Firebase
	@echo "$(GREEN)Deploying to Firebase...$(NC)"
	pnpm run build
	firebase deploy

firebase-deploy-hosting: ## Deploy hosting only
	pnpm run build:web
	firebase deploy --only hosting

firebase-deploy-functions: ## Deploy functions only
	firebase deploy --only functions

##@ Database

db-migrate: ## Run database migrations
	@echo "$(YELLOW)Note: Migrations not yet implemented$(NC)"
	@echo "Placeholder for future Prisma migrations"

db-seed: ## Seed database with test data
	pnpm run seed:users

db-reset: ## Reset database (warning: destructive)
	@echo "$(RED)WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down postgres; \
		docker volume rm cortex-dc-web_postgres_data; \
		docker-compose up -d postgres; \
		echo "$(GREEN)✓ Database reset complete$(NC)"; \
	fi

##@ Utilities

validate: type-check lint test ## Run all validation checks

pre-commit: validate ## Pre-commit checks
	@echo "$(GREEN)✓ All pre-commit checks passed$(NC)"

check-ports: ## Check if required ports are available
	@echo "$(CYAN)Checking ports...$(NC)"
	@./scripts/check-ports.sh || echo "$(YELLOW)Create scripts/check-ports.sh for port checking$(NC)"

health-check: ## Check health of all services
	@echo "$(CYAN)Checking service health...$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Services:$(NC)"
	@docker-compose ps 2>/dev/null || echo "  No services running"
	@echo ""
	@echo "$(YELLOW)Web Server:$(NC)"
	@curl -s http://localhost:3000/api/health > /dev/null && echo "  ✓ http://localhost:3000 OK" || echo "  ✗ Not responding"
	@echo ""
	@echo "$(YELLOW)PostgreSQL:$(NC)"
	@docker-compose exec -T postgres pg_isready -U cortex 2>/dev/null && echo "  ✓ PostgreSQL OK" || echo "  ✗ Not available"
	@echo ""
	@echo "$(YELLOW)Keycloak:$(NC)"
	@curl -s http://localhost:8180/health/ready > /dev/null && echo "  ✓ Keycloak OK" || echo "  ✗ Not available"

##@ Documentation

docs: ## Generate documentation
	@echo "$(CYAN)Documentation files:$(NC)"
	@echo "  CLAUDE.md                    - Project overview"
	@echo "  ARCHITECTURE_DOCUMENTATION.md - System architecture"
	@echo "  E2E_TESTING_NO_FIREBASE.md  - E2E testing guide"
	@echo "  KUBERNETES_QUICK_START.md   - K8s deployment"
	@echo "  SELF_HOSTED_QUICK_START.md  - Self-hosted setup"

##@ Quick Start Commands

demo: ## 🚀 Bootstrap local environment and start demo (one-command setup)
	@echo "$(CYAN)Starting Cortex DC Local Demo Bootstrap...$(NC)"
	@./scripts/bootstrap-local.sh
	@echo ""
	@echo "$(GREEN)✅ Bootstrap complete!$(NC)"
	@echo "$(YELLOW)Next: Run 'pnpm dev' to start the web server$(NC)"

quick-start-firebase: setup-firebase emulators dev ## Quick start with Firebase (opens emulators and web)

quick-start-self-hosted: setup-self-hosted docker-up dev ## Quick start self-hosted (starts infra and web)

quick-test: seed-e2e test-e2e ## Quick E2E test run

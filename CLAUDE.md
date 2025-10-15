# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Cortex Domain Consultant Web Platform - A Firebase-based monorepo for accelerating Domain Consultant engagement tracking, featuring POV (Proof of Value) management, TRR (Technical Risk Review) workflows, and customer engagement analytics.

## Project Structure

This is a **pnpm monorepo** with Turbo for build orchestration:

```
cortex-dc-web/
├── apps/
│   └── web/          # Next.js 14 web application (App Router)
├── packages/
│   ├── db/           # Database layer with multi-backend adapters (Firebase/PostgreSQL)
│   ├── ai/           # AI services (Gemini, OpenAI integrations)
│   ├── commands/     # Command registry and unified command service
│   ├── content/      # Content library and knowledge base services
│   ├── integrations/ # External integrations (BigQuery, XSIAM)
│   ├── terminal/     # Terminal-related components
│   ├── ui/           # Shared UI components
│   ├── utils/        # Shared utilities and API services
│   ├── admin-tools/  # Admin utilities and seeding scripts
│   └── test-utils/   # Testing utilities
├── functions/        # Firebase Cloud Functions (Node 22)
└── dataconnect/      # Firebase Data Connect configuration
```

## Development Commands

### Initial Setup
```bash
pnpm install                    # Install dependencies
firebase login                  # Authenticate with Firebase
firebase use cortex-dc-portal   # Set Firebase project
pnpm run setup                  # Full setup (install + Firebase config)
```

### Development Workflow
```bash
# Start full development environment (emulators + web app)
pnpm run dev

# Or run services separately:
pnpm run emulators              # Firebase emulators with data export
pnpm run dev:web                # Next.js dev server only
pnpm run dev:functions          # Firebase Functions only

# Type checking across all packages
pnpm run type-check

# Run type check for specific package
pnpm --filter "@cortex/db" type-check
```

### Build and Deploy
```bash
# Build all packages
pnpm run build

# Build specific package
pnpm --filter "@cortex-dc/web" build

# Deploy to Firebase
pnpm run deploy                 # Full deployment
pnpm run deploy:hosting         # Hosting only
pnpm run deploy:functions       # Functions only
pnpm run deploy:rules           # Security rules only
```

### Testing
```bash
# Run all tests
pnpm run test

# End-to-end tests
pnpm run test:e2e               # Run E2E tests
pnpm run test:e2e:ui            # Run E2E tests with Playwright UI
pnpm run e2e:local              # E2E tests against localhost:3000
pnpm run report:e2e             # View E2E test report
```

### Data Seeding
```bash
# Seed users (requires emulators running)
pnpm run seed:users

# Seed demo data
pnpm run seed:data
```

### Firebase Emulators
The emulators run on these ports:
- **Auth**: 9099
- **Firestore**: 8080
- **Functions**: 5001
- **Hosting**: 5000
- **Storage**: 9199
- **Emulator UI**: 4040

```bash
# Start with data import/export
pnpm run emulators

# Start without persistence
pnpm run emulators:start

# Kill all emulators
pnpm run emulators:kill
```

## Core Architecture

### Database Layer (`packages/db`)

The database package uses an **adapter pattern** to support multiple backends:

- **Firebase Firestore** (default)
- **PostgreSQL** (self-hosted option)
- **Future**: MinIO for storage, Keycloak for auth

Key exports:
```typescript
import {
  getDatabase,    // Factory: returns DatabaseAdapter
  getStorage,     // Factory: returns StorageAdapter
  getAuth,        // Factory: returns AuthAdapter
  FirestoreClient,
  FirestoreQueries
} from '@cortex/db';
```

**Deployment mode** is controlled via environment variables:
- `DEPLOYMENT_MODE=firebase` (default)
- `DEPLOYMENT_MODE=self-hosted` (PostgreSQL + MinIO + Keycloak)

### Core Data Models

The platform is built around three primary entities defined in `packages/db/src/types/projects.ts`:

1. **Project** - Top-level customer engagement
   - Links to POVs, TRRs, and Scenarios
   - Tracks customer details, team, timeline, and value

2. **POV (Proof of Value)** - Technical validation initiative
   - Multi-phase workflow (planning → in_progress → testing → validating → completed)
   - Contains objectives, test plans, success metrics
   - Tracks phases, milestones, and resources

3. **TRR (Technical Risk Review)** - Risk assessment and validation
   - Risk scoring (0-10) across multiple categories
   - Findings with severity levels (low/medium/high/critical)
   - Validation and signoff workflow
   - Evidence attachment support

**Relationships:**
- Projects contain multiple POVs and TRRs
- POVs can have associated TRRs
- POVs reference Scenarios for testing
- All entities support timeline tracking and team collaboration

### Services Architecture

Key services in `packages/db/src/services/`:

- **`analytics-service.ts`** - User and admin analytics, metrics tracking
- **`relationship-management-service.ts`** - Manages relationships between Projects/POVs/TRRs, ensures referential integrity
- **`dynamic-record-service.ts`** - Auto-creates and populates records as workflows progress
- **`database-validation-service.ts`** - Validates database operations across backends
- **`terraform-generation-service.ts`** - Generates Terraform IaC from demo scenarios

### Next.js Application (`apps/web`)

- **App Router** (Next.js 14) with React Server Components
- **Route structure**:
  - `/` - Dashboard home
  - `/(auth)/*` - Authentication pages
  - `/(dashboard)/*` - Main application routes
  - `/pov/[id]` - POV detail pages with multi-tab interface
  - `/trr/[id]` - TRR detail pages
  - `/api/*` - API routes

- **Key features**:
  - Terraform deployment generation for scenarios
  - Multi-workspace support for internal packages
  - SWR for data fetching
  - Tailwind CSS with custom Cortex color palette

### Firebase Functions (`functions/`)

**Runtime**: Node.js 22

**Key functions**:
- `healthCheck` - Health probe endpoint
- `echo` - Echo test endpoint
- `environmentSummary` - Environment configuration
- `menuSuggestion` - Genkit AI-powered menu suggestions

**Kubernetes deployment**:
Functions can be deployed as a microservice to Kubernetes:
```bash
cd functions
pnpm run docker:build       # Build Docker image
pnpm run k8s:apply          # Deploy to K8s
pnpm run k8s:status         # Check pod status
pnpm run k8s:logs           # View logs
```

K8s manifests are in `functions/k8s/`. See `functions/KUBERNETES_DEPLOYMENT.md` for details.

## TypeScript Configuration

- Strict mode enabled across all packages
- Path aliases configured for imports
- Monorepo uses workspace protocol (`workspace:*`) for inter-package dependencies

When adding new packages, export them from `packages/*/src/index.ts` and ensure they're built before the web app.

## Common Development Patterns

### Adding a New Service

1. Create service in `packages/db/src/services/`
2. Export from `packages/db/src/services/index.ts`
3. Use the database factory pattern:
```typescript
import { getDatabase } from '../adapters/database.factory';

export class MyService {
  async myMethod() {
    const db = getDatabase();
    return await db.findMany('collection', options);
  }
}
```

### Adding a New Page

1. Create in `apps/web/app/` following App Router conventions
2. Use Server Components by default
3. Mark with `'use client'` only when needed (forms, interactive UI)
4. Import workspace packages via `@cortex/*` or `@cortex-dc/*` aliases

### Database Queries

```typescript
import { getDatabase } from '@cortex/db';

const db = getDatabase();

// Find one
const pov = await db.findOne('povs', povId);

// Find many with filters
const activePOVs = await db.findMany('povs', {
  filters: [
    { field: 'status', operator: '==', value: 'in_progress' },
    { field: 'projectId', operator: '==', value: projectId }
  ],
  orderBy: 'createdAt',
  orderDirection: 'desc',
  limit: 10
});

// Create
await db.create('povs', povData);

// Update
await db.update('povs', povId, updates);

// Delete
await db.delete('povs', povId);
```

## Migration Notes

This codebase was migrated from `henryreed.ai` and retains some Firebase-specific patterns. When working with self-hosted mode:

1. Use adapter factories (`getDatabase`, `getStorage`, `getAuth`) rather than direct Firebase imports
2. Check `DEPLOYMENT_MODE` environment variable
3. Adapters handle backend-specific implementation details

## Firebase Extensions

Installed extensions:
- `firestore-bigquery-export` - Auto-export Firestore to BigQuery
- `firestore-multimodal-genai` - Multimodal AI generation

## Important Files

- `firebase.json` - Firebase configuration, emulator ports, security rules
- `pnpm-workspace.yaml` - Workspace package definitions and shared dependency catalog
- `turbo.json` - Turbo build cache and task dependencies
- `packages/db/src/types/projects.ts` - Core data model schemas (POV, TRR, Project)
- `packages/db/src/adapters/` - Multi-backend adapter implementations

## Key Dependencies

- **Framework**: Next.js 14 (App Router), React 18
- **Database**: Firebase Firestore, Firebase Admin SDK
- **Styling**: Tailwind CSS, Lucide icons
- **Forms/Validation**: Zod
- **Data Fetching**: SWR
- **AI**: Genkit (Firebase), Google Generative Language, OpenAI
- **Build**: Turbo, pnpm workspaces
- **Testing**: Playwright, Vitest
- **Functions**: Firebase Cloud Functions v2, Express.js

## Auto-Approved Commands

These commands run without user approval for faster development:

- Type checking: `pnpm type-check:*`
- Linting: `pnpm lint:*`
- Building: `pnpm build:*`, `pnpm run build`
- Firebase emulators: `firebase emulators:start:*`
- Docker: `docker build:*`, `docker-compose build:*`
- Git: `git fetch:*`
- Install: `pnpm install:*`, `pnpm add:*`
- Utils: `ls:*`, `cat:*`, `tree:*`, `find:*`, `echo:*`, `curl:*`

## Notes

- Always use `pnpm` (not npm or yarn)
- Firebase project ID: `cortex-dc-portal`
- Node version: >=18.0.0 (Functions require Node 22)
- Emulators auto-export data to `./emulator-data` on exit
- When modifying database schemas, update Zod schemas in `packages/db/src/types/`
- POV and TRR are the core workflows - maintain referential integrity via `relationship-management-service`

# Quick Start Guide

Get up and running with Cortex DC Web in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Docker Desktop running (for self-hosted mode)

## Option 1: Automated Start (Recommended)

Run the automated startup script:

```bash
./scripts/start-local-dev.sh
```

This will:
1. Ask which mode you want (Firebase Emulators or Self-Hosted)
2. Configure environment variables automatically
3. Start required services
4. Launch the web app

## Option 2: Manual Start

### Firebase Emulators Mode

```bash
# Terminal 1: Start emulators
pnpm run emulators

# Terminal 2: Start web app
pnpm run dev:web
```

### Self-Hosted Mode

```bash
# Terminal 1: Start infrastructure
docker-compose up -d

# Terminal 2: Start web app
export DEPLOYMENT_MODE=self-hosted
pnpm run dev:web
```

## Access the App

- Web App: http://localhost:3000
- Firebase Emulator UI: http://localhost:4040 (Firebase mode)
- Keycloak: http://localhost:8180 (Self-hosted mode)

## Test the System

Run the test scripts:

```bash
# Test record workflow
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
FIRESTORE_EMULATOR_HOST=localhost:8080 \
npx tsx test-scripts/test-record-workflow.ts

# Test analytics
npx tsx test-scripts/test-analytics.ts
```

## Next Steps

1. Open http://localhost:3000
2. Login with a test user
3. Create a POV from the dashboard
4. Create a TRR and link it to the POV
5. Test phase transitions and workflows

## Documentation

- **Full Architecture**: [ARCHITECTURE_DOCUMENTATION.md](./ARCHITECTURE_DOCUMENTATION.md)
- **Testing Guide**: [LOCAL_TESTING_GUIDE.md](./LOCAL_TESTING_GUIDE.md)
- **Project Info**: [CLAUDE.md](./CLAUDE.md)

## Troubleshooting

### Ports already in use
```bash
# Kill emulators
pnpm run emulators:kill

# Stop docker services
docker-compose down
```

### Dependencies not installed
```bash
pnpm install
```

### Type errors
```bash
pnpm run type-check
pnpm run build
```

## Get Help

Check the documentation files or review the logs:
- Web app logs: Terminal output
- Emulator logs: `emulators.log`
- Docker logs: `docker-compose logs -f`

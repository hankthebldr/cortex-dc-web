# E2E Testing Quick Start

This guide provides a quick setup and execution flow for end-to-end testing in the Cortex DC Web platform.

## Prerequisites

- Node.js 20+ installed
- pnpm 8+ installed  
- Firebase CLI installed and authenticated
- All dependencies installed: `pnpm install`

## Quick Start

### 1. Start Firebase Emulators
```bash
firebase emulators:start
```
Wait for all emulators to be ready (usually 30-60 seconds).

### 2. Seed Test Data
In a **new terminal window**:
```bash
# Seed users with roles (user, manager, admin)
pnpm seed:users

# Seed core application data
pnpm seed:data
```

### 3. Run Tests

#### Run All Tests
```bash
pnpm e2e:local
```

#### Run Specific Browser
```bash
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox  
pnpm test:e2e --project=webkit
```

#### Run Specific Test File
```bash
pnpm test:e2e tests/e2e/specs/000-smoke.spec.ts
```

#### Interactive Test Runner (Recommended for Development)
```bash
pnpm test:e2e:ui
```
This opens a GUI where you can run tests interactively, see real-time results, and debug failures.

## Test Users

The following test users are automatically created:

| Email | Password | Role | Use Case |
|-------|----------|------|----------|
| `user1@dev.local` | `Password123!` | user | Domain Consultant workflows |
| `manager1@dev.local` | `Password123!` | manager | Management dashboards, approvals |
| `admin1@dev.local` | `Password123!` | admin | System administration, full access |

## Viewing Results

### HTML Report (after test run)
```bash
pnpm report:e2e
```

### Debug Failed Tests
```bash
# Shows trace files for debugging
playwright show-trace test-results/
```

### Emulator UI (while emulators are running)
Open http://localhost:4040 to view:
- Firestore data
- Auth users
- Storage files
- Function logs

## Common Test Scenarios

### 1. Smoke Test (Basic Connectivity)
```bash
pnpm test:e2e tests/e2e/specs/000-smoke.spec.ts
```
Validates that all Firebase services are running and accessible.

### 2. Authentication Test
```bash
pnpm test:e2e tests/e2e/specs/001-auth-and-rbac.spec.ts  
```
Tests user sign-in and role-based access control.

### 3. Development Mode (Watch Tests)
For active development, use the interactive UI:
```bash
pnpm test:e2e:ui
```

## Troubleshooting

### Emulators Won't Start
```bash
# Kill any existing processes
firebase emulators:kill

# Check for port conflicts
lsof -i :5000,8080,9099

# Restart emulators
firebase emulators:start
```

### Tests Fail Due to Missing Data
```bash
# Re-seed test data
pnpm seed:users
pnpm seed:data
```

### Clear Test Data
```bash
pnpm clean:e2e
```

### Firebase Project Issues
```bash
# Verify current project
firebase use

# Switch to correct project  
firebase use cortex-dc-web-dev
```

## Test Development Guidelines

### Never Delete Code Rule ⚠️
When modifying existing components for testability:
- **Comment out** old code instead of deleting
- Add reference comments linking to this testing documentation
- Create searchable index for commented functionality
- This maintains evolution history and prevents broken links

### Adding Test Selectors
Prefer `data-testid` attributes for stable selectors:
```tsx
// Good - stable and semantic
<button data-testid="pov-wizard-next">Next</button>

// Avoid - brittle and dependent on styling
<button className="bg-blue-500 text-white px-4 py-2">Next</button>
```

### Test File Naming
Follow the numbering convention:
- `000-smoke.spec.ts` - Basic connectivity tests
- `001-auth-and-rbac.spec.ts` - Authentication tests  
- `010-pov-wizard.spec.ts` - POV management workflows
- `100-firebase-services.spec.ts` - Service validation
- `200-responsive-visuals.spec.ts` - Layout and visual tests

## Continuous Integration

### GitHub Actions
Tests automatically run on:
- Pull requests
- Pushes to main branch
- Across chromium, firefox, and webkit browsers

### Local CI Simulation
```bash
# Run tests like CI does
CI=1 pnpm test:e2e
```

## Performance Testing

### Lighthouse CI
```bash
pnpm perf:lh
```

### Load Testing (if k6 is installed)
```bash
pnpm perf:k6
```

## Critical Success Criteria

✅ **Firebase Deploy Test**: The ultimate success gate is that `firebase deploy` completes successfully and post-deploy validation passes.

✅ **Service Matrix**: All Firebase/GCP services (Auth, Firestore, Storage, Functions, Data Connect, Genkit) are functional.

✅ **Role-Based Access**: User, Manager, and Admin dashboards render correctly with appropriate permissions.

✅ **Cross-Browser Compatibility**: Core workflows function across Chromium, Firefox, and WebKit.

## Getting Help

- **Architecture Details**: See `docs/testing/E2E-ARCHITECTURE.md`
- **Playwright Docs**: https://playwright.dev/docs/intro
- **Firebase Emulator Docs**: https://firebase.google.com/docs/emulator-suite

## Next Steps

1. **Start with smoke tests** to validate your setup
2. **Use interactive UI** for developing new tests
3. **Review the architecture docs** for advanced scenarios
4. **Follow the never-delete-code rule** when making changes

Happy testing! 🧪
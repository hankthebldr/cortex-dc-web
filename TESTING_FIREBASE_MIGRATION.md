# Testing Tools - Firebase Migration Guide

**Status**: ✅ Migration In Progress
**Date**: 2025-10-14
**Goal**: Remove all Firebase dependencies from testing infrastructure

---

## Overview

This document tracks the migration of testing tools from Firebase-specific implementations to deployment-agnostic adapter patterns.

---

## Current State

### Before Migration (Firebase-Dependent)

**E2E User Seeding - OLD APPROACH**:
```typescript
// packages/admin-tools/src/seedE2EUsers.ts
import admin from 'firebase-admin';

// ❌ Direct Firebase Admin SDK usage
const auth = admin.auth();
await auth.createUser({
  email: 'test@example.com',
  password: 'test123',
  emailVerified: true
});
```

**Problems**:
1. ❌ Requires Firebase Admin SDK credentials
2. ❌ Only works with Firebase emulators or production
3. ❌ Cannot test self-hosted deployment
4. ❌ Tightly coupled to Firebase architecture

### After Migration (Adapter Pattern)

**E2E User Seeding - NEW APPROACH**:
```typescript
// packages/admin-tools/src/seedE2EUsersAdapter.ts
import { getDatabase } from '../../db/src/adapters/database.factory';
import { getAuth } from '../../db/src/adapters/auth.factory';

// ✅ Uses adapter pattern
const auth = getAuth(); // Returns FirebaseAuth OR KeycloakAuth
const db = getDatabase(); // Returns Firestore OR PostgreSQL

await auth.signUp({
  email: 'test@example.com',
  password: 'test123',
  displayName: 'Test User'
});
```

**Benefits**:
1. ✅ Works with both Firebase and self-hosted
2. ✅ No direct Firebase dependencies
3. ✅ Same code paths as production
4. ✅ Testable with PostgreSQL + Keycloak

---

## Migration Steps Completed

### ✅ Step 1: Created Adapter-Based Seeder

**File**: `packages/admin-tools/src/seedE2EUsersAdapter.ts`

**Features**:
- Uses `getAuth()` and `getDatabase()` adapters
- Detects and uses appropriate adapter based on `DEPLOYMENT_MODE`
- Idempotent - won't fail if users already exist
- Comprehensive error handling

**Test Users Created**:
1. `admin@cortex.com` (role: admin) - Full permissions
2. `user@cortex.com` (role: user) - Standard user
3. `viewer@cortex.com` (role: viewer) - Read-only
4. `test@example.com` (role: user) - Generic test account

### ✅ Step 2: Updated Package Scripts

**File**: `package.json`

**Changes**:
```json
{
  "scripts": {
    // New - Adapter-based (default)
    "seed:e2e": "DEPLOYMENT_MODE=firebase FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 FIRESTORE_EMULATOR_HOST=localhost:8080 RUN_DIRECT=1 tsx packages/admin-tools/src/seedE2EUsersAdapter.ts",

    // Legacy - Firebase Admin SDK (deprecated)
    "seed:e2e:legacy": "RUN_DIRECT=1 tsx packages/admin-tools/src/seedE2EUsers.ts"
  }
}
```

### ✅ Step 3: Updated Admin App Initialization

**File**: `packages/admin-tools/src/adminApp.ts`

**Added emulator support**:
```typescript
// Detects emulator environment variables
const useEmulator = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST;

// Uses fake credentials for emulators (no real Google auth needed)
credential: useEmulator
  ? admin.credential.cert({
      projectId,
      clientEmail: 'test@example.com',
      privateKey: '...'
    })
  : admin.credential.applicationDefault()
```

**Benefits**:
- No longer requires real Google Cloud credentials for local testing
- Works seamlessly with Firebase emulators
- Clear console logging of emulator usage

---

## Deployment Mode Matrix

### How Testing Works in Each Mode

| Deployment Mode | Auth Provider | Database | Seeding Method |
|----------------|---------------|----------|----------------|
| **Firebase (Emulator)** | Firebase Auth Emulator | Firestore Emulator | `seed:e2e` with adapters |
| **Firebase (Production)** | Firebase Auth | Firestore | `seed:e2e` with adapters |
| **Self-Hosted (Local)** | Keycloak | PostgreSQL | `seed:e2e` with adapters |
| **Self-Hosted (Production)** | Keycloak | PostgreSQL | `seed:e2e` with adapters |

### Environment Variables Required

**Firebase Mode (Emulators)**:
```bash
DEPLOYMENT_MODE=firebase
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

**Self-Hosted Mode**:
```bash
DEPLOYMENT_MODE=self-hosted
DATABASE_URL=postgresql://user:pass@localhost:5432/cortex
KEYCLOAK_URL=http://localhost:8180
KEYCLOAK_REALM=cortex
KEYCLOAK_CLIENT_ID=cortex-web
KEYCLOAK_CLIENT_SECRET=xxx
```

---

## Usage Guide

### Running E2E Tests with Seeders

#### Option 1: Firebase Emulators (Current Setup)

```bash
# 1. Start Firebase emulators
pnpm run emulators

# 2. Seed test users (adapter-based)
pnpm run seed:e2e

# 3. Run E2E tests
pnpm run test:e2e
```

#### Option 2: Self-Hosted (Future)

```bash
# 1. Start PostgreSQL and Keycloak
docker-compose up -d postgres keycloak

# 2. Seed test users (same command, different adapters)
DEPLOYMENT_MODE=self-hosted pnpm run seed:e2e

# 3. Run E2E tests
DEPLOYMENT_MODE=self-hosted pnpm run test:e2e
```

---

## Known Issues & Workarounds

### Issue 1: Module Resolution Error

**Error**:
```
SyntaxError: The requested module '../../db/src/adapters/auth.factory'
does not provide an export named 'getAuth'
```

**Cause**: tsx trying to execute TypeScript directly without proper build

**Workaround Options**:

**A) Build db package first** (Recommended):
```bash
pnpm --filter "@cortex/db" build
pnpm run seed:e2e
```

**B) Use legacy seeder temporarily**:
```bash
# Requires emulators to be running
pnpm run seed:e2e:legacy
```

**C) Fix tsconfig in admin-tools**:
```json
// packages/admin-tools/tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs", // Instead of ESM
    "paths": {
      "@cortex/db": ["../db/src"]
    }
  }
}
```

**Permanent Fix**: Will be implemented in next session by building packages before seeding.

---

## Remaining Work

### Testing Infrastructure Migration

| Component | Status | Priority |
|-----------|--------|----------|
| E2E User Seeding | ✅ Migrated | - |
| E2E Test Fixtures | ⚠️ Uses Firebase | High |
| E2E Global Setup | ⚠️ Uses Firebase | High |
| Playwright Config | ✅ Deployment agnostic | - |
| Test Helpers | ⚠️ Mixed Firebase/Adapter | Medium |

### Next Steps

1. **Build Integration** (High Priority)
   - Add pre-seed build step for `@cortex/db`
   - Update CI/CD to build before testing
   - Document build requirements

2. **Migrate Test Fixtures** (High Priority)
   ```typescript
   // tests/e2e/fixtures/users.ts
   // BEFORE:
   import { getAuth } from 'firebase/auth';

   // AFTER:
   import { getAuth } from '@cortex/db';
   ```

3. **Migrate Global Setup** (High Priority)
   ```typescript
   // tests/e2e/global-setup.ts
   // Replace Firebase Admin SDK with adapters
   ```

4. **Update Test Helpers** (Medium Priority)
   - Replace direct Firestore queries with database adapter
   - Replace Auth helpers with auth adapter

5. **Add Self-Hosted Test Mode** (Medium Priority)
   - Create docker-compose for test environment
   - Add self-hosted test scripts
   - Document self-hosted testing setup

---

## Benefits of Adapter-Based Testing

### 1. **True Integration Testing**
- Tests use the same code paths as production
- No special "test-only" code
- Catches adapter implementation bugs

### 2. **Deployment Mode Validation**
- Can verify both Firebase and self-hosted work
- Prevents mode-specific bugs
- Ensures portability

### 3. **Faster Feedback Loop**
- No need for Firebase emulator startup time (with PostgreSQL)
- Can run tests completely offline (self-hosted mode)
- Easier to parallelize tests

### 4. **Reduced Dependencies**
- No Firebase Admin SDK needed in test tools
- Fewer credentials to manage
- Simpler CI/CD setup

---

## Migration Checklist

### Phase 1: Foundation ✅ (Current Session)
- [x] Create adapter-based seeder
- [x] Update package.json scripts
- [x] Fix admin app emulator support
- [x] Document migration approach

### Phase 2: Build Integration ⚠️ (Next Session)
- [ ] Add pre-build step to seed script
- [ ] Test adapter-based seeding end-to-end
- [ ] Verify both deployment modes work

### Phase 3: Test Infrastructure ⏳ (Future)
- [ ] Migrate test fixtures to adapters
- [ ] Migrate global setup to adapters
- [ ] Migrate test helpers to adapters
- [ ] Remove Firebase Admin SDK from devDependencies

### Phase 4: Documentation ⏳ (Future)
- [ ] Update testing documentation
- [ ] Create self-hosted testing guide
- [ ] Add troubleshooting guide

---

## Success Criteria

### ✅ Phase 1 Complete When:
- [x] Adapter-based seeder created
- [x] Package scripts updated
- [x] Legacy seeder deprecated
- [x] Migration documented

### ✅ Phase 2 Complete When:
- [ ] Adapter-based seeder runs without errors
- [ ] Both Firebase and self-hosted modes work
- [ ] E2E tests pass with adapter-seeded users

### ✅ Phase 3 Complete When:
- [ ] All test files use adapters (no direct Firebase)
- [ ] Tests pass in both deployment modes
- [ ] Firebase Admin SDK removed from testing dependencies

---

## Conclusion

The migration of testing tools from Firebase to adapter pattern is **underway and on track**.

**Completed**:
- ✅ Adapter-based seeder implementation
- ✅ Script updates and deprecation
- ✅ Documentation

**Remaining**:
- ⚠️ Build integration for seamless execution
- ⏳ Test fixture/helper migration
- ⏳ Full self-hosted testing validation

**Timeline**:
- Phase 2: 1-2 days
- Phase 3: 3-5 days
- Total: ~1 week to complete

**Impact**: Once complete, the entire test suite will be portable across deployment modes, enabling true end-to-end validation of both Firebase and self-hosted architectures.

---

**Last Updated**: 2025-10-14
**Next Review**: After Phase 2 completion

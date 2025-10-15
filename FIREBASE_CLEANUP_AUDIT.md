# Firebase to Self-Hosted Migration Audit

**Date**: 2025-10-14
**Status**: In Progress
**Goal**: Complete removal of Firebase dependencies for full self-hosted architecture

---

## Executive Summary

The codebase currently has a **hybrid architecture** with proper adapter patterns in place, but still contains Firebase-specific code that needs to be cleaned up for a complete self-hosted deployment.

### Migration Status

| Component | Adapter Pattern | Self-Hosted Implementation | Cleanup Needed | Status |
|-----------|----------------|---------------------------|----------------|---------|
| Database | ✅ Complete | ✅ PostgreSQL adapter | ⚠️ Legacy exports | 🟡 Partial |
| Storage | ✅ Complete | ✅ MinIO adapter | ⚠️ Legacy exports | 🟡 Partial |
| Authentication | ✅ Complete | ✅ Keycloak adapter | ⚠️ Legacy exports | 🟡 Partial |
| Functions | ⚠️ Express wrapper | ❌ Still uses Firebase SDK | 🔴 Major cleanup | 🔴 Needs Work |
| Frontend | ❌ Direct Firebase imports | ⚠️ Some API client usage | 🔴 Major cleanup | 🔴 Needs Work |

---

## Detailed Audit

### 1. Database Layer (`packages/db`)

#### ✅ **Strengths**
- Proper adapter pattern implemented
- Both Firestore and PostgreSQL adapters working
- Database factory with environment-based selection
- New services (access control, federated data) use adapters

#### ⚠️ **Issues Found**

**A. Legacy Direct Firestore Exports**

`packages/db/src/index.ts` (Lines 1-13):
```typescript
// ❌ Still exporting Firebase-specific clients
export * from './firebase-config';
export { firebaseApp as app } from './firebase-config';
export { FirestoreClient } from './firestore/client';
export { FirestoreQueries } from './firestore/queries';
```

**Impact**: Frontend code may still be using direct Firestore clients instead of adapters.

**Recommendation**:
- Deprecate these exports
- Add deprecation warnings
- Create migration guide for consumers

**B. Services with Firebase Imports**

Files with direct Firebase usage:
- `src/services/event-tracking-service.ts`
- `src/services/terraform-generation-service.ts`
- `src/services/database-validation-service.ts`
- `src/services/user-management-service.ts`
- `src/auth/auth-service.ts`
- `src/services/data-service.ts`

**Example from `user-management-service.ts`**:
```typescript
// ❌ Direct Firebase import
import { db } from '../firebase-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
```

**Recommendation**:
- Refactor to use `getDatabase()` adapter
- Remove direct Firestore SDK imports

**C. Unused Firestore Utilities**

- `src/firestore/client.ts` - 500+ lines of Firestore-specific code
- `src/firestore/queries.ts` - Firebase query builders

**Recommendation**:
- Move to `legacy/` directory
- Mark as deprecated
- Remove after frontend migration complete

---

### 2. Firebase Functions (`functions/`)

#### 🔴 **Critical Issues**

**A. Firebase Functions SDK Dependencies**

`functions/package.json`:
```json
{
  "dependencies": {
    "firebase-admin": "^13.0.2",           // ❌ Remove
    "firebase-functions": "^6.2.0",        // ❌ Remove
    "@genkit-ai/firebase": "^0.9.11"       // ❌ Remove
  }
}
```

**B. Firebase Admin Initialization**

`functions/src/server.ts` (Lines 9-16):
```typescript
// ❌ Still initializing Firebase Admin
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
```

**Recommendation**:
- Replace with database adapter: `getDatabase()`
- Use Keycloak adapter: `getAuth()`
- Remove firebase-admin dependency

**C. Firebase Functions Logger**

`functions/src/server.ts` (Line 8):
```typescript
// ❌ Firebase-specific logger
import * as logger from 'firebase-functions/logger';
```

**Recommendation**:
- Replace with Winston or Pino
- Use standard console logging for simplicity
- Add structured logging

**D. Firebase Functions Wrappers**

`functions/src/index.ts` (Lines 1-4):
```typescript
// ❌ Using Firebase Functions v2 SDK
import {setGlobalOptions} from "firebase-functions/v2/options";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
```

**Recommendation**:
- Convert to pure Express handlers
- Remove Firebase Functions SDK completely
- Use standard HTTP request/response

---

### 3. Frontend (`apps/web`)

#### 🔴 **Major Cleanup Needed**

**A. Firebase Configuration Still Exported**

`packages/db/src/firebase-config.ts`:
- 218 lines of Firebase-specific configuration
- Exports: `auth`, `db`, `storage`, `functions`, `firebaseApp`
- Used for emulator connections and Firebase SDK initialization

**Status**: Needed ONLY for Firebase deployment mode, but still exported globally

**Recommendation**:
1. Move to `packages/db/src/legacy/firebase-config.ts`
2. Only import when `DEPLOYMENT_MODE=firebase`
3. Throw clear error if imported in self-hosted mode

**B. Frontend Direct Firebase Usage**

Need to audit all frontend files for:
```typescript
// ❌ Direct Firebase imports
import { db } from '@cortex/db';
import { collection, getDocs } from 'firebase/firestore';

// ✅ Should use API client instead
import { apiClient } from '@/lib/api-client';
const data = await apiClient.get('/api/povs');
```

**Files to Audit**:
```bash
apps/web/app/**/*.tsx
apps/web/components/**/*.tsx
apps/web/lib/**/*.ts
```

**C. Authentication Flow**

Current authentication likely uses Firebase Auth directly. Needs migration to:
- API-based authentication
- JWT tokens
- Keycloak integration for self-hosted

---

### 4. Configuration Files

#### ⚠️ **Firebase-Specific Config**

**A. Firebase Project Files**

Files that are Firebase-specific:
- `firebase.json` - Firebase hosting and functions config
- `.firebaserc` - Project aliases
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore indexes
- `storage.rules` - Storage security rules
- `dataconnect/` - Firebase Data Connect (new feature)

**Recommendation**:
- Keep for Firebase deployment mode
- Create `deployment/firebase/` directory
- Move Firebase-specific files there
- Update documentation

**B. Environment Variables**

Firebase-specific environment variables:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
# ... etc
```

**Recommendation**:
- Create `.env.firebase.example`
- Create `.env.self-hosted.example` ✅ (Already exists!)
- Document when each is needed

---

## Migration Plan

### Phase 1: Database Layer Cleanup ✅ (Current)

1. ✅ Adapter pattern implemented
2. 🟡 **In Progress**: Audit services for direct Firebase usage
3. ⏳ **TODO**: Refactor services to use adapters
4. ⏳ **TODO**: Deprecate legacy exports
5. ⏳ **TODO**: Move Firestore utilities to legacy/

### Phase 2: Functions Migration 🔴 (Next)

1. ⏳ Remove firebase-functions dependency
2. ⏳ Replace firebase-admin with database adapters
3. ⏳ Replace firebase-functions/logger with standard logging
4. ⏳ Convert Firebase Functions to pure Express handlers
5. ⏳ Remove Firebase-specific initialization

### Phase 3: Frontend Migration 🔴 (After Phase 2)

1. ⏳ Audit all frontend files for direct Firebase imports
2. ⏳ Migrate authentication to API-based flow
3. ⏳ Replace Firestore queries with API calls
4. ⏳ Update hooks to use API client instead of Firebase SDK
5. ⏳ Remove Firebase SDK from frontend bundle

### Phase 4: Configuration Cleanup ⏳ (Final)

1. ⏳ Move Firebase files to deployment/firebase/
2. ⏳ Create deployment mode selector script
3. ⏳ Update documentation
4. ⏳ Create deployment guides for both modes

---

## Detailed Recommendations

### Immediate Actions (Phase 1)

#### 1. Refactor User Management Service

**Current** (`user-management-service.ts`):
```typescript
// ❌ Direct Firebase
import { db } from '../firebase-config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function getUsers() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

**Refactored**:
```typescript
// ✅ Using adapter
import { getDatabase } from '../adapters/database.factory';

export async function getUsers() {
  const db = getDatabase();
  const users = await db.findMany('users', {});
  return users;
}
```

#### 2. Deprecate Direct Firebase Exports

**Update** `packages/db/src/index.ts`:
```typescript
// Mark as deprecated
/**
 * @deprecated Use getDatabase(), getAuth(), getStorage() adapters instead
 * These exports are for Firebase deployment mode only
 * Will be removed in v2.0
 */
export * from './firebase-config';

// Add console warning
if (process.env.DEPLOYMENT_MODE === 'self-hosted') {
  console.warn(
    '⚠️  Warning: Firebase exports are deprecated in self-hosted mode. ' +
    'Use adapter factories (getDatabase, getAuth, getStorage) instead.'
  );
}
```

#### 3. Create Legacy Directory

```bash
mkdir -p packages/db/src/legacy
mv packages/db/src/firebase-config.ts packages/db/src/legacy/
mv packages/db/src/firestore packages/db/src/legacy/
```

Update imports to reference legacy path when needed for Firebase mode.

### Phase 2 Actions (Functions)

#### 1. Remove Firebase Dependencies

**Update** `functions/package.json`:
```json
{
  "dependencies": {
    // ❌ Remove these:
    // "firebase-admin": "^13.0.2",
    // "firebase-functions": "^6.2.0",
    // "@genkit-ai/firebase": "^0.9.11",

    // ✅ Add these:
    "express": "^4.18.2",
    "winston": "^3.11.0",           // Standard logging
    "@cortex/db": "workspace:*",    // Use our adapters
    "dotenv": "^16.0.3"
  }
}
```

#### 2. Refactor Server to Pure Express

**Update** `functions/src/server.ts`:
```typescript
// ✅ No Firebase imports
import express, { Request, Response } from 'express';
import winston from 'winston';
import { getDatabase } from '@cortex/db';

// ✅ Standard logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// ✅ Use database adapter
const db = getDatabase();

const app = express();
const PORT = process.env.PORT || 8080;

// ... rest of Express setup
```

#### 3. Convert Functions to Express Routes

**Before** (`functions/src/index.ts`):
```typescript
// ❌ Firebase Functions SDK
import {onRequest} from "firebase-functions/v2/https";

export const healthCheck = onRequest((request, response) => {
  response.status(200).json({ status: "ok" });
});
```

**After** (`functions/src/routes/health.ts`):
```typescript
// ✅ Pure Express
import { Request, Response } from 'express';

export function healthCheck(req: Request, res: Response) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'dev'
  });
}
```

### Phase 3 Actions (Frontend)

#### 1. Create API Client Layer

**Create** `apps/web/lib/api/client.ts`:
```typescript
// ✅ API-based data fetching (no Firebase)
export class APIClient {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  async get(path: string) {
    const response = await fetch(`${this.baseURL}${path}`, {
      headers: {
        'Authorization': `Bearer ${await this.getToken()}`
      }
    });
    return response.json();
  }

  async post(path: string, data: any) {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getToken()}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  private async getToken(): Promise<string> {
    // Get JWT token from session/cookie
    return sessionStorage.getItem('auth_token') || '';
  }
}

export const apiClient = new APIClient();
```

#### 2. Replace Firebase Hooks

**Before** (Direct Firebase):
```typescript
// ❌ Direct Firestore usage
import { db } from '@cortex/db';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function usePOVs(projectId: string) {
  const [povs, setPOVs] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'povs'),
      where('projectId', '==', projectId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPOVs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [projectId]);

  return povs;
}
```

**After** (API-based):
```typescript
// ✅ API client with SWR
import useSWR from 'swr';
import { apiClient } from '@/lib/api/client';

export function usePOVs(projectId: string) {
  const { data, error, mutate } = useSWR(
    `/povs?projectId=${projectId}`,
    (url) => apiClient.get(url),
    {
      refreshInterval: 5000,  // Poll every 5 seconds (replaces real-time)
      revalidateOnFocus: true
    }
  );

  return {
    povs: data?.povs || [],
    loading: !data && !error,
    error,
    refresh: mutate
  };
}
```

---

## Priority Matrix

### 🔴 Critical (Do First)

1. **Refactor services to use adapters** - Prevents new Firebase dependencies
2. **Remove Firebase from functions** - Enables true self-hosted deployment
3. **Deprecate legacy exports** - Warns developers not to use old APIs

### 🟡 Important (Do Soon)

1. **Frontend API client migration** - Reduces Firebase dependency
2. **Move Firebase config to legacy** - Cleanly separates deployment modes
3. **Update documentation** - Helps team understand new architecture

### 🟢 Nice to Have (Do Later)

1. **Remove unused Firebase files** - Reduces codebase size
2. **Optimize bundle size** - Removes Firebase SDK from frontend
3. **Add deployment mode tests** - Ensures both modes work

---

## Success Criteria

### ✅ Phase 1 Complete When:
- [ ] All services use `getDatabase()` adapter
- [ ] No direct `firebase/firestore` imports in services
- [ ] Legacy exports marked as deprecated
- [ ] Firestore utilities moved to legacy/

### ✅ Phase 2 Complete When:
- [ ] Functions run without firebase-functions SDK
- [ ] No firebase-admin usage (use adapters instead)
- [ ] Standard logging (no firebase-functions/logger)
- [ ] Express server is standalone and portable

### ✅ Phase 3 Complete When:
- [ ] Frontend uses API client for all data
- [ ] No direct Firebase SDK usage in components
- [ ] Authentication is API-based
- [ ] Firebase SDK removed from frontend bundle (self-hosted mode)

### ✅ Phase 4 Complete When:
- [ ] Firebase files organized in deployment/firebase/
- [ ] Clear documentation for both deployment modes
- [ ] Deployment scripts for firebase vs self-hosted
- [ ] Environment templates for both modes

---

## Testing Strategy

### Unit Tests
- [ ] Test database adapters with mock implementations
- [ ] Test API client with mock fetch
- [ ] Test authentication flows for both modes

### Integration Tests
- [ ] Test functions microservice standalone
- [ ] Test frontend with self-hosted backend
- [ ] Test Firebase mode still works (backward compatibility)

### End-to-End Tests
- [ ] Deploy to self-hosted environment
- [ ] Verify all features work without Firebase
- [ ] Verify Firebase deployment still works

---

## Risk Assessment

### 🔴 High Risk
- **Breaking existing Firebase deployments** - Mitigate by maintaining backward compatibility
- **Data loss during migration** - Mitigate with database adapter testing and backups

### 🟡 Medium Risk
- **Performance regression** - Mitigate by performance testing both modes
- **Authentication issues** - Mitigate with staged rollout and fallbacks

### 🟢 Low Risk
- **Build failures** - Mitigate with CI/CD checks
- **Documentation gaps** - Mitigate with comprehensive migration guides

---

## Timeline Estimate

- **Phase 1 (Database Cleanup)**: 2-3 days
- **Phase 2 (Functions Migration)**: 3-4 days
- **Phase 3 (Frontend Migration)**: 5-7 days
- **Phase 4 (Configuration Cleanup)**: 1-2 days

**Total**: 11-16 days (2-3 weeks)

---

## Next Steps

1. ✅ Complete this audit document
2. 🟡 Refactor user-management-service.ts to use adapters
3. 🟡 Refactor other services one by one
4. ⏳ Remove Firebase from functions/
5. ⏳ Create frontend API client
6. ⏳ Migrate frontend to API-based data fetching
7. ⏳ Organize Firebase-specific files
8. ⏳ Update all documentation

---

## Questions & Decisions Needed

1. **Backward Compatibility**: Do we need to support Firebase deployment mode indefinitely?
   - **Recommendation**: Yes, maintain for existing customers, but make self-hosted the default

2. **Real-time Updates**: Firebase has real-time listeners. How to handle in self-hosted?
   - **Recommendation**: WebSocket layer or polling with SWR

3. **Firebase Extensions**: What about installed Firebase extensions?
   - **Recommendation**: Replicate functionality in self-hosted or mark as Firebase-only features

4. **Migration Path**: How to migrate existing Firebase customers to self-hosted?
   - **Recommendation**: Create data export/import tools

---

**Last Updated**: 2025-10-14
**Next Review**: After Phase 1 completion

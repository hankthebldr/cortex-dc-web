# Phase 2: Frontend Migration Guide

## Overview

Step-by-step guide to migrate the Cortex DC Web Platform frontend from direct Firebase SDK usage to the unified backend API.

**Status**: Ready to implement
**Duration**: 2 weeks
**Prerequisites**: Phase 1 (Backend API) ✅ Complete

---

## What's Been Implemented

### ✅ Complete

1. **API Client** (`apps/web/lib/api-client.ts`)
   - Full REST API client with 40+ methods
   - Automatic token management and refresh
   - Error handling and retry logic
   - TypeScript interfaces for all responses

2. **Authentication Module** (`apps/web/lib/auth.ts`)
   - Firebase Auth integration (OAuth, email/password)
   - Backend API profile fetching
   - Token synchronization
   - Auth state management

3. **Data Fetching Hooks** (`apps/web/lib/hooks/use-api.ts`)
   - SWR-based data fetching with caching
   - CRUD operation hooks
   - Optimistic updates
   - Automatic revalidation

4. **Environment Configuration**
   - `.env.local.example` - Local development template
   - `.env.production.example` - Production template
   - Feature flags and API URL configuration

5. **Dependencies**
   - Added `swr` for data fetching
   - Kept `firebase` for auth only
   - Updated `package.json`

---

## Migration Steps

### Week 1: Core Infrastructure

#### Day 1: Setup and Configuration

**1. Install Dependencies**

```bash
cd apps/web
pnpm install
```

**2. Create Environment File**

```bash
cp .env.local.example .env.local
```

**3. Update `.env.local` with your values**

```bash
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Firebase (get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cortex-dc-portal.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cortex-dc-portal
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here

# Feature Flags
NEXT_PUBLIC_USE_BACKEND_API=true
```

**4. Start Backend API**

```bash
# Terminal 1: Start backend
cd /Users/henry/Github/Github_desktop/cortex-dc-web
pnpm --filter @cortex/backend dev
```

**5. Start Frontend**

```bash
# Terminal 2: Start frontend
cd /Users/henry/Github/Github_desktop/cortex-dc-web/apps/web
pnpm dev
```

#### Day 2-3: Authentication Pages

**Create Login Page** (`apps/web/app/login/page.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <h2 className="text-3xl font-bold">Sign In to Cortex DC</h2>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border p-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border p-2"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
```

**Create Auth Provider** (`apps/web/components/providers/auth-provider.tsx`)

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthChange } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Update Root Layout** (`apps/web/app/layout.tsx`)

```typescript
import { AuthProvider } from '@/components/providers/auth-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### Day 4-5: Dashboard Migration

**Before (Direct Firestore):**

```typescript
// Old approach - DON'T USE
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@cortex/db';

async function fetchPOVs() {
  const q = query(
    collection(db, 'povs'),
    where('userId', '==', currentUser.uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

**After (Backend API):**

```typescript
// New approach - USE THIS
import { usePOVs } from '@/lib/hooks/use-api';

function POVList() {
  const { data: povs, isLoading, error } = usePOVs(currentUser.uid);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {povs.map(pov => (
        <POVCard key={pov.id} pov={pov} />
      ))}
    </div>
  );
}
```

**Update Dashboard** (`apps/web/app/(dashboard)/page.tsx`)

```typescript
'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { usePOVs, useTRRs } from '@/lib/hooks/use-api';
import { POVCard } from '@cortex-dc/ui';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: povs, isLoading: povsLoading } = usePOVs(user?.uid);
  const { data: trrs, isLoading: trrsLoading } = useTRRs(user?.uid);

  if (!user) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Active POVs</h2>
        {povsLoading ? (
          <div>Loading POVs...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {povs.map(pov => (
              <POVCard key={pov.id} pov={pov} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Recent TRRs</h2>
        {trrsLoading ? (
          <div>Loading TRRs...</div>
        ) : (
          <div className="space-y-4">
            {trrs.map(trr => (
              <div key={trr.id} className="border rounded-lg p-4">
                {trr.name}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

### Week 2: Complete Component Migration

#### Day 6-7: POV Management

**Update POV Creation** (`apps/web/app/pov/create/page.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreatePOV } from '@/lib/hooks/use-api';
import { Button } from '@/components/ui/button';

export default function CreatePOVPage() {
  const [name, setName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const { create, isCreating, error } = useCreatePOV();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await create({
        name,
        customerName,
        status: 'draft',
        scope: [],
      });

      router.push('/pov');
    } catch (err) {
      console.error('Failed to create POV:', err);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create POV</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
          {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-2">
            POV Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-md border p-2"
            required
          />
        </div>

        <Button type="submit" loading={isCreating}>
          Create POV
        </Button>
      </form>
    </div>
  );
}
```

#### Day 8-9: File Upload and Storage

**Update File Upload Component**

```typescript
'use client';

import { useFileUpload } from '@/lib/hooks/use-api';

export function FileUploader() {
  const { upload, isUploading, error } = useFileUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await upload({
        file,
        path: `uploads/${Date.now()}-${file.name}`,
        metadata: {
          originalName: file.name,
          size: file.size,
          type: file.type,
        },
      });

      console.log('File uploaded:', result);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading && <p>Uploading...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
    </div>
  );
}
```

#### Day 10: Testing and Validation

**Create Integration Tests**

```typescript
// apps/web/__tests__/integration/auth-flow.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import LoginPage from '@/app/login/page';

describe('Authentication Flow', () => {
  it('allows user to login with email', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByPlaceholder(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholder(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

**Manual Testing Checklist**:

- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Logout
- [ ] View dashboard (POVs, TRRs)
- [ ] Create new POV
- [ ] Edit POV
- [ ] Delete POV
- [ ] Upload file
- [ ] Download file
- [ ] AI chat
- [ ] Data export (CSV, JSON)

---

## Migration Patterns

### Pattern 1: List Data Fetching

**Before:**
```typescript
const [povs, setPOVs] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    const q = query(collection(db, 'povs'));
    const snapshot = await getDocs(q);
    setPOVs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };
  fetchData();
}, []);
```

**After:**
```typescript
const { data: povs, isLoading } = usePOVs();
```

### Pattern 2: Create Data

**Before:**
```typescript
const handleCreate = async (data) => {
  await addDoc(collection(db, 'povs'), data);
};
```

**After:**
```typescript
const { create, isCreating } = useCreatePOV();
const handleCreate = async (data) => {
  await create(data);
};
```

### Pattern 3: Update Data

**Before:**
```typescript
const handleUpdate = async (id, updates) => {
  await updateDoc(doc(db, 'povs', id), updates);
};
```

**After:**
```typescript
const { patch, isPatching } = usePatchPOV();
const handleUpdate = async (id, updates) => {
  await patch({ id, updates });
};
```

### Pattern 4: Delete Data

**Before:**
```typescript
const handleDelete = async (id) => {
  await deleteDoc(doc(db, 'povs', id));
};
```

**After:**
```typescript
const { deleteItem, isDeleting } = useDeletePOV();
const handleDelete = async (id) => {
  await deleteItem(id);
};
```

---

## Troubleshooting

### Issue: API connection refused

**Solution:**
```bash
# Ensure backend is running
cd /Users/henry/Github/Github_desktop/cortex-dc-web
pnpm --filter @cortex/backend dev

# Check .env.local
# Verify NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Issue: Authentication token not set

**Solution:**
```typescript
// Check if token is being set after login
import { apiClient } from '@/lib/api-client';

// After successful Firebase login:
const token = await firebaseUser.getIdToken();
apiClient.setAuthToken(token);
```

### Issue: CORS errors

**Solution:**
Backend already configured with CORS. Ensure:
```typescript
// packages/backend/src/config/env.config.ts
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### Issue: SWR cache not invalidating

**Solution:**
```typescript
import { invalidateCache } from '@/lib/hooks/use-api';

// After mutation
invalidateCache('/api/data/povs');

// Or use built-in revalidation
const { mutate } = usePOVs();
await mutate();
```

---

## Performance Optimization

### 1. Enable Request Deduplication

Already configured in hooks:
```typescript
useSWR(key, fetcher, {
  dedupingInterval: 2000, // Dedupe within 2 seconds
});
```

### 2. Implement Optimistic Updates

```typescript
const { patch } = usePatchPOV();
const { data: povs, mutate } = usePOVs();

const handleUpdate = async (id, updates) => {
  // Optimistically update UI
  mutate(
    povs.map(pov => pov.id === id ? { ...pov, ...updates } : pov),
    false // Don't revalidate yet
  );

  try {
    await patch({ id, updates });
  } catch (err) {
    // Revert on error
    mutate();
  }
};
```

### 3. Prefetch Data

```typescript
import { prefetchData } from '@/lib/hooks/use-api';

// On hover or route change
await prefetchData('povs', null, { userId });
```

---

## Success Metrics

### Performance
- [ ] Page load time < 2s
- [ ] API response time < 200ms (p95)
- [ ] Zero client-side Firestore calls
- [ ] Bundle size reduced by 70%

### Functionality
- [ ] All CRUD operations working
- [ ] File upload/download working
- [ ] AI features working
- [ ] Data export working
- [ ] Authentication working

### Developer Experience
- [ ] Easier to test (mock API calls)
- [ ] Faster local development
- [ ] Better error messages
- [ ] Cleaner code (fewer Firestore queries)

---

## Next Steps

After Phase 2 completion:

1. **Phase 3: Package Optimization** (1 week)
   - Remove unused Firebase SDK features
   - Optimize bundle size
   - Update @cortex/db package

2. **Phase 4: GKE Deployment** (1 week)
   - Deploy to staging
   - Load testing
   - Production deployment

3. **Phase 5: Cleanup** (1 week)
   - Remove old Firebase Functions
   - Update documentation
   - Team training

---

## Support

Questions or issues? Check:
1. [GKE Optimization Strategy](./GKE_OPTIMIZATION_STRATEGY.md)
2. [Backend API Documentation](./packages/backend/README.md)
3. [API Client Examples](./apps/web/lib/api-client.ts)

---

**Document Version**: 1.0
**Last Updated**: January 2025
**Status**: Ready for Implementation ✅

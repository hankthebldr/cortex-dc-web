# Authentication Module

The authentication module provides a unified interface for user authentication that works seamlessly across multiple deployment modes without code changes.

## Architecture Overview

```
Components → useAuth() Hook → Auth Adapter Factory → Adapter Implementation
                                                    ↓
                                    ┌──────────────┴──────────────┐
                                    │                             │
                            Firebase Auth                  Keycloak/Self-Hosted
```

## Deployment Modes

The authentication system supports two deployment modes, controlled by the `NEXT_PUBLIC_DEPLOYMENT_MODE` environment variable.

### Firebase Mode (Default)

**Environment Configuration:**
```bash
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**Features:**
- Firebase Authentication SDK
- Email/password authentication
- Google OAuth
- GitHub OAuth
- Okta SAML/OAuth via Firebase SAML provider
- Built-in session management
- Automatic token refresh

**Use Cases:**
- Rapid prototyping
- Small to medium deployments
- Leveraging Firebase ecosystem
- Managed infrastructure

### Self-Hosted Mode

**Environment Configuration:**
```bash
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_KEYCLOAK_URL=https://keycloak.your-domain.com
NEXT_PUBLIC_KEYCLOAK_REALM=cortex-dc
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=cortex-dc-web
```

**Features:**
- Keycloak authentication server
- Email/password authentication
- OAuth 2.0 / OpenID Connect
- SAML 2.0 enterprise SSO
- LDAP/Active Directory integration
- Custom identity providers
- On-premise deployment

**Use Cases:**
- Enterprise deployments
- Regulatory compliance (HIPAA, SOC 2, etc.)
- Custom security requirements
- On-premise infrastructure
- Multi-tenancy with isolation

## File Structure

```
lib/auth/
├── README.md                    # This file
├── auth.adapter.ts             # AuthAdapter interface definition
├── firebase-auth.adapter.ts    # Firebase implementation
├── self-hosted-auth.adapter.ts # Keycloak/Self-hosted implementation
└── index.ts                    # Public API & factory
```

## Usage in Components

### Basic Authentication

```tsx
import { useAuth } from '@/contexts/auth-context';

function LoginPage() {
  const { signIn, user, isLoading } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      // User is now authenticated
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.displayName}!</div>;

  return <LoginForm onSubmit={handleLogin} />;
}
```

### Direct Auth Module Usage

```tsx
import { signInWithEmail, getCurrentUser, signOut } from '@/lib/auth';

// Sign in
const user = await signInWithEmail('user@example.com', 'password');

// Get current user
const currentUser = await getCurrentUser();

// Sign out
await signOut();
```

### OAuth Providers

```tsx
import { signInWithGoogle, signInWithGitHub } from '@/lib/auth';

// Google OAuth
const googleUser = await signInWithGoogle();

// GitHub OAuth
const githubUser = await signInWithGitHub();
```

### Enterprise SSO (Okta)

```tsx
import { signInWithOktaSAML, signInWithOktaOAuth } from '@/lib/auth';

// Okta SAML (popup flow)
const user = await signInWithOktaSAML('saml.okta-cortex', false);

// Okta OAuth (redirect flow)
await signInWithOktaOAuth('your-client-id', true);
// User will be redirected to Okta and back
```

### Auth State Listening

```tsx
import { onAuthChange } from '@/lib/auth';

useEffect(() => {
  const unsubscribe = onAuthChange((user) => {
    if (user) {
      console.log('User signed in:', user.email);
    } else {
      console.log('User signed out');
    }
  });

  return () => unsubscribe();
}, []);
```

## API Reference

### Core Methods

#### `registerWithEmail(email, password, displayName?)`
Register a new user with email and password.

**Returns:** `Promise<User>`

#### `signInWithEmail(email, password)`
Sign in with email and password.

**Returns:** `Promise<User>`

#### `signInWithGoogle()`
Sign in with Google OAuth.

**Returns:** `Promise<User>`

#### `signInWithGitHub()`
Sign in with GitHub OAuth.

**Returns:** `Promise<User>`

#### `signOut()`
Sign out the current user.

**Returns:** `Promise<void>`

#### `getCurrentUser()`
Get the currently authenticated user.

**Returns:** `Promise<User | null>`

#### `updateUserProfile(updates)`
Update the current user's profile.

**Returns:** `Promise<User>`

#### `sendPasswordReset(email)`
Send a password reset email.

**Returns:** `Promise<void>`

#### `sendEmailVerification()`
Send an email verification to the current user.

**Returns:** `Promise<void>`

#### `onAuthChange(callback)`
Listen for authentication state changes.

**Returns:** `() => void` (unsubscribe function)

### Enterprise SSO Methods

#### `signInWithOktaSAML(providerId?, useRedirect?)`
Sign in with Okta using SAML 2.0.

**Parameters:**
- `providerId` (string): SAML provider ID (default: 'saml.okta')
- `useRedirect` (boolean): Use redirect flow vs popup (default: false)

**Returns:** `Promise<User | null>`

#### `signInWithOktaOAuth(clientId, useRedirect?)`
Sign in with Okta using OAuth 2.0.

**Parameters:**
- `clientId` (string): Your Okta application client ID
- `useRedirect` (boolean): Use redirect flow vs popup (default: false)

**Returns:** `Promise<User | null>`

#### `signInWithSAML(providerId, useRedirect?)`
Generic SAML sign-in for any SAML provider.

**Parameters:**
- `providerId` (string): SAML provider ID configured in auth system
- `useRedirect` (boolean): Use redirect flow vs popup (default: false)

**Returns:** `Promise<User | null>`

#### `getOktaRedirectResult()`
Handle the redirect result after OAuth/SAML authentication. Call this on app initialization.

**Returns:** `Promise<User | null>`

## User Object

```typescript
interface User {
  uid: string;              // Unique user identifier
  email: string;            // User email address
  displayName?: string;     // User display name
  photoURL?: string;        // Profile photo URL
  emailVerified: boolean;   // Email verification status
  role?: string;            // User role (admin, manager, user)
  permissions?: Record<string, any>; // Role-based permissions
  createdAt?: string;       // Account creation timestamp
  updatedAt?: string;       // Last update timestamp
}
```

## Switching Deployment Modes

### Development

```bash
# .env.local for Firebase mode
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
NEXT_PUBLIC_FIREBASE_API_KEY=...

# .env.local for Self-hosted mode
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:9090
```

### Production

```bash
# Vercel/Netlify Environment Variables
NEXT_PUBLIC_DEPLOYMENT_MODE=firebase
# ... other Firebase vars

# Or for self-hosted
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
# ... other Keycloak vars
```

### Docker

```yaml
# docker-compose.yml
services:
  web:
    environment:
      - NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
      - NEXT_PUBLIC_API_URL=http://api:8080
      - NEXT_PUBLIC_KEYCLOAK_URL=http://keycloak:9090
```

### Kubernetes

```yaml
# k8s/deployment.yaml
env:
  - name: NEXT_PUBLIC_DEPLOYMENT_MODE
    value: "self-hosted"
  - name: NEXT_PUBLIC_API_URL
    valueFrom:
      configMapKeyRef:
        name: cortex-config
        key: api-url
```

## Testing

### Unit Tests

```typescript
// __tests__/auth.test.ts
import { signInWithEmail } from '@/lib/auth';

// Mock environment
process.env.NEXT_PUBLIC_DEPLOYMENT_MODE = 'firebase';

test('signs in with email', async () => {
  const user = await signInWithEmail('test@example.com', 'password');
  expect(user.email).toBe('test@example.com');
});
```

### E2E Tests

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('Firebase mode login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Self-hosted mode login', async ({ page }) => {
    // Test with NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
    // ... same test, different backend
  });
});
```

## Security Considerations

### Token Management

- **Firebase Mode:** Tokens stored in localStorage, auto-refreshed by Firebase SDK
- **Self-Hosted Mode:** Tokens stored in httpOnly cookies, refreshed via API

### Session Expiration

- **Firebase Mode:** 1 hour (Firebase default), auto-refresh on activity
- **Self-Hosted Mode:** Configurable via Keycloak (default: 30 minutes)

### CSRF Protection

- All API routes use Next.js built-in CSRF protection
- Self-hosted mode additionally validates origin headers

### Rate Limiting

Configure rate limiting at the API gateway level:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Rate limit auth endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return rateLimitMiddleware(request);
  }
}
```

## Troubleshooting

### "Auth adapter not initialized"

**Cause:** `NEXT_PUBLIC_DEPLOYMENT_MODE` not set or invalid.

**Solution:** Set to `firebase` or `self-hosted` in `.env.local`

### "Failed to sign in" in Self-Hosted Mode

**Cause:** Keycloak not reachable or misconfigured.

**Solution:**
1. Verify `NEXT_PUBLIC_KEYCLOAK_URL` is correct
2. Check Keycloak realm and client configuration
3. Ensure CORS is enabled in Keycloak for your domain

### Firebase Mode Works but Self-Hosted Doesn't

**Cause:** Backend API routes may not be using adapters.

**Solution:** Ensure all API routes use `getAuth()` from `@cortex/db`:

```typescript
// ✅ Correct
import { getAuth } from '@cortex/db';
const auth = getAuth();

// ❌ Wrong
import { auth } from '@/lib/firebase';
```

### Redirect Loop on Login

**Cause:** Session cookie not being set correctly.

**Solution:** Check cookie settings in API routes:

```typescript
cookies().set('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
});
```

## Migration Guide

### From Firebase-Only to Multi-Mode

If you have existing Firebase-only code:

```typescript
// ❌ Old (Firebase-only)
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const handleLogin = async () => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // ...
};

// ✅ New (Multi-mode)
import { useAuth } from '@/contexts/auth-context';

const { signIn } = useAuth();
const handleLogin = async () => {
  await signIn(email, password);
  // Works with both Firebase and Keycloak!
};
```

## Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Next.js Authentication Patterns](https://nextjs.org/docs/authentication)
- [SAML 2.0 Specification](https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)

## Support

For issues or questions:
1. Check this README
2. Review the adapter implementation files
3. Check the main project CLAUDE.md for architecture details
4. Consult the backend adapter documentation in `packages/db/`

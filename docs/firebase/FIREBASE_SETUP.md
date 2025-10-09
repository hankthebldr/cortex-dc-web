# Firebase Configuration Guide

## Overview

This document outlines the Firebase configuration and setup for the Cortex DC Web application, including client-side authentication, Firestore integration, and deployment features.

## Configuration Files

### Client Configuration
- **Location:** `apps/web/lib/firebase.ts`
- **Purpose:** Initializes Firebase client-side services
- **Services:** Authentication, Firestore, Storage, Analytics

### Authentication Service
- **Location:** `apps/web/lib/auth.ts`
- **Purpose:** Provides authentication methods and user management
- **Features:** Email/password login, Google OAuth, role-based user profiles

### Providers
- **ThemeProvider:** `apps/web/components/providers/ThemeProvider.tsx`
- **AuthProvider:** `apps/web/components/providers/AuthProvider.tsx`

## Firebase Services Configured

### 1. Authentication
```typescript
// Email/password and Google OAuth support
import { getAuth } from 'firebase/auth';
export const auth = getAuth(app);
```

**Features:**
- Email/password authentication
- Google OAuth integration
- Role-based access control (user, management, admin)
- Automatic user profile creation via Cloud Function

### 2. Firestore Database
```typescript
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
```

**Collections:**
- `users/{uid}` - User profiles with role information
- RBAC rules implemented for secure data access

### 3. Storage
```typescript
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);
```

**Purpose:** File uploads and asset management

### 4. Analytics
```typescript
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
```

**Features:** User behavior tracking and insights

## Project Configuration

### Firebase Project Details
- **Project ID:** cortex-dc-portal
- **Auth Domain:** cortex-dc-portal.firebaseapp.com
- **Storage Bucket:** cortex-dc-portal.firebasestorage.app

### Security Features
- **RBAC Implementation:** Role-based access control with three levels
- **Secure Rules:** Firestore security rules prevent unauthorized access
- **Client-side Protection:** Route guards and authentication checks

## Integration with Application

### Authentication Flow
1. User signs in via login page
2. Firebase Authentication validates credentials
3. AuthProvider manages authentication state
4. Cloud Function creates/updates user profile
5. Dashboard displays based on user role

### Role-Based Access Control
- **User:** Access to POV Management, TRR Management, Content Hub, etc.
- **Management:** Additional access to team dashboards and management features
- **Admin:** Full platform access including administration tools

## Deployment Configuration

### Firebase Hosting
- **Type:** App Hosting (for dynamic Next.js application)
- **Region:** us-central1
- **Source:** apps/web directory

### Cloud Functions
- **Runtime:** Node.js 20
- **Functions:** onCreateUser (user profile creation)
- **Region:** us-central1

### Environment Variables
All sensitive configuration is handled through Firebase's built-in configuration system.

## Development Workflow

### Local Development
```bash
# Start emulators
firebase emulators:start --only auth,firestore,functions

# Start web app
cd apps/web && pnpm dev
```

### Testing Authentication
1. Navigate to `/login`
2. Sign in with email/password or Google
3. Verify user profile creation in Firestore
4. Test role-based navigation

### Deployment
```bash
# Build and deploy full stack
pnpm run build
firebase deploy
```

## Best Practices

1. **Security First:** Always validate user roles on both client and server
2. **Error Handling:** Implement proper error handling for auth failures
3. **Performance:** Use Firebase SDK tree-shaking for optimal bundle size
4. **Monitoring:** Leverage Firebase Analytics for user insights

## Troubleshooting

### Common Issues
1. **Hydration Errors:** Use `suppressHydrationWarning` on html element
2. **Auth State:** Ensure AuthProvider wraps the entire application
3. **Build Errors:** Check that all Firebase imports are properly configured

### Debug Steps
1. Check browser console for Firebase errors
2. Verify Firebase project configuration
3. Test authentication in emulator first
4. Review Firestore security rules

## Next Steps

1. **Enhanced Security:** Add multi-factor authentication
2. **Performance:** Implement auth state persistence
3. **Features:** Add password reset functionality
4. **Monitoring:** Set up Firebase Performance monitoring
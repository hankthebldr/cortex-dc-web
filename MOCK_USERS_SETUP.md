# Mock Users Setup for Smoke Testing

## Quick Setup Guide

Since we need to create test users with custom role claims, follow these steps:

### Option 1: Manual Creation via Firebase Console (Recommended for Quick Testing)

1. **Go to Firebase Console**
   - Navigate to https://console.firebase.google.com
   - Select project: `cortex-dc-portal`
   - Go to Authentication > Users

2. **Create Admin User**
   - Click "Add user"
   - Email: `user@cortex`
   - Password: `xsiam`
   - Click "Add user"

3. **Create Regular User**
   - Click "Add user"
   - Email: `user1@cortex`
   - Password: `xsiam`
   - Click "Add user"

4. **Set Custom Claims for Roles**

   To set custom claims (roles), you have two options:

   **Option A: Using Firebase CLI (Quick)**
   ```bash
   # Install Firebase CLI if not already installed
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Set admin role for user@cortex
   firebase auth:export users.json --project cortex-dc-portal
   # Find the UID for user@cortex
   # Then use Cloud Functions or Admin SDK to set claims
   ```

   **Option B: Using Cloud Function (Recommended)**

   Deploy this Cloud Function to set custom claims:

   ```typescript
   // functions/src/setUserRole.ts
   import * as functions from 'firebase-functions';
   import * as admin from 'firebase-admin';

   admin.initializeApp();

   export const setUserRole = functions.https.onCall(async (data, context) => {
     // Only allow admins to set roles (in production)
     const { email, role } = data;

     const user = await admin.auth().getUserByEmail(email);
     await admin.auth().setCustomUserClaims(user.uid, { role });

     return { success: true, message: `Role ${role} set for ${email}` };
   });
   ```

   Then call it:
   ```bash
   firebase functions:shell
   > setUserRole({email: 'user@cortex', role: 'admin'})
   > setUserRole({email: 'user1@cortex', role: 'user'})
   ```

### Option 2: Using Firebase Emulator (For Local Testing)

If you want to test locally without affecting production:

1. **Start Firebase Emulator**
   ```bash
   firebase emulators:start
   ```

2. **Create Users in Emulator**
   - Open Emulator UI: http://localhost:4040
   - Go to Authentication
   - Add users manually or use the script

3. **Configure App to Use Emulator**
   Create `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_USE_EMULATOR=true
   NEXT_PUBLIC_AUTH_EMULATOR_HOST=localhost:9099
   NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost
   NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT=8080

   # Other required config
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=cortex-dc-portal
   NEXT_PUBLIC_FIREBASE_API_KEY=mock-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cortex-dc-portal.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_APP_ID=mock-app-id
   ```

4. **Run the mock users script**
   ```bash
   # With emulator running
   export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
   npx ts-node scripts/create-mock-users.ts
   ```

### Option 3: Using the Admin Script (Requires Service Account)

If you have a service account key:

1. **Download Service Account Key**
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `service-account-key.json` in project root

2. **Set Environment Variable**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
   export FIREBASE_PROJECT_ID="cortex-dc-portal"
   ```

3. **Run Script**
   ```bash
   npx ts-node scripts/create-mock-users.ts
   ```

## Test User Accounts

After creation, you should have:

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| user@cortex | xsiam | admin | All features + Admin panel |
| user1@cortex | xsiam | user | Basic dashboard, own POVs/TRRs |

## Verifying User Roles

To verify custom claims are set correctly:

```typescript
// In browser console after login:
firebase.auth().currentUser.getIdTokenResult().then(token => {
  console.log('Custom claims:', token.claims);
  console.log('Role:', token.claims.role);
});
```

## Next Steps

Once users are created:
1. Start dev server: `pnpm --filter "@cortex-dc/web" dev`
2. Navigate to http://localhost:3000
3. Begin smoke testing from SMOKE_TEST_PLAN.md

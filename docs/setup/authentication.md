# Firebase Authentication Setup

## Initial Setup

### 1. Enable Authentication
1. Go to [Firebase Console Authentication](https://console.firebase.google.com/project/cortex-dc-portal/authentication)
2. Click "Get started"
3. This enables the Authentication service

### 2. Configure Sign-in Methods
After enabling Authentication, configure these providers:

#### Email/Password
- Go to "Sign-in method" tab
- Click on "Email/Password"
- Enable "Email/Password"
- Save

#### Google Sign-in (Recommended)
- Click on "Google"
- Enable the provider
- Set the project support email
- Save

#### Optional Providers
- GitHub (for developers)
- Microsoft (for enterprise)
- Apple (for iOS apps)

### 3. Authentication Rules
The current Firestore security rules should allow authenticated users to:
- Read their own user document: `users/{uid}`
- Write access is controlled by Cloud Functions

### 4. Testing Authentication
Once enabled, you can test by:
1. Using the Firebase Auth Emulator locally
2. Creating test users in the Firebase Console
3. Using the web app sign-up flow

## Integration Points

### Cloud Function: onCreateUser
- Triggers on user creation
- Creates/updates Firestore `users/{uid}` document
- Handles both social login and email/password registration

### Web App: AuthProvider
- Located: `apps/web/components/providers/AuthProvider.tsx`
- Manages authentication state
- Integrates with Next.js routing

### Security Rules
- Users can read their own profile
- All writes go through Cloud Functions
- Ensures data consistency and security

## Troubleshooting

### Function Deployment Errors
If you see "Firebase Auth is not enabled":
1. Ensure Authentication is enabled in Console
2. Wait 2-3 minutes for propagation
3. Retry deployment

### Permission Issues
- Ensure you're project owner or have Firebase Admin role
- Check that all required APIs are enabled
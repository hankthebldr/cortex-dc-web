# Okta SSO Integration Guide for Cortex DC Web

## Overview

Cortex DC Web now supports enterprise Single Sign-On (SSO) through Okta using either **SAML 2.0** or **OAuth 2.0/OIDC**. This guide will walk you through the complete setup process.

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Option 1: SAML Integration (Recommended for Enterprise)](#option-1-saml-integration)
3. [Option 2: OAuth/OIDC Integration](#option-2-oauthoidc-integration)
4. [Firebase Configuration](#firebase-configuration)
5. [Environment Variables](#environment-variables)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Authentication Flow

```
User → Login Page → Okta SSO → Firebase Auth → Backend API → Dashboard
```

1. User clicks "Sign in with Okta" on login page
2. User is redirected to Okta login (or popup)
3. Okta authenticates user and returns SAML assertion/OAuth token
4. Firebase Auth validates and creates session
5. Frontend gets Firebase ID token
6. Backend API validates Firebase token and returns user profile
7. User is redirected to dashboard

---

## Option 1: SAML Integration

### Step 1: Configure Okta SAML Application

1. **Log in to Okta Admin Console**
   - Navigate to: Applications → Applications → Create App Integration

2. **Create SAML 2.0 Application**
   - Sign-In Method: **SAML 2.0**
   - App Name: **Cortex DC Portal**
   - App Logo: Upload your logo (optional)

3. **Configure SAML Settings**

   **General Settings:**
   ```
   Single sign on URL: https://cortex-dc-portal.firebaseapp.com/__/auth/handler
   Audience URI (SP Entity ID): cortex-dc-portal
   Name ID format: EmailAddress
   Application username: Email
   ```

   **Attribute Statements:**
   ```
   email       → user.email
   displayName → user.displayName
   firstName   → user.firstName
   lastName    → user.lastName
   ```

   **Group Attribute Statements (Optional):**
   ```
   groups → Matches regex: .*
   ```

4. **Assign Users/Groups**
   - Go to Assignments tab
   - Assign users or groups who should have access

5. **Download Metadata**
   - Go to Sign On tab
   - Click "View SAML setup instructions"
   - Download the Identity Provider metadata XML file

### Step 2: Configure Firebase for SAML

1. **Go to Firebase Console**
   - Navigate to: Authentication → Sign-in method

2. **Add SAML Provider**
   - Click "Add new provider"
   - Select **SAML**
   - Provider ID: `saml.okta-cortex-dc` (or any custom ID)
   - Display name: **Okta**

3. **Upload Okta Metadata**
   - Upload the XML file from Step 1.5
   - Or paste the metadata XML directly

4. **Configure RP Settings**
   ```
   Callback URL: https://cortex-dc-portal.firebaseapp.com/__/auth/handler
   ```

5. **Save Configuration**

### Step 3: Environment Variables

Add to `.env.local` (development):
```bash
NEXT_PUBLIC_OKTA_SAML_PROVIDER_ID=saml.okta-cortex-dc
```

Add to `.env.production` (production):
```bash
NEXT_PUBLIC_OKTA_SAML_PROVIDER_ID=saml.okta-cortex-dc
```

### Step 4: Test SAML Flow

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/login`

3. Click "Sign in with Okta"

4. You should be redirected to Okta login

5. After successful authentication, you should be redirected back and logged in

---

## Option 2: OAuth/OIDC Integration

### Step 1: Configure Okta OAuth Application

1. **Log in to Okta Admin Console**
   - Navigate to: Applications → Applications → Create App Integration

2. **Create OIDC Application**
   - Sign-In Method: **OIDC - OpenID Connect**
   - Application type: **Single-Page Application (SPA)**
   - App Name: **Cortex DC Portal**

3. **Configure OAuth Settings**

   **Sign-in redirect URIs:**
   ```
   https://cortex-dc-portal.firebaseapp.com/__/auth/handler
   http://localhost:3000/__/auth/handler (for testing)
   ```

   **Sign-out redirect URIs:**
   ```
   https://cortex-dc.henryreed.ai
   http://localhost:3000
   ```

   **Grant Types:**
   - ✅ Authorization Code
   - ✅ Implicit (hybrid)

   **Controlled access:**
   - Choose who can access (specific users/groups or all users)

4. **Save and Get Client ID**
   - Copy the **Client ID** from the General tab

### Step 2: Configure Firebase for OAuth

1. **Go to Firebase Console**
   - Navigate to: Authentication → Sign-in method

2. **Add OAuth Provider**
   - Click "Add new provider"
   - Select **OpenID Connect**
   - Provider ID: `oidc.okta`
   - Display name: **Okta**

3. **Configure Provider**
   ```
   Client ID: [Your Okta Client ID]
   Issuer: https://[your-okta-domain].okta.com
   ```

4. **Save Configuration**

### Step 3: Environment Variables

Add to `.env.local` (development):
```bash
NEXT_PUBLIC_OKTA_CLIENT_ID=your-client-id-here
```

Add to `.env.production` (production):
```bash
NEXT_PUBLIC_OKTA_CLIENT_ID=${OKTA_CLIENT_ID}
```

### Step 4: Test OAuth Flow

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/login`

3. Click "Sign in with Okta"

4. You should see Okta OAuth consent screen

5. After authorization, you should be redirected back and logged in

---

## Firebase Configuration

### Required Firebase Settings

1. **Enable Authentication**
   - Ensure Firebase Authentication is enabled
   - Add authorized domains:
     - `cortex-dc.henryreed.ai`
     - `localhost` (for testing)

2. **Configure Authorized Domains**
   - Go to: Authentication → Settings → Authorized domains
   - Add your production domain
   - Add `localhost` for testing

### Backend API Configuration

The backend API must be configured to:

1. **Validate Firebase ID Tokens**
   ```typescript
   // Backend validates Firebase tokens
   const decodedToken = await admin.auth().verifyIdToken(token);
   const uid = decodedToken.uid;
   ```

2. **Create User Profiles**
   - On first login, create user profile in Firestore
   - Store user metadata from Okta (email, name, groups)

3. **Handle Role Mapping**
   - Map Okta groups to Cortex roles
   - Store in user profile

---

## Environment Variables

### Complete List

#### Development (`.env.local`)
```bash
# Firebase (Auth Only)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cortex-dc-portal.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cortex-dc-portal
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080

# Okta SSO (Choose one)
NEXT_PUBLIC_OKTA_SAML_PROVIDER_ID=saml.okta-cortex-dc
# OR
# NEXT_PUBLIC_OKTA_CLIENT_ID=your-client-id

# Feature Flags
NEXT_PUBLIC_USE_BACKEND_API=true
```

#### Production (`.env.production`)
```bash
# Firebase (Auth Only)
NEXT_PUBLIC_FIREBASE_API_KEY=${FIREBASE_API_KEY}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cortex-dc-portal.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cortex-dc-portal
NEXT_PUBLIC_FIREBASE_APP_ID=${FIREBASE_APP_ID}

# Backend API
NEXT_PUBLIC_API_URL=https://api.cortex-dc.henryreed.ai

# Okta SSO
NEXT_PUBLIC_OKTA_SAML_PROVIDER_ID=${OKTA_SAML_PROVIDER_ID}
# OR
# NEXT_PUBLIC_OKTA_CLIENT_ID=${OKTA_CLIENT_ID}

# Feature Flags
NEXT_PUBLIC_USE_BACKEND_API=true
```

---

## Code Usage

### Sign in with Okta SAML

```typescript
import { signInWithOktaSAML } from '@/lib/auth';

// Popup flow
const user = await signInWithOktaSAML('saml.okta-cortex-dc', false);

// Redirect flow (better for mobile)
await signInWithOktaSAML('saml.okta-cortex-dc', true);
// User will be redirected, handle result on return
```

### Sign in with Okta OAuth

```typescript
import { signInWithOktaOAuth } from '@/lib/auth';

// Popup flow
const user = await signInWithOktaOAuth('your-client-id', false);

// Redirect flow
await signInWithOktaOAuth('your-client-id', true);
```

### Handle Redirect Result

Add this to your app initialization (e.g., in root layout or auth provider):

```typescript
import { getOktaRedirectResult } from '@/lib/auth';

useEffect(() => {
  const handleRedirect = async () => {
    try {
      const user = await getOktaRedirectResult();
      if (user) {
        console.log('User signed in:', user);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Redirect error:', error);
    }
  };

  handleRedirect();
}, []);
```

---

## Testing

### Manual Testing Checklist

- [ ] User can click "Sign in with Okta" on login page
- [ ] Okta login page appears (popup or redirect)
- [ ] User can authenticate with Okta credentials
- [ ] User is redirected back to application
- [ ] User profile is created/fetched from backend
- [ ] User is redirected to dashboard
- [ ] User can access protected resources
- [ ] User can sign out successfully

### Test Different Scenarios

1. **First-time user** (should create profile)
2. **Existing user** (should fetch profile)
3. **Multiple tabs** (should sync auth state)
4. **Session expiry** (should auto-refresh token)
5. **Network errors** (should show error message)

### Test Data

Create test users in Okta:
```
Test User 1:
- Email: testuser1@cortex-dc.com
- Name: Test User One
- Groups: cortex-users

Test Admin:
- Email: admin@cortex-dc.com
- Name: Admin User
- Groups: cortex-admins, cortex-users
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid SAML Response"

**Cause:** SAML configuration mismatch

**Solution:**
- Verify Audience URI matches in Okta and Firebase
- Check callback URL is correct
- Ensure metadata is up to date

#### 2. "Provider not found"

**Cause:** Provider ID doesn't match

**Solution:**
- Check `NEXT_PUBLIC_OKTA_SAML_PROVIDER_ID` matches Firebase provider ID
- Ensure provider is enabled in Firebase Console

#### 3. "Popup blocked"

**Cause:** Browser blocked popup window

**Solution:**
- Use redirect flow instead: `signInWithOktaSAML('saml.okta', true)`
- Or instruct users to allow popups

#### 4. "User not found in backend"

**Cause:** Backend API can't fetch user profile

**Solution:**
- Check backend API is running
- Verify Firebase token is valid
- Check backend creates user profile on first login

#### 5. "CORS error"

**Cause:** Backend API doesn't allow frontend origin

**Solution:**
- Add frontend URL to backend CORS allowed origins
- In development: `http://localhost:3000`
- In production: `https://cortex-dc.henryreed.ai`

### Debug Mode

Enable debug logging:

```typescript
// Add to your auth.ts
console.log('[Auth] Starting Okta sign-in...');
console.log('[Auth] Provider ID:', providerId);
console.log('[Auth] Redirect mode:', useRedirect);
```

### Check Firebase Auth

View active sessions in Firebase Console:
- Authentication → Users
- Click on user to see provider info

---

## Security Considerations

### Best Practices

1. **Use HTTPS in Production**
   - All OAuth/SAML flows require HTTPS
   - Use `localhost` for local development only

2. **Validate Tokens**
   - Backend must validate Firebase ID tokens
   - Don't trust client-side user data

3. **Implement Role-Based Access Control**
   - Map Okta groups to application roles
   - Enforce permissions in backend API

4. **Session Management**
   - Firebase sessions expire after 1 hour by default
   - Implement auto-refresh logic (already built-in)

5. **Audit Logging**
   - Log authentication events
   - Monitor failed login attempts
   - Alert on suspicious activity

### Compliance

- **SAML 2.0 Compliance:** Ensures enterprise SSO standards
- **OAuth 2.0/OIDC:** Industry-standard authorization
- **GDPR:** User data stored in Firestore (EU regions available)
- **SOC 2:** Firebase and Okta are SOC 2 compliant

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Okta SAML/OAuth app configured and tested
- [ ] Firebase SAML/OAuth provider configured
- [ ] Environment variables set in production
- [ ] Backend API configured for Okta integration
- [ ] Authorized domains added to Firebase
- [ ] SSL certificates valid
- [ ] CORS configured correctly
- [ ] Role mapping configured
- [ ] Test users created and verified

### Deployment Steps

1. **Set Environment Variables**
   ```bash
   # In your deployment platform (Vercel, GCP, etc.)
   OKTA_SAML_PROVIDER_ID=saml.okta-cortex-dc
   # OR
   OKTA_CLIENT_ID=your-client-id
   ```

2. **Deploy Frontend**
   ```bash
   pnpm build
   pnpm deploy
   ```

3. **Test Production**
   - Navigate to production login page
   - Test Okta sign-in flow
   - Verify dashboard access

4. **Monitor**
   - Check logs for authentication errors
   - Monitor Firebase Authentication metrics
   - Set up alerts for failed logins

---

## Support and Resources

### Documentation Links

- [Firebase SAML Authentication](https://firebase.google.com/docs/auth/web/saml)
- [Firebase OAuth Authentication](https://firebase.google.com/docs/auth/web/openid-connect)
- [Okta SAML Configuration](https://help.okta.com/en/prod/Content/Topics/Apps/Apps_App_Integration_Wizard_SAML.htm)
- [Okta OIDC Configuration](https://help.okta.com/en/prod/Content/Topics/Apps/Apps_App_Integration_Wizard_OIDC.htm)

### Getting Help

If you encounter issues:

1. Check troubleshooting section above
2. Review Firebase Auth logs
3. Check Okta system logs
4. Contact your Okta administrator
5. File an issue on GitHub (for code bugs)

---

## Appendix

### SAML vs OAuth: Which to Choose?

| Feature | SAML | OAuth/OIDC |
|---------|------|------------|
| **Use Case** | Enterprise SSO | Modern apps, APIs |
| **Complexity** | Higher | Lower |
| **Setup Time** | ~30 minutes | ~15 minutes |
| **Mobile Support** | Good (redirect) | Better |
| **Enterprise Features** | Excellent | Good |
| **Recommended For** | Large orgs, compliance | Startups, modern apps |

**Recommendation:** Use **SAML** for enterprise deployments with strict compliance requirements. Use **OAuth/OIDC** for faster setup and modern app architectures.

### Code Reference

All Okta integration code is in:
- `/apps/web/lib/auth.ts` - Authentication functions
- `/apps/web/app/(auth)/login/page.tsx` - Login UI
- `/apps/web/contexts/auth-context.tsx` - Auth state management

---

**Last Updated:** 2025-10-13
**Version:** 1.0.0
**Author:** Claude Code (AI Assistant)

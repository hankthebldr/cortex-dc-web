/**
 * Authentication Module
 * Integrates Firebase Auth with Backend API
 */

import { auth } from '@cortex/db';
import { apiClient } from './api-client';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  SAMLAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
} from 'firebase/auth';

/**
 * User interface matching backend API response
 */
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role?: string;
  permissions?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Register a new user with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get Firebase ID token
    const token = await firebaseUser.getIdToken();

    // Set token in API client
    apiClient.setAuthToken(token);

    // Register user in backend (creates user profile in Firestore)
    const user = await apiClient.register(email, password, displayName);

    return user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Failed to register');
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get Firebase ID token
    const token = await firebaseUser.getIdToken();

    // Set token in API client
    apiClient.setAuthToken(token);

    // Fetch user profile from backend
    const user = await apiClient.getCurrentUser();

    return user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Get Firebase ID token
    const token = await firebaseUser.getIdToken();

    // Set token in API client
    apiClient.setAuthToken(token);

    // Fetch or create user profile from backend
    const user = await apiClient.getCurrentUser();

    return user;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

/**
 * Sign in with GitHub
 */
export async function signInWithGitHub(): Promise<User> {
  try {
    const provider = new GithubAuthProvider();
    provider.setCustomParameters({
      allow_signup: 'true',
    });

    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;

    // Get Firebase ID token
    const token = await firebaseUser.getIdToken();

    // Set token in API client
    apiClient.setAuthToken(token);

    // Fetch or create user profile from backend
    const user = await apiClient.getCurrentUser();

    return user;
  } catch (error: any) {
    console.error('GitHub sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with GitHub');
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    // Sign out from backend
    await apiClient.logout();

    // Sign out from Firebase
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    // Continue with sign out even if backend call fails
    await firebaseSignOut(auth);
  }
}

/**
 * Get current user from backend API
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    // Get fresh Firebase ID token
    const token = await firebaseUser.getIdToken();

    // Set token in API client
    apiClient.setAuthToken(token);

    // Fetch user profile from backend
    const user = await apiClient.getCurrentUser();

    return user;
  } catch (error: any) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Listen for auth state changes
 */
export function onAuthChange(
  callback: (user: User | null) => void | Promise<void>
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Get Firebase ID token
        const token = await firebaseUser.getIdToken();

        // Set token in API client
        apiClient.setAuthToken(token);

        // Fetch user profile from backend
        const user = await apiClient.getCurrentUser();

        callback(user);
      } catch (error) {
        console.error('Auth change error:', error);
        callback(null);
      }
    } else {
      // User signed out
      apiClient.clearAuthToken();
      callback(null);
    }
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
}

/**
 * Send email verification
 */
export async function sendEmailVerification(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user signed in');
    }

    await firebaseSendEmailVerification(user);
  } catch (error: any) {
    console.error('Email verification error:', error);
    throw new Error(error.message || 'Failed to send verification email');
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  try {
    const user = await apiClient.updateProfile(updates);
    return user;
  } catch (error: any) {
    console.error('Update profile error:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!auth.currentUser;
}

/**
 * Get Firebase user (for direct Firebase operations)
 */
export function getFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}

// =============================================================================
// OKTA SAML/OAuth Integration
// =============================================================================

/**
 * Sign in with Okta using SAML
 * Requires Okta SAML provider to be configured in Firebase Console
 *
 * @param providerId - The SAML provider ID configured in Firebase (e.g., 'saml.okta-cortex-dc')
 * @param useRedirect - Use redirect flow instead of popup (recommended for mobile)
 */
export async function signInWithOktaSAML(
  providerId: string = 'saml.okta',
  useRedirect: boolean = false
): Promise<User | null> {
  try {
    const provider = new SAMLAuthProvider(providerId);

    if (useRedirect) {
      // Redirect flow - better for mobile devices
      await signInWithRedirect(auth, provider);
      // User will be redirected away, result handled by getOktaRedirectResult()
      return null;
    } else {
      // Popup flow
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // Set token in API client
      apiClient.setAuthToken(token);

      // Fetch or create user profile from backend
      const user = await apiClient.getCurrentUser();

      return user;
    }
  } catch (error: any) {
    console.error('Okta SAML sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Okta SAML');
  }
}

/**
 * Sign in with Okta using OAuth 2.0
 * Requires Okta OAuth provider to be configured in Firebase Console
 *
 * @param clientId - Your Okta application client ID
 * @param useRedirect - Use redirect flow instead of popup (recommended for mobile)
 */
export async function signInWithOktaOAuth(
  clientId: string,
  useRedirect: boolean = false
): Promise<User | null> {
  try {
    const provider = new OAuthProvider('oidc.okta');

    // Configure Okta OAuth provider
    provider.addScope('openid');
    provider.addScope('email');
    provider.addScope('profile');

    // Set custom parameters
    provider.setCustomParameters({
      client_id: clientId,
    });

    if (useRedirect) {
      // Redirect flow
      await signInWithRedirect(auth, provider);
      return null;
    } else {
      // Popup flow
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      // Set token in API client
      apiClient.setAuthToken(token);

      // Fetch or create user profile from backend
      const user = await apiClient.getCurrentUser();

      return user;
    }
  } catch (error: any) {
    console.error('Okta OAuth sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Okta OAuth');
  }
}

/**
 * Handle redirect result after Okta authentication
 * Call this on app initialization to handle redirect flow
 */
export async function getOktaRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);

    if (!result) {
      return null;
    }

    const firebaseUser = result.user;

    // Get Firebase ID token
    const token = await firebaseUser.getIdToken();

    // Set token in API client
    apiClient.setAuthToken(token);

    // Fetch or create user profile from backend
    const user = await apiClient.getCurrentUser();

    return user;
  } catch (error: any) {
    console.error('Okta redirect result error:', error);
    throw new Error(error.message || 'Failed to process Okta authentication');
  }
}

/**
 * Generic SAML sign-in for any SAML provider
 *
 * @param providerId - The SAML provider ID configured in Firebase
 * @param useRedirect - Use redirect flow instead of popup
 */
export async function signInWithSAML(
  providerId: string,
  useRedirect: boolean = false
): Promise<User | null> {
  try {
    const provider = new SAMLAuthProvider(providerId);

    if (useRedirect) {
      await signInWithRedirect(auth, provider);
      return null;
    } else {
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const token = await firebaseUser.getIdToken();
      apiClient.setAuthToken(token);

      const user = await apiClient.getCurrentUser();
      return user;
    }
  } catch (error: any) {
    console.error('SAML sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with SAML');
  }
}

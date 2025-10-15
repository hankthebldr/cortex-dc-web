/**
 * Firebase Auth Adapter
 * Wraps Firebase Authentication for the adapter pattern
 *
 * This adapter maintains all existing Firebase Auth functionality
 * while conforming to the AuthAdapter interface.
 */

import { auth } from '../firebase';
import { apiClient } from '../api-client';
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
import { AuthAdapter, User } from './auth.adapter';

/**
 * Firebase Auth Adapter Implementation
 */
export class FirebaseAuthAdapter implements AuthAdapter {
  /**
   * Register a new user with email and password
   */
  async registerWithEmail(
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

      // Register user in backend (creates user profile)
      const user = await apiClient.register(email, password, displayName);

      return user;
    } catch (error: any) {
      console.error('[Firebase] Registration error:', error);
      throw new Error(error.message || 'Failed to register');
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
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
      console.error('[Firebase] Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
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
      console.error('[Firebase] Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub(): Promise<User> {
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
      console.error('[Firebase] GitHub sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with GitHub');
    }
  }

  /**
   * Sign in with Okta using SAML
   */
  async signInWithOktaSAML(
    providerId: string = 'saml.okta',
    useRedirect: boolean = false
  ): Promise<User | null> {
    try {
      const provider = new SAMLAuthProvider(providerId);

      if (useRedirect) {
        // Redirect flow - better for mobile devices
        await signInWithRedirect(auth, provider);
        // User will be redirected away
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
      console.error('[Firebase] Okta SAML sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Okta SAML');
    }
  }

  /**
   * Sign in with Okta using OAuth 2.0
   */
  async signInWithOktaOAuth(
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
      console.error('[Firebase] Okta OAuth sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Okta OAuth');
    }
  }

  /**
   * Generic SAML sign-in for any SAML provider
   */
  async signInWithSAML(
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
      console.error('[Firebase] SAML sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with SAML');
    }
  }

  /**
   * Handle redirect result after authentication
   */
  async getOktaRedirectResult(): Promise<User | null> {
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
      console.error('[Firebase] Redirect result error:', error);
      throw new Error(error.message || 'Failed to process authentication');
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      // Sign out from backend
      await apiClient.logout();

      // Sign out from Firebase
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('[Firebase] Sign out error:', error);
      // Continue with sign out even if backend call fails
      await firebaseSignOut(auth);
    }
  }

  /**
   * Get current user from backend API
   */
  async getCurrentUser(): Promise<User | null> {
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
      console.error('[Firebase] Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<User>): Promise<User> {
    try {
      const user = await apiClient.updateProfile(updates);
      return user;
    } catch (error: any) {
      console.error('[Firebase] Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('[Firebase] Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user signed in');
      }

      await firebaseSendEmailVerification(user);
    } catch (error: any) {
      console.error('[Firebase] Email verification error:', error);
      throw new Error(error.message || 'Failed to send verification email');
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthChange(
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
          console.error('[Firebase] Auth change error:', error);
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
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Get Firebase user (for direct Firebase operations)
   * Note: This is Firebase-specific and not part of the AuthAdapter interface
   */
  getFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}

/**
 * Self-Hosted Auth Adapter
 * JWT-based authentication for self-hosted deployments
 *
 * Uses backend API for all authentication operations
 * No Firebase dependencies
 */

import { apiClient } from '../api-client';
import { AuthAdapter, User } from './auth.adapter';

/**
 * Self-Hosted Auth Adapter Implementation
 * All authentication is handled by backend API
 */
export class SelfHostedAuthAdapter implements AuthAdapter {
  private user: User | null = null;
  private authChangeCallbacks: Set<(user: User | null) => void | Promise<void>> = new Set();

  constructor() {
    // Initialize by checking for existing session
    this.initializeSession();
  }

  /**
   * Initialize session from stored token
   */
  private async initializeSession(): Promise<void> {
    try {
      // Check if token exists (stored in httpOnly cookie or localStorage)
      const user = await apiClient.getCurrentUser();
      if (user) {
        this.user = user;
        this.notifyAuthChange(user);
      }
    } catch (error) {
      // No valid session
      this.user = null;
    }
  }

  /**
   * Notify all auth change listeners
   */
  private notifyAuthChange(user: User | null): void {
    this.authChangeCallbacks.forEach((callback) => {
      try {
        const result = callback(user);
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error('[SelfHosted] Auth change callback error:', error);
          });
        }
      } catch (error) {
        console.error('[SelfHosted] Auth change callback error:', error);
      }
    });
  }

  /**
   * Register a new user with email and password
   */
  async registerWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> {
    try {
      const user = await apiClient.register(email, password, displayName);
      this.user = user;
      this.notifyAuthChange(user);
      return user;
    } catch (error: any) {
      console.error('[SelfHosted] Registration error:', error);
      throw new Error(error.message || 'Failed to register');
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      // Call backend login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const user = data.user;

      // Store token if provided (for non-cookie auth)
      if (data.token) {
        apiClient.setAuthToken(data.token);
      }

      this.user = user;
      this.notifyAuthChange(user);

      return user;
    } catch (error: any) {
      console.error('[SelfHosted] Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      // Redirect to backend OAuth endpoint
      const redirectUrl = `${window.location.origin}/api/auth/oauth/google`;
      window.location.href = redirectUrl;

      // Return empty user (will be populated after redirect)
      // In a real implementation, this would handle the OAuth flow
      throw new Error('Google sign-in redirecting...');
    } catch (error: any) {
      console.error('[SelfHosted] Google sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Google');
    }
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub(): Promise<User> {
    try {
      // Redirect to backend OAuth endpoint
      const redirectUrl = `${window.location.origin}/api/auth/oauth/github`;
      window.location.href = redirectUrl;

      throw new Error('GitHub sign-in redirecting...');
    } catch (error: any) {
      console.error('[SelfHosted] GitHub sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with GitHub');
    }
  }

  /**
   * Sign in with Okta using SAML
   */
  async signInWithOktaSAML(
    providerId: string = 'okta',
    useRedirect: boolean = true
  ): Promise<User | null> {
    try {
      // Redirect to backend SAML endpoint
      const redirectUrl = `${window.location.origin}/api/auth/saml/${providerId}`;
      window.location.href = redirectUrl;

      return null;
    } catch (error: any) {
      console.error('[SelfHosted] Okta SAML sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Okta SAML');
    }
  }

  /**
   * Sign in with Okta using OAuth 2.0
   */
  async signInWithOktaOAuth(
    clientId: string,
    useRedirect: boolean = true
  ): Promise<User | null> {
    try {
      // Redirect to backend OAuth endpoint
      const redirectUrl = `${window.location.origin}/api/auth/oauth/okta?client_id=${clientId}`;
      window.location.href = redirectUrl;

      return null;
    } catch (error: any) {
      console.error('[SelfHosted] Okta OAuth sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with Okta OAuth');
    }
  }

  /**
   * Generic SAML sign-in
   */
  async signInWithSAML(
    providerId: string,
    useRedirect: boolean = true
  ): Promise<User | null> {
    try {
      const redirectUrl = `${window.location.origin}/api/auth/saml/${providerId}`;
      window.location.href = redirectUrl;

      return null;
    } catch (error: any) {
      console.error('[SelfHosted] SAML sign in error:', error);
      throw new Error(error.message || 'Failed to sign in with SAML');
    }
  }

  /**
   * Handle redirect result after authentication
   */
  async getOktaRedirectResult(): Promise<User | null> {
    try {
      // Check URL parameters for auth result
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('error');

      if (error) {
        throw new Error(decodeURIComponent(error));
      }

      if (token) {
        apiClient.setAuthToken(token);
        const user = await apiClient.getCurrentUser();
        this.user = user;
        this.notifyAuthChange(user);

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        return user;
      }

      return null;
    } catch (error: any) {
      console.error('[SelfHosted] Redirect result error:', error);
      throw new Error(error.message || 'Failed to process authentication');
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await apiClient.logout();
      this.user = null;
      this.notifyAuthChange(null);
    } catch (error: any) {
      console.error('[SelfHosted] Sign out error:', error);
      // Clear local state even if API call fails
      this.user = null;
      apiClient.clearAuthToken();
      this.notifyAuthChange(null);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      if (this.user) {
        return this.user;
      }

      const user = await apiClient.getCurrentUser();
      this.user = user;
      return user;
    } catch (error: any) {
      console.error('[SelfHosted] Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<User>): Promise<User> {
    try {
      const user = await apiClient.updateProfile(updates);
      this.user = user;
      this.notifyAuthChange(user);
      return user;
    } catch (error: any) {
      console.error('[SelfHosted] Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send password reset email');
      }
    } catch (error: any) {
      console.error('[SelfHosted] Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const response = await fetch('/api/auth/email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send verification email');
      }
    } catch (error: any) {
      console.error('[SelfHosted] Email verification error:', error);
      throw new Error(error.message || 'Failed to send verification email');
    }
  }

  /**
   * Listen for auth state changes
   */
  onAuthChange(
    callback: (user: User | null) => void | Promise<void>
  ): () => void {
    this.authChangeCallbacks.add(callback);

    // Immediately call with current user state
    const result = callback(this.user);
    if (result instanceof Promise) {
      result.catch((error) => {
        console.error('[SelfHosted] Initial auth change callback error:', error);
      });
    }

    // Return unsubscribe function
    return () => {
      this.authChangeCallbacks.delete(callback);
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.user;
  }

  /**
   * Manually trigger auth state check
   * Useful for polling or manual refresh
   */
  async refreshAuthState(): Promise<void> {
    try {
      const user = await apiClient.getCurrentUser();
      const previousUser = this.user;
      this.user = user;

      // Only notify if user changed
      if (JSON.stringify(previousUser) !== JSON.stringify(user)) {
        this.notifyAuthChange(user);
      }
    } catch (error) {
      // User not authenticated
      if (this.user !== null) {
        this.user = null;
        this.notifyAuthChange(null);
      }
    }
  }
}

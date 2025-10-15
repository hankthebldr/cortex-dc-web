/**
 * Authentication Client for Containerized Deployment
 * Uses API routes instead of Firebase client SDK
 * Compatible with Keycloak, Auth0, or any OIDC provider
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

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

class AuthClient {
  private authState: AuthState = {
    user: null,
    isLoading: true,
    error: null,
  };

  private listeners: Array<(state: AuthState) => void> = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAuth();
    }
  }

  /**
   * Initialize authentication state
   */
  private async initializeAuth() {
    try {
      const user = await this.getCurrentUser();
      this.updateState({ user, isLoading: false, error: null });

      // Check auth state periodically
      this.checkInterval = setInterval(() => {
        this.refreshAuthState();
      }, 5 * 60 * 1000); // Every 5 minutes
    } catch (error) {
      this.updateState({
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Auth initialization failed'
      });
    }
  }

  /**
   * Update auth state and notify listeners
   */
  private updateState(newState: Partial<AuthState>) {
    this.authState = { ...this.authState, ...newState };
    this.listeners.forEach(listener => listener(this.authState));
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (state: AuthState) => void): () => void {
    this.listeners.push(callback);
    callback(this.authState); // Immediately call with current state

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const { user } = await response.json();
      this.updateState({ user, error: null });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      this.updateState({ error: message });
      throw error;
    }
  }

  /**
   * Sign in with Google (OIDC)
   */
  async signInWithGoogle(): Promise<void> {
    // Redirect to backend OAuth flow
    window.location.href = '/api/auth/oauth/google';
  }

  /**
   * Sign in with GitHub (OIDC)
   */
  async signInWithGitHub(): Promise<void> {
    window.location.href = '/api/auth/oauth/github';
  }

  /**
   * Sign in with Okta SAML
   */
  async signInWithOktaSAML(): Promise<void> {
    window.location.href = '/api/auth/saml/okta';
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      this.updateState({ user: null, error: null });
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if API call fails
      this.updateState({ user: null, error: null });
    }
  }

  /**
   * Get current user from session
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to get current user');
      }

      const { user } = await response.json();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Refresh auth state
   */
  private async refreshAuthState() {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        this.updateState({ user });
      } else if (this.authState.user) {
        // User was logged in but session expired
        this.updateState({ user: null });
      }
    } catch (error) {
      console.error('Refresh auth state error:', error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    const response = await fetch('/api/auth/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send password reset');
    }
  }

  /**
   * Register new user
   */
  async register(email: string, password: string, displayName?: string): Promise<User> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, displayName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const { user } = await response.json();
    this.updateState({ user, error: null });
    return user;
  }

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return this.authState;
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.listeners = [];
  }
}

// Export singleton instance
export const authClient = new AuthClient();
export default authClient;

/**
 * Keycloak Authentication Adapter
 * Implements AuthAdapter interface for Keycloak (OpenID Connect)
 *
 * NOTE: This requires keycloak-js library for client-side usage
 * For now, this is a stub implementation that shows the structure
 *
 * @deprecated Client-side only - uses window and localStorage
 */

// Type guards for browser environment
declare const window: any;
declare const localStorage: any;

import {
  AuthAdapter,
  AuthUser,
  AuthResult,
  SignInCredentials,
  SignUpCredentials,
  TokenPayload,
} from './auth.adapter';

export class KeycloakAuthAdapter implements AuthAdapter {
  private initialized: boolean = false;
  private keycloak: any = null; // Will be Keycloak instance
  private currentUser: AuthUser | null = null;

  constructor() {
    // Keycloak configuration would be loaded from environment
    const config = {
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8180',
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'cortex',
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'cortex-web',
    };

    // In production, initialize Keycloak here
    // this.keycloak = new Keycloak(config);
    console.log('[KeycloakAuthAdapter] Configuration:', config);
  }

  async initialize(): Promise<void> {
    // Initialize Keycloak
    // await this.keycloak.init({ onLoad: 'check-sso' });
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private parseToken(token: string): AuthUser {
    // Parse JWT token
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = JSON.parse(atob(parts[1]));

    return {
      uid: payload.sub,
      email: payload.email || null,
      displayName: payload.name || payload.preferred_username || null,
      photoURL: null,
      emailVerified: payload.email_verified || false,
      role: payload.role || payload.realm_access?.roles?.[0],
      customClaims: payload,
    };
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResult> {
    // For Keycloak, we typically use redirect-based flows
    // But for password grant (if enabled), we can use direct API calls

    const tokenEndpoint = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'cortex-web',
        grant_type: 'password',
        username: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const error = await response.json() as { error_description?: string };
      throw new Error(error.error_description || 'Authentication failed');
    }

    const data = await response.json() as { access_token: string; refresh_token: string };
    const user = this.parseToken(data.access_token);
    this.currentUser = user;

    // Store tokens in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('keycloak_access_token', data.access_token);
      localStorage.setItem('keycloak_refresh_token', data.refresh_token);
    }

    return {
      user,
      token: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  async signUp(credentials: SignUpCredentials): Promise<AuthResult> {
    // Keycloak user registration typically handled via:
    // 1. Redirect to Keycloak registration page, or
    // 2. Admin API call (requires admin credentials)

    // For now, redirect to registration
    const registrationUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/registrations`;

    throw new Error(`Please complete registration at: ${registrationUrl}`);
  }

  async signOut(): Promise<void> {
    // Clear local tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('keycloak_access_token');
      localStorage.removeItem('keycloak_refresh_token');
    }

    this.currentUser = null;

    // Keycloak logout endpoint
    const logoutUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/logout`;

    // Optional: Redirect to logout
    // window.location.href = logoutUrl;
  }

  async signInWithGoogle(): Promise<AuthResult> {
    // Redirect to Keycloak with Google IDP
    const authUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth`;
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'cortex-web',
      response_type: 'code',
      scope: 'openid email profile',
      redirect_uri: `${window.location.origin}/auth/callback`,
      kc_idp_hint: 'google',
    });

    window.location.href = `${authUrl}?${params.toString()}`;

    // This will redirect, so we return a promise that never resolves
    return new Promise(() => {});
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to get user from stored token
    const token = await this.getIdToken();
    if (token) {
      this.currentUser = this.parseToken(token);
      return this.currentUser;
    }

    return null;
  }

  async getUserById(uid: string): Promise<AuthUser | null> {
    // Would require admin API access
    throw new Error('getUserById requires admin access');
  }

  async updateUserProfile(uid: string, data: Partial<AuthUser>): Promise<AuthUser> {
    // Would require account management API
    throw new Error('Profile updates should be done through Keycloak Account Console');
  }

  async deleteUser(uid: string): Promise<void> {
    // Would require admin API access
    throw new Error('User deletion requires admin access');
  }

  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    let token = localStorage.getItem('keycloak_access_token');

    if (!token) {
      return null;
    }

    // Check if token is expired
    if (forceRefresh) {
      const refreshToken = localStorage.getItem('keycloak_refresh_token');
      if (refreshToken) {
        try {
          const result = await this.refreshToken(refreshToken);
          token = result.token;
        } catch (error) {
          return null;
        }
      }
    }

    return token;
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    return this.parseToken(token) as any;
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const tokenEndpoint = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'cortex-web',
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json() as { access_token: string; refresh_token: string };
    const user = this.parseToken(data.access_token);
    this.currentUser = user;

    // Update stored tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('keycloak_access_token', data.access_token);
      localStorage.setItem('keycloak_refresh_token', data.refresh_token);
    }

    return {
      user,
      token: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    // Redirect to Keycloak forgot password page
    const resetUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/login-actions/reset-credentials`;
    console.log(`Password reset: ${resetUrl}`);
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    throw new Error('Password reset handled by Keycloak');
  }

  async updatePassword(newPassword: string): Promise<void> {
    throw new Error('Password updates should be done through Keycloak Account Console');
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    // Poll for token changes
    let intervalId: NodeJS.Timeout;

    if (typeof window !== 'undefined') {
      intervalId = setInterval(async () => {
        const user = await this.getCurrentUser();
        callback(user);
      }, 5000); // Check every 5 seconds
    }

    // Return cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }
}

// Singleton instance
let keycloakAuthInstance: KeycloakAuthAdapter | null = null;

export function getKeycloakAuthAdapter(): KeycloakAuthAdapter {
  if (!keycloakAuthInstance) {
    keycloakAuthInstance = new KeycloakAuthAdapter();
  }
  return keycloakAuthInstance;
}

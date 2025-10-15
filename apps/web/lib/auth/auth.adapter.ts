/**
 * Auth Adapter Interface
 * Defines the contract for authentication providers
 *
 * Supports both Firebase Auth and self-hosted JWT authentication
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
 * Auth Adapter Interface
 * All authentication providers must implement this interface
 */
export interface AuthAdapter {
  // Email/Password Authentication
  registerWithEmail(email: string, password: string, displayName?: string): Promise<User>;
  signInWithEmail(email: string, password: string): Promise<User>;

  // Social Authentication
  signInWithGoogle(): Promise<User>;
  signInWithGitHub(): Promise<User>;

  // Enterprise Authentication (SAML/OAuth)
  signInWithOktaSAML(providerId?: string, useRedirect?: boolean): Promise<User | null>;
  signInWithOktaOAuth(clientId: string, useRedirect?: boolean): Promise<User | null>;
  signInWithSAML(providerId: string, useRedirect?: boolean): Promise<User | null>;
  getOktaRedirectResult(): Promise<User | null>;

  // User Management
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  updateUserProfile(updates: Partial<User>): Promise<User>;

  // Email Operations
  sendPasswordReset(email: string): Promise<void>;
  sendEmailVerification(): Promise<void>;

  // State Management
  onAuthChange(callback: (user: User | null) => void | Promise<void>): () => void;
  isAuthenticated(): boolean;
}

/**
 * Auth Mode
 * Determines which authentication provider to use
 */
export type AuthMode = 'firebase' | 'self-hosted';

/**
 * Get current auth mode from environment
 */
export function getAuthMode(): AuthMode {
  const mode = process.env.NEXT_PUBLIC_AUTH_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;

  if (mode === 'self-hosted') {
    return 'self-hosted';
  }

  // Default to Firebase for backward compatibility
  return 'firebase';
}

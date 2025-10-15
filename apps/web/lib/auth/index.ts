/**
 * Auth Module - Entry Point
 * Provides authentication via self-hosted JWT authentication (Keycloak)
 *
 * USAGE:
 * import { signInWithEmail, signOut, getCurrentUser } from '@/lib/auth';
 */

import { AuthAdapter, User } from './auth.adapter';
import { SelfHostedAuthAdapter } from './self-hosted-auth.adapter';

/**
 * Auth Adapter Instance
 * Singleton pattern - one adapter per application
 */
let authAdapter: AuthAdapter | null = null;

/**
 * Get Auth Adapter
 * Returns the self-hosted auth adapter
 */
function getAuthAdapter(): AuthAdapter {
  if (authAdapter) {
    return authAdapter;
  }

  console.log('[Auth] Initializing self-hosted auth adapter');
  authAdapter = new SelfHostedAuthAdapter();

  return authAdapter;
}

// =============================================================================
// PUBLIC API
// =============================================================================

const adapter = getAuthAdapter();

/**
 * Register a new user with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  return adapter.registerWithEmail(email, password, displayName);
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  return adapter.signInWithEmail(email, password);
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  return adapter.signInWithGoogle();
}

/**
 * Sign in with GitHub
 */
export async function signInWithGitHub(): Promise<User> {
  return adapter.signInWithGitHub();
}

/**
 * Sign in with Okta using SAML
 */
export async function signInWithOktaSAML(
  providerId?: string,
  useRedirect?: boolean
): Promise<User | null> {
  return adapter.signInWithOktaSAML(providerId, useRedirect);
}

/**
 * Sign in with Okta using OAuth 2.0
 */
export async function signInWithOktaOAuth(
  clientId: string,
  useRedirect?: boolean
): Promise<User | null> {
  return adapter.signInWithOktaOAuth(clientId, useRedirect);
}

/**
 * Generic SAML sign-in
 */
export async function signInWithSAML(
  providerId: string,
  useRedirect?: boolean
): Promise<User | null> {
  return adapter.signInWithSAML(providerId, useRedirect);
}

/**
 * Handle redirect result after authentication
 */
export async function getOktaRedirectResult(): Promise<User | null> {
  return adapter.getOktaRedirectResult();
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  return adapter.signOut();
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  return adapter.getCurrentUser();
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  return adapter.updateUserProfile(updates);
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  return adapter.sendPasswordReset(email);
}

/**
 * Send email verification
 */
export async function sendEmailVerification(): Promise<void> {
  return adapter.sendEmailVerification();
}

/**
 * Listen for auth state changes
 */
export function onAuthChange(
  callback: (user: User | null) => void | Promise<void>
): () => void {
  return adapter.onAuthChange(callback);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return adapter.isAuthenticated();
}

/**
 * Refresh auth state
 */
export async function refreshAuthState(): Promise<void> {
  const selfHostedAdapter = adapter as SelfHostedAuthAdapter;
  if (selfHostedAdapter.refreshAuthState) {
    await selfHostedAdapter.refreshAuthState();
  }
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type { User } from './auth.adapter';

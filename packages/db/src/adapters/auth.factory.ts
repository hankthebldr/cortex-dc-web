/**
 * Authentication Factory
 * Returns the appropriate auth adapter based on configuration
 */

import { AuthAdapter } from './auth.adapter';
import { FirebaseAuthAdapter, getFirebaseAuthAdapter } from './firebase-auth.adapter';
import { KeycloakAuthAdapter, getKeycloakAuthAdapter } from './keycloak-auth.adapter';

export type AuthMode = 'firebase' | 'keycloak';

export class AuthFactory {
  private static instance: AuthAdapter | null = null;
  private static mode: AuthMode | null = null;

  /**
   * Get the configured auth adapter
   */
  static getAdapter(): AuthAdapter {
    if (!this.instance) {
      this.instance = this.createAdapter();
    }
    return this.instance;
  }

  /**
   * Create a new adapter based on environment configuration
   */
  private static createAdapter(): AuthAdapter {
    const mode = this.getMode();

    console.log(`[AuthFactory] Initializing ${mode} adapter`);

    if (mode === 'keycloak') {
      return getKeycloakAuthAdapter();
    } else {
      return getFirebaseAuthAdapter();
    }
  }

  /**
   * Determine which auth mode to use
   */
  private static getMode(): AuthMode {
    if (this.mode) {
      return this.mode;
    }

    // Check environment variable
    const deploymentMode = process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;

    if (deploymentMode === 'self-hosted') {
      this.mode = 'keycloak';
      return 'keycloak';
    }

    // Check if Keycloak URL is configured
    if (process.env.NEXT_PUBLIC_KEYCLOAK_URL || process.env.KEYCLOAK_URL) {
      this.mode = 'keycloak';
      return 'keycloak';
    }

    // Default to Firebase
    this.mode = 'firebase';
    return 'firebase';
  }

  /**
   * Manually set the auth mode (useful for testing)
   */
  static setMode(mode: AuthMode): void {
    this.mode = mode;
    this.instance = null; // Reset instance to force recreation
  }

  /**
   * Reset the factory (useful for testing)
   */
  static reset(): void {
    this.instance = null;
    this.mode = null;
  }

  /**
   * Initialize the auth adapter
   */
  static async initialize(): Promise<void> {
    const adapter = this.getAdapter();
    await adapter.initialize();
  }
}

/**
 * Convenience function to get the auth adapter
 */
export function getAuth(): AuthAdapter {
  return AuthFactory.getAdapter();
}

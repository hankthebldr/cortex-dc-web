/**
 * Database Factory
 * Returns the appropriate database adapter based on configuration
 */

import { DatabaseAdapter } from './database.adapter';
import { FirestoreAdapter, getFirestoreAdapter } from './firestore.adapter';
import { PostgresAdapter, getPostgresAdapter } from './postgres.adapter';

export type DatabaseMode = 'firebase' | 'self-hosted';

export class DatabaseFactory {
  private static instance: DatabaseAdapter | null = null;
  private static mode: DatabaseMode | null = null;

  /**
   * Get the configured database adapter
   */
  static getAdapter(): DatabaseAdapter {
    if (!this.instance) {
      this.instance = this.createAdapter();
    }
    return this.instance;
  }

  /**
   * Create a new adapter based on environment configuration
   */
  private static createAdapter(): DatabaseAdapter {
    const mode = this.getMode();

    console.log(`[DatabaseFactory] Initializing ${mode} adapter`);

    if (mode === 'self-hosted') {
      return getPostgresAdapter();
    } else {
      return getFirestoreAdapter();
    }
  }

  /**
   * Determine which database mode to use
   */
  private static getMode(): DatabaseMode {
    if (this.mode) {
      return this.mode;
    }

    // Check environment variable
    const deploymentMode = process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;

    if (deploymentMode === 'self-hosted') {
      this.mode = 'self-hosted';
      return 'self-hosted';
    }

    // Check if DATABASE_URL is set (indicates PostgreSQL)
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql')) {
      this.mode = 'self-hosted';
      return 'self-hosted';
    }

    // Default to Firebase
    this.mode = 'firebase';
    return 'firebase';
  }

  /**
   * Manually set the database mode (useful for testing)
   */
  static setMode(mode: DatabaseMode): void {
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
   * Connect to the database
   */
  static async connect(): Promise<void> {
    const adapter = this.getAdapter();
    await adapter.connect();
  }

  /**
   * Disconnect from the database
   */
  static async disconnect(): Promise<void> {
    const adapter = this.getAdapter();
    await adapter.disconnect();
  }
}

/**
 * Convenience function to get the database adapter
 */
export function getDatabase(): DatabaseAdapter {
  return DatabaseFactory.getAdapter();
}

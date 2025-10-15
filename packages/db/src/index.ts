/**
 * ========================================================================
 * LEGACY FIREBASE EXPORTS (DEPRECATED)
 * ========================================================================
 *
 * The following exports are for Firebase deployment mode only.
 *
 * @deprecated Use adapter factories (getDatabase, getAuth, getStorage) instead.
 * These legacy exports will be removed in v2.0.
 *
 * For self-hosted deployments, these exports are not needed and should not be used.
 *
 * Migration guide:
 * - Replace direct Firebase imports with adapter pattern
 * - Use getDatabase() instead of importing db directly
 * - Use getAuth() instead of importing auth directly
 * - Use getStorage() instead of importing storage directly
 * ========================================================================
 */
export * from './legacy/firebase-config';
export { firebaseApp as app } from './legacy/firebase-config';

/**
 * @deprecated Use adapter pattern - see legacy/firestore/ for Firebase-specific code
 */
export { FirestoreClient } from './legacy/firestore/client';

/**
 * @deprecated Use adapter pattern - see legacy/firestore/ for Firebase-specific code
 */
export { FirestoreQueries } from './legacy/firestore/queries';

// Authentication services (migrated from henryreed.ai)
export * from './auth';

// Data and user management services (migrated from henryreed.ai)
export * from './services';

// Schema definitions
export * from './schemas/user';
export * from './schemas/chat';

// Storage adapters (Firebase Storage and MinIO/S3)
export { getStorage, initializeStorage } from './adapters/storage.factory';
export type { StorageAdapter, StorageFile, UploadOptions } from './adapters/storage.adapter';

// Database adapters (Firebase Firestore and PostgreSQL)
export { getDatabase } from './adapters/database.factory';
export type { DatabaseAdapter, QueryOptions } from './adapters/database.adapter';

// Authentication adapters (Firebase Auth and Keycloak)
export { getAuth } from './adapters/auth.factory';
export type { AuthAdapter, AuthUser, AuthResult } from './adapters/auth.adapter';

// Types (includes the main POV and TRR schemas)
// Note: Some types are re-exported from services to avoid ambiguity
export { UserRole, ROLE_PERMISSIONS } from './types/auth';
export type { UserProfile } from './types/auth';
export type { TimelineEvent } from './types/projects';
export type {
  DatabaseClient,
  QueryResult,
  TransactionContext
} from './types/database';

/**
 * ========================================================================
 * RUNTIME WARNING FOR SELF-HOSTED MODE
 * ========================================================================
 */
if (typeof process !== 'undefined' && process.env?.DEPLOYMENT_MODE === 'self-hosted') {
  console.warn(
    '\n' +
    '⚠️  WARNING: Running in self-hosted mode with Firebase legacy exports\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    '\n' +
    'Firebase exports from @cortex/db are deprecated and should not be used\n' +
    'in self-hosted deployments.\n' +
    '\n' +
    'Please migrate to adapter pattern:\n' +
    '  - Use getDatabase() instead of direct Firebase imports\n' +
    '  - Use getAuth() instead of Firebase Auth\n' +
    '  - Use getStorage() instead of Firebase Storage\n' +
    '\n' +
    'See packages/db/src/legacy/ for Firebase-specific code.\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
  );
}

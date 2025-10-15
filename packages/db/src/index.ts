// Firebase configuration and services (migrated from henryreed.ai)
export * from './firebase-config';
export { firebaseApp as app } from './firebase-config';

// Authentication services (migrated from henryreed.ai)
export * from './auth';

// Data and user management services (migrated from henryreed.ai)
export * from './services';

// Firestore client and utilities
export { FirestoreClient } from './firestore/client';
export { FirestoreQueries } from './firestore/queries';

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

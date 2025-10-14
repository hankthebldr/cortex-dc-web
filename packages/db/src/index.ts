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

// Types (includes the main POV and TRR schemas)
// Note: Some types are re-exported from services to avoid ambiguity
export type { UserProfile, UserRole, ROLE_PERMISSIONS } from './types/auth';
export type { TimelineEvent } from './types/projects';
export type {
  DatabaseClient,
  QueryResult,
  TransactionContext
} from './types/database';

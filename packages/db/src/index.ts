// Firestore client and utilities
export { FirestoreClient } from './firestore/client';
export { FirestoreQueries } from './firestore/queries';

// Schema definitions
export * from './schemas/user';
export * from './schemas/chat';

// Types (includes the main POV and TRR schemas)
export * from './types/auth';
export * from './types/projects';
export type { 
  DatabaseClient,
  QueryResult,
  TransactionContext 
} from './types/database';

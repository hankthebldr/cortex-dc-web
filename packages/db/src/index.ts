// Firestore client and utilities
export { FirestoreClient } from './firestore/client';
export { FirestoreQueries } from './firestore/queries';

// Schema definitions
export * from './schemas/user';
export * from './schemas/pov';
export * from './schemas/trr';
export * from './schemas/chat';

// Types
export type { 
  DatabaseClient,
  QueryResult,
  TransactionContext 
} from './types/database';
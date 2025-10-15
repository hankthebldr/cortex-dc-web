/**
 * Database Adapter Interface
 * Provides abstraction layer for both Firebase Firestore and PostgreSQL
 */

export interface QueryFilter {
  field: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'array-contains';
  value: any;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: QueryFilter[];
}

export interface DatabaseAdapter {
  // CRUD Operations
  findMany<T>(collection: string, options?: QueryOptions): Promise<T[]>;
  findOne<T>(collection: string, id: string): Promise<T | null>;
  findByField<T>(collection: string, field: string, value: any): Promise<T | null>;
  create<T>(collection: string, data: Partial<T>): Promise<T>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string): Promise<void>;

  // Batch Operations
  createMany<T>(collection: string, data: Partial<T>[]): Promise<T[]>;
  updateMany(collection: string, ids: string[], data: any): Promise<void>;
  deleteMany(collection: string, ids: string[]): Promise<void>;

  // Transactions
  transaction<T>(callback: (tx: DatabaseTransaction) => Promise<T>): Promise<T>;

  // Utility
  exists(collection: string, id: string): Promise<boolean>;
  count(collection: string, options?: QueryOptions): Promise<number>;

  // Connection
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export interface DatabaseTransaction {
  findOne<T>(collection: string, id: string): Promise<T | null>;
  create<T>(collection: string, data: Partial<T>): Promise<T>;
  update<T>(collection: string, id: string, data: Partial<T>): Promise<T>;
  delete(collection: string, id: string): Promise<void>;
}

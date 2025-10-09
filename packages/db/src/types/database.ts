export interface DatabaseClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface QueryResult<T = any> {
  data: T[];
  total: number;
  hasMore: boolean;
}

export interface TransactionContext {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
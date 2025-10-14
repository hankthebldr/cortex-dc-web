/**
 * Data Service
 * Abstract data access layer supporting Firestore and PostgreSQL
 */

import { config } from '../config/env.config';
import { NotFoundError, BadRequestError } from '../middleware/error.middleware';
import { Firestore } from '@google-cloud/firestore';

/**
 * Query options interface
 */
interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  filters?: Record<string, any>;
}

/**
 * List result interface
 */
interface ListResult<T = any> {
  items: T[];
  total: number;
}

/**
 * Data Service class
 */
export class DataService {
  private firestore?: Firestore;

  constructor() {
    if (config.DATABASE_TYPE === 'firestore') {
      this.initializeFirestore();
    }
  }

  /**
   * Initialize Firestore client
   */
  private initializeFirestore(): void {
    this.firestore = new Firestore({
      projectId: config.FIRESTORE_PROJECT_ID || config.GCP_PROJECT_ID,
      databaseId: config.FIRESTORE_DATABASE_ID,
    });
  }

  /**
   * List documents in a collection
   */
  async list(collection: string, options: QueryOptions = {}): Promise<ListResult> {
    const { limit = 50, offset = 0, orderBy, filters } = options;

    if (config.DATABASE_TYPE === 'firestore') {
      return this.listFirestore(collection, { limit, offset, orderBy, filters });
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * List documents from Firestore
   */
  private async listFirestore(collection: string, options: QueryOptions): Promise<ListResult> {
    const { limit = 50, offset = 0, orderBy, filters } = options;

    let query: any = this.firestore!.collection(collection);

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (typeof value === 'object' && value.operator) {
          query = query.where(field, value.operator, value.value);
        } else {
          query = query.where(field, '==', value);
        }
      });
    }

    // Apply ordering
    if (orderBy) {
      const [field, direction = 'asc'] = orderBy.split(':');
      query = query.orderBy(field, direction);
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);

    const snapshot = await query.get();

    const items = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get total count (this is expensive in Firestore, consider caching)
    const totalSnapshot = await this.firestore!.collection(collection).count().get();
    const total = totalSnapshot.data().count;

    return { items, total };
  }

  /**
   * Get a single document by ID
   */
  async get(collection: string, id: string): Promise<any> {
    if (config.DATABASE_TYPE === 'firestore') {
      const doc = await this.firestore!.collection(collection).doc(id).get();

      if (!doc.exists) {
        throw new NotFoundError(`Document not found: ${id}`);
      }

      return {
        id: doc.id,
        ...doc.data(),
      };
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Create a new document
   */
  async create(collection: string, data: any, userId: string): Promise<any> {
    const now = new Date().toISOString();

    const document = {
      ...data,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    };

    if (config.DATABASE_TYPE === 'firestore') {
      const docRef = await this.firestore!.collection(collection).add(document);

      return {
        id: docRef.id,
        ...document,
      };
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Update a document (full replacement)
   */
  async update(collection: string, id: string, updates: any, userId: string): Promise<any> {
    const now = new Date().toISOString();

    const document = {
      ...updates,
      updatedAt: now,
      updatedBy: userId,
    };

    if (config.DATABASE_TYPE === 'firestore') {
      const docRef = this.firestore!.collection(collection).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError(`Document not found: ${id}`);
      }

      await docRef.set(document, { merge: false });

      return {
        id,
        ...document,
      };
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Patch a document (partial update)
   */
  async patch(collection: string, id: string, updates: any, userId: string): Promise<any> {
    const now = new Date().toISOString();

    const patch = {
      ...updates,
      updatedAt: now,
      updatedBy: userId,
    };

    if (config.DATABASE_TYPE === 'firestore') {
      const docRef = this.firestore!.collection(collection).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError(`Document not found: ${id}`);
      }

      await docRef.update(patch);

      const updated = await docRef.get();

      return {
        id: updated.id,
        ...updated.data(),
      };
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Delete a document
   */
  async delete(collection: string, id: string): Promise<void> {
    if (config.DATABASE_TYPE === 'firestore') {
      const docRef = this.firestore!.collection(collection).doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundError(`Document not found: ${id}`);
      }

      await docRef.delete();
      return;
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Batch create documents
   */
  async batchCreate(collection: string, items: any[], userId: string): Promise<any[]> {
    const now = new Date().toISOString();

    const documents = items.map(item => ({
      ...item,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
    }));

    if (config.DATABASE_TYPE === 'firestore') {
      const batch = this.firestore!.batch();

      documents.forEach(doc => {
        const docRef = this.firestore!.collection(collection).doc();
        batch.set(docRef, doc);
      });

      await batch.commit();

      return documents;
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Batch update documents
   */
  async batchUpdate(collection: string, updates: Array<{ id: string; data: any }>, userId: string): Promise<any[]> {
    const now = new Date().toISOString();

    if (config.DATABASE_TYPE === 'firestore') {
      const batch = this.firestore!.batch();

      updates.forEach(({ id, data }) => {
        const docRef = this.firestore!.collection(collection).doc(id);
        batch.update(docRef, {
          ...data,
          updatedAt: now,
          updatedBy: userId,
        });
      });

      await batch.commit();

      return updates.map(u => ({ id: u.id, ...u.data }));
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Batch delete documents
   */
  async batchDelete(collection: string, ids: string[]): Promise<void> {
    if (config.DATABASE_TYPE === 'firestore') {
      const batch = this.firestore!.batch();

      ids.forEach(id => {
        const docRef = this.firestore!.collection(collection).doc(id);
        batch.delete(docRef);
      });

      await batch.commit();
      return;
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }

  /**
   * Search documents
   */
  async search(collection: string, query: string, options: QueryOptions = {}): Promise<ListResult> {
    // Note: Full-text search in Firestore requires external indexing (Algolia, Elasticsearch, etc.)
    // This is a simple implementation using basic filtering

    const { limit = 50, offset = 0, filters } = options;

    if (config.DATABASE_TYPE === 'firestore') {
      let firestoreQuery: any = this.firestore!.collection(collection);

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([field, value]) => {
          firestoreQuery = firestoreQuery.where(field, '==', value);
        });
      }

      // Apply pagination
      firestoreQuery = firestoreQuery.limit(limit).offset(offset);

      const snapshot = await firestoreQuery.get();

      // Filter by search query (case-insensitive substring match)
      const items = snapshot.docs
        .map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((item: any) => {
          const searchText = JSON.stringify(item).toLowerCase();
          return searchText.includes(query.toLowerCase());
        });

      return { items, total: items.length };
    }

    throw new Error(`Unsupported database type: ${config.DATABASE_TYPE}`);
  }
}

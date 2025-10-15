/**
 * Firestore Adapter
 * Implements DatabaseAdapter interface for Firebase Firestore
 * Maintains backward compatibility
 */

import {
  collection as firestoreCollection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  QueryConstraint,
  writeBatch,
  runTransaction,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../legacy/firebase-config';
import {
  DatabaseAdapter,
  DatabaseTransaction,
  QueryOptions,
  QueryFilter,
} from './database.adapter';

export class FirestoreAdapter implements DatabaseAdapter {
  private connected: boolean = true; // Firestore is always "connected"

  async connect(): Promise<void> {
    // No explicit connection needed for Firestore
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    // No explicit disconnection needed for Firestore
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private buildQuery(collectionName: string, options?: QueryOptions) {
    const collectionRef = firestoreCollection(db, collectionName);
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (options?.filters) {
      options.filters.forEach((filter: QueryFilter) => {
        constraints.push(where(filter.field, filter.operator as any, filter.value));
      });
    }

    // Apply ordering
    if (options?.orderBy) {
      constraints.push(orderBy(options.orderBy, options.orderDirection || 'asc'));
    }

    // Apply limit
    if (options?.limit) {
      constraints.push(firestoreLimit(options.limit));
    }

    return query(collectionRef, ...constraints);
  }

  async findMany<T>(collection: string, options?: QueryOptions): Promise<T[]> {
    const q = this.buildQuery(collection, options);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  async findOne<T>(collection: string, id: string): Promise<T | null> {
    const docRef = doc(db, collection, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as T;
  }

  async findByField<T>(
    collection: string,
    field: string,
    value: any
  ): Promise<T | null> {
    const results = await this.findMany<T>(collection, {
      filters: [{ field, operator: '==', value }],
      limit: 1,
    });

    return results.length > 0 ? results[0] : null;
  }

  async create<T>(collection: string, data: Partial<T>): Promise<T> {
    const collectionRef = firestoreCollection(db, collection);
    const docRef = doc(collectionRef);

    const fullData = {
      ...data,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(docRef, fullData);

    return fullData as T;
  }

  async update<T>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<T> {
    const docRef = doc(db, collection, id);

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, updateData);

    // Return the updated document
    return await this.findOne<T>(collection, id) as T;
  }

  async delete(collection: string, id: string): Promise<void> {
    const docRef = doc(db, collection, id);
    await deleteDoc(docRef);
  }

  async createMany<T>(collection: string, data: Partial<T>[]): Promise<T[]> {
    const batch = writeBatch(db);
    const created: T[] = [];

    data.forEach((item) => {
      const collectionRef = firestoreCollection(db, collection);
      const docRef = doc(collectionRef);

      const fullData = {
        ...item,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      batch.set(docRef, fullData);
      created.push(fullData as T);
    });

    await batch.commit();
    return created;
  }

  async updateMany(
    collection: string,
    ids: string[],
    data: any
  ): Promise<void> {
    const batch = writeBatch(db);

    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    ids.forEach((id) => {
      const docRef = doc(db, collection, id);
      batch.update(docRef, updateData);
    });

    await batch.commit();
  }

  async deleteMany(collection: string, ids: string[]): Promise<void> {
    const batch = writeBatch(db);

    ids.forEach((id) => {
      const docRef = doc(db, collection, id);
      batch.delete(docRef);
    });

    await batch.commit();
  }

  async transaction<T>(
    callback: (tx: DatabaseTransaction) => Promise<T>
  ): Promise<T> {
    return await runTransaction(db, async (transaction) => {
      const tx: DatabaseTransaction = {
        findOne: async <T>(collection: string, id: string): Promise<T | null> => {
          const docRef = doc(db, collection, id);
          const docSnap = await transaction.get(docRef);

          if (!docSnap.exists()) {
            return null;
          }

          return {
            id: docSnap.id,
            ...docSnap.data(),
          } as T;
        },

        create: async <T>(collection: string, data: Partial<T>): Promise<T> => {
          const collectionRef = firestoreCollection(db, collection);
          const docRef = doc(collectionRef);

          const fullData = {
            ...data,
            id: docRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          transaction.set(docRef, fullData);
          return fullData as T;
        },

        update: async <T>(
          collection: string,
          id: string,
          data: Partial<T>
        ): Promise<T> => {
          const docRef = doc(db, collection, id);

          const updateData = {
            ...data,
            updatedAt: new Date().toISOString(),
          };

          transaction.update(docRef, updateData);

          // Get the updated document
          const docSnap = await transaction.get(docRef);
          return {
            id: docSnap.id,
            ...docSnap.data(),
          } as T;
        },

        delete: async (collection: string, id: string): Promise<void> => {
          const docRef = doc(db, collection, id);
          transaction.delete(docRef);
        },
      };

      return await callback(tx);
    });
  }

  async exists(collection: string, id: string): Promise<boolean> {
    const docRef = doc(db, collection, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  }

  async count(collection: string, options?: QueryOptions): Promise<number> {
    const q = this.buildQuery(collection, options);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }
}

// Singleton instance
let firestoreInstance: FirestoreAdapter | null = null;

export function getFirestoreAdapter(): FirestoreAdapter {
  if (!firestoreInstance) {
    firestoreInstance = new FirestoreAdapter();
  }
  return firestoreInstance;
}

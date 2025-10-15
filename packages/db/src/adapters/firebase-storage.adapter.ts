/**
 * Firebase Storage Adapter Implementation
 * Implements StorageAdapter interface for Firebase Storage
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  getBytes,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
  FirebaseStorage,
  UploadMetadata,
  FullMetadata,
  ListResult,
} from 'firebase/storage';
import type { StorageAdapter, StorageFile, UploadOptions } from './storage.adapter';

export class FirebaseStorageAdapter implements StorageAdapter {
  private storage: FirebaseStorage | null = null;
  private initialized = false;

  constructor(storage?: FirebaseStorage) {
    if (storage) {
      this.storage = storage;
      this.initialized = true;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { storage } = await import('../legacy/firebase-config');
      if (storage) {
        this.storage = storage;
        this.initialized = true;
      } else {
        throw new Error('Firebase storage not available');
      }
    } catch (error) {
      throw new Error(`Failed to initialize Firebase storage: ${error}`);
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.storage !== null;
  }

  private ensureInitialized(): void {
    if (!this.storage) {
      throw new Error('Firebase storage not initialized');
    }
  }

  async upload(
    path: string,
    data: Blob | File | ArrayBuffer | Uint8Array,
    options?: UploadOptions
  ): Promise<StorageFile> {
    await this.initialize();
    this.ensureInitialized();

    const storageRef = ref(this.storage!, path);

    const metadata: UploadMetadata = {
      contentType: options?.contentType,
      customMetadata: options?.customMetadata,
      cacheControl: options?.cacheControl,
    };

    const uploadResult = await uploadBytes(storageRef, data, metadata);
    const downloadURL = await getDownloadURL(uploadResult.ref);

    return this.mapToStorageFile(uploadResult.metadata, downloadURL);
  }

  async getDownloadURL(path: string): Promise<string> {
    await this.initialize();
    this.ensureInitialized();

    const storageRef = ref(this.storage!, path);
    return await getDownloadURL(storageRef);
  }

  async download(path: string): Promise<Uint8Array> {
    await this.initialize();
    this.ensureInitialized();

    const storageRef = ref(this.storage!, path);
    const arrayBuffer = await getBytes(storageRef);
    return new Uint8Array(arrayBuffer);
  }

  async delete(path: string): Promise<void> {
    await this.initialize();
    this.ensureInitialized();

    const storageRef = ref(this.storage!, path);
    await deleteObject(storageRef);
  }

  async list(
    path: string,
    options?: { maxResults?: number; pageToken?: string }
  ): Promise<{
    items: StorageFile[];
    nextPageToken?: string;
  }> {
    await this.initialize();
    this.ensureInitialized();

    const storageRef = ref(this.storage!, path);
    const listResult: ListResult = await listAll(storageRef);

    const items: StorageFile[] = await Promise.all(
      listResult.items.map(async (item) => {
        const metadata = await getMetadata(item);
        const downloadURL = await getDownloadURL(item);
        return this.mapToStorageFile(metadata, downloadURL);
      })
    );

    return {
      items,
      nextPageToken: undefined,
    };
  }

  async getMetadata(path: string): Promise<StorageFile> {
    await this.initialize();
    this.ensureInitialized();

    const storageRef = ref(this.storage!, path);
    const metadata = await getMetadata(storageRef);
    const downloadURL = await getDownloadURL(storageRef);

    return this.mapToStorageFile(metadata, downloadURL);
  }

  async updateMetadata(
    path: string,
    metadata: Partial<StorageFile>
  ): Promise<StorageFile> {
    await this.initialize();
    this.ensureInitialized();

    const storageRef = ref(this.storage!, path);

    const newMetadata: Partial<FullMetadata> = {
      contentType: metadata.contentType,
      customMetadata: metadata.metadata,
      cacheControl: metadata.metadata?.cacheControl,
    };

    const updatedMetadata = await updateMetadata(storageRef, newMetadata);
    const downloadURL = await getDownloadURL(storageRef);

    return this.mapToStorageFile(updatedMetadata, downloadURL);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.getMetadata(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Map Firebase Storage metadata to StorageFile
   */
  private mapToStorageFile(
    metadata: FullMetadata,
    downloadURL?: string
  ): StorageFile {
    return {
      name: metadata.name,
      fullPath: metadata.fullPath,
      size: metadata.size,
      contentType: metadata.contentType || undefined,
      bucket: metadata.bucket,
      metadata: {
        ...metadata.customMetadata,
        downloadURL,
      },
      timeCreated: new Date(metadata.timeCreated),
      updated: new Date(metadata.updated),
    };
  }
}

// Singleton instance
let firebaseStorageAdapter: FirebaseStorageAdapter | null = null;

export function getFirebaseStorageAdapter(): FirebaseStorageAdapter {
  if (!firebaseStorageAdapter) {
    firebaseStorageAdapter = new FirebaseStorageAdapter();
  }
  return firebaseStorageAdapter;
}

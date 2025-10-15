/**
 * Storage Factory
 * Automatically selects the appropriate storage adapter based on environment configuration
 */

import type { StorageAdapter } from './storage.adapter';
import { getFirebaseStorageAdapter } from './firebase-storage.adapter';
import { getMinIOStorageAdapter } from './minio-storage.adapter';

export type StorageMode = 'firebase' | 'minio' | 's3';

export class StorageFactory {
  /**
   * Get the storage adapter based on environment configuration
   */
  static getAdapter(): StorageAdapter {
    const mode = this.getMode();

    switch (mode) {
      case 'minio':
      case 's3':
        console.log('[Storage] Using MinIO/S3 storage adapter');
        return getMinIOStorageAdapter();

      case 'firebase':
      default:
        console.log('[Storage] Using Firebase storage adapter');
        return getFirebaseStorageAdapter();
    }
  }

  /**
   * Determine storage mode based on environment variables
   */
  private static getMode(): StorageMode {
    // Check explicit storage mode configuration
    const storageMode = process.env.STORAGE_MODE || process.env.NEXT_PUBLIC_STORAGE_MODE;
    if (storageMode === 'minio' || storageMode === 's3') {
      return 'minio';
    }

    // Check deployment mode
    const deploymentMode = process.env.DEPLOYMENT_MODE || process.env.NEXT_PUBLIC_DEPLOYMENT_MODE;
    if (deploymentMode === 'self-hosted') {
      return 'minio';
    }

    // Check for MinIO environment variables
    if (process.env.MINIO_ENDPOINT || process.env.NEXT_PUBLIC_MINIO_ENDPOINT) {
      return 'minio';
    }

    // Check for S3 environment variables
    if (process.env.AWS_S3_BUCKET || process.env.NEXT_PUBLIC_AWS_S3_BUCKET) {
      return 's3';
    }

    // Default to Firebase
    return 'firebase';
  }

  /**
   * Get storage mode information
   */
  static getInfo(): {
    mode: StorageMode;
    description: string;
    config: Record<string, string | undefined>;
  } {
    const mode = this.getMode();

    const info = {
      firebase: {
        mode: 'firebase' as StorageMode,
        description: 'Using Firebase Storage',
        config: {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        },
      },
      minio: {
        mode: 'minio' as StorageMode,
        description: 'Using MinIO (S3-compatible) Storage',
        config: {
          endpoint: process.env.MINIO_ENDPOINT || process.env.NEXT_PUBLIC_MINIO_ENDPOINT,
          bucket: process.env.MINIO_BUCKET || process.env.NEXT_PUBLIC_MINIO_BUCKET,
          accessKey: process.env.MINIO_ACCESS_KEY ? '[CONFIGURED]' : '[NOT SET]',
          secretKey: process.env.MINIO_SECRET_KEY ? '[CONFIGURED]' : '[NOT SET]',
        },
      },
      s3: {
        mode: 's3' as StorageMode,
        description: 'Using AWS S3 Storage',
        config: {
          bucket: process.env.AWS_S3_BUCKET || process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
          region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION,
          accessKey: process.env.AWS_ACCESS_KEY_ID ? '[CONFIGURED]' : '[NOT SET]',
          secretKey: process.env.AWS_SECRET_ACCESS_KEY ? '[CONFIGURED]' : '[NOT SET]',
        },
      },
    };

    return info[mode === 's3' ? 'minio' : mode];
  }
}

/**
 * Get the storage adapter instance
 * This is the main function to use throughout the application
 */
export function getStorage(): StorageAdapter {
  return StorageFactory.getAdapter();
}

/**
 * Initialize storage with explicit configuration
 * Useful for testing or specific deployment scenarios
 */
export async function initializeStorage(config?: {
  mode?: StorageMode;
  options?: any;
}): Promise<StorageAdapter> {
  const adapter = config?.mode
    ? config.mode === 'firebase'
      ? getFirebaseStorageAdapter()
      : getMinIOStorageAdapter()
    : StorageFactory.getAdapter();

  await adapter.initialize();
  return adapter;
}

/**
 * Storage Service
 * File storage and management using Google Cloud Storage
 */

import { config } from '../config/env.config';
import { NotFoundError, BadRequestError } from '../middleware/error.middleware';
import { Storage, Bucket, File } from '@google-cloud/storage';

/**
 * Upload options interface
 */
interface UploadOptions {
  file: Buffer | string;
  path: string;
  metadata?: Record<string, any>;
  userId: string;
}

/**
 * Download result interface
 */
interface DownloadResult {
  data: Buffer;
  contentType: string;
  filename: string;
}

/**
 * List options interface
 */
interface ListOptions {
  prefix?: string;
  maxResults?: number;
}

/**
 * Storage Service class
 */
export class StorageService {
  private storage?: Storage;
  private bucket?: Bucket;

  constructor() {
    if (config.STORAGE_PROVIDER === 'gcs') {
      this.initializeGCS();
    }
  }

  /**
   * Initialize Google Cloud Storage
   */
  private initializeGCS(): void {
    this.storage = new Storage({
      projectId: config.GCP_PROJECT_ID,
    });

    this.bucket = this.storage.bucket(config.STORAGE_BUCKET);
  }

  /**
   * Upload a file
   */
  async upload(options: UploadOptions): Promise<any> {
    const { file, path, metadata, userId } = options;

    if (!file) {
      throw new BadRequestError('File is required');
    }

    if (!path) {
      throw new BadRequestError('Path is required');
    }

    // Validate file size
    const fileSize = Buffer.isBuffer(file) ? file.length : Buffer.from(file).length;
    if (fileSize > config.STORAGE_MAX_FILE_SIZE) {
      throw new BadRequestError(
        `File size exceeds maximum allowed size of ${config.STORAGE_MAX_FILE_SIZE} bytes`
      );
    }

    if (config.STORAGE_PROVIDER === 'gcs') {
      const fileBuffer = Buffer.isBuffer(file) ? file : Buffer.from(file);
      const blob = this.bucket!.file(path);

      const uploadMetadata: Record<string, any> = {
        metadata: {
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      };

      await blob.save(fileBuffer, uploadMetadata);

      const [fileMetadata] = await blob.getMetadata();

      return {
        path,
        name: blob.name,
        size: fileMetadata.size,
        contentType: fileMetadata.contentType,
        url: this.getPublicUrl(path),
        metadata: fileMetadata.metadata,
      };
    }

    throw new Error(`Unsupported storage provider: ${config.STORAGE_PROVIDER}`);
  }

  /**
   * Download a file
   */
  async download(path: string): Promise<DownloadResult> {
    if (!path) {
      throw new BadRequestError('Path is required');
    }

    if (config.STORAGE_PROVIDER === 'gcs') {
      const file = this.bucket!.file(path);

      const [exists] = await file.exists();
      if (!exists) {
        throw new NotFoundError(`File not found: ${path}`);
      }

      const [data] = await file.download();
      const [metadata] = await file.getMetadata();

      return {
        data,
        contentType: metadata.contentType || 'application/octet-stream',
        filename: metadata.name || path.split('/').pop() || 'download',
      };
    }

    throw new Error(`Unsupported storage provider: ${config.STORAGE_PROVIDER}`);
  }

  /**
   * Get signed URL for a file
   */
  async getSignedUrl(path: string, expiresIn: number = 3600): Promise<string> {
    if (!path) {
      throw new BadRequestError('Path is required');
    }

    if (config.STORAGE_PROVIDER === 'gcs') {
      const file = this.bucket!.file(path);

      const [exists] = await file.exists();
      if (!exists) {
        throw new NotFoundError(`File not found: ${path}`);
      }

      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000,
      });

      return url;
    }

    throw new Error(`Unsupported storage provider: ${config.STORAGE_PROVIDER}`);
  }

  /**
   * Delete a file
   */
  async delete(path: string): Promise<void> {
    if (!path) {
      throw new BadRequestError('Path is required');
    }

    if (config.STORAGE_PROVIDER === 'gcs') {
      const file = this.bucket!.file(path);

      const [exists] = await file.exists();
      if (!exists) {
        throw new NotFoundError(`File not found: ${path}`);
      }

      await file.delete();
      return;
    }

    throw new Error(`Unsupported storage provider: ${config.STORAGE_PROVIDER}`);
  }

  /**
   * List files in a directory
   */
  async list(options: ListOptions = {}): Promise<any[]> {
    const { prefix, maxResults = 100 } = options;

    if (config.STORAGE_PROVIDER === 'gcs') {
      const [files] = await this.bucket!.getFiles({
        prefix,
        maxResults,
      });

      return Promise.all(
        files.map(async (file: File) => {
          const [metadata] = await file.getMetadata();

          return {
            path: file.name,
            name: file.name.split('/').pop(),
            size: metadata.size,
            contentType: metadata.contentType,
            updated: metadata.updated,
            url: this.getPublicUrl(file.name),
          };
        })
      );
    }

    throw new Error(`Unsupported storage provider: ${config.STORAGE_PROVIDER}`);
  }

  /**
   * Get file metadata
   */
  async getMetadata(path: string): Promise<any> {
    if (!path) {
      throw new BadRequestError('Path is required');
    }

    if (config.STORAGE_PROVIDER === 'gcs') {
      const file = this.bucket!.file(path);

      const [exists] = await file.exists();
      if (!exists) {
        throw new NotFoundError(`File not found: ${path}`);
      }

      const [metadata] = await file.getMetadata();

      return {
        path: file.name,
        name: file.name.split('/').pop(),
        size: metadata.size,
        contentType: metadata.contentType,
        created: metadata.timeCreated,
        updated: metadata.updated,
        metadata: metadata.metadata,
      };
    }

    throw new Error(`Unsupported storage provider: ${config.STORAGE_PROVIDER}`);
  }

  /**
   * Get public URL for a file
   */
  private getPublicUrl(path: string): string {
    if (config.STORAGE_CDN_URL) {
      return `${config.STORAGE_CDN_URL}/${path}`;
    }

    if (config.STORAGE_PROVIDER === 'gcs') {
      return `https://storage.googleapis.com/${config.STORAGE_BUCKET}/${path}`;
    }

    return '';
  }

  /**
   * Make file public
   */
  async makePublic(path: string): Promise<void> {
    if (config.STORAGE_PROVIDER === 'gcs') {
      const file = this.bucket!.file(path);

      const [exists] = await file.exists();
      if (!exists) {
        throw new NotFoundError(`File not found: ${path}`);
      }

      await file.makePublic();
    }
  }

  /**
   * Make file private
   */
  async makePrivate(path: string): Promise<void> {
    if (config.STORAGE_PROVIDER === 'gcs') {
      const file = this.bucket!.file(path);

      const [exists] = await file.exists();
      if (!exists) {
        throw new NotFoundError(`File not found: ${path}`);
      }

      await file.makePrivate();
    }
  }
}

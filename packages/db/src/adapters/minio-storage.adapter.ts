/**
 * MinIO Storage Adapter Implementation
 * Implements StorageAdapter interface for MinIO (S3-compatible storage)
 */

import type { StorageAdapter, StorageFile, UploadOptions } from './storage.adapter';

/**
 * MinIO/S3 Storage Adapter
 * Uses the AWS SDK S3 client for MinIO compatibility
 */
export class MinIOStorageAdapter implements StorageAdapter {
  private s3Client: any = null;
  private initialized = false;
  private bucket: string;
  private endpoint: string;
  private accessKey: string;
  private secretKey: string;

  constructor(config?: {
    endpoint?: string;
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
  }) {
    this.endpoint = config?.endpoint || process.env.MINIO_ENDPOINT || 'http://localhost:9000';
    this.accessKey = config?.accessKey || process.env.MINIO_ACCESS_KEY || 'minioadmin';
    this.secretKey = config?.secretKey || process.env.MINIO_SECRET_KEY || 'minioadmin';
    this.bucket = config?.bucket || process.env.MINIO_BUCKET || 'cortex-storage';
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic import of AWS SDK v3 for S3
      const { S3Client } = await import('@aws-sdk/client-s3');

      this.s3Client = new S3Client({
        endpoint: this.endpoint,
        region: 'us-east-1', // MinIO doesn't use regions, but SDK requires it
        credentials: {
          accessKeyId: this.accessKey,
          secretAccessKey: this.secretKey,
        },
        forcePathStyle: true, // Required for MinIO
      });

      // Ensure bucket exists
      await this.ensureBucket();
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize MinIO storage: ${error}`);
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.s3Client !== null;
  }

  private ensureInitialized(): void {
    if (!this.s3Client) {
      throw new Error('MinIO storage not initialized');
    }
  }

  /**
   * Ensure the bucket exists, create if it doesn't
   */
  private async ensureBucket(): Promise<void> {
    try {
      const { HeadBucketCommand, CreateBucketCommand } = await import('@aws-sdk/client-s3');

      try {
        await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      } catch (error: any) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
          // Bucket doesn't exist, create it
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
          console.log(`Created MinIO bucket: ${this.bucket}`);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error ensuring MinIO bucket exists:', error);
      throw error;
    }
  }

  async upload(
    path: string,
    data: Blob | File | ArrayBuffer | Uint8Array,
    options?: UploadOptions
  ): Promise<StorageFile> {
    await this.initialize();
    this.ensureInitialized();

    const { PutObjectCommand } = await import('@aws-sdk/client-s3');

    // Convert data to Buffer if necessary
    let buffer: Buffer;
    if (data instanceof ArrayBuffer) {
      buffer = Buffer.from(data);
    } else if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else if (data instanceof Blob) {
      buffer = Buffer.from(await data.arrayBuffer());
    } else {
      buffer = Buffer.from(data);
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      Body: buffer,
      ContentType: options?.contentType,
      Metadata: options?.customMetadata,
      CacheControl: options?.cacheControl,
    });

    await this.s3Client.send(command);

    return {
      name: path.split('/').pop() || path,
      fullPath: path,
      size: buffer.length,
      contentType: options?.contentType,
      bucket: this.bucket,
      metadata: options?.customMetadata,
      timeCreated: new Date(),
      updated: new Date(),
    };
  }

  async getDownloadURL(path: string): Promise<string> {
    await this.initialize();
    this.ensureInitialized();

    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    // Generate a presigned URL valid for 1 hour
    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    return url;
  }

  async download(path: string): Promise<Uint8Array> {
    await this.initialize();
    this.ensureInitialized();

    const { GetObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    const response = await this.s3Client.send(command);

    // Convert stream to Uint8Array
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async delete(path: string): Promise<void> {
    await this.initialize();
    this.ensureInitialized();

    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    await this.s3Client.send(command);
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

    const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: path,
      MaxKeys: options?.maxResults,
      ContinuationToken: options?.pageToken,
    });

    const response = await this.s3Client.send(command);

    const items: StorageFile[] = (response.Contents || []).map((obj: any) => ({
      name: obj.Key?.split('/').pop() || obj.Key || '',
      fullPath: obj.Key || '',
      size: obj.Size || 0,
      bucket: this.bucket,
      timeCreated: obj.LastModified,
      updated: obj.LastModified,
    }));

    return {
      items,
      nextPageToken: response.NextContinuationToken,
    };
  }

  async getMetadata(path: string): Promise<StorageFile> {
    await this.initialize();
    this.ensureInitialized();

    const { HeadObjectCommand } = await import('@aws-sdk/client-s3');

    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });

    const response = await this.s3Client.send(command);

    return {
      name: path.split('/').pop() || path,
      fullPath: path,
      size: response.ContentLength || 0,
      contentType: response.ContentType,
      bucket: this.bucket,
      metadata: response.Metadata,
      timeCreated: response.LastModified,
      updated: response.LastModified,
    };
  }

  async updateMetadata(
    path: string,
    metadata: Partial<StorageFile>
  ): Promise<StorageFile> {
    await this.initialize();
    this.ensureInitialized();

    const { CopyObjectCommand } = await import('@aws-sdk/client-s3');

    // S3/MinIO doesn't support direct metadata updates
    // We need to copy the object to itself with new metadata
    const command = new CopyObjectCommand({
      Bucket: this.bucket,
      Key: path,
      CopySource: `${this.bucket}/${path}`,
      Metadata: metadata.metadata,
      ContentType: metadata.contentType,
      MetadataDirective: 'REPLACE',
    });

    await this.s3Client.send(command);

    return this.getMetadata(path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.getMetadata(path);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let minioStorageAdapter: MinIOStorageAdapter | null = null;

export function getMinIOStorageAdapter(): MinIOStorageAdapter {
  if (!minioStorageAdapter) {
    minioStorageAdapter = new MinIOStorageAdapter();
  }
  return minioStorageAdapter;
}

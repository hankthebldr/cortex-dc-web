/**
 * Storage Adapter Interface
 * Abstraction for file storage operations
 * Supports both Firebase Storage and MinIO (S3-compatible)
 */

export interface UploadOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
  cacheControl?: string;
}

export interface StorageFile {
  name: string;
  fullPath: string;
  size: number;
  contentType?: string;
  bucket: string;
  metadata?: Record<string, any>;
  timeCreated?: Date;
  updated?: Date;
}

export interface StorageAdapter {
  /**
   * Upload a file to storage
   * @param path - Path where file will be stored (e.g., 'content-hub/notes/file.md')
   * @param data - File data (Blob, File, ArrayBuffer, or Uint8Array)
   * @param options - Upload options (content type, metadata, etc.)
   */
  upload(
    path: string,
    data: Blob | File | ArrayBuffer | Uint8Array,
    options?: UploadOptions
  ): Promise<StorageFile>;

  /**
   * Get download URL for a file
   * @param path - Path to the file
   */
  getDownloadURL(path: string): Promise<string>;

  /**
   * Download file data
   * @param path - Path to the file
   */
  download(path: string): Promise<Uint8Array>;

  /**
   * Delete a file
   * @param path - Path to the file
   */
  delete(path: string): Promise<void>;

  /**
   * List files in a directory
   * @param path - Directory path
   * @param options - List options (prefix, maxResults, etc.)
   */
  list(
    path: string,
    options?: {
      maxResults?: number;
      pageToken?: string;
    }
  ): Promise<{
    items: StorageFile[];
    nextPageToken?: string;
  }>;

  /**
   * Get file metadata
   * @param path - Path to the file
   */
  getMetadata(path: string): Promise<StorageFile>;

  /**
   * Update file metadata
   * @param path - Path to the file
   * @param metadata - Metadata to update
   */
  updateMetadata(
    path: string,
    metadata: Partial<StorageFile>
  ): Promise<StorageFile>;

  /**
   * Check if file exists
   * @param path - Path to the file
   */
  exists(path: string): Promise<boolean>;

  /**
   * Initialize the storage adapter
   */
  initialize(): Promise<void>;

  /**
   * Check if the adapter is initialized
   */
  isInitialized(): boolean;
}

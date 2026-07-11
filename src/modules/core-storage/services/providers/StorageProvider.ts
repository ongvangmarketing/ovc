import { StorageConnection, StorageFile } from "@prisma/client";

export interface StorageUploadParams {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folderPath: string; // e.g. /Mail/Attachments
}

export interface StorageUploadResult {
  providerId: string;
  path: string;
  sizeBytes: number;
}

export interface StorageProvider {
  /**
   * Initializes the provider with the connection credentials.
   */
  init(connection: StorageConnection): Promise<void>;

  /**
   * Uploads a file to the storage provider.
   */
  upload(params: StorageUploadParams): Promise<StorageUploadResult>;

  /**
   * Downloads a file from the storage provider.
   */
  download(file: StorageFile): Promise<Buffer>;

  /**
   * Deletes a file from the storage provider.
   */
  delete(file: StorageFile): Promise<boolean>;

  /**
   * Generates a temporary access link if supported, otherwise null.
   */
  getTemporaryLink?(file: StorageFile, expiresInSeconds?: number): Promise<string | null>;
}

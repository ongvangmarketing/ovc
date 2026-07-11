import { StorageConnection, StorageFile } from "@prisma/client";
import { StorageProvider, StorageUploadParams, StorageUploadResult } from "./StorageProvider";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

export class S3Provider implements StorageProvider {
  private client: S3Client | null = null;
  private bucket: string = "";
  private region: string = "";
  private connectionId: string = "";

  async init(connection: StorageConnection): Promise<void> {
    this.connectionId = connection.id;

    if (!connection.credentials) {
      throw new Error("S3Provider requires credentials");
    }

    let creds: any;
    try {
      if (typeof connection.credentials === "string") {
        creds = JSON.parse(connection.credentials);
      } else {
        creds = connection.credentials;
      }
    } catch (e) {
      throw new Error("Invalid credentials JSON for S3/R2");
    }

    const { accessKeyId, secretAccessKey, endpoint, bucket, region } = creds;

    if (!accessKeyId || !secretAccessKey || !bucket) {
      throw new Error("S3/R2 credentials must include accessKeyId, secretAccessKey, and bucket");
    }

    this.bucket = bucket;
    this.region = connection.region || region || "auto";

    this.client = new S3Client({
      region: this.region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      // for R2 compatibility
      forcePathStyle: true, 
    });
  }

  private buildObjectKey(folderPath: string, fileName: string): string {
    const cleanPath = folderPath.replace(/^\/+|\/+$/g, "");
    return cleanPath ? `${cleanPath}/${fileName}` : fileName;
  }

  async upload(params: StorageUploadParams): Promise<StorageUploadResult> {
    if (!this.client) throw new Error("S3Provider not initialized");

    const objectKey = this.buildObjectKey(params.folderPath, params.fileName);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      Body: params.buffer,
      ContentType: params.mimeType,
    });

    await this.client.send(command);

    return {
      providerId: objectKey,
      path: params.folderPath,
      sizeBytes: params.buffer.length,
    };
  }

  async createResumableUploadSession(params: {
    fileName: string;
    mimeType: string;
    folderPath: string;
    sizeBytes: number;
    origin?: string;
  }): Promise<string> {
    if (!this.client) throw new Error("S3Provider not initialized");

    const objectKey = this.buildObjectKey(params.folderPath, params.fileName);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: params.mimeType,
    });

    // Create a presigned URL valid for 1 hour (3600 seconds)
    const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
    return url;
  }

  async download(file: StorageFile): Promise<Buffer> {
    if (!this.client) throw new Error("S3Provider not initialized");

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: file.providerId,
    });

    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error("Empty response body from S3/R2");
    }

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async delete(file: StorageFile): Promise<boolean> {
    if (!this.client) throw new Error("S3Provider not initialized");

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: file.providerId,
      });
      await this.client.send(command);
      return true;
    } catch (e) {
      console.error("S3/R2 Delete Error:", e);
      return false;
    }
  }

  async getTemporaryLink(file: StorageFile, expiresInSeconds: number = 3600): Promise<string | null> {
    if (!this.client) throw new Error("S3Provider not initialized");

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: file.providerId,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
      return url;
    } catch (e) {
      console.error("S3/R2 GetTemporaryLink Error:", e);
      return null;
    }
  }
}

import { StorageConnection, StorageFile } from "@prisma/client";
import { StorageProvider, StorageUploadParams, StorageUploadResult } from "./StorageProvider";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export class LocalProvider implements StorageProvider {
  private rootDir: string = "./storage";

  async init(connection: StorageConnection): Promise<void> {
    const creds = connection.credentials as any;
    if (creds && creds.basePath) {
      this.rootDir = creds.basePath;
    } else if (connection.rootFolder) {
      this.rootDir = path.join(process.cwd(), "storage", connection.rootFolder);
    } else {
      this.rootDir = path.join(process.cwd(), "storage");
    }
  }

  async upload(params: StorageUploadParams): Promise<StorageUploadResult> {
    const fileId = crypto.randomBytes(16).toString("hex");
    const relativePath = path.join(params.folderPath, `${fileId}-${params.fileName}`);
    const absolutePath = path.join(this.rootDir, relativePath);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    
    // Write file
    await fs.writeFile(absolutePath, params.buffer);
    
    return {
      providerId: fileId,
      path: relativePath,
      sizeBytes: params.buffer.length
    };
  }

  async download(file: StorageFile): Promise<Buffer> {
    const absolutePath = path.join(this.rootDir, file.path);
    return await fs.readFile(absolutePath);
  }

  async delete(file: StorageFile): Promise<boolean> {
    try {
      const absolutePath = path.join(this.rootDir, file.path);
      await fs.unlink(absolutePath);
      return true;
    } catch (e) {
      console.error(`LocalProvider delete error:`, e);
      return false;
    }
  }
}

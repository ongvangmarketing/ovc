import { StorageProvider } from "./providers/StorageProvider";
import { LocalProvider } from "./providers/LocalProvider";
import { GoogleDriveProvider } from "./providers/GoogleDriveProvider";
import { S3Provider } from "./providers/S3Provider";
import { getSystemDb } from "@/lib/db";
import { StorageProviderType } from "@prisma/client";
import crypto from "crypto";

export class StorageGateway {
  /**
   * Retrieves the appropriate provider implementation.
   */
  private static async getProvider(providerType: StorageProviderType): Promise<StorageProvider> {
    switch (providerType) {
      case "LOCAL":
        return new LocalProvider();
      case "GOOGLE_DRIVE":
      case "GOOGLE_SHARED_DRIVE":
        return new GoogleDriveProvider();
      case "S3":
      case "R2":
        return new S3Provider();
      default:
        throw new Error(`Provider ${providerType} not implemented yet`);
    }
  }

  /**
   * Main entry point to upload a file from any module in the system.
   */
  static async upload(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
    category: string, // e.g., 'MAIL_ATTACHMENT', 'INVOICE'
    moduleName: string, // e.g., 'MAIL', 'FINANCE'
    organizationId: string,
    relatedRecordId?: string,
    uploadedById?: string
  ) {
    const db = getSystemDb();

    // 1. Find the Storage Policy for this category
    let policy = await db.storagePolicy.findFirst({
      where: {
        organizationId,
        fileCategory: category,
        isActive: true
      },
      include: {
        connection: true
      }
    });

    if (!policy) {
      console.warn(`No active storage policy found for category: ${category}. Auto-creating default LOCAL policy.`);
      let defaultConn = await db.storageConnection.findFirst({
        where: { organizationId, provider: "LOCAL" }
      });
      if (!defaultConn) {
        defaultConn = await db.storageConnection.create({
          data: {
            organizationId,
            name: "Local Storage (Default)",
            provider: "LOCAL",
            status: "ACTIVE",
            credentials: {},
            rootFolder: "/uploads"
          }
        });
      }
      policy = await db.storagePolicy.create({
        data: {
          organizationId,
          connectionId: defaultConn.id,
          name: `Default ${category} Policy`,
          fileCategory: category,
          isActive: true
        },
        include: {
          connection: true
        }
      });
    }

    if (policy.connection.status !== "ACTIVE") {
      throw new Error(`Storage connection ${policy.connection.name} is not active`);
    }

    // 2. Initialize the Provider
    const provider = await this.getProvider(policy.connection.provider);
    await provider.init(policy.connection);

    // 3. Perform Upload
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    let uploaderName = uploadedById || "guest";
    if (uploadedById) {
      const uploader = await db.user.findUnique({ where: { id: uploadedById } });
      if (uploader && uploader.name) {
        uploaderName = uploader.name.replace(/\//g, "-"); // Xoá xuyệt để tránh lỗi folder
      }
    }
    
    let folderPath = policy.folderMapping 
      ? (policy.folderMapping.includes("{YYYY}") ? policy.folderMapping : `${policy.folderMapping}/{YYYY}/{MM}/{DD}/{USER_NAME}/{HH}`)
      : `/${moduleName}/${category}/{YYYY}/{MM}/{DD}/{USER_NAME}/{HH}`;
      
    folderPath = folderPath
      .replace(/{YYYY}/g, year)
      .replace(/{MM}/g, month)
      .replace(/{DD}/g, day)
      .replace(/{HH}/g, hours)
      .replace(/{mm}/g, minutes)
      .replace(/{USER_ID}/g, uploadedById || "guest")
      .replace(/{USER_NAME}/g, uploaderName);

    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    const result = await provider.upload({
      buffer,
      fileName,
      mimeType,
      folderPath
    });

    // 4. Save Metadata
    const file = await db.storageFile.create({
      data: {
        organizationId,
        connectionId: policy.connection.id,
        providerId: result.providerId,
        name: fileName,
        path: result.path,
        mimeType,
        sizeBytes: BigInt(result.sizeBytes),
        hash,
        category,
        module: moduleName,
        relatedRecordId,
        uploadedById
      }
    });

    // 5. Audit Log
    await db.storageAuditLog.create({
      data: {
        organizationId,
        userId: uploadedById,
        action: "UPLOAD",
        fileId: file.id,
        connectionId: policy.connection.id,
        details: { fileName, sizeBytes: result.sizeBytes }
      }
    });

    // 6. Update Connection used bytes
    await db.storageConnection.update({
      where: { id: policy.connection.id },
      data: { usedBytes: { increment: result.sizeBytes } }
    });

    return file;
  }

  private static buildFolderPath(policyFolderMapping: string | null, moduleName: string, category: string) {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");

    const folderPath = policyFolderMapping
      ? (policyFolderMapping.includes("{YYYY}") ? policyFolderMapping : `${policyFolderMapping}/{YYYY}/{MM}`)
      : `/${moduleName}/${category}/{YYYY}/{MM}`;

    return folderPath.replace(/{YYYY}/g, year).replace(/{MM}/g, month);
  }

  private static async getActivePolicy(organizationId: string, category: string) {
    const db = getSystemDb();
    const policy = await db.storagePolicy.findFirst({
      where: {
        organizationId,
        fileCategory: category,
        isActive: true,
      },
      include: {
        connection: true,
      },
    });

    if (!policy) {
      throw new Error(`No active storage policy found for category: ${category}`);
    }

    if (policy.connection.status !== "ACTIVE") {
      throw new Error(`Storage connection ${policy.connection.name} is not active`);
    }

    return policy;
  }

  static async createDirectUploadSession(
    fileName: string,
    mimeType: string,
    sizeBytes: number,
    category: string,
    moduleName: string,
    organizationId: string,
    origin?: string
  ) {
    const policy = await this.getActivePolicy(organizationId, category);
    const folderPath = this.buildFolderPath(policy.folderMapping, moduleName, category);

    if (
      policy.connection.provider !== "GOOGLE_DRIVE" && 
      policy.connection.provider !== "GOOGLE_SHARED_DRIVE" &&
      policy.connection.provider !== "S3" &&
      policy.connection.provider !== "R2"
    ) {
      throw new Error(`Direct upload is not supported for provider: ${policy.connection.provider}`);
    }

    const provider = await this.getProvider(policy.connection.provider);
    await provider.init(policy.connection);

    if (!(provider instanceof GoogleDriveProvider) && !(provider instanceof S3Provider)) {
      throw new Error("Direct upload provider is not available");
    }

    const uploadUrl = await provider.createResumableUploadSession({
      fileName,
      mimeType,
      folderPath,
      sizeBytes,
      origin,
    });

    const cleanFolderPath = folderPath.replace(/^\/+|\/+$/g, "");
    const providerId = cleanFolderPath ? `${cleanFolderPath}/${fileName}` : fileName;

    return {
      uploadUrl,
      connectionId: policy.connection.id,
      folderPath,
      provider: policy.connection.provider,
      providerId,
    };
  }

  static async completeDirectUpload(params: {
    organizationId: string;
    connectionId: string;
    providerId: string;
    fileName: string;
    path: string;
    mimeType: string;
    sizeBytes: number;
    category: string;
    moduleName: string;
    relatedRecordId?: string;
    uploadedById?: string;
  }) {
    const db = getSystemDb();
    const file = await db.storageFile.create({
      data: {
        organizationId: params.organizationId,
        connectionId: params.connectionId,
        providerId: params.providerId,
        name: params.fileName,
        path: params.path,
        mimeType: params.mimeType,
        sizeBytes: BigInt(params.sizeBytes),
        category: params.category,
        module: params.moduleName,
        relatedRecordId: params.relatedRecordId,
        uploadedById: params.uploadedById,
      },
    });

    await db.storageAuditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.uploadedById,
        action: "UPLOAD",
        fileId: file.id,
        connectionId: params.connectionId,
        details: { fileName: params.fileName, sizeBytes: params.sizeBytes, direct: true },
      },
    });

    await db.storageConnection.update({
      where: { id: params.connectionId },
      data: { usedBytes: { increment: params.sizeBytes } },
    });

    return file;
  }

  static async listGoogleDriveFolders(organizationId: string) {
    const db = getSystemDb();
    const connections = await db.storageConnection.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        provider: { in: ["GOOGLE_DRIVE", "GOOGLE_SHARED_DRIVE"] },
      },
    });

    return Promise.all(connections.map(async (connection) => {
      const provider = new GoogleDriveProvider();
      await provider.init(connection);
      const folders = await provider.listFolders();
      return { connectionId: connection.id, folders };
    }));
  }

  static async getGoogleDriveQuotas(organizationId: string) {
    const db = getSystemDb();
    const connections = await db.storageConnection.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
        provider: { in: ["GOOGLE_DRIVE", "GOOGLE_SHARED_DRIVE"] },
      },
    });

    return Promise.all(connections.map(async (connection) => {
      const provider = new GoogleDriveProvider();
      await provider.init(connection);
      return {
        connectionId: connection.id,
        connectionName: connection.name,
        ...(await provider.getStorageQuota()),
      };
    }));
  }

  /**
   * Main entry point to download a file.
   */
  static async download(fileId: string) {
    const db = getSystemDb();
    
    const file = await db.storageFile.findUnique({
      where: { id: fileId },
      include: { connection: true }
    });

    if (!file) throw new Error("File not found");

    const provider = await this.getProvider(file.connection.provider);
    await provider.init(file.connection);

    const buffer = await provider.download(file);

    await db.storageAuditLog.create({
      data: {
        organizationId: file.organizationId,
        action: "DOWNLOAD",
        fileId: file.id,
        connectionId: file.connection.id
      }
    });

    return { buffer, file };
  }

  /**
   * Main entry point to delete a file.
   */
  static async delete(fileId: string, deletedById?: string) {
    const db = getSystemDb();
    
    const file = await db.storageFile.findUnique({
      where: { id: fileId },
      include: { connection: true }
    });

    if (!file) throw new Error("File not found");

    const provider = await this.getProvider(file.connection.provider);
    await provider.init(file.connection);

    const success = await provider.delete(file);
    if (!success) throw new Error("Failed to delete file from provider");

    // Soft delete or hard delete? Let's hard delete for now.
    await db.storageFile.delete({
      where: { id: fileId }
    });

    await db.storageAuditLog.create({
      data: {
        organizationId: file.organizationId,
        userId: deletedById,
        action: "DELETE",
        fileId: file.id,
        connectionId: file.connection.id
      }
    });

    await db.storageConnection.update({
      where: { id: file.connection.id },
      data: { usedBytes: { decrement: file.sizeBytes } }
    });

    return true;
  }
}

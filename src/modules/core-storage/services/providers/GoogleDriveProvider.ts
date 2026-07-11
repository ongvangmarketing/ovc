import { StorageConnection, StorageFile } from "@prisma/client";
import { StorageProvider, StorageUploadParams, StorageUploadResult } from "./StorageProvider";

/**
 * GoogleDriveProvider – uses raw REST API via fetch() to avoid
 * googleapis/node:http transport being aborted by Next.js request context.
 */
export class GoogleDriveProvider implements StorageProvider {
  private accessToken!: string;
  private rootFolderId?: string;

  async init(connection: StorageConnection): Promise<void> {
    const creds = connection.credentials as { refresh_token?: string };
    this.rootFolderId = this.extractFolderId(connection.rootFolder || undefined);

    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Missing GOOGLE_DRIVE_CLIENT_ID or GOOGLE_DRIVE_CLIENT_SECRET");
    }
    if (!creds?.refresh_token) {
      throw new Error("Invalid Google Drive credentials. Refresh token is required.");
    }

    // Refresh access token via OAuth2 token endpoint
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: creds.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Failed to refresh Google token: ${err}`);
    }

    const tokenData = await tokenRes.json();
    this.accessToken = tokenData.access_token;
  }

  private extractFolderId(folder?: string): string | undefined {
    if (!folder) return undefined;
    const value = folder.trim();
    if (!value) return undefined;

    const folderMatch = value.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    if (folderMatch?.[1]) return folderMatch[1];

    const fileMatch = value.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (fileMatch?.[1]) return fileMatch[1];

    if (value.startsWith("id:")) {
      const idPart = value.substring(3).split("/")[0];
      return idPart?.split("?")[0]?.trim() || undefined;
    }

    const firstPart = value.split("/")[0];
    return firstPart?.split("?")[0]?.trim() || undefined;
  }

  async listFolders(): Promise<Array<{ id: string; name: string; path: string; parentId: string }>> {
    const rootId = this.rootFolderId || "root";
    const folders: Array<{ id: string; name: string; path: string; parentId: string }> = [];
    const queue: Array<{ id: string; path: string }> = [{ id: rootId, path: "" }];
    const visited = new Set<string>();

    while (queue.length > 0 && visited.size < 2000) {
      const parent = queue.shift();
      if (!parent || visited.has(parent.id)) continue;
      visited.add(parent.id);

      let pageToken: string | undefined;
      do {
        const searchParams = new URLSearchParams({
          q: `'${parent.id.replace(/'/g, "\\'")}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          fields: "nextPageToken,files(id,name)",
          pageSize: "1000",
          spaces: "drive",
          supportsAllDrives: "true",
          includeItemsFromAllDrives: "true",
        });
        if (pageToken) searchParams.set("pageToken", pageToken);

        const response = await fetch(`https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`, {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        });
        if (!response.ok) {
          throw new Error(`Không đọc được cây thư mục Google Drive: ${await response.text()}`);
        }

        const data = await response.json() as {
          nextPageToken?: string;
          files?: Array<{ id: string; name: string }>;
        };
        for (const folder of data.files || []) {
          const path = parent.path ? `${parent.path}/${folder.name}` : folder.name;
          folders.push({ id: folder.id, name: folder.name, path, parentId: parent.id });
          queue.push({ id: folder.id, path });
        }
        pageToken = data.nextPageToken;
      } while (pageToken);
    }

    return folders;
  }

  async getStorageQuota(): Promise<{
    limit: number | null;
    usage: number;
    usageInDrive: number;
    usageInDriveTrash: number;
  }> {
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/about?fields=storageQuota(limit,usage,usageInDrive,usageInDriveTrash)",
      { headers: { Authorization: `Bearer ${this.accessToken}` } },
    );
    if (!response.ok) {
      throw new Error(`Không đọc được dung lượng Google Drive: ${await response.text()}`);
    }

    const data = await response.json() as {
      storageQuota?: {
        limit?: string;
        usage?: string;
        usageInDrive?: string;
        usageInDriveTrash?: string;
      };
    };
    const quota = data.storageQuota || {};
    return {
      limit: quota.limit ? Number(quota.limit) : null,
      usage: Number(quota.usage || 0),
      usageInDrive: Number(quota.usageInDrive || 0),
      usageInDriveTrash: Number(quota.usageInDriveTrash || 0),
    };
  }

  /** Find a folder by name under parentId, returns its Drive ID or null. */
  private async findFolder(name: string, parentId?: string): Promise<string | null> {
    const q = `mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g, "\\'")}' and trashed=false`
      + (parentId ? ` and '${parentId}' in parents` : "");

    const searchParams = new URLSearchParams({
      q,
      fields: "files(id)",
      spaces: "drive",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    const url = `https://www.googleapis.com/drive/v3/files?${searchParams.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to find Google Drive folder "${name}": ${err}`);
    }
    const data = await res.json();
    return data.files?.[0]?.id ?? null;
  }

  /** Create a folder, returns new Drive ID. */
  private async createFolder(name: string, parentId?: string): Promise<string> {
    const meta: { name: string; mimeType: string; parents?: string[] } = {
      name,
      mimeType: "application/vnd.google-apps.folder",
    };
    if (parentId) meta.parents = [parentId];

    const res = await fetch("https://www.googleapis.com/drive/v3/files?fields=id&supportsAllDrives=true", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meta),
    });
    const data = await res.json();
    if (!data.id) throw new Error(`Failed to create folder "${name}": ${JSON.stringify(data)}`);
    return data.id;
  }

  /** Find or create a folder, returns its Drive ID. */
  private async findOrCreateFolder(name: string, parentId?: string): Promise<string> {
    const existing = await this.findFolder(name, parentId);
    if (existing) return existing;
    return this.createFolder(name, parentId);
  }

  /** Resolve a folder path (or ID/URL) into a Drive folder ID. */
  private async resolvePath(folderPath: string): Promise<string | undefined> {
    if (!folderPath || folderPath === "/") return this.rootFolderId;

    let baseParentId = this.rootFolderId;
    let pathToCreate = folderPath;

    // Full Google Drive URL
    if (folderPath.includes("drive.google.com/drive/folders/")) {
      const match = folderPath.match(/folders\/([a-zA-Z0-9-_]+)/);
      if (match?.[1]) {
        baseParentId = match[1];
        pathToCreate = folderPath.replace(folderPath.substring(0, folderPath.indexOf(match[1]) + match[1].length), "");
      }
    }
    // Explicit id: prefix
    else if (folderPath.startsWith("id:")) {
      const parts = folderPath.substring(3).split("/");
      const firstPart = parts[0];
      baseParentId = firstPart?.split("?")[0]?.trim() || this.rootFolderId;
      pathToCreate = parts.slice(1).join("/");
    }
    // Raw bare Drive ID (25-40 chars) at start of path
    else {
      const parts = folderPath.split("/").filter(p => p.trim() !== "");
      const firstPart = parts[0];
      if (firstPart && /^[a-zA-Z0-9-_]{25,40}(?:\?.*)?$/.test(firstPart)) {
        baseParentId = firstPart.split("?")[0]?.trim() || this.rootFolderId;
        pathToCreate = parts.slice(1).join("/");
      }
    }

    if (!pathToCreate || pathToCreate.trim() === "") return baseParentId;

    const subDirs = pathToCreate.split("/").filter(p => p.trim() !== "");
    let currentParentId = baseParentId;
    for (const dir of subDirs) {
      currentParentId = await this.findOrCreateFolder(dir, currentParentId);
    }
    return currentParentId;
  }

  async upload(params: StorageUploadParams): Promise<StorageUploadResult> {
    const parentFolderId = await this.resolvePath(params.folderPath);

    // Build multipart upload body manually
    const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const meta = JSON.stringify({
      name: params.fileName,
      ...(parentFolderId ? { parents: [parentFolderId] } : {}),
    });

    const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`;
    const mediaPart = `--${boundary}\r\nContent-Type: ${params.mimeType}\r\n\r\n`;
    const endPart = `\r\n--${boundary}--`;

    const metaBytes = Buffer.from(metaPart, "utf-8");
    const mediaStartBytes = Buffer.from(mediaPart, "utf-8");
    const endBytes = Buffer.from(endPart, "utf-8");

    const body = Buffer.concat([metaBytes, mediaStartBytes, params.buffer, endBytes]);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id&supportsAllDrives=true",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": body.length.toString(),
        },
        body,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      throw new Error(`Google Drive upload failed: ${err}`);
    }

    const result = await uploadRes.json();
    if (!result.id) throw new Error(`Google Drive upload returned no ID: ${JSON.stringify(result)}`);

    return {
      providerId: result.id,
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
    const parentFolderId = await this.resolvePath(params.folderPath);
    const meta = {
      name: params.fileName,
      ...(parentFolderId ? { parents: [parentFolderId] } : {}),
    };

    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id&supportsAllDrives=true",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": params.mimeType,
          "X-Upload-Content-Length": params.sizeBytes.toString(),
          ...(params.origin ? { Origin: params.origin } : {}),
        },
        body: JSON.stringify(meta),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to create Google Drive upload session: ${err}`);
    }

    const location = res.headers.get("location");
    if (!location) {
      throw new Error("Google Drive did not return an upload session URL");
    }

    return location;
  }

  async download(file: StorageFile): Promise<Buffer> {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${file.providerId}?alt=media&supportsAllDrives=true`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    );
    if (!res.ok) throw new Error(`Google Drive download failed: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer);
  }

  async delete(file: StorageFile): Promise<boolean> {
    try {
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.providerId}?supportsAllDrives=true`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${this.accessToken}` },
        }
      );
      return res.ok || res.status === 204;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Google Drive delete error:", message);
      return false;
    }
  }
}

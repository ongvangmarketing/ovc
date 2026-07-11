"use server";

import { getSystemDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { StorageGateway } from "../services/StorageGateway";
import { requireAuth } from "@/lib/auth/require-auth";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function getStorageFiles(organizationId: string) {
  const db = getSystemDb();
  return await db.storageFile.findMany({
    where: { organizationId, isDeleted: false },
    include: {
      connection: {
        select: { id: true, name: true, provider: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getGoogleDriveFolders(organizationId: string) {
  const session = await requireAuth();
  if (session.organizationId !== organizationId) {
    throw new Error("Workspace không hợp lệ");
  }
  return StorageGateway.listGoogleDriveFolders(organizationId);
}

export async function deleteStorageFile(organizationId: string, id: string) {
  try {
    const db = getSystemDb();
    
    // Find the file
    const file = await db.storageFile.findUnique({
      where: { id, organizationId }
    });
    
    if (!file) throw new Error("File not found");

    // Use static delete
    await StorageGateway.delete(file.id);

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: unknown) {
    console.error("Delete File Error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function uploadStorageFile(organizationId: string, formData: FormData) {
  try {
    const session = await requireAuth();
    if (session.organizationId !== organizationId) {
      throw new Error("Workspace upload không hợp lệ");
    }

    const file = formData.get("file") as File;
    const category = formData.get("category") as string || "GENERAL";
    const moduleName = formData.get("module") as string || "CORE";
    const relatedRecordId = formData.get("relatedRecordId") as string || "";

    if (!file) throw new Error("No file uploaded");

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use static upload
    const result = await StorageGateway.upload(
      buffer,
      file.name,
      file.type,
      category,
      moduleName,
      organizationId,
      relatedRecordId,
      session.userId,
    );

    revalidatePath("/workspace/settings");
    return { success: true, fileId: result.id };
  } catch (error: unknown) {
    console.error("Upload File Error:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

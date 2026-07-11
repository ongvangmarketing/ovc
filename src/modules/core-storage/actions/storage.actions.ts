"use server";

import { getSystemDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { StorageProviderType } from "@prisma/client";
import { StorageGateway } from "../services/StorageGateway";

// Connections
export async function getStorageConnections(organizationId: string) {
  const db = getSystemDb();
  const connections = await db.storageConnection.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  });
  
  return connections.map(c => ({
    ...c,
    capacityBytes: c.capacityBytes?.toString() || null,
    usedBytes: c.usedBytes.toString()
  }));
}

export async function createStorageConnection(organizationId: string, data: { name: string; provider: StorageProviderType; rootFolder?: string; credentials: any }) {
  try {
    const db = getSystemDb();
    const connection = await db.storageConnection.create({
      data: {
        organizationId,
        ...data,
      }
    });
    revalidatePath("/admin/settings");
    return { success: true, connection };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStorageConnection(organizationId: string, id: string) {
  try {
    const db = getSystemDb();
    await db.storageConnection.delete({
      where: { id, organizationId }
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStorageConnection(organizationId: string, id: string, data: any) {
  try {
    const db = getSystemDb();
    const connection = await db.storageConnection.update({
      where: { id, organizationId },
      data
    });
    revalidatePath("/admin/settings");
    return { success: true, connection };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Policies
export async function getStoragePolicies(organizationId: string) {
  const db = getSystemDb();
  const policies = await db.storagePolicy.findMany({
    where: { organizationId },
    include: { connection: true },
    orderBy: { createdAt: 'desc' }
  });

  return policies.map(p => ({
    ...p,
    connection: {
      ...p.connection,
      capacityBytes: p.connection.capacityBytes?.toString() || null,
      usedBytes: p.connection.usedBytes.toString()
    }
  }));
}

export async function createStoragePolicy(organizationId: string, data: { name: string; connectionId: string; fileCategory: string; folderMapping?: string }) {
  try {
    const db = getSystemDb();
    
    // Tìm xem đã có policy cho category này chưa
    const existing = await db.storagePolicy.findFirst({
      where: {
        organizationId,
        fileCategory: data.fileCategory
      }
    });

    let policy;
    if (existing) {
      policy = await db.storagePolicy.update({
        where: { id: existing.id },
        data: {
          ...data,
        }
      });
    } else {
      policy = await db.storagePolicy.create({
        data: {
          organizationId,
          ...data,
        }
      });
    }
    revalidatePath("/admin/settings");
    return { success: true, policy };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStoragePolicy(organizationId: string, id: string) {
  try {
    const db = getSystemDb();
    await db.storagePolicy.delete({
      where: { id, organizationId }
    });
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStoragePolicy(organizationId: string, id: string, data: any) {
  try {
    const db = getSystemDb();
    const policy = await db.storagePolicy.update({
      where: { id, organizationId },
      data
    });
    revalidatePath("/admin/settings");
    return { success: true, policy };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Stats
export async function getStorageStats(organizationId: string) {
  const db = getSystemDb();
  
  const filesCount = await db.storageFile.count({ where: { organizationId, isDeleted: false } });
  
  const sumSize = await db.storageFile.aggregate({
    where: { organizationId, isDeleted: false },
    _sum: { sizeBytes: true }
  });

  const connections = await db.storageConnection.findMany({
    where: { organizationId },
    select: { capacityBytes: true },
  });
  const googleQuotas = await StorageGateway.getGoogleDriveQuotas(organizationId).catch(() => []);
  const configuredCapacities = connections
    .map((connection) => connection.capacityBytes)
    .filter((capacity): capacity is bigint => capacity !== null);
  const configuredCapacityBytes = configuredCapacities.length > 0
    ? configuredCapacities.reduce((total, capacity) => total + capacity, BigInt(0))
    : null;
  const googleLimitBytes = googleQuotas.length > 0 && googleQuotas.every((quota) => quota.limit !== null)
    ? googleQuotas.reduce((total, quota) => total + (quota.limit || 0), 0)
    : null;
  const totalCapacityBytes = googleLimitBytes ?? (configuredCapacityBytes === null ? null : Number(configuredCapacityBytes));
  const googleUsageBytes = googleQuotas.reduce((total, quota) => total + quota.usage, 0);
  const totalBytes = googleQuotas.length > 0 ? googleUsageBytes : Number(sumSize._sum.sizeBytes || 0);

  return {
    totalFiles: filesCount,
    totalBytes,
    totalCapacityBytes,
    availableBytes: totalCapacityBytes === null ? null : Math.max(0, totalCapacityBytes - totalBytes),
    activeConnections: connections.length,
  };
}

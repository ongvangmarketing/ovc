"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { getTenantDb } from "@/lib/db";

export async function getUnreadNotifications() {
  const session = await requireAuth();

  const notifications = await getTenantDb().notification.findMany({
    where: {
      userId: session.userId,
      read: false,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      title: true,
      body: true,
      link: true,
      createdAt: true,
      type: true,
    },
  });

  return notifications.map((notification) => ({
    ...notification,
    createdAt: notification.createdAt.toISOString(),
  }));
}

export async function markNotificationsRead(ids: string[]) {
  const session = await requireAuth();
  if (!ids.length) return { success: true };

  await getTenantDb().notification.updateMany({
    where: {
      id: { in: ids },
      userId: session.userId,
    },
    data: {
      read: true,
      readAt: new Date(),
    },
  });

  return { success: true };
}

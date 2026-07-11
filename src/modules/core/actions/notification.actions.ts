"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { NotificationService } from "../services/notification.service";
import { revalidatePath } from "next/cache";

export async function getUserNotificationsAction(filter?: { unreadOnly?: boolean }, pagination?: { skip?: number; take?: number }) {
  const session = await requireAuth();
  return NotificationService.getUserNotifications(session.user.id, filter, pagination);
}

export async function getUnreadCountAction() {
  const session = await requireAuth();
  return NotificationService.getUnreadCount(session.user.id);
}

export async function markAsReadAction(notificationIds: string[]) {
  const session = await requireAuth();
  await NotificationService.markAsRead(notificationIds, session.user.id);
  revalidatePath("/workspace/notifications");
}

export async function markAllAsReadAction() {
  const session = await requireAuth();
  await NotificationService.markAllAsRead(session.user.id);
  revalidatePath("/workspace/notifications");
}

export async function deleteNotificationsAction(notificationIds: string[]) {
  const session = await requireAuth();
  await NotificationService.deleteNotifications(notificationIds, session.user.id);
  revalidatePath("/workspace/notifications");
}

import { getTenantDb } from "@/lib/db";
import { Prisma } from "@prisma/client";

export class NotificationRepository {
  static async getByUserId(userId: string, filter?: { unreadOnly?: boolean }, pagination?: { skip?: number; take?: number }) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (filter?.unreadOnly) {
      where.read = false;
    }

    return getTenantDb().notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination?.skip,
      take: pagination?.take,
    });
  }

  static async countByUserId(userId: string, filter?: { unreadOnly?: boolean }) {
    const where: Prisma.NotificationWhereInput = { userId };
    if (filter?.unreadOnly) {
      where.read = false;
    }

    return getTenantDb().notification.count({ where });
  }

  static async markAsRead(notificationIds: string[], userId: string) {
    return getTenantDb().notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  static async markAllAsRead(userId: string) {
    return getTenantDb().notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  static async deleteNotifications(notificationIds: string[], userId: string) {
    return getTenantDb().notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
    });
  }
}

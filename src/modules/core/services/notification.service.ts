import { NotificationRepository } from "../repositories/notification.repository";

export class NotificationService {
  static async getUserNotifications(userId: string, filter?: { unreadOnly?: boolean }, pagination?: { skip?: number; take?: number }) {
    return NotificationRepository.getByUserId(userId, filter, pagination);
  }

  static async getUnreadCount(userId: string) {
    return NotificationRepository.countByUserId(userId, { unreadOnly: true });
  }

  static async markAsRead(notificationIds: string[], userId: string) {
    return NotificationRepository.markAsRead(notificationIds, userId);
  }

  static async markAllAsRead(userId: string) {
    return NotificationRepository.markAllAsRead(userId);
  }

  static async deleteNotifications(notificationIds: string[], userId: string) {
    return NotificationRepository.deleteNotifications(notificationIds, userId);
  }
}

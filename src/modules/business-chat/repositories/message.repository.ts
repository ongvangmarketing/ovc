import { getTenantDb } from "@/lib/db";
import { MessageType, ChatMessage } from "@prisma/client";

export class MessageRepository {
  /**
   * Tạo tin nhắn mới
   */
  static async create(
    organizationId: string,
    conversationId: string,
    senderId: string,
    data: {
      content?: string;
      type: MessageType;
      metadata?: any;
      replyToId?: string;
    }
  ): Promise<ChatMessage> {
    const db = getTenantDb(organizationId);
    const message = await db.chatMessage.create({
      data: {
        organizationId,
        conversationId,
        senderId,
        ...data,
      }
    });

    // Manually fetch sender
    const sender = await db.user.findUnique({ where: { id: senderId } });
    return { ...message, sender } as any;
  }

  /**
   * Lấy danh sách tin nhắn theo Conversation (Có phân trang)
   */
  static async getMessages(
    organizationId: string,
    conversationId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    const db = getTenantDb(organizationId);
    const messages = await db.chatMessage.findMany({
      where: {
        organizationId,
        conversationId,
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        createdAt: "desc", // Lấy mới nhất trước, client sẽ reverse lại
      }
    });

    // Lấy danh sách user IDs
    const userIds = [...new Set(messages.map(m => m.senderId))];
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, image: true, email: true }
    });
    
    // Map sender info
    return messages.map(m => {
      const sender = users.find(u => u.id === m.senderId);
      return { ...m, sender } as any;
    });
  }

  /**
   * Cập nhật nội dung tin nhắn
   */
  static async update(
    organizationId: string,
    messageId: string,
    content: string
  ): Promise<ChatMessage> {
    const db = getTenantDb(organizationId);
    return await db.chatMessage.update({
      where: {
        id: messageId,
        organizationId,
      },
      data: {
        content,
        isEdited: true,
      },
    });
  }

  /**
   * Thu hồi tin nhắn
   */
  static async revoke(
    organizationId: string,
    messageId: string
  ): Promise<ChatMessage> {
    const db = getTenantDb(organizationId);
    return await db.chatMessage.update({
      where: {
        id: messageId,
        organizationId,
      },
      data: {
        isDeleted: true,
        content: null, // Xóa nội dung
      },
    });
  }
}

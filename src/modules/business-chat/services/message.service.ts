import { MessageType, ChatMessage } from "@prisma/client";
import { MessageRepository } from "../repositories/message.repository";
import { ParticipantRepository } from "../repositories/participant.repository";
import { pusherServer } from "@/lib/pusher";

export class MessageService {
  /**
   * Gửi tin nhắn mới
   */
  static async sendMessage(
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
    // 1. Kiểm tra sender có thuộc cuộc trò chuyện này không
    const isMember = await ParticipantRepository.isMember(
      organizationId,
      conversationId,
      senderId
    );
    if (!isMember) {
      throw new Error("Bạn không phải là thành viên của cuộc trò chuyện này.");
    }

    // 2. Lưu tin nhắn vào DB
    const message = await MessageRepository.create(
      organizationId,
      conversationId,
      senderId,
      data
    );

    // Cập nhật thời gian updatedAt của Conversation để nó nảy lên đầu danh sách
    try {
      const { getSystemDb } = await import("@/lib/db");
      await getSystemDb().chatConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });
    } catch (e) {
      console.error("Lỗi cập nhật updatedAt cho conversation:", e);
    }

    // 3. Trigger sự kiện Realtime (Pusher)
    try {
      await pusherServer.trigger(
        `org-${organizationId}-chat-${conversationId}`,
        "new-message",
        message
      );
    } catch (error) {
      console.error("Lỗi khi gửi sự kiện Pusher:", error);
    }
    
    // 4. Bắn Notification cho những người được Mention hoặc đang offline (nếu cần)
    
    return message;
  }

  /**
   * Lấy lịch sử tin nhắn
   */
  static async getMessages(
    organizationId: string,
    conversationId: string,
    userId: string,
    cursor?: string
  ): Promise<ChatMessage[]> {
    // 1. Kiểm tra quyền
    const isMember = await ParticipantRepository.isMember(
      organizationId,
      conversationId,
      userId
    );
    if (!isMember) {
      throw new Error("Bạn không có quyền xem cuộc trò chuyện này.");
    }

    // 2. Lấy dữ liệu
    return await MessageRepository.getMessages(organizationId, conversationId, cursor);
  }
}


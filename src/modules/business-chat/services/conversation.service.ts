import { ChatType, ChatConversation } from "@prisma/client";
import { ConversationRepository } from "../repositories/conversation.repository";
import { ParticipantRepository } from "../repositories/participant.repository";

export class ConversationService {
  /**
   * Tạo một cuộc trò chuyện 1-1
   */
  static async createDirectChat(
    organizationId: string,
    currentUserId: string,
    targetUserId: string
  ): Promise<ChatConversation> {
    // 1. Kiểm tra xem đã có chat 1-1 giữa 2 người chưa (Có thể viết thêm hàm repo để check)
    // Tạm thời tạo mới luôn
    const conversation = await ConversationRepository.create(organizationId, {
      type: "DIRECT" as any,
    });

    // 2. Thêm 2 người vào cuộc trò chuyện
    await ParticipantRepository.addMembers(
      organizationId,
      conversation.id,
      [currentUserId, targetUserId]
    );

    return conversation;
  }

  /**
   * Tạo cuộc trò chuyện gắn liền với Nghiệp vụ (Ví dụ: Deal, Lead)
   */
  static async getOrCreateEntityChat(
    organizationId: string,
    currentUserId: string,
    entityType: string,
    entityId: string,
    name: string,
    zaloAccountId?: string
  ): Promise<ChatConversation> {
    // 1. Tìm xem Entity này đã có chat chưa
    let conversation = await ConversationRepository.findByEntity(
      organizationId,
      entityType,
      entityId
    );

    // 2. Nếu chưa có thì tạo mới
    if (!conversation) {
      const data: any = {
        type: "ENTITY" as any,
        entityType,
        entityId,
        name,
      };
      if (zaloAccountId) data.zaloAccountId = zaloAccountId;

      conversation = await ConversationRepository.create(organizationId, data);
    }

    // 3. Thêm user hiện tại vào chat nếu chưa có mặt
    const isMember = await ParticipantRepository.isMember(
      organizationId,
      conversation.id,
      currentUserId
    );
    if (!isMember) {
      await ParticipantRepository.addMember(
        organizationId,
        conversation.id,
        currentUserId
      );
    }

    return conversation;
  }

  /**
   * Lấy danh sách cuộc trò chuyện của user
   */
  static async getUserConversations(organizationId: string, userId: string) {
    return await ConversationRepository.getUserConversations(
      organizationId,
      userId
    );
  }
}

import { getTenantDb } from "@/lib/db";
import { ChatType, ChatConversation } from "@prisma/client";

export class ConversationRepository {
  /**
   * Khởi tạo cuộc trò chuyện mới
   */
  static async create(
    organizationId: string,
    data: {
      type: ChatType;
      name?: string;
      description?: string;
      avatarUrl?: string;
      entityType?: string;
      entityId?: string;
    }
  ): Promise<ChatConversation> {
    const db = getTenantDb(organizationId);
    
    if (!db.chatConversation) {
      throw new Error("SERVER_NEEDS_RESTART: Không tìm thấy bảng ChatConversation trong Prisma Client. Vui lòng tắt server Next.js (Ctrl+C) và chạy lại lệnh 'npm run dev'.");
    }

    return await db.chatConversation.create({
      data: {
        organizationId,
        ...data,
      },
    });
  }

  /**
   * Lấy chi tiết cuộc trò chuyện
   */
  static async findById(
    organizationId: string,
    conversationId: string
  ): Promise<ChatConversation | null> {
    const db = getTenantDb(organizationId);
    return await db.chatConversation.findUnique({
      where: {
        id: conversationId,
        organizationId,
      },
    });
  }

  /**
   * Tìm cuộc trò chuyện theo Entity liên kết (Lead, Project...)
   */
  static async findByEntity(
    organizationId: string,
    entityType: string,
    entityId: string
  ): Promise<ChatConversation | null> {
    const db = getTenantDb(organizationId);
    return await db.chatConversation.findFirst({
      where: {
        organizationId,
        type: "ENTITY" as any,
        entityType,
        entityId,
      },
    });
  }

  /**
   * Lấy danh sách cuộc trò chuyện của một User
   */
  static async getUserConversations(
    organizationId: string,
    userId: string
  ): Promise<ChatConversation[]> {
    const db = getTenantDb(organizationId);
    return await db.chatConversation.findMany({
      where: {
        organizationId,
        participants: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        participants: true,
        // Bao gồm tin nhắn mới nhất để hiển thị ở list
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }
}

import { getTenantDb } from "@/lib/db";
import { ParticipantRole, ChatParticipant } from "@prisma/client";

export class ParticipantRepository {
  /**
   * Thêm thành viên vào cuộc trò chuyện
   */
  static async addMember(
    organizationId: string,
    conversationId: string,
    userId: string,
    role: any = "MEMBER"
  ): Promise<ChatParticipant> {
    const db = getTenantDb(organizationId);
    return await db.chatParticipant.create({
      data: {
        organizationId,
        conversationId,
        userId,
        role,
      },
    });
  }

  /**
   * Thêm nhiều thành viên cùng lúc
   */
  static async addMembers(
    organizationId: string,
    conversationId: string,
    userIds: string[],
    role: any = "MEMBER"
  ) {
    const db = getTenantDb(organizationId);
    const data = userIds.map((userId) => ({
      organizationId,
      conversationId,
      userId,
      role,
    }));

    return await db.chatParticipant.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Kiểm tra user có nằm trong cuộc trò chuyện không
   */
  static async isMember(
    organizationId: string,
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    const db = getTenantDb(organizationId);
    const participant = await db.chatParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });
    // Check organizationId as well to prevent tenant bleeding
    return !!participant && participant.organizationId === organizationId;
  }

  /**
   * Lấy danh sách thành viên
   */
  static async getMembers(
    organizationId: string,
    conversationId: string
  ): Promise<ChatParticipant[]> {
    const db = getTenantDb(organizationId);
    return await db.chatParticipant.findMany({
      where: {
        organizationId,
        conversationId,
      },
    });
  }

  /**
   * Cập nhật thời gian đọc tin nhắn
   */
  static async updateLastRead(
    organizationId: string,
    conversationId: string,
    userId: string
  ) {
    const db = getTenantDb(organizationId);
    return await db.chatParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
      },
    });
  }
}

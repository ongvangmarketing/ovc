"use server";

import { MessageType } from "@prisma/client";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";

import { requireAuth } from "@/lib/auth/require-auth";

/**
 * Lấy user session hiện tại.
 */
async function getAuthSession() {
  return await requireAuth();
}

export async function getConversationsAction() {
  const session = await getAuthSession();
  if (!session?.user) throw new Error("Unauthorized");

  return await ConversationService.getUserConversations(
    session.organizationId,
    session.user.id
  );
}

export async function getOrCreateEntityChatAction(
  entityType: string,
  entityId: string,
  name: string
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const conv = await ConversationService.getOrCreateEntityChat(
      session.organizationId,
      session.user.id,
      entityType,
      entityId,
      name
    );
    return { success: true, conversation: conv };
  } catch (error: any) {
    console.error("Lỗi trong getOrCreateEntityChatAction:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

export async function createDirectChatAction(targetUserId: string) {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const conv = await ConversationService.createDirectChat(
      session.organizationId,
      session.user.id,
      targetUserId
    );
    return { success: true, conversation: conv };
  } catch (error: any) {
    console.error("Lỗi trong createDirectChatAction:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

export async function getConnectedZaloAccountsAction() {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");
    
    const { getSystemDb } = await import("@/lib/db");
    const accounts = await getSystemDb().zaloAccount.findMany({
      where: { organizationId: session.organizationId, status: "CONNECTED" },
      select: { id: true, name: true, avatar: true }
    });
    return { success: true, accounts };
  } catch (error: any) {
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

export async function createZaloChatAction(zaloId: string, name: string, avatar: string, selectedZaloAccountId?: string) {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const { getSystemDb } = await import("@/lib/db");
    const systemDb = getSystemDb();

    // 1. Check or Create Mock Zalo User
    const email = `zalo_${zaloId}@zalo.me`;
    let zaloUser = await systemDb.user.findUnique({ where: { email } });
    if (!zaloUser) {
      zaloUser = await systemDb.user.create({
        data: {
          email,
          name,
          image: avatar,
          role: "MEMBER",
        }
      });
    }

    // 2. Lấy ZaloAccount ID (nếu được truyền từ UI, nếu không thì lấy mặc định)
    let accountId = selectedZaloAccountId;
    if (!accountId) {
      const account = await systemDb.zaloAccount.findFirst({
        where: { organizationId: session.organizationId, status: "CONNECTED" }
      });
      accountId = account?.id;
    }

    // 3. Create ChatConversation
    const conv = await ConversationService.getOrCreateEntityChat(
      session.organizationId,
      session.user.id,
      "ZaloCustomer",
      zaloId,
      `Zalo-${zaloId}`,
      accountId
    );
    return { success: true, conversation: conv };
  } catch (error: any) {
    console.error("Lỗi trong createZaloChatAction:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

export async function sendMessageAction(
  conversationId: string,
  data: {
    content?: string;
    type: any; // Bỏ type chặt để tránh lỗi Enum undefined
    metadata?: any;
    replyToId?: string;
  }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const { getSystemDb } = await import("@/lib/db");
    const conv = await getSystemDb().chatConversation.findUnique({ where: { id: conversationId } });

    // Gửi tin nhắn thực tế qua Zalo Native nếu đây là hội thoại Zalo
    if (conv?.name?.startsWith("Zalo-") && data.type === "TEXT" && data.content) {
      const threadId = conv.name.replace("Zalo-", "");
      try {
        const { ZaloSessionManager } = await import("../../zalo-integration/services/zalo-session.manager");
        
        // Cần truyền zaloAccountId vào. Nếu conv chưa có (dữ liệu cũ), có thể throw error hoặc log
        if (conv.zaloAccountId) {
            await ZaloSessionManager.getInstance().sendMessage(conv.zaloAccountId, threadId, data.content);
        } else {
            console.warn(`Hội thoại Zalo ${conv.id} thiếu zaloAccountId`);
        }
      } catch (e) {
        console.error("Lỗi gửi tin Zalo (Native):", e);
      }
    }

    const msg = await MessageService.sendMessage(
      session.organizationId,
      conversationId,
      session.user.id,
      data
    );
    return { success: true, message: msg };
  } catch (error: any) {
    console.error("Lỗi trong sendMessageAction:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

export async function getMessagesAction(
  conversationId: string,
  cursor?: string
) {
  const session = await getAuthSession();
  if (!session?.user) throw new Error("Unauthorized");
  
  const organizationId = session.organizationId;
  const userId = session.user.id;

  const messages = await MessageService.getMessages(
    organizationId,
    conversationId,
    userId,
    cursor
  );

  // Lọc tin nhắn nếu là MEMBER bị thuyên chuyển
  const { getSystemDb } = await import("@/lib/db");
  const db = getSystemDb();
  const participant = await db.chatParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } }
  });

  if (participant?.role === "MEMBER") {
    // Tìm tin nhắn chuyển giao gần nhất do user này thực hiện
    const transferMsg = await db.chatMessage.findFirst({
      where: {
        organizationId,
        conversationId,
        senderId: userId,
        type: "SYSTEM",
        content: { startsWith: "TRANSFERRED|" }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (transferMsg) {
      // Chỉ lấy những tin nhắn trước (hoặc bằng) thời điểm chuyển giao
      return messages.filter(m => new Date(m.createdAt) <= new Date(transferMsg.createdAt));
    }
  }

  return messages;
}

export async function getOrganizationUsersAction() {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const { getSystemDb } = await import("@/lib/db");
    const users = await getSystemDb().user.findMany({
      where: {
        organizationMembers: {
          some: { organizationId: session.organizationId }
        }
      },
      select: { id: true, name: true, email: true, image: true }
    });
    return { success: true, users };
  } catch (error: any) {
    console.error("Error fetching org users:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

export async function transferChatAction(conversationId: string, newOwnerId: string) {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");
    const currentUserId = session.user.id;
    const organizationId = session.organizationId;

    const { getSystemDb } = await import("@/lib/db");
    const db = getSystemDb();

    // Lấy thông tin chat
    const conv = await db.chatConversation.findUnique({
      where: { id: conversationId, organizationId },
      include: { participants: true }
    });
    if (!conv) throw new Error("Không tìm thấy hội thoại");

    const currentParticipant = conv.participants.find(p => p.userId === currentUserId);
    const isHighRole = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role || "");

    const hasPermission = 
      isHighRole || 
      (currentParticipant && (currentParticipant.role === "ADMIN" || currentParticipant.role === "OWNER" as any));

    if (!hasPermission) {
      throw new Error("Bạn không có quyền chuyển giao hội thoại này");
    }

    // Gán owner mới (nếu chưa có thì tạo, nếu có thì up lên ADMIN)
    const existingNewUser = conv.participants.find(p => p.userId === newOwnerId);
    
    // Nếu chat liên kết với Lead, đổi luôn owner của Lead
    if (conv.entityType === "LEAD" && conv.entityId) {
      await db.lead.update({
        where: { id: conv.entityId },
        data: { ownerId: newOwnerId }
      }).catch(e => console.log("Không tìm thấy Lead hoặc lỗi update lead:", e));
    }

    // Thực hiện trong transaction
    const operations: any[] = [];
    
    // 1. Hạ quyền người hiện tại (nếu họ có trong nhóm)
    if (currentParticipant) {
      operations.push(
        db.chatParticipant.update({
          where: { id: currentParticipant.id },
          data: { role: "MEMBER" }
        })
      );
    }

    // 2. Tăng quyền hoặc tạo người mới
    if (existingNewUser) {
      operations.push(
        db.chatParticipant.update({
          where: { id: existingNewUser.id },
          data: { role: "ADMIN" }
        })
      );
    } else {
      operations.push(
        db.chatParticipant.create({
          data: {
            organizationId,
            conversationId,
            userId: newOwnerId,
            role: "ADMIN"
          }
        })
      );
    }

    // 3. Ghi lại system message
    operations.push(
      db.chatMessage.create({
        data: {
          organizationId,
          conversationId,
          senderId: currentUserId,
          type: "SYSTEM",
          content: `TRANSFERRED|${currentUserId}|${newOwnerId}`
        }
      })
    );

    await db.$transaction(operations);

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/workspace/chat");
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi chuyển giao:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

export async function deleteConversationAction(conversationId: string) {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const { getSystemDb } = await import("@/lib/db");
    await getSystemDb().chatConversation.delete({
      where: {
        id: conversationId,
        organizationId: session.organizationId,
      }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/workspace/chat");
    return { success: true };
  } catch (error: any) {
    console.error("Lỗi khi xoá cuộc trò chuyện:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

export async function convertZaloToDealAction(conversationId: string, payload: { title: string, value: number, expectedClose?: Date }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const { getSystemDb } = await import("@/lib/db");
    const db = getSystemDb();
    
    const conv = await db.chatConversation.findUnique({
      where: { id: conversationId, organizationId: session.organizationId },
      include: { participants: { include: { user: true } } }
    });

    if (!conv) throw new Error("Không tìm thấy hội thoại");
    if (conv.entityType) throw new Error("Hội thoại này đã được liên kết với một " + conv.entityType);

    // Tìm khách hàng (Zalo User)
    const zaloUser = conv.participants.find(p => p.user.email.includes("@zalo.me"));
    if (!zaloUser) throw new Error("Không tìm thấy khách hàng Zalo trong hội thoại này");

    // Tạo Contact nếu chưa có (dựa vào email Zalo)
    let contact = await db.contact.findFirst({
      where: { email: zaloUser.user.email, organizationId: session.organizationId }
    });
    
    if (!contact) {
      contact = await db.contact.create({
        data: {
          organizationId: session.organizationId,
          name: zaloUser.user.name || "Khách Zalo",
          email: zaloUser.user.email,
          phone: zaloUser.user.phone,
          status: "LEAD",
        }
      });
    }

    // Tạo Deal
    const deal = await db.deal.create({
      data: {
        organizationId: session.organizationId,
        title: payload.title,
        value: payload.value,
        contactId: contact.id,
        assigneeId: session.user.id,
        expectedClose: payload.expectedClose,
      }
    });

    // Cập nhật lại Conversation
    await db.chatConversation.update({
      where: { id: conversationId },
      data: {
        entityType: "Deal",
        entityId: deal.id
      }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/workspace/chat");
    return { success: true, dealId: deal.id };
  } catch (error: any) {
    console.error("Lỗi chuyển đổi Deal:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

export async function convertZaloToStudentAction(conversationId: string, payload: { courseId: string, classId?: string }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) throw new Error("Unauthorized");

    const { getSystemDb } = await import("@/lib/db");
    const db = getSystemDb();
    
    const conv = await db.chatConversation.findUnique({
      where: { id: conversationId, organizationId: session.organizationId },
      include: { participants: { include: { user: true } } }
    });

    if (!conv) throw new Error("Không tìm thấy hội thoại");
    if (conv.entityType) throw new Error("Hội thoại này đã được liên kết với một " + conv.entityType);

    const zaloUser = conv.participants.find(p => p.user.email.includes("@zalo.me"));
    if (!zaloUser) throw new Error("Không tìm thấy khách hàng Zalo trong hội thoại này");

    // Lấy User (Zalo user cũng là 1 record trong bảng User)
    const studentUser = zaloUser.user;

    // Tạo Enrollment
    const enrollment = await db.enrollment.create({
      data: {
        courseId: payload.courseId,
        classId: payload.classId || null,
        studentId: studentUser.id,
        status: "PENDING",
      }
    });

    // Cập nhật lại Conversation
    await db.chatConversation.update({
      where: { id: conversationId },
      data: {
        entityType: "Student",
        entityId: studentUser.id
      }
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/workspace/chat");
    return { success: true, studentId: studentUser.id };
  } catch (error: any) {
    console.error("Lỗi chuyển đổi Học viên:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}

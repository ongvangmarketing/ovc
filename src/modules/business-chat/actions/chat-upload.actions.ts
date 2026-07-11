"use server";

import { MessageType } from "@prisma/client";
import { MessageService } from "../services/message.service";
import { StorageGateway } from "@/modules/core-storage/services/StorageGateway";
import { requireAuth } from "@/lib/auth/require-auth";

/**
 * Upload file đính kèm trong Chat
 * Sử dụng FormData để hỗ trợ upload từ Client Component
 */
export async function uploadChatAttachmentAction(
  conversationId: string,
  formData: FormData
) {
  try {
    // 1. Lấy thông tin user
    const session = await requireAuth();

    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("Không tìm thấy file.");
    }

    // 2. Upload file qua OVC StorageGateway
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storageFile = await StorageGateway.upload(
      buffer,
      file.name,
      file.type,
      "CHAT_ATTACHMENT", // category
      "BUSINESS_CHAT",   // moduleName
      session.organizationId,
      conversationId,    // relatedRecordId
      session.user.id    // uploadedById
    );

    const fileUrl = `/api/storage/download?fileId=${storageFile.id}`;

    const isImage = file.type.startsWith("image/");
    const messageType = "FILE"; // Prisma schema only has TEXT, FILE, SYSTEM, OVC_CARD

    const { getSystemDb } = await import("@/lib/db");
    const conv = await getSystemDb().chatConversation.findUnique({ where: { id: conversationId } });

    // 3. Nếu là hội thoại Zalo, gửi file/ảnh qua Zalo (Native)
    if (conv?.name?.startsWith("Zalo-")) {
      const threadId = conv.name.replace("Zalo-", "");
      try {
        const { ZaloSessionManager } = await import("../../zalo-integration/services/zalo-session.manager");
        if (conv.zaloAccountId) {
            // Sử dụng Buffer đã đọc được thay vì lấy URL
            await ZaloSessionManager.getInstance().sendAttachment(conv.zaloAccountId, threadId, buffer, file.name);
        }
      } catch (e) {
        console.error("Lỗi gửi file Zalo (Native):", e);
      }
    }

    // 4. Tạo tin nhắn dạng FILE hoặc IMAGE trong DB
    const message = await MessageService.sendMessage(
      session.organizationId,
      conversationId,
      session.user.id,
      {
        type: messageType as any, 
        content: fileUrl,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          storageFileId: storageFile.id,
        },
      }
    );

    return { success: true, message };
  } catch (error: any) {
    console.error("Lỗi trong uploadChatAttachmentAction:", error);
    return { success: false, error: error?.message || "Lỗi Server" };
  }
}


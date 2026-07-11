import { ChatSidebarClient } from "./chat-sidebar-client";
import { requireAuth } from "@/lib/auth/require-auth";

export async function ChatSidebar() {
  const session = await requireAuth();
  const currentUserId = session?.user?.id;
  const organizationId = session?.organizationId;

  let conversations: any[] = [];
  try {
    const { getConversationsAction } = await import("../actions/chat.actions");
    conversations = await getConversationsAction();
  } catch (error) {
    console.error("Lỗi khi tải danh sách cuộc trò chuyện", error);
  }

  const formatTime = (date?: Date) => {
    if (!date) return "Vừa xong";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
    return `${Math.floor(diff / 86400)} ngày`;
  };

    const enrichedConversations = await Promise.all(
    conversations.map(async (conv) => {
      let convName = conv.name;
      let avatarUrl = conv.avatarUrl;

      if (convName?.startsWith("Zalo-")) {
        // Lấy tên khách hàng từ Zalo (đã lưu dưới dạng user)
        const threadId = convName.replace("Zalo-", "");
        try {
          const { getSystemDb } = await import("@/lib/db");
          const zaloUser = await getSystemDb().user.findFirst({
            where: { email: `zalo_${threadId}@zalo.me` }
          });
          if (zaloUser) {
            if (zaloUser.name) convName = zaloUser.name;
            if (zaloUser.image) avatarUrl = zaloUser.image;
          }
        } catch (e) {}
      } else if (conv.type === "DIRECT" && currentUserId) {
        const otherUserId = conv.participants?.find((p: any) => p.userId !== currentUserId)?.userId;
        if (otherUserId) {
          try {
            const { getSystemDb } = await import("@/lib/db");
            const user = await getSystemDb().user.findUnique({ where: { id: otherUserId } });
            convName = user?.name || "Người dùng ẩn danh";
            if (user?.image) avatarUrl = user.image;
          } catch (e) {
            convName = "Người dùng ẩn danh";
          }
        } else {
          convName = "Người dùng ẩn danh";
        }
      } else if (!convName) {
        convName = "Nhóm chưa đặt tên";
      }

      const latestMessage = conv.messages?.[0];
      let previewText = "Chưa có tin nhắn...";
      if (latestMessage) {
        const senderPrefix = latestMessage.senderId === currentUserId ? "Bạn: " : "";
        if (latestMessage.type === "FILE") {
          const isImage = latestMessage.metadata && (latestMessage.metadata as any).fileType?.startsWith("image/");
          previewText = senderPrefix + (isImage ? "[Hình ảnh]" : "[Tệp đính kèm]");
        } else {
          previewText = senderPrefix + latestMessage.content;
        }
      }

      let platform = "Office";
      if (conv.name?.startsWith("Zalo-")) {
        platform = "Zalo";
      } else if (conv.entityType === "LEAD") {
        platform = "Lead";
      } else if (conv.entityType === "CUSTOMER") {
        platform = "Customer";
      }

      return {
        id: conv.id,
        avatarUrl,
        isDirect: conv.type === "DIRECT",
        convName,
        previewText,
        formattedTime: formatTime(conv.updatedAt),
        platform, // Thêm thông tin platform
      };
    })
  );

  return <ChatSidebarClient conversations={enrichedConversations} organizationId={organizationId} />;
}

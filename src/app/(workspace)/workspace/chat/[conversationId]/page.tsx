import { ChatLayout } from "@/modules/business-chat/components/chat-layout";
import { ChatRoom } from "@/modules/business-chat/components/chat-room";
import { getMessagesAction } from "@/modules/business-chat/actions/chat.actions";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const session = await requireAuth();
  const { conversationId } = await params;

  // Fetch initial messages từ DB
  let initialMessages: any[] = [];
  let headerName = "Đang tải...";
  let headerAvatar = "";
  let headerPhone = "";
  let isOnline = true; // Mock status
  let entityType = null;
  let entityId = null;
  let platform = "Office";
  let userRole = "MEMBER";
  let senderZaloAccount = null;
  
  try {
    const msgs = await getMessagesAction(conversationId);
    initialMessages = msgs.reverse();
    
    const { getSystemDb } = await import("@/lib/db");
    const conv = await getSystemDb().chatConversation.findUnique({
      where: { id: conversationId },
      include: { participants: true, zaloAccount: true }
    });

    if (conv) {
      const me = conv.participants?.find((p: any) => p.userId === session.user.id);
      const isHighRole = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role || "");

      if (me) {
        userRole = me.role;
        // Trưởng phòng, Admin công ty luôn có quyền ADMIN trong chat
        if (isHighRole) userRole = "ADMIN";
      } else {
        // Nếu user có thể vào được chat này mà không có trong participants
        if (isHighRole) {
          userRole = "ADMIN";
        }
      }

      headerName = conv.name || "Nhóm chưa đặt tên";
      headerAvatar = conv.avatarUrl || "";
      entityType = conv.entityType || null;
      entityId = conv.entityId || null;
      
      if (conv.zaloAccount) {
        senderZaloAccount = {
          name: conv.zaloAccount.name,
          avatar: conv.zaloAccount.avatar || ""
        };
      }
      
      if (conv.name?.startsWith("Zalo-")) {
        platform = "Zalo";
        const threadId = conv.name.replace("Zalo-", "");
        const zaloUser = await getSystemDb().user.findFirst({
          where: { email: `zalo_${threadId}@zalo.me` }
        });
        if (zaloUser) {
          headerName = zaloUser.name || "Zalo Khách hàng";
          headerAvatar = zaloUser.image || "";
          headerPhone = zaloUser.phone || "";
        }
      } else if (conv.entityType === "LEAD") {
        platform = "Lead";
      } else if (conv.entityType === "CUSTOMER") {
        platform = "Customer";
      }

      if (conv.type === "DIRECT") {
        const otherUserId = conv.participants?.find((p: any) => p.userId !== session.user.id)?.userId;
        if (otherUserId) {
          const user = await getSystemDb().user.findUnique({ where: { id: otherUserId } });
          if (user) {
            headerName = user.name || "Người dùng ẩn danh";
            headerAvatar = user.image || "";
            headerPhone = user.phone || "";
          }
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu chat", error);
  }

  return (
    <ChatLayout isChatSelected={true}>
      <ChatRoom
        conversationId={conversationId}
        organizationId={session.organizationId}
        initialMessages={initialMessages}
        currentUserId={session.user.id}
        userRole={userRole}
        headerName={headerName}
        headerAvatar={headerAvatar}
        headerPhone={headerPhone}
        isOnline={isOnline}
        entityType={entityType as string | null}
        entityId={entityId as string | null}
        platform={platform}
        senderZaloAccount={senderZaloAccount}
      />
    </ChatLayout>
  );
}

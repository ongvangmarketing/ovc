import { NextResponse } from "next/server";
import { getSystemDb } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

// Webhook này sẽ nhận dữ liệu từ Zalo Gateway
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type === "MESSAGE") {
      const msg = body.data;
      
      // Zalo Message Format từ zca-js: 
      // msg.threadId (ID người/nhóm chat), msg.msgId, msg.message, msg.senderId
      // Chúng ta sẽ lấy organizationId đầu tiên để lưu (tạm thời)
      // Trong thực tế cần map Zalo ID với Organization
      
      const db = getSystemDb();
      const org = await db.organization.findFirst();
      if (!org) return NextResponse.json({ error: "No organization found" }, { status: 500 });
      
      const threadId = msg.threadId;
      const content = msg.message;
      const senderId = msg.senderId;

      if (!content || !threadId) {
        return NextResponse.json({ success: true, ignored: true });
      }

      // Tìm kiếm Conversation, nếu chưa có thì tạo
      let conversation = await db.chatConversation.findFirst({
        where: {
          organizationId: org.id,
          zaloThreadId: threadId, // Chú ý: Cần thêm trường zaloThreadId vào schema (Tạm dùng id Zalo làm name hoặc 1 cột phụ)
        }
      } as any); // Type cast tạm thời nếu schema chưa có

      // Nếu chưa có bảng zaloThreadId, ta dùng name = `Zalo-${threadId}` làm key tạm
      if (!conversation) {
        conversation = await db.chatConversation.findFirst({
          where: { name: `Zalo-${threadId}`, organizationId: org.id }
        });
      }

      if (!conversation) {
        conversation = await db.chatConversation.create({
          data: {
            organizationId: org.id,
            name: `Zalo-${threadId}`, // Tạm thời dùng ID, sau này update tên thật
            type: "ZALO" as any, // Cần thêm enum ZALO nếu chưa có, tạm dùng GROUP
          }
        });
      }

      // Tạo người dùng Zalo ảo (nếu chưa có)
      let zaloUser = await db.user.findFirst({
        where: { email: `zalo_${senderId}@zalo.me` }
      });

      if (!zaloUser) {
        zaloUser = await db.user.create({
          data: {
            email: `zalo_${senderId}@zalo.me`,
            name: `Zalo User ${senderId}`,
            // provider: "CREDENTIALS", // Mock
          }
        });
      }

      // Lưu tin nhắn
      const chatMessage = await db.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: zaloUser.id,
          content: content,
          type: "TEXT",
        },
        include: { sender: true }
      });

      // Bắn sự kiện Pusher
      const pusher = getPusherServer();
      const channelName = `org-${org.id}-chat-${conversation.id}`;
      await pusher.trigger(channelName, "new-message", chatMessage);

      // Trigger update sidebar
      await pusher.trigger(`org-${org.id}-conversations`, "update", {
        conversationId: conversation.id,
        lastMessage: chatMessage,
      });

      return NextResponse.json({ success: true, messageId: chatMessage.id });
    }

    return NextResponse.json({ success: true, ignored: true });
  } catch (error: any) {
    console.error("Zalo Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

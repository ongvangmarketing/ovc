"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { CreateChatButton } from "./create-chat-button";
import { DeleteChatButton } from "./delete-chat-button";
import { MoreHorizontal, ChevronDown, Tag, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getPusherClient } from "@/lib/pusher";
import { toast } from "sonner";

export function ChatSidebarClient({ conversations, organizationId }: { conversations: any[], organizationId?: string }) {
  const [activeTab, setActiveTab] = useState("Ưu tiên");
  const [searchQuery, setSearchQuery] = useState("");
  const params = useParams();
  const router = useRouter();
  const activeChatId = params?.conversationId || params?.chatId;

  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set());
  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
    if (activeChatId) {
      setUnreadIds((prev) => {
        const next = new Set(prev);
        if (next.has(activeChatId as string)) {
          next.delete(activeChatId as string);
          return next;
        }
        return prev;
      });
    }
  }, [activeChatId]);

  // Request Notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Lắng nghe sự kiện có tin nhắn mới hoặc cuộc trò chuyện mới để refresh Sidebar
  useEffect(() => {
    if (!organizationId) {
      console.warn("[ChatSidebar] organizationId is missing - cannot subscribe to Pusher");
      return;
    }
    const pusher = getPusherClient();
    const globalChannel = `org-${organizationId}-global`;
    console.log("[ChatSidebar] Subscribing to Pusher channel:", globalChannel);
    const channel = pusher.subscribe(globalChannel);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("[ChatSidebar] ✅ Pusher subscription succeeded:", globalChannel);
    });

    channel.bind("chat-update", (data: { conversationId: string; senderName?: string; content?: string }) => {
      console.log("[ChatSidebar] 📨 chat-update received:", data);
      
      if (data.conversationId !== activeChatIdRef.current) {
        setUnreadIds((prev) => new Set(prev).add(data.conversationId));
        
        // Play Sound using Web Audio API (không cần file bên ngoài)
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(880, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.4);
        } catch (e) { console.log("Audio failed:", e); }

        // Desktop Notification (kể cả khi tab đang mở)
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          const notification = new Notification("Tin nhắn mới", {
            body: `${data.senderName || "Khách hàng"}: ${data.content || "Đã gửi tin nhắn"}`,
            icon: "/brand/ong-vang-logo.svg"
          });
          notification.onclick = () => {
            window.focus();
            router.push(`/workspace/chat/${data.conversationId}`);
          };
        }
      }
      
      toast.success(`📨 Tin nhắn mới từ ${data.senderName || "Zalo"}!`);
      // Làm mới dữ liệu Server Component
      router.refresh();
    });

    return () => {
      pusher.unsubscribe(globalChannel);
    };
  }, [organizationId, router]);

  // Nhấp nháy tiêu đề tab
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const originalTitle = document.title;
    
    if (unreadIds.size > 0 && document.hidden) {
      let isAlt = false;
      interval = setInterval(() => {
        document.title = isAlt ? originalTitle : `(${unreadIds.size}) Tin nhắn mới!`;
        isAlt = !isAlt;
      }, 1000);
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && unreadIds.size > 0) {
        document.title = originalTitle;
      } else if (document.hidden && unreadIds.size > 0) {
        let isAlt = false;
        clearInterval(interval);
        interval = setInterval(() => {
          document.title = isAlt ? originalTitle : `(${unreadIds.size}) Tin nhắn mới!`;
          isAlt = !isAlt;
        }, 1000);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (document.title.includes("Tin nhắn mới")) {
        document.title = originalTitle;
      }
    };
  }, [unreadIds.size]);

  // Xử lý lọc và sắp xếp (ưu tiên unread)
  const filteredConversations = [...conversations].filter((conv) => {
    // 1. Lọc theo tìm kiếm
    if (searchQuery) {
      const nameMatch = (conv.convName || "").toLowerCase().includes(searchQuery.toLowerCase());
      if (!nameMatch) {
        return false;
      }
    }
    
    // 2. Lọc theo tab (Chỉ áp dụng khi không có query search để dễ tìm)
    if (!searchQuery && activeTab === "Khác") {
      return true; 
    }
    
    return true;
  }).sort((a, b) => {
    const aUnread = unreadIds.has(a.id);
    const bUnread = unreadIds.has(b.id);
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;
    return 0; // Giữ nguyên thứ tự (đã được sort theo updatedAt từ server)
  });

  return (
    <aside className="w-full md:w-[340px] border-r border-[#eaeaea] bg-white flex flex-col h-full group">
      {/* Search Bar & Actions */}
      <div className="h-16 px-4 flex items-center justify-between gap-3 border-b border-[#eaeaea] shrink-0">
        <div className="flex-1 flex items-center border border-[#eaeaea] rounded-md px-3 py-1.5 focus-within:border-black transition-colors">
          <Search className="w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm hội thoại..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[13px] w-full ml-2 placeholder:text-gray-400 text-black"
          />
        </div>
        <CreateChatButton />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between px-6 pt-4 pb-0 border-b border-[#eaeaea]">
        <div className="flex space-x-6">
          <button 
            onClick={() => setActiveTab("Ưu tiên")}
            className={`text-[12px] font-medium pb-3 tracking-widest uppercase transition-colors relative ${activeTab === "Ưu tiên" ? "text-black" : "text-gray-400 hover:text-black"}`}
          >
            Ưu tiên
            {activeTab === "Ưu tiên" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></span>}
          </button>
          <button 
            onClick={() => setActiveTab("Khác")}
            className={`text-[12px] font-medium pb-3 tracking-widest uppercase transition-colors relative ${activeTab === "Khác" ? "text-black" : "text-gray-400 hover:text-black"}`}
          >
            Khác
            {activeTab === "Khác" && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black"></span>}
          </button>
        </div>
        <div className="flex items-center space-x-3 text-gray-400 pb-3">
          <button className="flex items-center text-[11px] font-medium uppercase tracking-widest hover:text-black transition-colors">
            Filter
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
      
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filteredConversations.length === 0 ? (
          <div className="text-[13px] text-gray-400 text-center p-8 border border-dashed border-[#eaeaea] rounded-lg mt-4 mx-2">
            No conversations found.
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <Link 
              key={conv.id} 
              href={`/workspace/chat/${conv.id}`}
              className={`flex items-center gap-3.5 p-3 rounded-md transition-colors cursor-pointer ${activeChatId === conv.id ? "bg-gray-50 border border-[#eaeaea]" : "border border-transparent hover:border-[#eaeaea] hover:bg-gray-50/50"}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-[#eaeaea] flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                {conv.avatarUrl ? (
                  <img src={conv.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-black text-[14px] font-medium">
                    {conv.isDirect ? conv.convName?.charAt(0)?.toUpperCase() : conv.convName?.charAt(0)?.toUpperCase() || "G"}
                  </span>
                )}
                {conv.isDirect && (
                   <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <h3 className={`text-[14px] tracking-tight truncate ${unreadIds.has(conv.id) ? "font-semibold text-black" : "font-medium text-gray-900"}`}>
                      {conv.convName}
                    </h3>
                    {unreadIds.has(conv.id) && (
                      <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0" />
                    )}
                    {conv.platform && (
                      <span className="rounded-full border border-[#eaeaea] bg-white px-1.5 py-[2px] text-[8px] font-medium text-gray-400 uppercase tracking-wider shrink-0 leading-none">
                        {conv.platform}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end shrink-0">
                    <span className={`text-[11px] font-medium whitespace-nowrap ${unreadIds.has(conv.id) ? "text-black" : "text-gray-400"}`}>
                      {conv.formattedTime}
                    </span>
                  </div>
                </div>
                <p className={`text-[13px] leading-relaxed truncate pr-4 ${unreadIds.has(conv.id) ? "font-medium text-gray-900" : "text-gray-500"}`}>
                  {conv.previewText}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </aside>
  );
}

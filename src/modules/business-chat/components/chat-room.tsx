"use client";

import { useEffect, useState, useRef } from "react";
import { ChatMessage, MessageType } from "@prisma/client";
import { sendMessageAction } from "../actions/chat.actions";
import { uploadChatAttachmentAction } from "../actions/chat-upload.actions";
import { getSettings } from "@/actions/settings";
import { getDynamicPaymentChannels } from "@/lib/finance/payment-channels";
import { getPusherClient } from "@/lib/pusher";
import { TransferChatModal } from "./transfer-chat-modal";
import { Send, Image as ImageIcon, Paperclip, Smile, MoreVertical, MoreHorizontal, X, CreditCard, Plus, ChevronLeft, ArrowRightLeft, Trash2 } from "lucide-react";
import { ChatCustomerSidebar } from "./chat-customer-sidebar";
import { useRouter } from "next/navigation";
import { deleteConversationAction } from "../actions/chat.actions";
import { toast } from "sonner";

interface ChatRoomProps {
  conversationId: string;
  organizationId: string;
  initialMessages: ChatMessage[];
  currentUserId: string;
  userRole?: string;
  headerName?: string;
  headerAvatar?: string;
  headerPhone?: string;
  isOnline?: boolean;
  senderZaloAccount?: { name: string; avatar: string } | null;
}

export function ChatRoom({
  conversationId,
  organizationId,
  initialMessages,
  currentUserId,
  userRole = "MEMBER",
  headerName = "Trò chuyện",
  headerAvatar = "",
  headerPhone = "",
  isOnline = false,
  entityType = null,
  entityId = null,
  platform = "Office",
  senderZaloAccount = null
}: ChatRoomProps & { entityType?: string | null, entityId?: string | null, platform?: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const emojis = ["😀","😂","🤣","😊","🥰","😍","😘","😎","🤔","😭","👍","🙏","❤️","🔥","🎉"];

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    getSettings().then((settings) => {
      const channels = getDynamicPaymentChannels(settings.PAYMENT_METHODS || settings.PAYMENT_CHANNELS);
      setBankAccounts(channels.map((c: any) => ({
        bank: c.bankName,
        number: c.accountNumber,
        name: c.accountName
      })));
    }).catch(console.error);
  }, []);

  // Lắng nghe sự kiện Real-time
  useEffect(() => {
    // Chỉ subscribe nếu đang là ADMIN (Người phụ trách)
    if (userRole !== "ADMIN") return;

    const pusher = getPusherClient();
    const channelName = `org-${organizationId}-chat-${conversationId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("new-message", (newMessage: ChatMessage) => {
      console.log("Realtime event received:", newMessage);
      setMessages((prev) => {
        // Tránh trùng lặp (nếu mình là người gửi và đã tự cập nhật UI)
        if (prev.some((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [conversationId, organizationId, userRole]);

  const handleSendText = async () => {
    if (!input.trim() || userRole !== "ADMIN") return;
    const content = input.trim();
    setInput("");

    // Optimistic UI có thể áp dụng ở đây, nhưng để đơn giản ta chỉ gọi API
    try {
      const res = await sendMessageAction(conversationId, {
        content,
        type: "TEXT" as any,
      });
      if (!res?.success) throw new Error(res?.error || "Không thể gửi tin nhắn");
      
      // Tự động thêm tin nhắn vào UI ngay lập tức (tránh đợi Pusher)
      if (res.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (userRole !== "ADMIN") return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadChatAttachmentAction(conversationId, formData);
      if (!res?.success) throw new Error(res?.error || "Lỗi tải file");
      
      // Tự động thêm file vào UI ngay
      if (res.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
      alert("Đã xảy ra lỗi khi tải file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteConversation = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteConversationAction(conversationId);
      if (res?.success) {
        toast.success("Đã xóa cuộc trò chuyện");
        router.push("/workspace/chat");
        router.refresh();
      } else {
        toast.error(res?.error || "Không thể xóa");
      }
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-white relative">
      {/* Modal xác nhận xóa */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 p-5 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-[17px] font-semibold text-gray-900 mb-2">Xóa cuộc trò chuyện?</h3>
            <p className="text-[14px] text-gray-500 mb-6">
              Bạn có chắc chắn muốn xóa toàn bộ tin nhắn này không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2 text-[14px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <button 
                onClick={handleDeleteConversation}
                disabled={isDeleting}
                className="flex-1 py-2 text-[14px] font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}

      <TransferChatModal 
        isOpen={showTransferModal} 
        onClose={() => setShowTransferModal(false)}
        conversationId={conversationId}
        organizationId={organizationId}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-16 border-b border-[#eaeaea] flex items-center justify-between px-4 sm:px-6 shrink-0 bg-white">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
          <a href="/workspace/chat" className="md:hidden p-2 -ml-2 text-gray-500 hover:text-black rounded-full transition-colors flex-shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </a>
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-[#eaeaea] flex items-center justify-center overflow-hidden flex-shrink-0">
            {headerAvatar ? (
              <img src={headerAvatar} alt={headerName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-black font-medium">{headerName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1 sm:pr-4">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="text-[15px] font-semibold tracking-tight text-black truncate">
                {headerName}
              </div>
              {platform && (
                <span className="rounded-full border border-[#eaeaea] bg-white px-1.5 py-[2px] text-[9px] font-medium text-gray-500 uppercase tracking-wider shrink-0 leading-none">
                  {platform}
                </span>
              )}
            </div>
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden sm:gap-2">
              {isOnline && <p className="text-[11px] uppercase tracking-widest text-emerald-600 font-medium shrink-0">● Online</p>}
              {headerPhone && (
                <>
                  {isOnline && <span className="hidden shrink-0 text-xs text-gray-300 sm:inline">|</span>}
                  <p className="hidden truncate font-mono text-[11px] uppercase tracking-widest text-gray-400 sm:block">{headerPhone}</p>
                </>
              )}
              {platform === "Zalo" && senderZaloAccount && (
                <>
                  <span className="shrink-0 text-xs text-gray-300">|</span>
                  <div className="flex min-w-0 max-w-[130px] items-center gap-1.5 rounded border border-[#eaeaea] bg-[#f5f5f5] px-1.5 py-0.5 text-[10px] font-medium text-gray-600 sm:max-w-[220px]">
                    {senderZaloAccount.avatar && (
                      <img src={senderZaloAccount.avatar} alt="Zalo Sender" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                    )}
                    <span className="truncate">{senderZaloAccount.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {userRole === "ADMIN" && (
            <button 
              onClick={() => setShowTransferModal(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-md border border-[#eaeaea] bg-white px-3 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
              Chuyển giao
            </button>
          )}

          {userRole === "ADMIN" && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="hidden sm:flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-100 transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              Xóa
            </button>
          )}
          
          {/* Nút mở Menu thông tin khách hàng trên mobile */}
          <button 
            onClick={() => setShowMobileSidebar(true)}
            className="lg:hidden p-2 -mr-2 text-gray-400 hover:text-black rounded-md transition-colors flex-shrink-0"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          <button className="hidden lg:block p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col-reverse gap-4 bg-white">
        {messages.length === 0 ? (
          <div className="text-center text-[13px] text-gray-400 mt-10 w-full h-full flex items-end justify-center">
            Start a new conversation.
          </div>
        ) : (
          [...messages].reverse().map((msg) => {
            const isMe = msg.senderId === currentUserId;
            
            // SYSTEM MESSAGES (e.g., TRANSFERRED)
            if (msg.type === "SYSTEM") {
              const content = msg.content || "";
              if (content.startsWith("TRANSFERRED|")) {
                const parts = content.split("|");
                // parts[1] is old owner, parts[2] is new owner
                return (
                  <div key={msg.id} className="w-full flex justify-center my-4">
                    <span className="bg-gray-50 border border-[#eaeaea] text-black text-[10px] font-medium uppercase tracking-widest px-4 py-1.5 rounded-full">
                      Chat transferred
                    </span>
                  </div>
                );
              }
              return (
                <div key={msg.id} className="w-full flex justify-center my-4">
                  <span className="bg-gray-50 border border-[#eaeaea] text-black text-[10px] font-medium uppercase tracking-widest px-4 py-1.5 rounded-full">
                    {content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isMe ? "ml-auto flex-row-reverse" : ""}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gray-100 border border-[#eaeaea] flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {(msg as any).sender?.image ? (
                      <img src={(msg as any).sender.image} alt={(msg as any).sender?.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[12px] text-black font-medium">{(msg as any).sender?.name?.charAt(0) || "C"}</span>
                    )}
                  </div>
                )}
                
                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  {(() => {
                    const isImage = msg.type === "IMAGE" || (msg.type === "FILE" && msg.metadata && (msg.metadata as any).fileType?.startsWith("image/"));
                    const bubbleClasses = isImage 
                      ? `rounded-lg overflow-hidden border border-[#eaeaea] ${isMe ? "rounded-tr-none" : "rounded-tl-none"}`
                      : `px-4 py-2.5 rounded-lg text-[14px] leading-relaxed whitespace-pre-wrap ${
                          isMe
                            ? "bg-black text-white rounded-tr-none"
                            : "bg-white border border-[#eaeaea] text-black rounded-tl-none"
                        }`;
                        
                    return (
                      <div className={bubbleClasses}>
                        {(msg.type === "FILE" || msg.type === "IMAGE") ? (
                          <div className="flex flex-col">
                            {(() => {
                              const fileUrl = msg.content || "";
                              const fixedUrl = fileUrl.includes("?fileId=") 
                                ? fileUrl 
                                : fileUrl.replace("/api/storage/download/", "/api/storage/download?fileId=");

                              if (isImage) {
                                return (
                                  <div 
                                    className="block cursor-pointer bg-gray-50"
                                    onClick={() => setSelectedImage(fixedUrl)}
                                  >
                                    <img 
                                      src={fixedUrl} 
                                      alt={(msg.metadata as any).fileName || "Ảnh đính kèm"}
                                      className="max-w-[280px] max-h-[280px] object-cover hover:opacity-90 transition-opacity"
                                    />
                                  </div>
                                );
                              }

                              return (
                                <a
                                  href={fixedUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`underline text-[13px] flex items-center gap-1 ${isMe ? 'hover:text-gray-200' : 'hover:text-gray-500'}`}
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  {msg.metadata ? (msg.metadata as any).fileName : "Tệp đính kèm"}
                                </a>
                              );
                            })()}
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    );
                  })()}
                  <span className="text-[10px] text-gray-400 mt-1.5 mx-1 uppercase tracking-widest font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Phóng to" 
            className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm"
          />
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-[#eaeaea] shrink-0">
        {/* Toolbar */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-[#eaeaea]">
          <div className="relative">
            <Smile 
              className={`w-5 h-5 hover:text-black cursor-pointer transition-colors ${showEmojiPicker ? 'text-black' : 'text-gray-400'}`} 
              strokeWidth={1.5} 
              onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowBankPicker(false); }} 
            />
            {showEmojiPicker && (
               <div className="absolute bottom-10 left-0 bg-white border border-[#eaeaea] rounded-md shadow-sm p-2 flex flex-wrap gap-1 w-[220px] z-50">
                  {emojis.map(e => (
                    <span 
                      key={e} 
                      className="cursor-pointer hover:bg-gray-50 p-2 rounded text-lg transition-colors" 
                      onClick={() => { setInput(prev => prev + e); setShowEmojiPicker(false); }}
                    >
                      {e}
                    </span>
                  ))}
               </div>
            )}
          </div>

          <input type="file" className="hidden" ref={imageInputRef} accept="image/*" onChange={handleFileUpload} />
          <ImageIcon className="w-5 h-5 text-gray-400 hover:text-black cursor-pointer transition-colors" strokeWidth={1.5} onClick={() => imageInputRef.current?.click()} />
          
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <Paperclip 
            className={`w-5 h-5 hover:text-black cursor-pointer transition-colors ${isUploading ? 'text-gray-300 pointer-events-none' : 'text-gray-400'}`}
            strokeWidth={1.5}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          />
          
          <div className="relative">
            {showBankPicker && (
              <div className="fixed inset-0 z-40" onClick={() => setShowBankPicker(false)} />
            )}
            <CreditCard 
              className={`relative z-50 w-5 h-5 hover:text-black cursor-pointer transition-colors ${showBankPicker ? 'text-black' : 'text-gray-400'}`} 
              strokeWidth={1.5} 
              onClick={() => { setShowBankPicker(!showBankPicker); setShowEmojiPicker(false); }} 
            />
            {showBankPicker && (
               <div className="absolute bottom-full mb-2 left-0 bg-white border border-[#eaeaea] rounded-md shadow-sm w-[280px] z-50 overflow-hidden">
                  <div className="bg-gray-50/50 px-3 py-2 border-b border-[#eaeaea] font-medium text-[11px] uppercase tracking-widest text-black">Bank Accounts</div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {bankAccounts.map(b => (
                      <div 
                        key={b.number} 
                        className="px-3 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors" 
                        onClick={async () => {
                          const msg = `Thanh toán qua tài khoản:\n🏦 Ngân hàng: ${b.bank}\n💳 STK: ${b.number}\n👤 Chủ TK: ${b.name}`;
                          setShowBankPicker(false);
                          
                          // Gọi API gửi ngay
                          try {
                            const res = await sendMessageAction(conversationId, {
                              content: msg,
                              type: "TEXT" as any,
                            });
                            if (res?.message) {
                              setMessages((prev) => {
                                if (prev.some((m) => m.id === res.message.id)) return prev;
                                return [...prev, res.message];
                              });
                            }
                          } catch (e) {
                            console.error("Lỗi gửi tài khoản", e);
                          }
                        }}
                      >
                         <div className="font-semibold text-[13px] text-black tracking-tight">{b.bank}</div>
                         <div className="text-[12px] text-gray-500 font-mono mt-0.5">{b.number}</div>
                         <div className="text-[11px] text-gray-400 mt-0.5">{b.name}</div>
                      </div>
                    ))}
                  </div>
               </div>
            )}
          </div>
        </div>
        
        {/* Input Field */}
        <div className="flex items-end gap-2 px-4 py-3 sm:p-4 relative">
          {userRole !== "ADMIN" && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <span className="text-[12px] font-medium uppercase tracking-widest text-black bg-white px-4 py-2 rounded-full border border-[#eaeaea]">
                Only admins can reply
              </span>
            </div>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendText();
              }
            }}
            placeholder={isUploading ? "Uploading file..." : "Type a message..."}
            className="flex-1 bg-transparent border-none outline-none resize-none min-h-[96px] max-h-[160px] text-[14px] text-black placeholder:text-gray-400 leading-relaxed disabled:opacity-50 sm:min-h-[48px] sm:max-h-32"
            rows={4}
            disabled={isUploading || userRole !== "ADMIN"}
          />
          <button
            onClick={handleSendText}
            disabled={!input.trim() || isUploading || userRole !== "ADMIN"}
            className="p-2.5 text-white bg-black hover:bg-gray-800 rounded-md transition-colors disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
      
      {/* Right Sidebar (Customer Info) */}
      <ChatCustomerSidebar 
        conversationId={conversationId} 
        entityType={entityType || null} 
        entityId={entityId || null} 
        headerName={headerName}
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
      />
    </div>
  );
}

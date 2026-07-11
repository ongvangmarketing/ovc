import { ChatLayout } from "@/modules/business-chat/components/chat-layout";

export default function ChatDashboardPage() {
  return (
    <ChatLayout>
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border border-gray-200">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
          Chào mừng đến với Business Chat
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm text-center">
          Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu một cuộc trò chuyện mới để liên kết với các nghiệp vụ.
        </p>
      </div>
    </ChatLayout>
  );
}

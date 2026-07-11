import { ReactNode } from "react";
import { ChatSidebar } from "./chat-sidebar";

interface ChatLayoutProps {
  children: ReactNode;
  isChatSelected?: boolean;
}

export function ChatLayout({ children, isChatSelected = false }: ChatLayoutProps) {
  return (
    <div className="flex flex-1 min-h-0 w-full bg-white overflow-hidden border-t border-gray-200">
      <div className={`h-full flex-shrink-0 flex flex-col ${isChatSelected ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}>
        <ChatSidebar />
      </div>
      <main className={`flex-1 flex-col min-w-0 min-h-0 bg-white overflow-hidden ${!isChatSelected ? 'hidden md:flex' : 'flex'}`}>
        {children}
      </main>
    </div>
  );
}

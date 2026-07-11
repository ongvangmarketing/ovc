import React from "react";
import { Inbox, Send, FileText, Archive, Trash2, AlertCircle, Edit, ChevronDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MailSidebarProps {
  mailboxes: any[];
  activeMailbox: string;
  setActiveMailbox: (id: string) => void;
  activeFolder: string;
  setActiveFolder: (folder: string) => void;
  onCompose: () => void;
  onSync: () => void;
  isSyncing?: boolean;
}

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "sent", label: "Sent", icon: Send },
  { id: "draft", label: "Draft", icon: FileText },
  { id: "archive", label: "Archive", icon: Archive },
  { id: "trash", label: "Trash", icon: Trash2 },
  { id: "spam", label: "Spam", icon: AlertCircle },
];

export function MailSidebar({ mailboxes, activeMailbox, setActiveMailbox, activeFolder, setActiveFolder, onCompose, onSync, isSyncing }: MailSidebarProps) {
  return (
    <div className="flex flex-col h-full py-4">
      {/* Compose Button */}
      <div className="px-4 mb-8">
        <button 
          onClick={onCompose}
          className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-2 rounded-md text-[14px] font-medium hover:bg-gray-800 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Soạn Email
        </button>
      </div>

      {/* Mailboxes */}
      <div className="px-3 mb-8">
        <p className="px-3 text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">Mailboxes</p>
        <div className="space-y-0.5">
          {mailboxes.map((mb) => (
            <button
              key={mb.id}
              onClick={() => setActiveMailbox(mb.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] transition-all",
                activeMailbox === mb.id ? "bg-white text-black font-medium border border-[#eaeaea] shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-black border border-transparent"
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="truncate">{mb.email}</span>
              </div>
              {mb.unread > 0 && (
                <span className="text-[10px] font-medium text-black bg-white border border-[#eaeaea] px-2 py-0.5 rounded-full shrink-0 uppercase tracking-widest">
                  {mb.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Folders */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-3">Thư mục</p>
        <div className="space-y-0.5">
          {folders.map((f) => {
            const Icon = f.icon;
            const isActive = activeFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all",
                  isActive ? "bg-white text-black font-medium border border-[#eaeaea] shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-black border border-transparent"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-black" : "text-gray-400")} />
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Sync Action */}
      <div className="px-4 py-4 mt-auto border-t border-[#eaeaea]">
        <button 
          onClick={onSync}
          disabled={isSyncing || !activeMailbox}
          className="w-full flex items-center justify-center gap-2 text-[12px] font-medium uppercase tracking-widest text-gray-500 bg-white border border-[#eaeaea] hover:bg-gray-50 transition-colors py-2.5 rounded-full disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
          {isSyncing ? "Đang đồng bộ..." : "Đồng bộ IMAP"}
        </button>
      </div>
    </div>
  );
}

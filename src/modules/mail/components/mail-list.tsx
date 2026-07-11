import React from "react";
import { Search, Filter, Paperclip, Star, ArrowDown, MailOpen, Mail, Trash2, Menu } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MailListProps {
  activeMailbox: string;
  activeFolder: string;
  messages: any[];
  loading?: boolean;
  selectedEmail: any | null;
  setSelectedEmail: (email: any) => void;
  selectedEmailIds: string[];
  toggleSelectAll: () => void;
  toggleSelectEmail: (id: string, e: React.MouseEvent) => void;
  handleBulkAction: (actionType: "read" | "unread" | "delete") => void;
  onOpenSidebar?: () => void;
}

export function MailList({ activeMailbox, activeFolder, messages, loading, selectedEmail, setSelectedEmail, selectedEmailIds, toggleSelectAll, toggleSelectEmail, handleBulkAction, onOpenSidebar }: MailListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Search & Filter */}
      <div className="p-4 border-b border-[#eaeaea]">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={onOpenSidebar} className="md:hidden p-2 -ml-2 text-gray-500 hover:text-black rounded-lg">
             <Menu className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm email..." 
              className="w-full bg-white border border-[#eaeaea] rounded-md pl-9 pr-4 py-2.5 text-[13px] focus:outline-none focus:border-gray-300 transition-colors"
            />
          </div>
        </div>
        <div className="flex items-center justify-between h-7">
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                checked={selectedEmailIds.length === messages.length}
                ref={input => {
                  if (input) {
                    input.indeterminate = selectedEmailIds.length > 0 && selectedEmailIds.length < messages.length;
                  }
                }}
                onChange={toggleSelectAll}
              />
            )}
            {selectedEmailIds.length > 0 ? (
              <span className="text-[12px] font-medium text-black">Đã chọn {selectedEmailIds.length}</span>
            ) : (
              <button className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-gray-500 hover:text-black">
                <span>Tất cả</span>
                <ArrowDown className="w-3 h-3" />
              </button>
            )}
          </div>
          
          {selectedEmailIds.length > 0 ? (
            <div className="flex items-center gap-1">
              <button onClick={() => handleBulkAction("read")} className="p-1.5 text-gray-500 hover:text-black rounded transition-colors" title="Đánh dấu đã đọc">
                <MailOpen className="w-4 h-4" />
              </button>
              <button onClick={() => handleBulkAction("unread")} className="p-1.5 text-gray-500 hover:text-black rounded transition-colors" title="Đánh dấu chưa đọc">
                <Mail className="w-4 h-4" />
              </button>
              <button onClick={() => handleBulkAction("delete")} className="p-1.5 text-gray-500 hover:text-red-600 rounded transition-colors" title="Xóa">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button className="p-1.5 text-gray-400 hover:bg-gray-50 hover:text-black rounded-md transition-colors border border-transparent hover:border-[#eaeaea]">
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="text-sm text-gray-400">Đang tải...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <span className="text-gray-300">📭</span>
            </div>
            <p className="text-[14px] text-gray-500 font-medium">Thư mục trống</p>
          </div>
        ) : (
          <div className="divide-y divide-[#eaeaea]">
            {messages.map((email) => {
            const isSelected = selectedEmail?.id === email.id;
            const isChecked = selectedEmailIds.includes(email.id);
            return (
              <div key={email.id} className={cn("group flex items-start px-3 py-2 border-b border-[#eaeaea] hover:bg-gray-50 transition-colors", isSelected && "bg-gray-50")}>
                <div className="pt-0.5 mr-3 flex-shrink-0">
                  <input 
                    type="checkbox" 
                    className={cn("w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer", isChecked ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
                    checked={isChecked}
                    onChange={(e) => toggleSelectEmail(email.id, e as any)}
                  />
                </div>
                <button
                  onClick={() => setSelectedEmail(email)}
                  className="flex-1 text-left min-w-0 relative"
                >
                  {/* Active Indicator */}
                  {isSelected && (
                    <div className="absolute -left-9 top-0 bottom-0 w-0.5 bg-black"></div>
                  )}
                  
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {/* Unread dot */}
                      {email.unread && (
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></div>
                      )}
                      <span className={cn("text-[13px] truncate", email.unread ? "font-medium text-black" : "text-gray-500")}>
                        {email.from}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {email.hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                      <Star className={cn("w-3 h-3", email.starred ? "text-yellow-400 fill-yellow-400" : "text-transparent group-hover:text-gray-300")} />
                      <span className={cn("text-[10px] uppercase tracking-widest", email.unread ? "font-medium text-black" : "text-gray-400")}>
                        {email.time}
                      </span>
                    </div>
                  </div>
                  
                  <p className={cn("text-[13px] truncate mb-0.5", email.unread ? "font-medium text-black" : "text-gray-700")}>
                    {email.subject}
                  </p>
                  
                  <p className="text-[12px] text-gray-500 line-clamp-1 leading-relaxed">
                    {email.preview}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}

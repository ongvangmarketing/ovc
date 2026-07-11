import React from "react";
import { Reply, ReplyAll, Forward, Trash2, Archive, MoreHorizontal, Download, ChevronLeft, Paperclip } from "lucide-react";

interface MailDetailProps {
  email: any | null;
  onClose: () => void;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
}

export function MailDetail({ email, onClose, onReply, onReplyAll, onForward }: MailDetailProps) {
  if (!email) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <p className="text-[14px] font-medium text-gray-500">Chọn một email để đọc</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-[#eaeaea]">
        <div className="flex items-center gap-1">
          {/* Back button on mobile/tablet */}
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg lg:hidden mr-2">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button onClick={onReply} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="Reply">
            <Reply className="w-4 h-4" />
          </button>
          <button onClick={onReplyAll} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="Reply All">
            <ReplyAll className="w-4 h-4" />
          </button>
          <button onClick={onForward} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="Forward">
            <Forward className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-gray-200 mx-2"></div>
          
          <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="Archive">
            <Archive className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          {/* Email Header */}
          <div className="mb-6">
            <h1 className="mb-5 !text-[24px] font-medium !leading-9 tracking-tight text-black">{email.subject}</h1>
            
            <div className="flex items-start gap-3 rounded-xl border border-[#eaeaea] bg-gray-50/70 p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[14px] font-medium uppercase text-black">
                {email.from.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0 truncate text-[14px] font-medium text-black">{email.from}</span>
                  <span className="shrink-0 whitespace-nowrap text-[12px] text-gray-500">{email.time} (2 giờ trước)</span>
                </div>
                <div className="mt-0.5 truncate text-[12px] text-gray-500">&lt;{email.email}&gt;</div>
                <div className="mt-1 text-[12px] text-gray-500">
                  Tới: <span className="text-gray-900">tôi</span> <span className="mx-1">·</span> <span className="text-gray-400">Chi tiết</span>
                </div>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div 
            className="prose prose-sm md:prose-base max-w-none text-gray-800 leading-relaxed overflow-hidden"
            dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
          />

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[#eaeaea]">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mb-4">
                {email.attachments.length} Tệp đính kèm
              </p>
              <div className="flex flex-wrap gap-3">
                {email.attachments.map((att: any) => (
                  <a 
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-md border border-[#eaeaea] bg-white hover:border-gray-300 transition-colors group w-64"
                  >
                    <div className="w-10 h-10 rounded-md bg-gray-50 border border-[#eaeaea] text-gray-500 flex items-center justify-center shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-black truncate" title={att.fileName}>{att.fileName}</p>
                      <p className="text-[11px] uppercase tracking-widest text-gray-400 mt-0.5">{(att.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div className="p-2 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-all">
                      <Download className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reply Box Stub */}
          <div className="mt-10">
            <div 
              onClick={onReply}
              className="w-full rounded-md border border-[#eaeaea] bg-white hover:border-gray-300 transition-colors p-4 cursor-text group"
            >
              <div className="flex items-center gap-3 text-gray-400">
                <Reply className="w-4 h-4 group-hover:text-black transition-colors" />
                <span className="text-[14px]">Nhấp để trả lời...</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { X, Minimize2, Paperclip, Image as ImageIcon, Link as LinkIcon, Smile, MoreHorizontal, Send, ChevronDown, Trash2 } from "lucide-react";
import { sendMailAction } from "../actions/mail.actions";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

interface MailComposeProps {
  onClose: () => void;
  mailboxes: any[];
  activeMailbox: string;
  composeData?: {
    mode: "compose" | "reply" | "reply-all" | "forward";
    originalEmail?: any;
  };
}

export function MailCompose({ onClose, mailboxes, activeMailbox, composeData }: MailComposeProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const currentMb = mailboxes.find(m => m.id === activeMailbox) || mailboxes[0];

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  useEffect(() => {
    if (composeData?.originalEmail) {
      const orig = composeData.originalEmail;
      const originalHtml = orig.bodyHtml || orig.preview || "Không có nội dung";

      if (composeData.mode === "reply") {
        setTo(orig.email);
        setSubject(orig.subject.startsWith("Re:") ? orig.subject : `Re: ${orig.subject}`);
        setContent(`<p><br></p><blockquote><p><b>Từ:</b> ${orig.from} &lt;${orig.email}&gt;</p>${originalHtml}</blockquote>`);
      } else if (composeData.mode === "reply-all") {
        setTo(orig.email); // Technically should include CCs of original
        setSubject(orig.subject.startsWith("Re:") ? orig.subject : `Re: ${orig.subject}`);
        setContent(`<p><br></p><blockquote><p><b>Từ:</b> ${orig.from} &lt;${orig.email}&gt;</p>${originalHtml}</blockquote>`);
      } else if (composeData.mode === "forward") {
        setSubject(orig.subject.startsWith("Fwd:") ? orig.subject : `Fwd: ${orig.subject}`);
        setContent(`<p><br></p><blockquote><p><b>Chuyển tiếp từ:</b> ${orig.from} &lt;${orig.email}&gt;</p>${originalHtml}</blockquote>`);
      }
    }
  }, [composeData]);

  const handleSend = async () => {
    if (!to || !subject) {
      toast.error("Vui lòng nhập người nhận và chủ đề!");
      return;
    }

    setIsSending(true);
    toast.info("Đang gửi email...");

    try {
      const filePromises = attachments.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              filename: file.name,
              content: (e.target?.result as string).split(",")[1], // base64
            });
          };
          reader.readAsDataURL(file);
        });
      });
      const resolvedAttachments = await Promise.all(filePromises);

      const options = {
        to: to.split(",").map(t => t.trim()).filter(Boolean),
        cc: cc ? cc.split(",").map(t => t.trim()).filter(Boolean) : undefined,
        bcc: bcc ? bcc.split(",").map(t => t.trim()).filter(Boolean) : undefined,
        subject,
        html: content,
        attachments: resolvedAttachments as any,
      };

      const result = await sendMailAction(currentMb.id, options);
      if (result.success) {
        toast.success("Email đã được gửi thành công!");
        onClose();
      } else {
        toast.error("Lỗi khi gửi email.");
      }
    } catch (error: any) {
      toast.error(`Gửi thất bại: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-24 w-72 bg-black text-white rounded-t-md shadow-none overflow-hidden animate-in slide-in-from-bottom-10 z-[100]">
        <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setIsMinimized(false)}>
          <span className="text-[13px] font-medium truncate">{subject || "Thư mới"}</span>
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 top-20 z-[100] flex max-h-[calc(100vh-5rem)] w-full flex-col overflow-hidden rounded-t-xl border border-[#eaeaea] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-10 md:right-24 md:top-auto md:max-h-[85vh] md:w-[600px] md:rounded-t-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-[#eaeaea]">
        <span className="text-[14px] font-medium text-black">Thư mới</span>
        <div className="flex items-center gap-2 text-gray-500">
          <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Thu nhỏ">
            <Minimize2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors flex items-center gap-1" title="Hủy bản nháp">
            <Trash2 className="w-4 h-4" />
            <span className="text-[13px] font-medium hidden sm:inline">Hủy</span>
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex min-h-14 items-center border-b border-[#eaeaea] px-6 py-3">
          <span className="w-16 shrink-0 text-[14px] text-gray-400">Từ</span>
          <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-[14px] font-medium text-gray-700 transition-colors hover:bg-gray-200">
            {currentMb?.email} <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex min-h-14 items-center border-b border-[#eaeaea] px-6 py-3">
          <span className="w-16 shrink-0 text-[14px] text-gray-400">Tới</span>
          <input 
            type="text" 
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 bg-transparent text-[15px] focus:outline-none" 
          />
          <div className="flex items-center gap-3 text-[13px] font-medium text-gray-400">
            {!showCc && <button onClick={() => setShowCc(true)} className="hover:text-black">Cc</button>}
            {!showBcc && <button onClick={() => setShowBcc(true)} className="hover:text-black">Bcc</button>}
          </div>
        </div>

        {showCc && (
          <div className="flex min-h-14 items-center border-b border-[#eaeaea] px-6 py-3">
            <span className="w-16 shrink-0 text-[14px] text-gray-400">Cc</span>
            <input 
              type="text" 
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="flex-1 bg-transparent text-[14px] focus:outline-none" 
            />
          </div>
        )}

        {showBcc && (
          <div className="flex min-h-14 items-center border-b border-[#eaeaea] px-6 py-3">
            <span className="w-16 shrink-0 text-[14px] text-gray-400">Bcc</span>
            <input 
              type="text" 
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              className="flex-1 bg-transparent text-[14px] focus:outline-none" 
            />
          </div>
        )}

        <div className="flex min-h-14 items-center border-b border-[#eaeaea] px-6 py-3">
          <input 
            type="text" 
            placeholder="Chủ đề" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-transparent text-[15px] font-medium focus:outline-none placeholder:text-gray-400" 
          />
        </div>

        {/* Body */}
        <div className="p-4 min-h-[250px] flex flex-col flex-1">
          <div className="flex-1 [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:border-none [&_.ProseMirror]:focus:ring-0 [&_.ProseMirror_blockquote]:my-4 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-slate-200 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-[13px] [&_.ProseMirror_blockquote]:font-normal [&_.ProseMirror_blockquote]:leading-5 [&_.ProseMirror_blockquote]:text-slate-500 [&_.ProseMirror_blockquote_*]:!text-[13px] [&_.ProseMirror_blockquote_*]:!leading-5">
            <TiptapEditor 
              value={content}
              onChange={setContent}
              placeholder="Nội dung email..."
            />
          </div>
          
          {attachments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {attachments.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-100 border border-[#eaeaea] rounded-md px-3 py-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-[12px] max-w-[150px] truncate">{file.name}</span>
                  <button onClick={() => setAttachments(attachments.filter((_, index) => index !== i))} className="text-gray-400 hover:text-red-500 ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-[#eaeaea] bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button 
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-[14px] font-medium transition-colors mr-2 disabled:opacity-50"
          >
            {isSending ? "Đang gửi..." : "Gửi"} <Send className="w-3.5 h-3.5" />
          </button>
          
          <label className="p-2 text-gray-500 hover:bg-gray-200 hover:text-black rounded-lg transition-colors cursor-pointer" title="Đính kèm file">
            <Paperclip className="w-4 h-4" />
            <input 
              type="file" 
              multiple 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files) {
                  setAttachments([...attachments, ...Array.from(e.target.files)]);
                }
              }} 
            />
          </label>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

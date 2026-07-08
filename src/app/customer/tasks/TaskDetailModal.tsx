"use client";

import { useState, useTransition } from "react";
import { X, MessageSquare, Send, CheckCircle2, XCircle, Calendar, Clock, AlertCircle, Edit2, Paperclip, UploadCloud } from "lucide-react";
import { addCustomerTaskComment, updateCustomerTaskStatus, updateCustomerTaskDueDate, uploadCustomerTaskAttachment } from "./actions";
import { formatDate, statusClass, statusLabel } from "../utils";
import Link from "next/link";
import { toast } from "sonner";

export function TaskDetailModal({ task, currentUser, onClose }: { task: any, currentUser: any, onClose: () => void }) {
  const [commentText, setCommentText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    startTransition(async () => {
      await addCustomerTaskComment(task.id, commentText);
      setCommentText("");
    });
  };

  const handleApprove = () => {
    startTransition(async () => {
      await updateCustomerTaskStatus(task.id, "DONE", "Đã duyệt và hoàn thành nhiệm vụ này.");
      onClose();
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      await updateCustomerTaskStatus(task.id, "IN_PROGRESS", "Yêu cầu chỉnh sửa lại nhiệm vụ này.");
      onClose();
    });
  };

  const handleStatusChange = (status: any) => {
    startTransition(async () => {
      await updateCustomerTaskStatus(task.id, status);
      toast.success("Đã cập nhật trạng thái");
    });
  };

  const handleDateChange = (dateString: string) => {
    startTransition(async () => {
      const date = dateString ? new Date(dateString) : null;
      await updateCustomerTaskDueDate(task.id, date);
      toast.success("Đã cập nhật ngày hạn");
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadCustomerTaskAttachment(task.id, file);
      toast.success("Đã tải lên tệp đính kèm");
    } catch (error) {
      toast.error("Không thể tải lên tệp");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = ''; // reset input
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="flex h-full max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#eaeaea] bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eaeaea] px-8 py-6 bg-white">
          <div className="pr-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isPending}
                className={`outline-none appearance-none cursor-pointer inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-widest border border-transparent transition-colors ${
                  task.status === "DONE" || task.status === "COMPLETED" ? "border-transparent bg-emerald-50 text-emerald-700" : 
                  "border-[#eaeaea] bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <option value="TODO">Cần làm</option>
                <option value="IN_PROGRESS">Đang triển khai</option>
                <option value="IN_REVIEW">Chờ duyệt</option>
                <option value="DONE">Hoàn thành</option>
              </select>
              <span className="text-[13px] font-medium text-gray-500">{task.projectName}</span>
            </div>
            <h2 className="text-[28px] font-medium tracking-tight text-black leading-tight">{task.title}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-black shrink-0"
              title="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col md:flex-row overflow-hidden bg-white">
          
          {/* Main Info (Left) */}
          <div className="flex-1 overflow-y-auto border-b md:border-b-0 md:border-r border-[#eaeaea] p-8 hide-scrollbar">
            
            {/* Action Bar (Approval) */}
            {task.status === "IN_REVIEW" && (
              <div className="mb-8 flex flex-col gap-4 rounded-xl border border-orange-200 bg-orange-50 p-6">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="text-[16px] font-medium tracking-tight">Nhiệm vụ đang chờ bạn duyệt</h3>
                </div>
                <p className="text-[14px] text-orange-700 leading-relaxed">Đội ngũ đã hoàn thành nhiệm vụ này và đang chờ xác nhận từ phía bạn để tiếp tục.</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <button 
                    onClick={handleApprove}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Đồng ý duyệt
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-full bg-white border border-[#eaeaea] px-5 py-2.5 text-[13px] font-medium text-black transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    Yêu cầu sửa lại
                  </button>
                </div>
              </div>
            )}

            <div className="mb-10">
              <h3 className="text-[18px] font-medium tracking-tight text-black mb-4">Mô tả công việc</h3>
              <div className="rounded-xl border border-[#eaeaea] bg-gray-50 p-6 text-[15px] text-black leading-relaxed">
                {task.description ? (
                  <div dangerouslySetInnerHTML={{ __html: task.description.replace(/\n/g, '<br/>') }} />
                ) : (
                  <p className="text-gray-400">Không có mô tả chi tiết.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-[18px] font-medium tracking-tight text-black mb-6">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                Thảo luận ({task.comments?.length || 0})
              </h3>
              
              <div className="flex flex-col gap-6 mb-8">
                {task.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 border border-[#eaeaea] flex items-center justify-center text-[12px] font-medium uppercase text-black">
                      {comment.user.image ? (
                        <img src={comment.user.image} alt={comment.user.name} className="h-full w-full object-cover" />
                      ) : (
                        comment.user.name?.charAt(0)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[14px] font-medium tracking-tight text-black">{comment.user.name}</span>
                        <span className="text-[12px] text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      <div className="rounded-xl bg-gray-50 border border-[#eaeaea] px-4 py-3 text-[14px] text-black leading-relaxed">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {!task.comments?.length && (
                  <p className="text-[14px] text-gray-400">Chưa có bình luận nào.</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex items-start gap-4 border-t border-[#eaeaea] pt-8">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 border border-[#eaeaea] flex items-center justify-center text-[12px] font-medium uppercase text-black">
                  {currentUser?.image ? (
                    <img src={currentUser.image} alt={currentUser.name} className="h-full w-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="relative flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết bình luận hoặc yêu cầu của bạn..."
                    className="w-full resize-none rounded-xl border border-[#eaeaea] bg-white p-4 pr-14 text-[14px] text-black placeholder:text-gray-400 outline-none transition-colors focus:border-black focus:ring-1 focus:ring-black hide-scrollbar"
                    rows={3}
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={isPending || !commentText.trim()}
                    className="absolute bottom-3 right-3 rounded-md bg-black p-2 text-white transition-colors hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar Info (Right) */}
          <div className="w-full md:w-[320px] shrink-0 bg-white p-8 overflow-y-auto hide-scrollbar">
            <h3 className="mb-6 text-[12px] font-medium text-gray-400 uppercase tracking-widest">Chi tiết</h3>
            
            <div className="flex flex-col gap-8">
              <div>
                <div className="mb-2 text-[12px] font-medium text-gray-500 uppercase tracking-widest">Thời hạn (Deadline)</div>
                <div className="flex items-center gap-2 text-[15px] font-medium text-black">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <input 
                    type="date"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={isPending}
                    className={`outline-none border-b border-transparent hover:border-gray-300 focus:border-black text-[15px] font-medium bg-transparent cursor-pointer transition-colors ${
                      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "text-red-500" : "text-black"
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 text-[12px] font-medium text-gray-500 uppercase tracking-widest">Dự án</div>
                <div className="text-[15px] font-medium text-black">{task.projectName}</div>
              </div>
              
              <div>
                <div className="mb-2 text-[12px] font-medium text-gray-500 uppercase tracking-widest">Ngày tạo</div>
                <div className="flex items-center gap-2 text-[15px] font-medium text-black">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {formatDate(task.createdAt)}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#eaeaea]">
              <h3 className="mb-4 text-[12px] font-medium text-gray-500 uppercase tracking-widest">Tệp đính kèm</h3>
              
              <div className="flex flex-col gap-3">
                {task.attachments?.map((file: any) => (
                  <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-[#eaeaea] hover:bg-gray-50 transition-colors">
                    <Paperclip className="h-4 w-4 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-black truncate">{file.name}</p>
                      <p className="text-[11px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </a>
                ))}
                
                <label className={`flex flex-col items-center justify-center p-6 border border-dashed border-[#eaeaea] rounded-xl cursor-pointer hover:bg-gray-50 transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <UploadCloud className="h-5 w-5 text-gray-400 mb-2" />
                  <span className="text-[13px] font-medium text-black">{isUploading ? "Đang tải lên..." : "Tải lên tệp đính kèm"}</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading || isPending} />
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

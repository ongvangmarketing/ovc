"use client";

import { useState, useTransition } from "react";
import { X, MessageSquare, Send, CheckCircle2, XCircle, Calendar, Clock, AlertCircle } from "lucide-react";
import { addCustomerTaskComment, updateCustomerTaskStatus } from "./actions";
import { formatDate, statusClass, statusLabel } from "../utils";

export function TaskDetailModal({ task, currentUser, onClose }: { task: any, currentUser: any, onClose: () => void }) {
  const [commentText, setCommentText] = useState("");
  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="flex h-full max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="pr-6">
            <div className="mb-2 flex items-center gap-3">
              <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase ${statusClass(task.status)}`}>
                {statusLabel(task.status)}
              </span>
              <span className="text-sm font-medium text-slate-500">{task.projectName}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{task.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Info (Left) */}
          <div className="flex-1 overflow-y-auto border-r border-slate-100 p-6 custom-scrollbar">
            
            {/* Action Bar (Approval) */}
            {task.status === "IN_REVIEW" && (
              <div className="mb-8 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                <div className="flex items-center gap-2 text-blue-800">
                  <AlertCircle className="h-5 w-5" />
                  <h3 className="font-semibold text-blue-900">Nhiệm vụ đang chờ bạn duyệt</h3>
                </div>
                <p className="text-sm text-blue-700">Đội ngũ đã hoàn thành nhiệm vụ này và đang chờ xác nhận từ phía bạn để tiếp tục.</p>
                <div className="mt-2 flex items-center gap-3">
                  <button 
                    onClick={handleApprove}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Đồng ý duyệt (Hoàn tất)
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                    Yêu cầu sửa lại
                  </button>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="mb-3 text-lg font-bold text-slate-900">Mô tả công việc</h3>
              <div className="prose prose-sm prose-slate max-w-none rounded-xl border border-slate-100 bg-slate-50 p-5 text-slate-700">
                {task.description ? (
                  <div dangerouslySetInnerHTML={{ __html: task.description.replace(/\n/g, '<br/>') }} />
                ) : (
                  <p className="italic text-slate-400">Không có mô tả chi tiết.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                <MessageSquare className="h-5 w-5 text-slate-400" />
                Thảo luận ({task.comments?.length || 0})
              </h3>
              
              <div className="flex flex-col gap-4 mb-6">
                {task.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                      {comment.user.image ? (
                        <img src={comment.user.image} alt={comment.user.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-bold text-slate-500 uppercase">
                          {comment.user.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{comment.user.name}</span>
                        <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-slate-100 px-4 py-3 text-sm text-slate-700 shadow-sm">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {!task.comments?.length && (
                  <p className="text-sm text-slate-500 italic">Chưa có bình luận nào.</p>
                )}
              </div>

              {/* Add Comment */}
              <div className="flex items-start gap-4 border-t border-slate-100 pt-6">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-200">
                  {currentUser?.image ? (
                    <img src={currentUser.image} alt={currentUser.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-slate-500 uppercase">
                      {currentUser?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="relative flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Viết bình luận hoặc yêu cầu của bạn..."
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3 pr-12 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 custom-scrollbar"
                    rows={3}
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={isPending || !commentText.trim()}
                    className="absolute bottom-3 right-3 rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar Info (Right) */}
          <div className="w-[300px] shrink-0 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
            <h3 className="mb-4 text-sm font-bold text-slate-900 uppercase tracking-wider">Chi tiết</h3>
            
            <div className="flex flex-col gap-5">
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">Thời hạn (Deadline)</div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE" ? "text-red-600" : ""}>
                    {task.dueDate ? formatDate(task.dueDate) : "Không xác định"}
                  </span>
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">Dự án</div>
                <div className="text-sm font-semibold text-blue-600">{task.projectName}</div>
              </div>
              
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">Ngày tạo</div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {formatDate(task.createdAt)}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Save, Trash2, Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createContentPlan, updateContentPlan, deleteContentPlan } from "@/actions/content-calendar";
import { publicApproveContentPlan } from "@/modules/projects/actions/project.actions";

interface ContentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialData?: any;
  defaultDate?: Date | null;
  readOnly?: boolean;
  guestMode?: boolean;
  guestShareToken?: string;
}

export function ContentPlanModal({ isOpen, onClose, projectId, initialData, defaultDate, readOnly, guestMode, guestShareToken }: ContentPlanModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [channels, setChannels] = useState<string[]>(initialData?.channels || []);
  const [scheduledAt, setScheduledAt] = useState<string>(
    (initialData?.scheduledAt 
      ? new Date(initialData.scheduledAt).toISOString().split("T")[0] 
      : defaultDate 
        ? format(defaultDate, "yyyy-MM-dd") 
        : "") || ""
  );
  const [clientStatus, setClientStatus] = useState(initialData?.clientStatus || "DRAFT");
  
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState<"APPROVE" | "REJECT" | null>(null);

  const availableChannels = ["FACEBOOK", "BLOG", "EMAIL", "TIKTOK", "INSTAGRAM", "YOUTUBE"];

  useEffect(() => {
    const savedName = localStorage.getItem("guest_name");
    if (savedName) setGuestName(savedName);
  }, []);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        await updateContentPlan(initialData.id, { title, description, channels, scheduledAt, clientStatus });
      } else {
        await createContentPlan(projectId, { title, description, channels, scheduledAt });
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setIsSubmitting(true);
    try {
      await deleteContentPlan(initialData.id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToClient = async () => {
    if (!initialData?.id) return;
    setIsSubmitting(true);
    try {
      await updateContentPlan(initialData.id, { clientStatus: "PENDING" });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeGuestAction = async (name: string) => {
    if (!initialData?.id || !guestShareToken || !pendingAction) return;
    setIsSubmitting(true);
    try {
      const newStatus = pendingAction === "APPROVE" ? "APPROVED" : "REJECTED";
      await publicApproveContentPlan(guestShareToken, initialData.id, name, newStatus);
      localStorage.setItem("guest_name", name);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
      setShowGuestPrompt(false);
    }
  };

  const handleGuestAction = (action: "APPROVE" | "REJECT") => {
    setPendingAction(action);
    if (!guestName) {
      setShowGuestPrompt(true);
    } else {
      executeGuestAction(guestName);
    }
  };

  const toggleChannel = (channel: string) => {
    if (readOnly) return;
    setChannels(prev => prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-medium text-slate-800">
            {initialData ? "Chi tiết bài đăng" : "Tạo bài đăng mới"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {showGuestPrompt ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in slide-in-from-bottom-2">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-medium text-slate-800 mb-2">Vui lòng cho biết tên của bạn</h4>
              <p className="text-sm text-slate-500 mb-6">Để team biết ai là người đã phê duyệt bài viết này nhé!</p>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ví dụ: Anh Tú - CEO"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && guestName.trim()) {
                    executeGuestAction(guestName);
                  }
                }}
              />
              <div className="flex w-full gap-3">
                <button onClick={() => setShowGuestPrompt(false)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium">Hủy</button>
                <button 
                  onClick={() => executeGuestAction(guestName)} 
                  disabled={!guestName.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-700">Tên bài viết / Tiêu đề</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ví dụ: Bài đăng ra mắt tính năng mới..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  readOnly={readOnly}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-700">Nội dung nháp</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Nhập nội dung bài viết vào đây..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[120px] resize-y"
                  readOnly={readOnly}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-700">Ngày đăng dự kiến</label>
                <input
                  type="date"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  readOnly={readOnly}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-slate-700">Kênh đăng tải</label>
                <div className="flex flex-wrap gap-2">
                  {availableChannels.map(channel => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleChannel(channel)}
                      disabled={readOnly}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border",
                        channels.includes(channel) 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>

              {initialData && (
                <div className="flex flex-col gap-1.5 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Trạng thái Khách duyệt</span>
                  <div className="flex items-center gap-2">
                    {clientStatus === "DRAFT" && <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md text-[13px] font-medium">Bản nháp nội bộ</span>}
                    {clientStatus === "PENDING" && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-[13px] font-medium">Đang chờ khách duyệt</span>}
                    {clientStatus === "APPROVED" && <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[13px] font-medium">Khách đã duyệt</span>}
                    {clientStatus === "REJECTED" && <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-[13px] font-medium">Khách yêu cầu sửa</span>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!showGuestPrompt && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
            {guestMode ? (
              <div className="flex w-full gap-3">
                <button 
                  disabled={isSubmitting || clientStatus === "REJECTED"}
                  onClick={() => handleGuestAction("REJECT")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Yêu cầu sửa
                </button>
                <button 
                  disabled={isSubmitting || clientStatus === "APPROVED"}
                  onClick={() => handleGuestAction("APPROVE")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Duyệt bài này
                </button>
              </div>
            ) : (
              <>
                <div>
                  {initialData?.id && (
                    <button 
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa bài đăng"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  {initialData?.id && clientStatus === "DRAFT" && (
                    <button 
                      onClick={handleSendToClient}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      Gửi khách duyệt
                    </button>
                  )}
                  <button 
                    onClick={handleSave}
                    disabled={isSubmitting || !title.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    Lưu
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

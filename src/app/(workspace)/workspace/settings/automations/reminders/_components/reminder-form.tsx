"use client";

import { useState } from "react";
import { X, Save, Clock, Target, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ReminderFormProps = {
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
};

export function ReminderForm({ initialData, onClose, onSave }: ReminderFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      entity: "invoice",
      dateField: "dueDate",
      timingType: "before",
      timingValue: 3,
      channel: "email",
      message: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <>
      <div className="fixed inset-0 z-[998] bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[999] flex w-full max-w-md flex-col border-l border-[#eaeaea] bg-white shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-[#eaeaea] px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            {initialData ? "Chỉnh sửa Nhắc nhở" : "Tạo Nhắc nhở tự động"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="reminder-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Tên nhắc nhở */}
              <div>
                <label className="mb-2 block text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Tên nhắc nhở
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nhắc nợ trước hạn 3 ngày"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Đối tượng */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mb-4 flex items-center gap-2 text-[13px] font-semibold tracking-wider text-slate-500 uppercase">
                  <Target className="h-4 w-4" /> 1. Đối tượng áp dụng
                </div>
                <div className="grid gap-3">
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={formData.entity}
                    onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                  >
                    <option value="invoice">Hóa đơn (Invoice)</option>
                    <option value="contract">Hợp đồng (Contract)</option>
                    <option value="contact">Khách hàng (Contact)</option>
                  </select>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={formData.dateField}
                    onChange={(e) => setFormData({ ...formData, dateField: e.target.value })}
                  >
                    {formData.entity === "invoice" && <option value="dueDate">Ngày đến hạn thanh toán</option>}
                    {formData.entity === "contract" && <option value="endDate">Ngày kết thúc hợp đồng</option>}
                    {formData.entity === "contact" && <option value="birthday">Ngày sinh nhật</option>}
                  </select>
                </div>
              </div>

              {/* Thời điểm kích hoạt */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mb-4 flex items-center gap-2 text-[13px] font-semibold tracking-wider text-slate-500 uppercase">
                  <Clock className="h-4 w-4" /> 2. Thời điểm kích hoạt
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={formData.timingType}
                    onChange={(e) => setFormData({ ...formData, timingType: e.target.value })}
                  >
                    <option value="before">Trước</option>
                    <option value="on">Đúng ngày</option>
                    <option value="after">Sau</option>
                  </select>
                  {formData.timingType !== "on" && (
                    <>
                      <input
                        type="number"
                        min="1"
                        className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        value={formData.timingValue}
                        onChange={(e) => setFormData({ ...formData, timingValue: parseInt(e.target.value) || 1 })}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Ngày</span>
                    </>
                  )}
                </div>
                <p className="mt-3 text-[13px] text-slate-500">
                  <AlertCircle className="inline h-3.5 w-3.5 mr-1" />
                  Hệ thống sẽ chạy ngầm vào 08:00 AM mỗi ngày để kiểm tra điều kiện này.
                </p>
              </div>

              {/* Hành động */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mb-4 flex items-center gap-2 text-[13px] font-semibold tracking-wider text-slate-500 uppercase">
                  <MessageSquare className="h-4 w-4" /> 3. Hành động
                </div>
                <div className="space-y-4">
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  >
                    <option value="email">Gửi Email</option>
                    <option value="zalo">Gửi tin nhắn Zalo</option>
                    <option value="notification">Bắn Thông báo nội bộ</option>
                  </select>
                  <textarea
                    rows={4}
                    placeholder="Soạn nội dung mẫu (Hỗ trợ biến {{name}}, {{amount}}...)"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[#eaeaea] p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="reminder-form"
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
          >
            <Save className="h-4 w-4" /> {initialData ? "Lưu thay đổi" : "Tạo nhắc nhở"}
          </button>
        </div>
      </div>
    </>
  );
}

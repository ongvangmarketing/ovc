"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Bell, Clock, Edit2, Trash2, Power, Loader2 } from "lucide-react";
import { ReminderForm } from "./reminder-form";
import {
  getRemindersAction,
  createReminderAction,
  updateReminderAction,
  deleteReminderAction,
  toggleReminderStatusAction,
  seedDefaultRemindersAction,
} from "../_actions/reminders.actions";

export function RemindersClient() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setIsLoading(true);
    const res = await getRemindersAction();
    if (res.success && res.data) {
      // Map DB data to Frontend structure for simplicity
      const mapped = res.data.map((r: any) => ({
        id: r.id,
        name: r.name,
        entity: r.triggerSource,
        dateField: r.referenceField,
        timingType: r.timingType,
        timingValue: r.timingValue,
        channel: r.channels?.[0] || "email",
        message: r.templateConfig?.templateCode || r.templateConfig?.message || "",
        active: r.status === "ACTIVE",
      }));
      setReminders(mapped);
    }
    setIsLoading(false);
  };

  const handleCreate = () => {
    setEditingReminder(null);
    setIsFormOpen(true);
  };

  const handleEdit = (reminder: any) => {
    setEditingReminder(reminder);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa lịch nhắc nhở này?")) {
      startTransition(async () => {
        await deleteReminderAction(id);
        fetchReminders();
      });
    }
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    startTransition(async () => {
      await toggleReminderStatusAction(id, currentActive ? "ACTIVE" : "PAUSED");
      fetchReminders();
    });
  };

  const handleSave = async (data: any) => {
    setIsFormOpen(false);
    startTransition(async () => {
      if (editingReminder) {
        await updateReminderAction(editingReminder.id, data);
      } else {
        await createReminderAction(data);
      }
      fetchReminders();
    });
  };

  const translateEntity = (entity: string) => {
    switch (entity) {
      case "invoice":
        return "Hóa đơn";
      case "contract":
        return "Hợp đồng";
      case "contact":
        return "Khách hàng";
      default:
        return entity;
    }
  };

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
                Tự động hóa
              </span>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[13px] font-medium text-black transition hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Tạo nhắc nhở
            </button>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Nhắc nhở tự động,</span>{" "}
            <span className="text-gray-400">quản lý lịch trình công việc.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Cấu hình các kịch bản nhắc nhở tự động cho hóa đơn, hợp đồng và khách hàng qua email hoặc portal.
          </p>
        </div>

        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
          <div className="p-8">
            <h3 className="text-[20px] font-medium tracking-tight text-black mb-1">Chiến dịch nhắc nhở</h3>
            <p className="text-[14px] text-gray-500 mb-6">Các kịch bản tự động hóa đang hoạt động trên workspace.</p>

            <div className="overflow-x-auto rounded-lg border border-[#eaeaea]">
              <table className="w-full min-w-[800px] border-collapse bg-white text-left">
                <thead className="bg-gray-50 text-[12px] font-medium text-gray-500 border-b border-[#eaeaea]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Tên chiến dịch nhắc nhở</th>
                    <th className="px-4 py-3 font-medium">Điều kiện</th>
                    <th className="px-4 py-3 font-medium">Hành động</th>
                    <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                    <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeaea]">
                  {reminders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500 text-[14px]">
                        <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                        <p className="mb-4">Chưa có lịch nhắc nhở nào được tạo.</p>
                        <button
                          onClick={() => {
                            startTransition(async () => {
                              await seedDefaultRemindersAction();
                              fetchReminders();
                            });
                          }}
                          disabled={isPending}
                          className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          Khởi tạo 3 mẫu mặc định
                        </button>
                      </td>
                    </tr>
                  ) : (
                    reminders.map((reminder) => (
                      <tr key={reminder.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-4 py-4">
                          <p className="text-[14px] font-medium text-black">{reminder.name}</p>
                          <p className="text-[12px] text-gray-500 mt-1">Đối tượng: {translateEntity(reminder.entity)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full w-fit">
                            <Clock className="h-3.5 w-3.5" />
                            {reminder.timingType === "before" ? "Trước" : reminder.timingType === "after" ? "Sau" : "Đúng"}{" "}
                            {reminder.timingType !== "on" ? `${reminder.timingValue} ngày` : "ngày"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-[14px] text-gray-700">
                          <span className="capitalize">{reminder.channel}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleToggle(reminder.id, reminder.active)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors ${
                              reminder.active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" /> {reminder.active ? "Đang chạy" : "Tạm dừng"}
                          </button>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(reminder)}
                              className="rounded-md border border-[#eaeaea] bg-white p-2 text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                              title="Sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(reminder.id)}
                              className="rounded-md border border-[#eaeaea] bg-white p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {isFormOpen && (
          <ReminderForm
            initialData={editingReminder}
            onClose={() => setIsFormOpen(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
}

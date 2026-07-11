"use client";

import { useState, useTransition } from "react";
import { markAsReadAction, markAllAsReadAction, deleteNotificationsAction } from "@/modules/core/actions/notification.actions";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";
import { Notification } from "@prisma/client";

export function NotificationsClient({ initialData }: { initialData: Notification[] }) {
  const [notifications, setNotifications] = useState(initialData);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [pending, startTransition] = useTransition();

  const displayedNotifications = notifications.filter(n => filter === "ALL" || !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    startTransition(async () => {
      try {
        await markAllAsReadAction();
        setNotifications(notifications.map(n => ({ ...n, read: true, readAt: new Date() })));
        toast.success("Đã đánh dấu tất cả là đã đọc");
      } catch (error) {
        toast.error("Có lỗi xảy ra");
      }
    });
  };

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      try {
        await markAsReadAction([id]);
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true, readAt: new Date() } : n));
      } catch (error) {
        toast.error("Có lỗi xảy ra");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteNotificationsAction([id]);
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success("Đã xóa thông báo");
      } catch (error) {
        toast.error("Có lỗi xảy ra");
      }
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-[#eaeaea] p-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilter("ALL")}
            className={`text-sm font-medium transition-colors ${filter === "ALL" ? "text-black" : "text-slate-500 hover:text-slate-900"}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${filter === "UNREAD" ? "text-black" : "text-slate-500 hover:text-slate-900"}`}
          >
            Chưa đọc
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[11px] text-blue-600">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>

      <div className="divide-y divide-[#eaeaea]">
        {displayedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Bell className="mb-3 h-12 w-12 text-slate-200" />
            <p className="text-sm">Không có thông báo nào</p>
          </div>
        ) : (
          displayedNotifications.map((notification) => (
            <div key={notification.id} className={`group relative flex gap-4 p-4 transition-colors sm:px-6 ${!notification.read ? "bg-blue-50/30" : "hover:bg-slate-50"}`}>
              {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
              
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Bell className="h-5 w-5" />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`text-[15px] ${!notification.read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
                      {notification.title}
                    </h3>
                    {notification.body && (
                      <p className="mt-1 text-[14px] text-slate-500 line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[12px] text-slate-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                      </span>
                      {notification.link && (
                        <Link href={notification.link} className="text-[12px] font-medium text-blue-600 hover:underline">
                          Xem chi tiết
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        disabled={pending}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      disabled={pending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

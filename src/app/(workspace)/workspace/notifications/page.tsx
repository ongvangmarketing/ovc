import { requireAuth } from "@/lib/auth/require-auth";
import { NotificationService } from "@/modules/core/services/notification.service";
import { NotificationsClient } from "./notifications-client";

export const metadata = {
  title: "Thông báo | OVC Workspace",
};

export default async function NotificationsPage() {
  const session = await requireAuth();
  
  // Fetch initial notifications
  const initialNotifications = await NotificationService.getUserNotifications(session.user.id, {}, { skip: 0, take: 50 });

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col bg-[#fafafa]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#eaeaea] bg-white px-6 sm:h-16">
        <h1 className="text-xl font-semibold text-slate-900">Thông báo của bạn</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#eaeaea] bg-white shadow-sm">
          <NotificationsClient initialData={initialNotifications} />
        </div>
      </div>
    </div>
  );
}

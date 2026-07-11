export default function NotificationsPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý và cấu hình các mẫu thông báo đẩy tự động.</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="text-center text-slate-500">
          <p>Trang Notifications đang được xây dựng...</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Bell, Folder, Link2, PanelLeftClose, PanelLeftOpen, Plus, Search, User as UserIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";


const PAGE_TITLES: Record<string, string> = {
  "/workspace/dashboard": "Dashboard",
  "/workspace/crm": "CRM",
  "/workspace/crm/contacts": "Khách hàng",
  "/workspace/crm/companies": "Công ty",
  "/workspace/crm/deals": "Cơ hội",
  "/workspace/projects": "Dự án",
  "/workspace/finance": "Tài chính",
  "/workspace/finance/quotations": "Báo giá",
  "/workspace/finance/contracts": "Hợp đồng",
  "/workspace/finance/invoices": "Hóa đơn",
  "/workspace/finance/payments": "Thanh toán",
  "/workspace/finance/reports": "Báo cáo tài chính",
  "/workspace/courses": "Khóa học",
  "/workspace/marketing": "Marketing",
  "/workspace/cms": "CMS",
  "/workspace/files": "Tệp tin",
  "/workspace/reports": "Báo cáo",
  "/workspace/settings": "Cài đặt",
};

export function Topbar({
  children,
  sidebarCollapsed = false,
  onToggleSidebar,
}: {
  children?: React.ReactNode;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(`${path}/`))?.[1] ??
    "Workspace";

  return (
    <header className="relative z-[200] flex h-16 flex-shrink-0 items-center gap-4 border-b border-slate-100 bg-white px-6">
      <div className="flex items-center gap-3 text-[15px]">
        {onToggleSidebar ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-500 shadow-sm transition hover:bg-orange-50 hover:text-orange-600"
            title={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
            aria-label={sidebarCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        ) : null}
        <button onClick={() => router.back()} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
          ←
        </button>
        <span className="hidden text-slate-300 md:inline">›</span>
        <h1 className="font-semibold text-slate-900">
          {title}
        </h1>
        {children}
      </div>

      <div className="mx-auto hidden flex-1 max-w-sm md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="h-9 w-full rounded-lg border border-slate-100 bg-slate-50 pl-9 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
            readOnly
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 border-slate-100 bg-white text-[10px]">⌘F</kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="hidden h-9 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 2xl:flex">
          <Folder className="h-4 w-4" />
          <span>Manage</span>
        </button>
        <button className="hidden h-9 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 2xl:flex">
          <Link2 className="h-4 w-4" />
          <span>Share</span>
        </button>
        <button className="flex h-9 min-w-[92px] items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-[15px] font-semibold text-white shadow-sm hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          <span className="whitespace-nowrap">Tạo mới</span>
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50">
          <Bell className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2 pl-2">
          {!isPending && session?.user ? (
            <div className="flex items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                  {session.user.image ? (
                    <img src={session.user.image} alt="Avatar" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold">
                      {session.user.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                    </span>
                  )}
                </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          )}
        </div>
      </div>

    </header>
  );
}

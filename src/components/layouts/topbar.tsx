"use client";

import { Bell, ChevronDown, FileCheck2, FileText, Folder, FolderKanban, Link2, PanelLeftClose, PanelLeftOpen, Plus, ReceiptText, Search, Settings, User as UserIcon, UserPlus, WalletCards } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";


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

const QUICK_CREATE_ITEMS = [
  { label: "Khách hàng", description: "Thêm liên hệ CRM", href: "/workspace/crm/contacts/create", icon: UserPlus, tone: "bg-blue-50 text-blue-600" },
  { label: "Dự án", description: "Khởi tạo dự án mới", href: "/workspace/projects?create=1", icon: FolderKanban, tone: "bg-violet-50 text-violet-600" },
  { label: "Báo giá", description: "Lập báo giá khách hàng", href: "/workspace/finance/quotations/create", icon: FileText, tone: "bg-amber-50 text-amber-600" },
  { label: "Hợp đồng", description: "Soạn hợp đồng mới", href: "/workspace/finance/contracts/create", icon: FileCheck2, tone: "bg-emerald-50 text-emerald-600" },
  { label: "Hóa đơn", description: "Phát hành hóa đơn", href: "/workspace/finance/invoices/create", icon: ReceiptText, tone: "bg-rose-50 text-rose-600" },
  { label: "Thanh toán", description: "Ghi nhận khoản thu", href: "/workspace/finance/payments/create", icon: WalletCards, tone: "bg-cyan-50 text-cyan-600" },
] as const;

export function Topbar({
  children,
  sidebarCollapsed = false,
  mobileSidebarOpen = false,
  onToggleSidebar,
}: {
  children?: React.ReactNode;
  sidebarCollapsed?: boolean;
  mobileSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenusOnOutsidePress(event: PointerEvent) {
      const target = event.target as Node;

      if (createMenuOpen && !createMenuRef.current?.contains(target)) {
        setCreateMenuOpen(false);
      }

      if (profileMenuOpen && !profileMenuRef.current?.contains(target)) {
        setProfileMenuOpen(false);
      }
    }

    function closeMenusOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCreateMenuOpen(false);
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenusOnOutsidePress);
    document.addEventListener("keydown", closeMenusOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeMenusOnOutsidePress);
      document.removeEventListener("keydown", closeMenusOnEscape);
    };
  }, [createMenuOpen, profileMenuOpen]);

  useEffect(() => {
    setCreateMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);
  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(`${path}/`))?.[1] ??
    "Workspace";

  return (
    <header className="relative z-[200] flex h-16 flex-shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-3 sm:gap-4 sm:px-6">
      <div className="relative flex min-w-0 items-center gap-2 text-[15px] sm:gap-3">
        {onToggleSidebar ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-500 shadow-sm transition hover:bg-orange-50 hover:text-orange-600"
            title="Mở menu"
            aria-label="Mở menu"
          >
            <span className="lg:hidden">{mobileSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}</span>
            <span className="hidden lg:inline">{sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</span>
          </button>
        ) : null}
        <button onClick={() => router.back()} className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 sm:flex">
          ←
        </button>
        <span className="hidden text-slate-300 md:inline">›</span>
        <Link
          href="/workspace"
          aria-label="Về trang chủ"
          title="Về trang chủ"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          <Image src="/brand/ong-vang-logo.svg" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
        </Link>
        <h1 className="truncate font-semibold text-slate-900">
          {title}
        </h1>
        <div className="hidden sm:block">{children}</div>
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

      <div className="relative ml-auto flex items-center gap-2">
        <button className="hidden h-9 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 2xl:flex">
          <Folder className="h-4 w-4" />
          <span>Manage</span>
        </button>
        <button className="hidden h-9 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 2xl:flex">
          <Link2 className="h-4 w-4" />
          <span>Share</span>
        </button>
        <div ref={createMenuRef} className="relative">
          <button
            type="button"
            aria-label="Tạo mới"
            aria-haspopup="menu"
            aria-expanded={createMenuOpen}
            onClick={() => {
              setCreateMenuOpen((current) => !current);
              setProfileMenuOpen(false);
            }}
            className="flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-[15px] font-semibold text-white shadow-sm hover:bg-slate-800 sm:min-w-[112px] sm:px-4"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden whitespace-nowrap sm:inline">Tạo mới</span>
            <ChevronDown className="hidden h-3.5 w-3.5 sm:block" />
          </button>
          {createMenuOpen ? (
            <div role="menu" className="absolute right-0 top-12 z-[400] w-[min(340px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
            <div className="px-3 pb-2 pt-1">
              <p className="text-sm font-semibold text-slate-900">Tạo mới</p>
              <p className="text-xs text-slate-500">Chọn nội dung bạn muốn tạo</p>
            </div>
            <div className="grid gap-1 sm:grid-cols-2">
              {QUICK_CREATE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setCreateMenuOpen(false);
                      router.push(item.href);
                    }}
                    className="flex min-w-0 items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-slate-50"
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone}`}><Icon className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <strong className="block text-sm font-semibold text-slate-900">{item.label}</strong>
                      <small className="block truncate text-[11px] text-slate-500">{item.description}</small>
                    </span>
                  </button>
                );
              })}
            </div>
            </div>
          ) : null}
        </div>
        <div ref={profileMenuRef} className="relative sm:hidden">
          <button
            type="button"
            aria-label="Menu tài khoản"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onClick={() => {
              setProfileMenuOpen((current) => !current);
              setCreateMenuOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white shadow-sm ring-2 ring-white"
          >
            {session?.user?.image ? (
              <img src={session.user.image} alt="Ảnh đại diện" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold">{session?.user?.name?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}</span>
            )}
          </button>
          {profileMenuOpen ? (
            <div role="menu" className="absolute right-0 top-12 z-[450] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
              <div className="border-b border-slate-100 px-3 pb-3 pt-1">
                <p className="truncate text-sm font-semibold text-slate-900">{session?.user?.name || "Tài khoản"}</p>
                <p className="truncate text-xs text-slate-500">{session?.user?.email || ""}</p>
              </div>
              <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); router.push("/workspace/settings?tab=security"); }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <UserIcon className="h-4 w-4 text-slate-500" /> Tài khoản & bảo mật
              </button>
              <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); router.push("/workspace/settings"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Settings className="h-4 w-4 text-slate-500" /> Cài đặt
              </button>
              <LogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50" />
            </div>
          ) : null}
        </div>
        <button className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 sm:flex">
          <Bell className="w-4 h-4" />
        </button>
        
        <div className="hidden items-center gap-2 pl-2 sm:flex">
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

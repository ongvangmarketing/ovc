"use client";

import { Bell, ChevronDown, FileCheck2, FileText, Folder, FolderKanban, Link2, PanelLeftClose, PanelLeftOpen, Plus, ReceiptText, Search, Settings, ShieldAlert, User as UserIcon, UserPlus, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { getUnreadNotifications, markNotificationsRead } from "@/app/actions/notifications";


const PAGE_TITLES: Record<string, string> = {
  "/workspace": "Trang chủ",
  "/workspace/dashboard": "Điều hành",
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
  "/workspace/training": "Đào tạo",
  "/workspace/training/students": "Học viên",
  "/workspace/training/potential-students": "Học viên tiềm năng",
  "/workspace/training/classes": "Lớp học",
  "/workspace/training/instructors": "Giảng viên",
  "/workspace/training/calendar": "Lịch học",
  "/workspace/training/tuition": "Học phí",
  "/workspace/training/certificates": "Chứng chỉ",
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

const SEARCH_NAV_ITEMS = [
  { label: "Trang chủ", description: "Mở workspace", href: "/workspace" },
  { label: "Điều hành", description: "Tổng quan hoạt động", href: "/workspace/dashboard" },
  { label: "Trung tâm Lead", description: "Tổng quan, danh sách Lead, trình tạo Form, Webhooks", href: "/workspace/leads/dashboard" },
  { label: "Danh sách Lead", description: "Danh sách khách hàng tiềm năng", href: "/workspace/leads" },
  { label: "CRM", description: "Khách hàng, công ty, cơ hội", href: "/workspace/crm" },
  { label: "Khách hàng", description: "Danh bạ CRM", href: "/workspace/crm/contacts" },
  { label: "Công ty", description: "Doanh nghiệp, đối tác", href: "/workspace/crm/companies" },
  { label: "Cơ hội", description: "Pipeline bán hàng", href: "/workspace/crm/deals" },
  { label: "Dự án", description: "Danh sách dự án", href: "/workspace/projects" },
  { label: "Công việc", description: "Tasks và tiến độ", href: "/workspace/tasks" },
  { label: "Tài chính", description: "Báo giá, hợp đồng, hóa đơn, thanh toán", href: "/workspace/finance/invoices" },
  { label: "Báo giá", description: "Danh sách báo giá", href: "/workspace/finance/quotations" },
  { label: "Hợp đồng", description: "Danh sách hợp đồng", href: "/workspace/finance/contracts" },
  { label: "Hóa đơn", description: "Danh sách hóa đơn", href: "/workspace/finance/invoices" },
  { label: "Thanh toán", description: "Theo dõi khoản thu", href: "/workspace/finance/payments" },
  { label: "Dịch vụ", description: "Services Catalog", href: "/workspace/services" },
  { label: "Đào tạo", description: "Học viên, khóa học, lớp học", href: "/workspace/training" },
  { label: "Social Marketing", description: "Báo cáo và kết nối mạng xã hội", href: "/workspace/social-marketing" },
  { label: "Cài đặt", description: "Thiết lập workspace", href: "/workspace/settings/organization" },
] as const;

type WorkspaceUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

type TopbarNotification = {
  id: string;
  title: string;
  body?: string | null;
  link?: string | null;
  createdAt: string;
  type: string;
};

function compactBrandName(name: string) {
  return name
    .replace(/^\s*công\s+ty\s+/i, "")
    .replace(/^\s*(tnhh|trách\s+nhiệm\s+hữu\s+hạn|cổ\s+phần|cp|mtv|một\s+thành\s+viên)\s+/i, "")
    .trim() || name;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function Topbar({
  children,
  brand,
  currentUser,
  sidebarCollapsed = false,
  mobileSidebarOpen = false,
  onToggleSidebar,
}: {
  children?: React.ReactNode;
  brand?: { name?: string | null; logo?: string | null };
  currentUser?: WorkspaceUser;
  sidebarCollapsed?: boolean;
  mobileSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<TopbarNotification[]>([]);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationIdsRef = useRef<Set<string>>(new Set());
  const notificationLoadedRef = useRef(false);
  const brandLogo = brand?.logo || "/brand/ong-vang-logo.svg";
  const brandName = compactBrandName(brand?.name || "Workspace");
  const sessionUser = session?.user
    ? ({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: "role" in session.user ? String(session.user.role) : currentUser?.role,
      } satisfies WorkspaceUser)
    : undefined;
  const user = sessionUser ?? currentUser;

  useEffect(() => {
    function closeMenusOnOutsidePress(event: PointerEvent) {
      const target = event.target as Node;

      if (createMenuOpen && !createMenuRef.current?.contains(target)) {
        setCreateMenuOpen(false);
      }

      if (profileMenuOpen && !profileMenuRef.current?.contains(target)) {
        setProfileMenuOpen(false);
      }

      if (searchOpen && !searchRef.current?.contains(target)) {
        setSearchOpen(false);
      }

      if (notificationOpen && !notificationRef.current?.contains(target)) {
        setNotificationOpen(false);
      }
    }

    function closeMenusOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCreateMenuOpen(false);
        setProfileMenuOpen(false);
        setSearchOpen(false);
        setNotificationOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenusOnOutsidePress);
    document.addEventListener("keydown", closeMenusOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeMenusOnOutsidePress);
      document.removeEventListener("keydown", closeMenusOnEscape);
    };
  }, [createMenuOpen, profileMenuOpen, searchOpen, notificationOpen]);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      try {
        const nextNotifications = await getUnreadNotifications();
        if (!mounted) return;

        const nextIds = new Set(nextNotifications.map((notification) => notification.id));
        const hasNewNotification =
          notificationLoadedRef.current &&
          nextNotifications.some((notification) => !notificationIdsRef.current.has(notification.id));

        notificationIdsRef.current = nextIds;
        notificationLoadedRef.current = true;
        setNotifications(nextNotifications);

        if (hasNewNotification && nextNotifications.length) {
          setNotificationOpen(true);
          setCreateMenuOpen(false);
          setProfileMenuOpen(false);
          setSearchOpen(false);
        }
      } catch {
        if (mounted) setNotifications([]);
      }
    }

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 15000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const normalizedSearchQuery = normalizeSearchText(searchQuery.trim());
  const searchResults = useMemo(() => {
    if (!normalizedSearchQuery) return SEARCH_NAV_ITEMS.slice(0, 8);

    return SEARCH_NAV_ITEMS.filter((item) => {
      const haystack = normalizeSearchText(`${item.label} ${item.description} ${item.href}`);
      return haystack.includes(normalizedSearchQuery);
    }).slice(0, 8);
  }, [normalizedSearchQuery]);
  const createResults = useMemo(() => {
    if (!normalizedSearchQuery) return QUICK_CREATE_ITEMS.slice(0, 4);

    return QUICK_CREATE_ITEMS.filter((item) => {
      const haystack = normalizeSearchText(`${item.label} ${item.description} ${item.href}`);
      return haystack.includes(normalizedSearchQuery);
    }).slice(0, 4);
  }, [normalizedSearchQuery]);

  const navigateFromSearch = (href: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  const openNotification = async (notification: TopbarNotification) => {
    await markNotificationsRead([notification.id]);
    setNotifications((current) => current.filter((item) => item.id !== notification.id));
    setNotificationOpen(false);
    if (notification.link) router.push(notification.link);
  };

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
          <img src={brandLogo} alt={brandName} className="h-6 w-6 object-contain" />
        </Link>
        <h1 className="truncate font-semibold text-slate-900">
          {title}
        </h1>
        <div className="hidden sm:block">{children}</div>
      </div>

      <div className="mx-auto hidden flex-1 max-w-sm md:block" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search everything"
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const firstResult = searchResults[0] ?? createResults[0];
                if (firstResult) navigateFromSearch(firstResult.href);
              }
            }}
            className="h-9 w-full rounded-lg border border-slate-100 bg-slate-50 pl-9 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 border-slate-100 bg-white text-[10px]">⌘F</kbd>
          {searchOpen ? (
            <div className="absolute left-0 right-0 top-11 z-[430] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
              <div className="px-2 pb-1 text-[11px] font-semibold uppercase text-slate-400">Đi tới</div>
              <div className="space-y-1">
                {searchResults.map((result) => (
                  <button
                    key={result.href}
                    type="button"
                    onClick={() => navigateFromSearch(result.href)}
                    className="flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                  >
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-semibold text-slate-900">{result.label}</strong>
                      <small className="block truncate text-xs text-slate-500">{result.description}</small>
                    </span>
                  </button>
                ))}
                {!searchResults.length ? <div className="px-3 py-2 text-sm text-slate-500">Không tìm thấy trang phù hợp.</div> : null}
              </div>

              {createResults.length ? (
                <>
                  <div className="mt-2 border-t border-slate-100 px-2 pb-1 pt-2 text-[11px] font-semibold uppercase text-slate-400">Tạo nhanh</div>
                  <div className="grid gap-1">
                    {createResults.map((result) => {
                      const Icon = result.icon;
                      return (
                        <button
                          key={result.href}
                          type="button"
                          onClick={() => navigateFromSearch(result.href)}
                          className="flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${result.tone}`}><Icon className="h-4 w-4" /></span>
                          <span className="min-w-0 flex-1">
                            <strong className="block truncate text-sm font-semibold text-slate-900">Tạo {result.label}</strong>
                            <small className="block truncate text-xs text-slate-500">{result.description}</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
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
        <div ref={notificationRef} className="relative hidden sm:block">
          <button
            type="button"
            aria-label="Thông báo"
            onClick={() => {
              setNotificationOpen((current) => !current);
              setCreateMenuOpen(false);
              setProfileMenuOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
          >
            <Bell className="w-4 h-4" />
            {notifications.length ? (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            ) : null}
          </button>
          {notificationOpen ? (
            <div className="absolute right-0 top-12 z-[460] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
              <div className="flex items-center justify-between px-3 pb-2 pt-1">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Thông báo</p>
                  <p className="text-xs text-slate-500">{notifications.length ? `${notifications.length} thông báo mới` : "Chưa có thông báo mới"}</p>
                </div>
                {notifications.length ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const ids = notifications.map((item) => item.id);
                      await markNotificationsRead(ids);
                      setNotifications([]);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Đã đọc
                  </button>
                ) : null}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className="flex w-full gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                  >
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                    <span className="min-w-0">
                      <strong className="block text-sm font-semibold text-slate-900">{notification.title}</strong>
                      {notification.body ? <small className="mt-0.5 block line-clamp-2 text-xs leading-5 text-slate-500">{notification.body}</small> : null}
                    </span>
                  </button>
                ))}
                {!notifications.length ? <div className="px-3 py-6 text-center text-sm text-slate-500">Không có thông báo mới.</div> : null}
              </div>
            </div>
          ) : null}
        </div>
        <div ref={profileMenuRef} className="relative">
          <button
            type="button"
            aria-label="Menu tài khoản"
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            onClick={() => {
              setProfileMenuOpen((current) => !current);
              setCreateMenuOpen(false);
            }}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white shadow-sm ring-2 ring-white sm:hidden"
          >
            {user?.image ? (
              <img src={user.image} alt="Ảnh đại diện" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-bold">{user?.name?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}</span>
            )}
          </button>
          {user ? (
            <button
              type="button"
              aria-label="Menu tài khoản"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              onClick={() => {
                setProfileMenuOpen((current) => !current);
                setCreateMenuOpen(false);
              }}
              className="hidden h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white shadow-sm ring-2 ring-white transition hover:ring-blue-100 sm:flex"
            >
              {user.image ? (
                <img src={user.image} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-semibold">
                  {user.name?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
                </span>
              )}
            </button>
          ) : (
            <div className="hidden h-9 w-9 rounded-full bg-muted animate-pulse sm:block" />
          )}
          {profileMenuOpen ? (
            <div role="menu" className="absolute right-0 top-12 z-[450] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
              <div className="border-b border-slate-100 px-3 pb-3 pt-1">
                <p className="truncate text-sm font-semibold text-slate-900">{user?.name || "Tài khoản"}</p>
                <p className="truncate text-xs text-slate-500">{user?.email || ""}</p>
              </div>
              <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); router.push("/workspace/settings?tab=security"); }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <UserIcon className="h-4 w-4 text-slate-500" /> Tài khoản & bảo mật
              </button>
              <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); router.push("/workspace/settings"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Settings className="h-4 w-4 text-slate-500" /> Cài đặt
              </button>
              {(user?.role === "SUPER_ADMIN" || user?.email === "admin@ongvang.com" || user?.email === "info@ovc.vn") && (
                <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); router.push("/admin"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-purple-700 hover:bg-purple-50 border-t border-slate-100 rounded-t-none">
                  <ShieldAlert className="h-4 w-4 text-purple-600" /> Super Admin
                </button>
              )}
              <LogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50" />
            </div>
          ) : null}
        </div>
      </div>

    </header>
  );
}

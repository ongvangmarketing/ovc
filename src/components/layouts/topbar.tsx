"use client";

import { Bell, ChevronDown, ChevronLeft, ChevronRight, FileCheck2, FileText, Folder, FolderKanban, Grid3x3, Home, Inbox, LayoutDashboard, Link2, MessageSquare, ReceiptText, Search, Settings, ShieldAlert, User as UserIcon, UserPlus, WalletCards, X } from "lucide-react";
import { getPusherClient } from "@/lib/pusher";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { getUnreadNotifications, markNotificationsRead } from "@/actions/notifications";
import { moduleDefinitions, ModuleNavItem, type PlatformModuleCode } from "@/lib/modules/registry";
import { cn } from "@/lib/utils/cn";
import type { AppLauncherPreferences } from "@/modules/core/types/app-launcher.types";

const QUICK_CREATE_ITEMS = [
  { label: "Khách hàng", description: "Thêm liên hệ CRM", href: "/crm/contacts/create", icon: UserPlus, tone: "bg-blue-50 text-blue-600" },
  { label: "Dự án", description: "Khởi tạo dự án mới", href: "/projects?create=1", icon: FolderKanban, tone: "bg-violet-50 text-violet-600" },
  { label: "Báo giá", description: "Lập báo giá khách hàng", href: "/finance/quotations/create", icon: FileText, tone: "bg-amber-50 text-amber-600" },
  { label: "Hợp đồng", description: "Soạn hợp đồng mới", href: "/finance/contracts/create", icon: FileCheck2, tone: "bg-emerald-50 text-emerald-600" },
  { label: "Hóa đơn", description: "Phát hành hóa đơn", href: "/finance/invoices/create", icon: ReceiptText, tone: "bg-rose-50 text-rose-600" },
  { label: "Thanh toán", description: "Ghi nhận khoản thu", href: "/finance/payments/create", icon: WalletCards, tone: "bg-cyan-50 text-cyan-600" },
] as const;

const SEARCH_NAV_ITEMS = [
  { label: "Trang chủ", description: "Mở workspace", href: "/workspace" },
  { label: "Dashboard", description: "Tổng quan hoạt động", href: "/dashboard" },
  { label: "Lead Center", description: "Tổng quan, danh sách Lead, trình tạo Form, Webhooks", href: "/leads/dashboard" },
  { label: "Danh sách Lead", description: "Danh sách khách hàng tiềm năng", href: "/leads" },
  { label: "CRM", description: "Khách hàng, công ty, cơ hội", href: "/crm" },
  { label: "Khách hàng", description: "Danh bạ CRM", href: "/crm/contacts" },
  { label: "Công ty", description: "Doanh nghiệp, đối tác", href: "/crm/companies" },
  { label: "Cơ hội", description: "Pipeline bán hàng", href: "/crm/deals" },
  { label: "Dự án", description: "Danh sách dự án", href: "/projects" },
  { label: "Công việc", description: "Tasks và tiến độ", href: "/tasks" },
  { label: "Tài chính", description: "Báo giá, hợp đồng, hóa đơn, thanh toán", href: "/finance/invoices" },
  { label: "Báo giá", description: "Danh sách báo giá", href: "/finance/quotations" },
  { label: "Hợp đồng", description: "Danh sách hợp đồng", href: "/finance/contracts" },
  { label: "Hóa đơn", description: "Danh sách hóa đơn", href: "/finance/invoices" },
  { label: "Thanh toán", description: "Theo dõi khoản thu", href: "/finance/payments" },
  { label: "Dịch vụ", description: "Services Catalog", href: "/services" },
  { label: "Đào tạo", description: "Học viên, khóa học, lớp học", href: "/training" },
  { label: "Social Marketing", description: "Báo cáo và kết nối mạng xã hội", href: "/social-marketing" },
  { label: "Cài đặt", description: "Thiết lập workspace", href: "/settings/organization" },
] as const;

type WorkspaceUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  organizationId?: string | null;
};

type TopbarNotification = {
  id: string;
  title: string;
  body?: string | null;
  link?: string | null;
  createdAt: string;
  type: string;
};

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

function isActive(pathname: string, href: string) {
  const normalizedPathname = pathname.startsWith("/workspace") 
    ? pathname 
    : `/workspace${pathname === "/" ? "" : pathname}`;

  if (href === "/workspace") return normalizedPathname === "/workspace";
  return normalizedPathname === href || normalizedPathname.startsWith(`${href}/`);
}

export function Topbar({
  children,
  brand,
  currentUser,
  enabledModuleCodes,
  launcherPreferences,
  onToggleSidebar,
}: {
  children?: React.ReactNode;
  brand?: { name?: string | null; logo?: string | null };
  currentUser?: WorkspaceUser;
  sidebarCollapsed?: boolean;
  mobileSidebarOpen?: boolean;
  enabledModuleCodes?: PlatformModuleCode[];
  launcherPreferences?: AppLauncherPreferences;
  onToggleSidebar?: () => void;
}) {
  const organizationId = currentUser?.organizationId ?? null;
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileAppMenuOpen, setMobileAppMenuOpen] = useState(false);
  const [mobileModuleMenuOpen, setMobileModuleMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<TopbarNotification[]>([]);
  // Chat inbox state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState<{ conversationId: string; senderName: string; content: string; time: number }[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const activeChatRef = useRef<string | null>(null);
  const mobileAppMenuRef = useRef<HTMLDivElement>(null);
  const mobileModuleMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationIdsRef = useRef<Set<string>>(new Set());
  const notificationLoadedRef = useRef(false);

  // Track active chat conversationId from URL
  useEffect(() => {
    const match = pathname.match(/\/chat\/([^/]+)/);
    activeChatRef.current = match?.[1] ?? null;
    if (match?.[1]) {
      setChatUnread((prev) => prev.filter((m) => m.conversationId !== match[1]));
    }
  }, [pathname]);
  const sessionUser = session?.user
    ? ({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: "role" in session.user ? String(session.user.role) : currentUser?.role,
      } satisfies WorkspaceUser)
    : undefined;
  const user = sessionUser ?? currentUser;

  const normalizedPathname = pathname.startsWith("/workspace") 
    ? pathname 
    : `/workspace${pathname === "/" ? "" : pathname}`;

  const isAppLauncher = normalizedPathname === "/workspace";
  const isWorkspaceDashboard = normalizedPathname === "/workspace/dashboard" || pathname === "/myworks" || pathname === "/";

  const moduleItems = useMemo(() => {
    const enabledModules = enabledModuleCodes ? new Set(enabledModuleCodes) : null;
    return moduleDefinitions
      .filter((module) => !enabledModules || enabledModules.has(module.code))
      .map((module) => module.nav)
      .filter(Boolean) as ModuleNavItem[];
  }, [enabledModuleCodes]);
  const mobileLauncherItems = useMemo(() => {
    const items = [
      { code: "DASHBOARD" as PlatformModuleCode, label: "Dashboard", href: "/workspace/dashboard", icon: <LayoutDashboard className="h-7 w-7 stroke-[1.5]" /> },
      ...moduleItems.filter((item) => item.code !== "DASHBOARD"),
    ];
    const itemByCode = new Map(items.map((item) => [item.code, item]));
    const orderedCodes = [
      ...(launcherPreferences?.order ?? []).filter((code) => itemByCode.has(code as PlatformModuleCode)),
      ...items.map((item) => item.code).filter((code) => !(launcherPreferences?.order ?? []).includes(code)),
    ];
    const hidden = new Set(launcherPreferences?.hidden ?? []);
    return orderedCodes.flatMap((code) => {
      const item = itemByCode.get(code as PlatformModuleCode);
      return item && !hidden.has(item.code) ? [item] : [];
    });
  }, [moduleItems, launcherPreferences]);

  const activeModule = useMemo(() => {
    if (isAppLauncher) return null;
    const sortedModules = [...moduleItems].sort((a, b) => b.href.length - a.href.length);
    return (
      sortedModules.find((item) =>
        isActive(pathname, item.href) ||
        item.children?.some((child) => child.href ? isActive(pathname, child.href) : false)
      ) || null
    );
  }, [pathname, moduleItems, isAppLauncher]);

  const getIconBg = (code: string | undefined) => {
    if (!code) return "border border-[#eaeaea] bg-gray-100 text-gray-900";
    const colors: Record<string, string> = {
      "WORKSPACE": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "CRM": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "FINANCE": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "MARKETING": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "SOCIAL_MARKETING": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "EDUCATION": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "PROJECTS": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "LEAD_CENTER": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "WEBSITE": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "SERVICES": "border border-[#eaeaea] bg-gray-100 text-gray-900",
      "TRAVELING": "border border-[#eaeaea] bg-gray-100 text-gray-900",
    };
    return colors[code] || "border border-[#eaeaea] bg-gray-100 text-gray-900";
  };

  const getChildMenuIcon = (item: NonNullable<ModuleNavItem["children"]>[number]) => {
    const href = item.href || "";
    const label = item.label.toLowerCase();
    if (href.includes("/dashboard") || label.includes("tổng quan")) return <LayoutDashboard className="h-4 w-4" />;
    if (href.includes("/documents") || label.includes("văn bản") || label.includes("form")) return <FileText className="h-4 w-4" />;
    if (href.includes("/approvals") || label.includes("phê duyệt")) return <FileCheck2 className="h-4 w-4" />;
    if (href.includes("/requests") || label.includes("yêu cầu")) return <MessageSquare className="h-4 w-4" />;
    if (href.includes("/signatures") || label.includes("ký số")) return <ReceiptText className="h-4 w-4" />;
    if (href.includes("/webhooks")) return <Link2 className="h-4 w-4" />;
    if (href.includes("/sources") || label.includes("nguồn")) return <Folder className="h-4 w-4" />;
    if (href.includes("/settings") || label.includes("cấu hình")) return <Settings className="h-4 w-4" />;
    if (label.includes("lead")) return <Inbox className="h-4 w-4" />;
    return item.icon || <LayoutDashboard className="h-4 w-4" />;
  };


  useEffect(() => {
    function closeMenusOnOutsidePress(event: PointerEvent) {
      const target = event.target as Node;

      if (profileMenuOpen && !profileMenuRef.current?.contains(target)) {
        setProfileMenuOpen(false);
      }

      if (searchOpen && !searchRef.current?.contains(target)) {
        setSearchOpen(false);
      }

      if (notificationOpen && !notificationRef.current?.contains(target)) {
        setNotificationOpen(false);
      }

      if (mobileAppMenuOpen && !mobileAppMenuRef.current?.contains(target)) {
        setMobileAppMenuOpen(false);
      }

      if (mobileModuleMenuOpen && !mobileModuleMenuRef.current?.contains(target)) {
        setMobileModuleMenuOpen(false);
      }

      if (chatOpen && !chatRef.current?.contains(target)) {
        setChatOpen(false);
      }
    }

    function closeMenusOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setSearchOpen(false);
        setNotificationOpen(false);
        setMobileAppMenuOpen(false);
        setMobileModuleMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenusOnOutsidePress);
    document.addEventListener("keydown", closeMenusOnEscape);

    const handleOpenApps = () => { setMobileAppMenuOpen(true); setProfileMenuOpen(false); setSearchOpen(false); setNotificationOpen(false); };
    const handleOpenProfile = () => { setProfileMenuOpen(true); setMobileAppMenuOpen(false); setSearchOpen(false); setNotificationOpen(false); };
    const handleOpenNotifications = () => { setNotificationOpen(true); setMobileAppMenuOpen(false); setProfileMenuOpen(false); setSearchOpen(false); };

    window.addEventListener("open-mobile-apps", handleOpenApps);
    window.addEventListener("open-mobile-profile", handleOpenProfile);
    window.addEventListener("open-mobile-notifications", handleOpenNotifications);

    return () => {
      document.removeEventListener("pointerdown", closeMenusOnOutsidePress);
      document.removeEventListener("keydown", closeMenusOnEscape);
      window.removeEventListener("open-mobile-apps", handleOpenApps);
      window.removeEventListener("open-mobile-profile", handleOpenProfile);
      window.removeEventListener("open-mobile-notifications", handleOpenNotifications);
    };
  }, [profileMenuOpen, searchOpen, notificationOpen, mobileAppMenuOpen, mobileModuleMenuOpen, chatOpen]);

  // Global Pusher listener for chat — always active regardless of current page
  useEffect(() => {
    if (!organizationId) {
      console.warn('[Topbar] organizationId not available yet');
      return;
    }

    // Request desktop notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const pusher = getPusherClient();
    const globalChannel = `org-${organizationId}-global`;
    console.log('[Topbar] Subscribing Pusher:', globalChannel);
    const channel = pusher.subscribe(globalChannel);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('[Topbar] ✅ Pusher ready:', globalChannel);
    });

    channel.bind('chat-update', (data: { conversationId: string; senderName?: string; content?: string }) => {
      console.log('[Topbar] 📨 chat-update:', data);
      const isCurrentChat = activeChatRef.current === data.conversationId;
      if (!isCurrentChat) {
        const entry = { conversationId: data.conversationId, senderName: data.senderName || 'Khách hàng', content: data.content || 'Đã gửi tin nhắn', time: Date.now() };
        setChatUnread((prev) => [entry, ...prev.filter(m => m.conversationId !== data.conversationId)]);

        // Sound via Web Audio API
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
        } catch (e) {}

        // Tab title blink
        let isAlt = false;
        const origTitle = document.title;
        const blink = setInterval(() => {
          document.title = isAlt ? origTitle : '💬 Tin nhắn mới!';
          isAlt = !isAlt;
        }, 1000);
        const stopBlink = () => { clearInterval(blink); document.title = origTitle; };
        document.addEventListener('visibilitychange', stopBlink, { once: true });
        setTimeout(stopBlink, 15000);

        // Desktop notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const notif = new Notification('💬 Tin nhắn mới', {
            body: `${data.senderName || 'Khách hàng'}: ${data.content || 'Đã gửi tin nhắn'}`,
            icon: '/brand/ong-vang-logo.svg',
            tag: data.conversationId,
          });
          notif.onclick = () => { window.focus(); router.push(`/workspace/chat/${data.conversationId}`); };
        }
      }
    });

    return () => {
      pusher.unsubscribe(globalChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

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
    try {
      await markNotificationsRead([notification.id]);
    } catch (e) {
      console.error("Failed to mark notification read", e);
    }
    setNotifications((current) => current.filter((item) => item.id !== notification.id));
    setNotificationOpen(false);
    if (notification.link) router.push(notification.link);
  };

  return (
    <>
    <header className="relative z-[200] flex h-20 flex-shrink-0 items-center gap-2 border-b border-[#eaeaea] bg-white/70 backdrop-blur-md px-4 sm:gap-4 sm:px-8">
      <div className="relative flex min-w-0 items-center gap-3 text-[15px] sm:gap-4">
        <div className="flex items-center gap-1 lg:gap-2">

          {onToggleSidebar ? (
            <div className="relative lg:hidden">
              <Link
                href="/workspace"
                prefetch={false}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 active:scale-95"
                title="Trang chủ Workspace"
              >
                <Home className="h-5 w-5" />
              </Link>
            </div>
          ) : null}
        </div>
        
        {/* Back / Forward Buttons - Desktop */}
        {!isAppLauncher ? (
          <div className="hidden lg:flex items-center gap-1 border-r border-[#eaeaea] pr-3 mr-1">
            <button 
              type="button" 
              onClick={() => window.history.back()} 
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Quay lại"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              type="button" 
              onClick={() => window.history.forward()} 
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Tiến tới"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        {/* Brand / Active Module Info */}
        {isWorkspaceDashboard ? (
          <Link
            href="/workspace/dashboard"
            prefetch={false}
            className="hidden lg:flex min-w-0 items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="truncate text-[16px] font-semibold text-slate-900">Dashboard</span>
          </Link>
        ) : isAppLauncher ? (
          <Link
            href="/workspace"
            prefetch={false}
            title="Về Workspace"
            className="hidden lg:flex min-w-0 items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-gray-50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#eaeaea]">
              <img
                src={brand?.logo || "https://res.cloudinary.com/ongvang/image/upload/v1741549419/ovc-workspace/assets/logo.png"}
                alt={brand?.name || "Workspace"}
                className="h-5 w-5 object-contain"
              />
            </span>
            <span className="truncate text-[16px] font-semibold text-slate-900">{brand?.name || "Workspace"}</span>
          </Link>
        ) : activeModule ? (
          <Link href={activeModule.href} className="hidden lg:flex min-w-0 items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-gray-50">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getIconBg(activeModule.code)}`}>
              {activeModule.icon ? <span className="[&>svg]:h-4 [&>svg]:w-4">{activeModule.icon}</span> : <span className="text-[14px] font-bold">{activeModule.label.charAt(0)}</span>}
            </div>
            <span className="truncate text-[16px] font-semibold text-slate-900">{activeModule.label}</span>
          </Link>
        ) : null}

        <div className="hidden sm:block">{children}</div>
      </div>

      <div
        className={cn(
          "mx-2 min-w-0 flex-1 md:mx-auto md:max-w-sm"
        )}
        ref={searchRef}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm"
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
            className="h-10 w-full rounded-xl border border-[#eaeaea] bg-white pl-9 pr-12 text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:h-9 sm:rounded-md sm:text-[15px]"
          />
          <div className="pointer-events-none absolute inset-y-0 right-2 hidden sm:flex items-center">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
              ⌘K
            </kbd>
          </div>
          {searchOpen ? (
            <div className="absolute left-0 right-0 top-11 z-[430] max-h-[60vh] overflow-y-auto overflow-x-hidden rounded-xl border border-[#eaeaea] bg-white p-2 shadow-sm">
              <div className="px-2 pb-2 pt-1 text-[11px] font-medium uppercase tracking-widest text-gray-400">Đi tới</div>
              <div className="space-y-0.5">
                {searchResults.map((result) => (
                  <button
                    key={result.href}
                    type="button"
                    onClick={() => navigateFromSearch(result.href)}
                    className="flex w-full min-w-0 items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-gray-50"
                  >
                    <Search className="h-4 w-4 shrink-0 text-gray-400" />
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-[14px] font-medium text-black">{result.label}</strong>
                      <small className="block truncate text-[13px] text-gray-500">{result.description}</small>
                    </span>
                  </button>
                ))}
                {!searchResults.length ? <div className="px-3 py-2 text-[14px] text-gray-500">Không tìm thấy trang phù hợp.</div> : null}
              </div>

              {createResults.length ? (
                <>
                  <div className="mt-2 border-t border-[#eaeaea] px-2 pb-2 pt-3 text-[11px] font-medium uppercase tracking-widest text-gray-400">Tạo nhanh</div>
                  <div className="grid gap-0.5">
                    {createResults.map((result) => {
                      const Icon = result.icon;
                      return (
                        <button
                          key={result.href}
                          type="button"
                          onClick={() => navigateFromSearch(result.href)}
                          className="flex w-full min-w-0 items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-gray-50"
                        >
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${result.tone}`}><Icon className="h-3.5 w-3.5" /></span>
                          <span className="min-w-0 flex-1">
                            <strong className="block truncate text-[14px] font-medium text-black">Tạo {result.label}</strong>
                            <small className="block truncate text-[13px] text-gray-500">{result.description}</small>
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
        <button 
          title="Tạo nhanh"
          className="hidden sm:flex relative h-8 w-8 items-center justify-center rounded-full bg-black text-white shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>

        {/* Chat Inbox Icon */}
        <div ref={chatRef} className="relative hidden sm:block">
          <button
            type="button"
            aria-label="Tin nhắn"
            onClick={() => { setChatOpen((o) => !o); setNotificationOpen(false); setProfileMenuOpen(false); }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-600 transition-all hover:scale-105 active:scale-95 hover:border-slate-200 hover:bg-white hover:shadow-sm"
          >
            <MessageSquare className="h-6 w-6 sm:h-4 sm:w-4" />
            {chatUnread.length > 0 && (
              <span className="absolute right-1 top-1 sm:right-1.5 sm:top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
                {chatUnread.length > 9 ? '9+' : chatUnread.length}
              </span>
            )}
          </button>
          {chatOpen && (
            <div className="fixed left-4 right-4 top-20 z-[460] w-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.2)] sm:absolute sm:left-auto sm:right-[-12px] sm:top-12 sm:w-[420px] md:right-0 md:w-[480px]">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Tin nhắn</p>
                  <p className="text-xs text-slate-500">{chatUnread.length ? `${chatUnread.length} tin chưa đọc` : 'Không có tin nhắn mới'}</p>
                </div>
                {chatUnread.length > 0 && (
                  <button onClick={() => setChatUnread([])} className="text-xs font-medium text-blue-600 hover:text-blue-700">Xóa tất cả</button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {chatUnread.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <MessageSquare className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Không có tin nhắn mới</p>
                  </div>
                ) : chatUnread.map((msg, i) => (
                  <button
                    key={`${msg.conversationId}-${i}`}
                    type="button"
                    onClick={() => {
                      setChatOpen(false);
                      setChatUnread((prev) => prev.filter((m) => m.conversationId !== msg.conversationId));
                      router.push(`/workspace/chat/${msg.conversationId}`);
                    }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{msg.senderName}</p>
                        <span className="shrink-0 text-[11px] text-slate-400">{new Date(msg.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{msg.content}</p>
                    </div>
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 p-2">
                <button
                  onClick={() => { setChatOpen(false); router.push('/workspace/chat'); }}
                  className="w-full rounded-xl py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Mở tất cả tin nhắn →
                </button>
              </div>
            </div>
          )}
        </div>
        <div ref={notificationRef} className="relative hidden sm:block">
          <button
            type="button"
            aria-label="Thông báo"
            onClick={() => {
              setNotificationOpen(true);
            }}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all hover:scale-105 active:scale-95 hover:bg-slate-50"
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
                      try {
                        await markNotificationsRead(ids);
                      } catch (e) {
                        console.error("Failed to mark notifications read", e);
                      }
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
              <div className="border-t border-slate-100 p-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen(false);
                    router.push("/workspace/notifications");
                  }}
                  className="w-full rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  Xem tất cả thông báo
                </button>
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
              setProfileMenuOpen(true);
            }}
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md ring-2 ring-white transition-transform active:scale-95 sm:hidden"
          >
            {user?.image ? (
              <img src={user.image} alt="Ảnh đại diện" className="h-full w-full object-cover" />
            ) : (
              <span className="text-base font-bold">{user?.name?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}</span>
            )}
          </button>
          {user ? (
            <button
              type="button"
              aria-label="Menu tài khoản"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              onClick={() => {
                setProfileMenuOpen(true);
              }}
              className="hidden h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white shadow-sm ring-2 ring-white transition-all hover:scale-105 active:scale-95 hover:ring-blue-100 sm:flex"
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
              <Link href="/workspace/account" onClick={() => setProfileMenuOpen(false)} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <UserIcon className="h-4 w-4 text-slate-500" /> Tài khoản & bảo mật
              </Link>
              <Link href="/workspace/settings" onClick={() => setProfileMenuOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Settings className="h-4 w-4 text-slate-500" /> Cài đặt workspace
              </Link>
              {(user?.role === "SUPER_ADMIN" || user?.email === "admin@ongvang.com" || user?.email === "info@ovc.vn") && (
                <Link href="/admin" onClick={() => setProfileMenuOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-purple-700 hover:bg-purple-50 border-t border-slate-100 rounded-t-none">
                  <ShieldAlert className="h-4 w-4 text-purple-600" /> Super Admin
                </Link>
              )}
              <LogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50" />
            </div>
          ) : null}
        </div>
      </div>

    </header>
    
    {/* Mobile Secondary Navigation Bar */}
    {!isAppLauncher ? (
      <div className="flex lg:hidden items-center bg-[#fafafa] border-b border-[#eaeaea] px-2 py-1.5 shrink-0 z-[190] gap-1">
        <button 
          type="button" 
          onClick={() => window.history.back()} 
          className="flex h-8 px-2 items-center justify-center gap-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all"
          title="Quay lại"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="text-[13px] font-medium">Quay lại</span>
        </button>

        {/* Level 2 Menu Dropdown */}
        <div className="flex-1 flex items-center justify-center">
          {activeModule ? (
            <div ref={mobileModuleMenuRef} className="relative min-w-0">
              <button
                type="button"
                aria-expanded={mobileModuleMenuOpen}
                onClick={() => {
                  setMobileModuleMenuOpen((current) => !current);
                  setMobileAppMenuOpen(false);
                  setProfileMenuOpen(false);
                  setSearchOpen(false);
                  setNotificationOpen(false);
                }}
                className="flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5 text-slate-900 transition-all active:scale-[0.98] hover:bg-slate-50"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-900">
                  {activeModule.icon ? <span className="[&>svg]:h-3 [&>svg]:w-3">{activeModule.icon}</span> : <span className="text-[10px] font-bold">{activeModule.label.charAt(0)}</span>}
                </div>
                <span className="truncate text-[13px] font-medium text-slate-900">{activeModule.label}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              </button>
              {mobileModuleMenuOpen ? (
                <div role="menu" className="absolute left-1/2 -translate-x-1/2 top-10 z-[700] w-[min(280px,calc(100vw-32px))] rounded-xl border border-[#eaeaea] bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
                  <div className="grid gap-1">
                    {(activeModule.children?.length ? activeModule.children : [activeModule]).map((item) => (
                      <Link
                        key={item.href || item.label}
                        href={item.href || "#"}
                        prefetch={false}
                        role="menuitem"
                        onClick={() => setMobileModuleMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-light text-slate-700 transition-colors hover:bg-gray-50 hover:text-black",
                          (item.href ? isActive(pathname, item.href) : false) && "bg-gray-50 font-medium text-black"
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#eaeaea] bg-white text-slate-600 [&>svg]:h-4 [&>svg]:w-4">
                          {getChildMenuIcon(item)}
                        </span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <button 
          type="button" 
          onClick={() => window.history.forward()} 
          className="flex h-8 px-2 items-center justify-center gap-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all"
          title="Tiến tới"
        >
          <span className="text-[13px] font-medium">Tiến tới</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    ) : null}
    </>
  );
}

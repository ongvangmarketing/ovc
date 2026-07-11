"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckSquare2,
  CircleDollarSign,
  Contact,
  FileCheck2,
  FileText,
  Grid3x3,
  Home,
  Inbox,
  KanbanSquare,
  Landmark,
  LayoutDashboard,
  MessageCircle,
  Megaphone,
  ReceiptText,
  Settings2,
  Info,
  Grid2X2,
  Bookmark,
  Code,
  Tags,
  UserRound,
  Users,
  WalletCards,
  Webhook,
  ChevronDown,
  Pin,
  PinOff
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { saveAppLauncherPreferencesAction } from "@/modules/core/actions/app-launcher.actions";
import { useSession } from "@/lib/auth/client";
import {
  defaultModuleCodes,
  moduleDefinitions,
  type ModuleNavItem,
  type PlatformModuleCode,
} from "@/lib/modules/registry";
import { cn } from "@/lib/utils/cn";
import { getInitials, stringToColor } from "@/lib/utils/format";
import type { AppLauncherPreferences } from "@/modules/core/types/app-launcher.types";

type MenuItem = Omit<ModuleNavItem, "code"> & { code?: PlatformModuleCode };

function isActive(pathname: string, href: string, siblings?: string[]) {
  // Bổ sung /workspace vào pathname nếu Next.js URL bị rewrite mất tiền tố
  const normalizedPathname = pathname.startsWith("/workspace") 
    ? pathname 
    : `/workspace${pathname === "/" ? "" : pathname}`;

  if (href === "/workspace") return normalizedPathname === "/workspace";
  // Exact match luôn active
  if (normalizedPathname === href) return true;
  // Nếu có sibling có href dài hơn mà đang match → không active cái ngắn hơn
  if (siblings) {
    const longerSiblingActive = siblings.some(
      (s) => s !== href && s.length > href.length && (normalizedPathname === s || normalizedPathname.startsWith(`${s}/`))
    );
    if (longerSiblingActive) return false;
  }
  return normalizedPathname.startsWith(`${href}/`);
}

function compactBrandName(name: string) {
  return name
    .replace(/^\s*công\s+ty\s+/i, "")
    .replace(/^\s*(tnhh|trách\s+nhiệm\s+hữu\s+hạn|cổ\s+phần|cp|mtv|một\s+thành\s+viên)\s+/i, "")
    .trim() || name;
}

function fallbackMenuIcon(item: { href?: string; label?: string }, level: number) {
  const href = item.href || "";
  const label = (item.label || "").toLowerCase();
  const className = level > 1 ? "h-4 w-4" : "h-5 w-5";

  if (href.includes("/workspace/dashboard") || label.includes("tổng quan")) return <LayoutDashboard className={className} />;
  if (href.includes("/tasks") || label.includes("công việc")) return <CheckSquare2 className={className} />;
  if (href.includes("/calendar") || href.includes("/lich") || label.includes("lịch")) return <CalendarDays className={className} />;
  if (href.includes("/leads/forms") || label.includes("form")) return <FileText className={className} />;
  if (href.includes("/leads/webhooks") || label.includes("webhook")) return <Webhook className={className} />;
  if (href.includes("/leads/sources") || label.includes("nguồn")) return <Tags className={className} />;
  if (href.includes("/leads") || label.includes("lead")) return <Inbox className={className} />;
  if (href.includes("/contacts") || label.includes("khách")) return <Contact className={className} />;
  if (href.includes("/companies") || label.includes("công ty")) return <Landmark className={className} />;
  if (href.includes("/deals") || label.includes("cơ hội")) return <KanbanSquare className={className} />;
  if (href.includes("/projects") || label.includes("dự án")) return <KanbanSquare className={className} />;
  if (href.includes("/quotations") || label.includes("báo giá")) return <FileText className={className} />;
  if (href.includes("/contracts") || label.includes("hợp đồng")) return <FileCheck2 className={className} />;
  if (href.includes("/invoices") || label.includes("hóa đơn")) return <ReceiptText className={className} />;
  if (href.includes("/payments") || label.includes("thanh toán")) return <WalletCards className={className} />;
  if (href.includes("/finance") || label.includes("tài chính")) return <CircleDollarSign className={className} />;
  if (href.includes("/students") || label.includes("học viên")) return <Users className={className} />;
  if (href.includes("/instructors") || label.includes("giảng viên")) return <UserRound className={className} />;
  if (href.includes("/marketing") || label.includes("marketing")) return <Megaphone className={className} />;
  if (href.includes("/settings") || label.includes("cài")) return <Settings2 className={className} />;
  return <Grid2X2 className={className} />;
}

function SidebarLink({
  item,
  collapsed,
  active,
  level = 1,
  showChildren = true,
  isPinned,
  onTogglePin,
}: {
  item: any;
  collapsed: boolean;
  active: boolean;
  level?: number;
  showChildren?: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
}) {
  const pathname = usePathname();
  const hasAction = 'action' in item && item.action;
  const hasChildren = 'children' in item && item.children && item.children.length > 0;
  
  const [isOpen, setIsOpen] = useState(active || (hasChildren && level === 1));

  if (item.available === false) {
    return null;
  }
  
  const isExactlyActive = pathname === item.href || pathname === item.href + "/";
  const showBg = active && (!hasChildren || isExactlyActive);

  return (
    <div className="flex flex-col">
      <div className="group relative flex items-center">
        <Link
          href={item.href}
          prefetch={false}
          title={item.label}
          onClick={(e) => {
            if (hasChildren) {
              setIsOpen(!isOpen);
            }
          }}
          className={cn(
            "sidebar-item flex h-11 flex-1 items-center gap-3 rounded-xl px-3 text-slate-600 transition-colors hover:bg-gray-100 hover:text-black",
            showBg ? "bg-gray-100 font-medium text-black" : (active ? "font-medium text-black" : "font-medium"),
            collapsed && "justify-center px-0",
            level > 1 && "ml-2 pl-3"
          )}
        >
          {'icon' in item && item.icon ? (
            <span className={cn("shrink-0 text-slate-500", active && "text-black")}>{item.icon}</span>
          ) : (
            <span className={cn("shrink-0 text-slate-400 transition-colors group-hover:text-slate-700", active && "text-black")}>
              {fallbackMenuIcon(item, level)}
            </span>
          )}
          
          {!collapsed ? <span className="truncate text-[15px] leading-none flex-1">{item.label}</span> : null}
          
          {!collapsed && hasChildren && (
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", isOpen && "rotate-180")} />
          )}
        </Link>

        
        {!collapsed && hasAction && (
          <Link
            href={item.action!.href}
            prefetch={false}
            title={item.action!.title}
            className="absolute right-1 shrink-0 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 hover:text-black group-hover:opacity-100"
          >
            {item.action!.icon}
          </Link>
        )}
        
        {!collapsed && onTogglePin && item.href !== "/workspace" && item.href !== "/workspace/dashboard" && !hasAction && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTogglePin();
            }}
            title={isPinned ? "Bỏ ghim khỏi Menu Mobile" : "Ghim vào Menu Mobile (Tối đa 3)"}
            className={cn(
              "absolute shrink-0 rounded p-1 transition-opacity hover:bg-gray-200",
              hasAction ? "right-8" : "right-1",
              isPinned ? "text-blue-600 opacity-100" : "text-gray-400 opacity-0 group-hover:opacity-100"
            )}
          >
            {isPinned ? <PinOff className="h-[14px] w-[14px]" /> : <Pin className="h-[14px] w-[14px]" />}
          </button>
        )}
      </div>

      {!collapsed && hasChildren && showChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children.map((child: any) => {
            return (
              <SidebarLinkChild
                key={child.href}
                item={child}
                collapsed={collapsed}
                level={level + 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarLinkChild({ item, collapsed, level, isPinned, onTogglePin }: { item: any, collapsed: boolean, level: number, isPinned?: boolean, onTogglePin?: () => void }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return <SidebarLink item={item} collapsed={collapsed} active={active} level={level} isPinned={isPinned} onTogglePin={onTogglePin} />;
}

type SidebarProps = {
  enabledModuleCodes?: PlatformModuleCode[];
  launcherPreferences?: AppLauncherPreferences;
  brand?: { name?: string | null; logo?: string | null };
  currentUser?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null };
  switcher?: ReactNode;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileNavigate?: () => void;
};

export function Sidebar({ enabledModuleCodes = defaultModuleCodes, launcherPreferences, brand, currentUser, switcher, collapsed: controlledCollapsed, mobileOpen = false, onMobileNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [internalCollapsed] = useState(false);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const appLauncherRef = useRef<HTMLDivElement>(null);
  
  const user = session?.user ?? currentUser;
  const brandName = compactBrandName(brand?.name || "OngVàng");
  const brandLogo = brand?.logo || "/brand/ong-vang-logo.svg";
  
  const normalizedPathname = pathname.startsWith("/workspace") 
    ? pathname 
    : `/workspace${pathname === "/" ? "" : pathname}`;

  const isAppLauncher = normalizedPathname === "/workspace";
  const isWorkspaceDashboard = normalizedPathname === "/workspace/dashboard" || pathname === "/myworks" || pathname === "/";
  const isAccountSettings = normalizedPathname.startsWith("/workspace/account");
  const isRailOnly = isAppLauncher || isWorkspaceDashboard || isAccountSettings;
  
  const collapsedPreference = controlledCollapsed ?? internalCollapsed;
  const enabledModuleKey = enabledModuleCodes.join("|");
  
  const handleTogglePin = (key: string) => {
    if (!launcherPreferences) return;
    startTransition(async () => {
      const currentOrder = launcherPreferences.bottomNavOrder || [];
      let newOrder = [...currentOrder];
      if (newOrder.includes(key)) {
        newOrder = newOrder.filter(k => k !== key);
      } else {
        if (newOrder.length >= 3) newOrder.shift(); // remove oldest to keep max 3
        newOrder.push(key);
      }
      await saveAppLauncherPreferencesAction({
        ...launcherPreferences,
        bottomNavOrder: newOrder,
      });
      router.refresh();
    });
  };
  const pinnedKeys = new Set(launcherPreferences?.bottomNavOrder || []);

  const moduleItems = useMemo(() => {
    const enabledModules = new Set(enabledModuleKey.split("|") as PlatformModuleCode[]);
    // Always enable system modules
    enabledModules.add("SETTINGS");
    
    let items = moduleDefinitions
      .filter((module) => enabledModules.has(module.code))
      .map((module) => module.nav)
      .filter(Boolean) as ModuleNavItem[];
      
    // Inject hotel children when inside the traveling hotels section
    const isHotelArea = pathname.startsWith('/workspace/traveling/hotels');
    const hotelMatch = pathname.match(/^\/workspace\/traveling\/hotels\/([^\/]+)/);
    const hotelId = (hotelMatch && hotelMatch[1] !== 'new') ? hotelMatch[1] : null;

    if (isHotelArea) {
      items = items.map(item => {
        if (item.code === 'TRAVELING' && item.children) {
          return {
            ...item,
            children: item.children.map(child => {
              if (child.href === '/workspace/traveling/hotels') {
                return {
                  ...child,
                  children: [
                    { label: "Tổng quan", href: hotelId ? `/workspace/traveling/hotels/${hotelId}` : `/workspace/traveling/hotels?tab=overview`, icon: <Info className="h-4 w-4" /> },
                    { label: "Loại phòng & Giá", href: hotelId ? `/workspace/traveling/hotels/${hotelId}/room-types` : `/workspace/traveling/hotels?tab=room-types`, icon: <Grid2X2 className="h-4 w-4" /> },
                    { label: "Lịch đóng mở", href: hotelId ? `/workspace/traveling/hotels/${hotelId}/schedule` : `/workspace/traveling/hotels?tab=schedule`, icon: <CalendarDays className="h-4 w-4" /> },
                    { label: "Đặt phòng", href: hotelId ? `/workspace/traveling/hotels/${hotelId}/bookings` : `/workspace/traveling/hotels?tab=bookings`, icon: <Bookmark className="h-4 w-4" /> },
                    { label: "Công cụ bán", href: hotelId ? `/workspace/traveling/hotels/${hotelId}/sales` : `/workspace/traveling/hotels?tab=sales`, icon: <Code className="h-4 w-4" /> },
                  ]
                };
              }
              return child;
            })
          };
        }
        return item;
      });
    }
    return items;
  }, [enabledModuleKey, pathname]);

  const launcherItems = useMemo(() => {
    const items = [{
      code: "DASHBOARD" as PlatformModuleCode,
      href: "/workspace/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    }, ...moduleItems.filter((item) => item.code !== "DASHBOARD")];
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

  useEffect(() => {
    if (!appLauncherOpen) return;

    function closeOnOutsidePress(event: PointerEvent) {
      if (!appLauncherRef.current?.contains(event.target as Node)) {
        setAppLauncherOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [appLauncherOpen]);

  // Determine Active Module based on Pathname
  // Sort by length of href descending to match more specific routes first
  const activeModule = useMemo(() => {
    if (isAppLauncher) return null;
    
    // Chỉ force SETTINGS sidebar cho đúng route /workspace/settings
    // Không áp dụng cho /workspace/crm/settings, /workspace/finance/settings, v.v.
    if (normalizedPathname.startsWith("/workspace/settings")) {
      return moduleItems.find((m) => m.code === "SETTINGS") || null;
    }
    
    const sortedModules = [...moduleItems].sort((a, b) => b.href.length - a.href.length);
    const found = sortedModules.find((item) =>
      isActive(pathname, item.href) ||
      item.children?.some((child) => child.href ? isActive(pathname, child.href) : false)
    );
    return found || null;
  }, [pathname, normalizedPathname, moduleItems, isAppLauncher]);

  const collapsed = collapsedPreference && !activeModule?.children?.length;

  // DEBUG LOGGING
  if (typeof window === 'undefined') {
    const fs = require('fs');
    fs.appendFileSync('/tmp/sidebar-debug.log', `SSR Render: pathname=${pathname}, activeModule=${activeModule?.code}, moduleItemsLength=${moduleItems.length}, isAppLauncher=${isAppLauncher}\n`);
  }

  return (
    <aside
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) onMobileNavigate?.();
      }}
      className={cn(
        "fixed inset-y-0 left-0 z-[700] flex w-[min(86vw,320px)] shrink-0 flex-col border-r border-[#eaeaea] bg-[#fafafa] text-slate-800 shadow-2xl transition-transform duration-300 lg:relative lg:inset-auto lg:z-[700] lg:shadow-none lg:transition-all",
        isRailOnly || appLauncherOpen ? "overflow-visible" : "overflow-y-auto",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed || isRailOnly ? "lg:w-[86px]" : "lg:w-[248px]",
        isAppLauncher && "bg-[#F8F9FA]" // Lighter background for the launcher sidebar like base.vn
      )}
    >
      <div className="flex h-20 items-center gap-3 border-b border-[#eaeaea] px-3">
        {isAppLauncher ? (
          <Link
            href="/workspace"
            prefetch={false}
            title="Về Workspace"
            className="flex min-w-0 flex-1 items-center justify-center gap-3"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              <img
                src={brandLogo}
                alt={brandName}
                className="h-9 w-9 object-contain"
              />
            </span>
          </Link>
        ) : (
          <div
            ref={appLauncherRef}
            className={cn(
              "relative flex min-w-0 flex-1 items-center gap-2",
              (collapsed || isRailOnly) && "justify-center"
            )}
          >
            <button
              type="button"
              title="App Launcher"
              aria-label="App Launcher"
              aria-haspopup="menu"
              aria-expanded={appLauncherOpen}
              onClick={() => setAppLauncherOpen((current) => !current)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#eaeaea] bg-white text-slate-600 transition-colors hover:border-gray-300 hover:text-black"
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            {!collapsed && !isRailOnly ? (
              <Link
                href="/workspace"
                prefetch={false}
              title="Home"
              aria-label="Home"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#eaeaea] bg-white text-slate-600 transition-colors hover:border-gray-300 hover:text-black"
              >
                <Home className="h-5 w-5" />
              </Link>
            ) : null}
            {appLauncherOpen ? (
              <div
                role="menu"
                className="absolute left-0 top-12 z-[900] w-[340px] max-w-[calc(100vw-24px)] rounded-[20px] border border-[#eaeaea] bg-white/95 p-5 shadow-2xl backdrop-blur-xl"
              >
                <div className="mb-4 border-b border-[#eaeaea] pb-3">
                  <h2 className="text-[18px] font-semibold tracking-tight text-black">Ứng dụng của bạn</h2>
                </div>
                <div className="grid grid-cols-3 gap-x-2 gap-y-4">
                  {launcherItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      role="menuitem"
                      onClick={() => {
                        setAppLauncherOpen(false);
                        onMobileNavigate?.();
                      }}
                      className="group flex min-w-0 flex-col items-center gap-2 rounded-md p-2 text-center transition-colors hover:bg-gray-50"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#eaeaea] bg-white text-black transition-colors group-hover:border-gray-300 [&>svg]:h-5 [&>svg]:w-5">
                        {item.icon}
                      </span>
                      <span className="max-w-full text-[12px] font-normal leading-4 text-black">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {(collapsed && !isRailOnly) ? (
        <Link
          href="/workspace"
          prefetch={false}
          className="mx-auto my-4 flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-[#eaeaea] hover:bg-white hover:text-black"
          title="Home"
          aria-label="Home"
        >
          <Home className="h-5 w-5" />
        </Link>
      ) : null}

      <nav className="space-y-4 p-3 flex-1">
        {isRailOnly ? (
          <div className="flex flex-col items-center gap-2">
            {[
              { href: "/workspace/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
              { href: "/workspace/myworks", label: "Công việc", icon: <CheckSquare2 className="h-5 w-5" /> },
              { href: "/workspace/chat", label: "Chat", icon: <MessageCircle className="h-5 w-5" /> },
              { href: "/calendar", label: "Lịch", icon: <CalendarDays className="h-5 w-5" /> },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                title={item.label}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border border-transparent text-gray-500 transition-colors hover:border-[#eaeaea] hover:bg-white hover:text-black",
                  isActive(pathname, item.href) && "border-[#eaeaea] bg-white text-black"
                )}
              >
                {item.icon}
              </Link>
            ))}
          </div>
        ) : activeModule ? (
          // Contextual Sidebar for Active Module
          <div className="space-y-1.5">
            {/* If the active module has children, render them as top-level items */}
            {activeModule.children && activeModule.children.length > 0
              ? activeModule.children.map(child => {
                  const siblingHrefs = (activeModule.children ?? []).map(c => c.href).filter(Boolean) as string[];
                  return (
                    <SidebarLink 
                      key={child.href || child.label} 
                      item={child} 
                      collapsed={collapsed} 
                      active={child.href ? isActive(pathname, child.href, siblingHrefs) : false} 
                      isPinned={child.href ? pinnedKeys.has(child.href) : false}
                      onTogglePin={child.href ? () => handleTogglePin(child.href) : undefined}
                    />
                  );
                })
              : (
                <SidebarLink 
                  item={activeModule} 
                  collapsed={collapsed} 
                  active={true} 
                  isPinned={pinnedKeys.has(activeModule.code)}
                  onTogglePin={() => handleTogglePin(activeModule.code)}
                />
              )
            }
          </div>
        ) : (
          // Fallback if somehow not on App Launcher and no active module found
          <div className="space-y-1.5">
            {moduleItems.map(item => (
               <SidebarLink 
                  key={item.href} 
                  item={item} 
                  collapsed={collapsed} 
                  active={isActive(pathname, item.href)} 
                  isPinned={pinnedKeys.has(item.code)}
                  onTogglePin={() => handleTogglePin(item.code)}
               />
            ))}
          </div>
        )}
      </nav>

      {switcher && !collapsed && !isRailOnly ? (
        <div className="border-t border-slate-100 p-3 [&_button]:w-full [&_button]:justify-between [&_button_span]:max-w-[170px]">
          {switcher}
        </div>
      ) : null}

      <div className={cn("mt-auto border-t border-slate-100 p-3", isRailOnly && !isAppLauncher && "hidden")}>
        {isAppLauncher ? (
          <Link
            href="/workspace/settings/organization"
            prefetch={false}
            title="Cài đặt hệ thống"
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
          >
            <Settings2 className="h-6 w-6" />
          </Link>
        ) : null}
        {!isRailOnly ? (
        <div className={cn("rounded-xl border border-[#eaeaea] bg-white p-3 transition hover:bg-gray-50", collapsed && "flex justify-center p-2")}>
          <div className={cn("flex items-center gap-3", (collapsed || isRailOnly) && "justify-center")}>
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white"
            style={{ backgroundColor: stringToColor(user?.name ?? "Ong Vàng") }}
          >
            {getInitials(user?.name ?? "OV")}
          </div>
          {(!collapsed && !isRailOnly) ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-slate-900">{user?.name ?? "Ong Vàng"}</p>
                <p className="truncate text-[12px] font-medium text-slate-500">
                  {user?.email ?? "info@ovc.vn"}
                </p>
              </div>
              <LogoutButton
                iconOnly
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-white hover:text-slate-900"
              />
            </>
          ) : null}
          </div>
        </div>
        ) : null}
      </div>
    </aside>
  );
}

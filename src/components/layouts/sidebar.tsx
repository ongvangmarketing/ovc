"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Home,
  PanelLeftOpen,
  RotateCcw,
  Settings2,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { useSession } from "@/lib/auth/client";
import {
  defaultModuleCodes,
  moduleDefinitions,
  workNavigation,
  type ModuleNavItem,
  type PlatformModuleCode,
} from "@/lib/modules/registry";
import { cn } from "@/lib/utils/cn";
import { getInitials, stringToColor } from "@/lib/utils/format";

type MenuItem = Omit<ModuleNavItem, "code"> & { code?: PlatformModuleCode };
type CustomMenuItem = MenuItem & { id: string };
type SidebarPreferences = {
  order: string[];
  hidden: string[];
};

const SIDEBAR_PREFERENCES_KEY = "ovc.workspace.sidebar.preferences.v1";

// Navigation handled by Next.js router for proper SPA behaviour.

function isActive(pathname: string, href: string) {
  if (href === "/workspace") return pathname === "/workspace" || pathname === "/workspace/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function compactBrandName(name: string) {
  return name
    .replace(/^\s*công\s+ty\s+/i, "")
    .replace(/^\s*(tnhh|trách\s+nhiệm\s+hữu\s+hạn|cổ\s+phần|cp|mtv|một\s+thành\s+viên)\s+/i, "")
    .trim() || name;
}

function defaultPreferences(items: CustomMenuItem[]): SidebarPreferences {
  return { order: items.map((item) => item.id), hidden: [] };
}

function normalizePreferences(items: CustomMenuItem[], preferences: SidebarPreferences): SidebarPreferences {
  const itemIds = items.map((item) => item.id);
  const itemIdSet = new Set(itemIds);
  const orderedKnownIds = preferences.order.filter((id) => itemIdSet.has(id));
  const missingIds = itemIds.filter((id) => !orderedKnownIds.includes(id));

  return {
    order: [...orderedKnownIds, ...missingIds],
    hidden: preferences.hidden.filter((id) => itemIdSet.has(id)),
  };
}

function readSidebarPreferences(items: CustomMenuItem[]) {
  if (typeof window === "undefined") return defaultPreferences(items);

  try {
    const stored = window.localStorage.getItem(SIDEBAR_PREFERENCES_KEY);
    if (!stored) return defaultPreferences(items);

    const parsed = JSON.parse(stored) as Partial<SidebarPreferences>;
    return normalizePreferences(items, {
      order: Array.isArray(parsed.order) ? parsed.order : [],
      hidden: Array.isArray(parsed.hidden) ? parsed.hidden : [],
    });
  } catch {
    return defaultPreferences(items);
  }
}

function saveSidebarPreferences(preferences: SidebarPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIDEBAR_PREFERENCES_KEY, JSON.stringify(preferences));
}

function SidebarLink({
  item,
  collapsed,
  active,
}: {
  item: MenuItem;
  collapsed: boolean;
  active: boolean;
}) {
  if (item.available === false) {
    return null;
  }

  return (
    <Link
      href={item.href}
      prefetch={false}
      title={item.label}
      className={cn(
        "sidebar-item h-[34px] gap-2 rounded-lg px-2 text-[15px] text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        active ? "font-medium bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-600" : "font-medium",
        collapsed && "justify-center px-0"
      )}
    >
      <span className={cn("text-slate-500", active && "text-orange-500")}>{item.icon}</span>
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );
}

function ModuleButton({
  item,
  collapsed,
  active,
  expanded,
  pathname,
  enabledModules,
  onToggle,
  onOpen,
}: {
  item: MenuItem;
  collapsed: boolean;
  active: boolean;
  expanded: boolean;
  pathname: string;
  enabledModules: Set<PlatformModuleCode>;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const isChildAvailable = (child: NonNullable<MenuItem["children"]>[number]) => {
    return child.available === true;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={collapsed ? onOpen : onToggle}
        onMouseEnter={() => {
          if (collapsed) onOpen();
        }}
        title={item.label}
        className={cn(
          "sidebar-item h-[34px] w-full gap-2 rounded-lg px-2 text-[15px] text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          active ? "font-medium bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-600" : "font-medium",
          collapsed && "justify-center px-0"
        )}
      >
        <span className={cn("text-slate-500", active && "text-orange-500")}>{item.icon}</span>
        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </>
        ) : null}
      </button>

      {!collapsed && expanded ? (
        <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-100 pl-3">
          {item.children?.map((child) => {
            const childActive = child.href === item.href ? pathname === child.href : isActive(pathname, child.href);
            const available = isChildAvailable(child);

            return available ? (
              <div key={child.href} className="group flex items-center relative pr-2">
                <Link
                  href={child.href}
                  prefetch={false}
                  className={cn(
                    "block flex-1 rounded-lg px-2 py-1.5 text-[14px] text-slate-500 transition hover:bg-slate-100 hover:text-slate-900",
                    childActive ? "font-medium bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-600" : "font-normal"
                  )}
                >
                  {child.label}
                </Link>
                {child.action && (
                  <Link
                    href={child.action.href}
                    prefetch={false}
                    title={child.action.title}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-orange-100 rounded text-orange-600 ml-1 shrink-0 absolute right-1"
                  >
                    {child.action.icon}
                  </Link>
                )}
              </div>
            ) : null;
          })}
        </div>
      ) : null}

      {collapsed && expanded && typeof document !== "undefined" ? createPortal(
        <div className="fixed bottom-0 left-[86px] top-16 z-[360] w-80 overflow-y-auto border-r border-slate-200 bg-white px-5 py-6 shadow-[18px_0_45px_rgba(15,23,42,0.08)]">
          <div className="mb-4 px-2 text-[12px] font-bold uppercase tracking-wide text-slate-500">{item.label}</div>
          <div className="space-y-1.5">
            {item.children?.map((child) => {
              const childActive = child.href === item.href ? pathname === child.href : isActive(pathname, child.href);
              const available = isChildAvailable(child);

              return available ? (
                <Link
                  key={child.href}
                  href={child.href}
                  prefetch={false}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-[14px] text-slate-600 transition-colors duration-75 hover:bg-slate-100 hover:text-slate-900",
                    childActive ? "font-medium bg-orange-50 text-orange-600 hover:bg-orange-50 hover:text-orange-600" : "font-normal"
                  )}
                >
                  {child.label}
                </Link>
              ) : null;
            })}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

type SidebarProps = {
  enabledModuleCodes?: PlatformModuleCode[];
  brand?: { name?: string | null; logo?: string | null };
  currentUser?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null };
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileNavigate?: () => void;
};

export function Sidebar({ enabledModuleCodes = defaultModuleCodes, brand, currentUser, collapsed: controlledCollapsed, onCollapsedChange, mobileOpen = false, onMobileNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [manualExpanded, setManualExpanded] = useState<string[]>([]);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const user = session?.user ?? currentUser;
  const brandName = compactBrandName(brand?.name || "OngVàng");
  const brandLogo = brand?.logo || "/brand/ong-vang-logo.svg";
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const enabledModules = new Set(enabledModuleCodes);
  const workItems = workNavigation.filter((item) => enabledModules.has(item.code));
  const moduleItems = moduleDefinitions
    .filter((module) => enabledModules.has(module.code))
    .map((module) => module.nav)
    .filter(Boolean) as ModuleNavItem[];
  const utilityItems = moduleItems.filter((item) => item.code === "REPORTS" || item.code === "SETTINGS");
  const primaryModuleItems = moduleItems.filter((item) => item.code !== "REPORTS" && item.code !== "SETTINGS");
  const homeItem: CustomMenuItem = { id: "home", label: "Trang chủ", href: "/workspace", icon: <Home className="h-5 w-5" /> };
  const sidebarItems: CustomMenuItem[] = [
    homeItem,
    ...workItems.map((item) => ({ ...item, id: item.code })),
    ...primaryModuleItems.map((item) => ({ ...item, id: item.code })),
    ...utilityItems.map((item) => ({ ...item, id: item.code })),
  ].filter((item) => item.available !== false);
  const [preferences, setPreferences] = useState<SidebarPreferences>(() => defaultPreferences(sidebarItems));
  const normalizedPreferences = normalizePreferences(sidebarItems, preferences);
  const hiddenItemIds = new Set(normalizedPreferences.hidden);
  const sidebarItemById = new Map(sidebarItems.map((item) => [item.id, item]));
  const orderedSidebarItems = normalizedPreferences.order
    .map((id) => sidebarItemById.get(id))
    .filter((item): item is CustomMenuItem => Boolean(item));
  const visibleSidebarItems = orderedSidebarItems.filter((item) => !hiddenItemIds.has(item.id));

  useEffect(() => {
    queueMicrotask(() => {
      setPreferences(readSidebarPreferences(sidebarItems));
    });
  }, [enabledModuleCodes.join("|")]);

  const updatePreferences = (nextPreferences: SidebarPreferences) => {
    const normalized = normalizePreferences(sidebarItems, nextPreferences);
    setPreferences(normalized);
    saveSidebarPreferences(normalized);
  };

  const moveItem = (id: string, direction: -1 | 1) => {
    const order = [...normalizedPreferences.order];
    const index = order.indexOf(id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return;

    const currentId = order[index];
    const nextId = order[nextIndex];
    if (!currentId || !nextId) return;

    order[index] = nextId;
    order[nextIndex] = currentId;
    updatePreferences({ ...normalizedPreferences, order });
  };

  const toggleItemVisibility = (id: string) => {
    const nextHidden = hiddenItemIds.has(id)
      ? normalizedPreferences.hidden.filter((itemId) => itemId !== id)
      : [...normalizedPreferences.hidden, id];
    updatePreferences({ ...normalizedPreferences, hidden: nextHidden });
  };

  const resetPreferences = () => {
    updatePreferences(defaultPreferences(sidebarItems));
  };

  const activeModuleHref = visibleSidebarItems.find((item) => {
    return isActive(pathname, item.href) || Boolean(item.children?.some((child) => isActive(pathname, child.href)));
  })?.href;

  const isExpanded = (href: string) => collapsed ? manualExpanded.includes(href) : href === activeModuleHref || manualExpanded.includes(href);

  const toggle = (href: string) => {
    if (!collapsed && href === activeModuleHref) return;
    setManualExpanded((current) =>
      current.includes(href) ? current.filter((item) => item !== href) : [href]
    );
  };

  const openMenu = (href: string) => {
    setManualExpanded([href]);
  };

  const setCollapsed = (nextCollapsed: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(nextCollapsed);
      return;
    }

    setInternalCollapsed(nextCollapsed);
  };

  return (
    <aside
      onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) onMobileNavigate?.();
      }}
      className={cn(
        "fixed inset-y-0 left-0 z-[300] flex w-[min(86vw,320px)] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white text-slate-800 shadow-2xl transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:shadow-none lg:transition-all",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed ? "lg:w-[86px]" : "lg:w-[260px]"
      )}
    >
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <Link
          href="/workspace"
          prefetch={false}
          title="Về Workspace"
          className={cn("flex min-w-0 flex-1 items-center gap-3", collapsed && "justify-center")}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <img
              src={brandLogo}
              alt={brandName}
              className="h-7 w-7 object-contain"
            />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold leading-5 text-slate-950">{brandName}</span>
              <span className="block text-[14px] font-medium leading-5 text-slate-500">Workspace</span>
            </span>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
            title="Thu gọn menu"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto my-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
          title="Mở menu"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      ) : null}

      <nav className="space-y-4 p-3">
        <div className="space-y-1.5">
          {!collapsed ? (
            <p className="px-3 text-[12px] font-semibold uppercase text-slate-500">Bàn làm việc</p>
          ) : null}
          {visibleSidebarItems.map((item) => {
            const active =
              isActive(pathname, item.href) ||
              Boolean(item.children?.some((child) => isActive(pathname, child.href)));

            return item.children?.length ? (
              <ModuleButton
                key={item.id}
                item={item}
                collapsed={collapsed}
                active={active}
                expanded={isExpanded(item.href)}
                pathname={pathname}
                enabledModules={enabledModules}
                onToggle={() => toggle(item.href)}
                onOpen={() => openMenu(item.href)}
              />
            ) : (
              <SidebarLink key={item.id} item={item} collapsed={collapsed} active={active} />
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-slate-100 p-3">
        {!collapsed ? (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setCustomizerOpen((current) => !current)}
              className="flex h-9 w-full items-center justify-between rounded-lg px-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Tùy biến sidebar
              </span>
              <ChevronDown className={cn("h-4 w-4 transition", customizerOpen && "rotate-180")} />
            </button>
            {customizerOpen ? (
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="mb-2 flex items-center justify-between gap-2 px-1">
                  <p className="text-[12px] font-semibold uppercase text-slate-500">Ẩn hiện & thứ tự</p>
                  <button
                    type="button"
                    onClick={resetPreferences}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-orange-600"
                    title="Khôi phục mặc định"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
                  {orderedSidebarItems.map((item, index) => {
                    const hidden = hiddenItemIds.has(item.id);

                    return (
                      <div key={item.id} className={cn("flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50/70 p-1.5", hidden && "opacity-60")}>
                        <button
                          type="button"
                          onClick={() => toggleItemVisibility(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-orange-600"
                          title={hidden ? "Hiện mục" : "Ẩn mục"}
                        >
                          {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <span className="flex min-w-0 flex-1 items-center gap-2 text-[13px] font-medium text-slate-700">
                          <span className="shrink-0 text-slate-400">{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => moveItem(item.id, -1)}
                          disabled={index === 0}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Đưa lên"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem(item.id, 1)}
                          disabled={index === orderedSidebarItems.length - 1}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Đưa xuống"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCollapsed(false);
              setCustomizerOpen(true);
            }}
            className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
            title="Tùy biến sidebar"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        )}
        <div className={cn("rounded-xl bg-slate-50 p-3 transition hover:bg-orange-50", collapsed && "flex justify-center p-2")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white"
            style={{ backgroundColor: stringToColor(user?.name ?? "Ong Vàng") }}
          >
            {getInitials(user?.name ?? "OV")}
          </div>
          {!collapsed ? (
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
      </div>
    </aside>
  );
}

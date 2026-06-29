"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Home,
  PanelLeftOpen,
  UserPlus,
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

function isActive(pathname: string, href: string) {
  if (href === "/workspace") return pathname === "/workspace" || pathname === "/workspace/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
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
    return (
      <button
        type="button"
        disabled
        title={`${item.label} · Đang phát triển`}
        className={cn(
          "sidebar-item h-10 w-full gap-2.5 rounded-lg px-2.5 text-left text-[14px] font-medium text-slate-400",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="text-slate-400">{item.icon}</span>
        {!collapsed ? <><span className="min-w-0 flex-1 truncate">{item.label}</span><span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-600">Đang phát triển</span></> : null}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      title={item.label}
      className={cn(
        "sidebar-item h-10 gap-2.5 rounded-lg px-2.5 text-[14px] font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600",
        active && "bg-orange-50 text-orange-600",
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
  onToggle,
}: {
  item: MenuItem;
  collapsed: boolean;
  active: boolean;
  expanded: boolean;
  pathname: string;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        title={item.label}
        className={cn(
          "sidebar-item h-10 w-full gap-2.5 rounded-lg px-2.5 text-[14px] font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600",
          active && "bg-orange-50 text-orange-600",
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
            const childActive = isActive(pathname, child.href);
            const available = child.available === true;

            return available ? (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition hover:bg-orange-50 hover:text-orange-600",
                  childActive && "bg-orange-50 text-orange-600"
                )}
              >
                {child.label}
              </Link>
            ) : (
              <button
                key={child.href}
                type="button"
                disabled
                title="Tính năng đang phát triển"
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium text-slate-400"
              >
                <span className="truncate">{child.label}</span>
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-600">Đang phát triển</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type SidebarProps = {
  enabledModuleCodes?: PlatformModuleCode[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  mobileOpen?: boolean;
  onMobileNavigate?: () => void;
};

export function Sidebar({ enabledModuleCodes = defaultModuleCodes, collapsed: controlledCollapsed, onCollapsedChange, mobileOpen = false, onMobileNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["/workspace/finance"]);
  const user = session?.user;
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const enabledModules = new Set(enabledModuleCodes);
  const workItems = enabledModules.has("WORKSPACE") ? workNavigation : [];
  const moduleItems = moduleDefinitions
    .filter((module) => enabledModules.has(module.code))
    .map((module) => module.nav)
    .filter(Boolean) as ModuleNavItem[];
  const utilityItems = moduleItems.filter((item) => item.code === "REPORTS" || item.code === "SETTINGS");
  const primaryModuleItems = moduleItems.filter((item) => item.code !== "REPORTS" && item.code !== "SETTINGS");

  const toggle = (href: string) => {
    setExpanded((current) =>
      current.includes(href) ? current.filter((item) => item !== href) : [...current, href]
    );
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
          title="Về Workspace"
          className={cn("flex min-w-0 flex-1 items-center gap-3", collapsed && "justify-center")}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Image
              src="/brand/ong-vang-logo.svg"
              alt="Ong Vàng Workspace"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </span>
          {!collapsed ? (
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold leading-5 text-slate-950">OngVàng</span>
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
        <SidebarLink
          item={{ label: "Trang chủ", href: "/workspace", icon: <Home className="h-5 w-5" /> }}
          collapsed={collapsed}
          active={isActive(pathname, "/workspace")}
        />

        <div className="space-y-1.5">
          {!collapsed ? (
            <p className="px-3 text-[12px] font-semibold uppercase text-slate-500">Bàn làm việc</p>
          ) : null}
          {workItems.map((item) => (
            <SidebarLink key={item.href} item={item} collapsed={collapsed} active={isActive(pathname, item.href)} />
          ))}
        </div>

        <div className="space-y-1.5">
          {primaryModuleItems.map((item) => {
            const active =
              isActive(pathname, item.href) ||
              Boolean(item.children?.some((child) => isActive(pathname, child.href)));

            return (
              <ModuleButton
                key={item.href}
                item={item}
                collapsed={collapsed}
                active={active}
                expanded={expanded.includes(item.href)}
                pathname={pathname}
                onToggle={() => toggle(item.href)}
              />
            );
          })}
        </div>

        {!collapsed ? <div className="h-px bg-slate-100" /> : null}

        <div className="space-y-1.5">
          {utilityItems.map((item) => (
            <SidebarLink key={item.href} item={item} collapsed={collapsed} active={isActive(pathname, item.href)} />
          ))}
        </div>
      </nav>

      <div className="space-y-1.5 border-t border-slate-100 p-3">
        <SidebarLink
          item={{ label: "Trung tâm trợ giúp", href: "/workspace/help", icon: <HelpCircle className="h-5 w-5" />, available: false }}
          collapsed={collapsed}
          active={isActive(pathname, "/workspace/help")}
        />
        <SidebarLink
          item={{ label: "Mời thành viên", href: "/workspace/settings/members", icon: <UserPlus className="h-5 w-5" />, available: false }}
          collapsed={collapsed}
          active={isActive(pathname, "/workspace/settings/members")}
        />
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

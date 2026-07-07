"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  FolderKanban,
  LayoutDashboard,
  ReceiptText,
  Search,
  User as UserIcon,
  Building2,
} from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { useSession } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/customer", label: "Tổng quan", icon: LayoutDashboard, key: "overview" },
  { href: "/customer/projects", label: "Dự án", icon: FolderKanban, key: "projects" },
  { href: "/customer/tasks", label: "Nhiệm vụ", icon: ClipboardList, key: "tasks" },
  { href: "/customer/finance", label: "Tài chính", icon: ReceiptText, key: "finance" },
  { href: "/customer/reports", label: "Báo cáo", icon: BarChart3, key: "reports" },
];

export function PortalShell({
  customerName,
  email,
  brand,
  children,
}: {
  customerName: string;
  email?: string | null;
  brand?: { name?: string | null; favicon?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  let active = "overview";
  if (pathname?.includes("/projects")) active = "projects";
  else if (pathname?.includes("/tasks")) active = "tasks";
  else if (pathname?.includes("/finance")) active = "finance";
  else if (pathname?.includes("/reports")) active = "reports";
  else if (pathname?.includes("/account")) active = "account";
  const { data: session, isPending } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const brandName = brand?.name || "OngVàng";
  const brandIcon = brand?.favicon || "/brand/ong-vang-logo.svg";

  return (
    <div className="portal-shell workspace-shell flex min-h-screen overflow-x-hidden p-0 sm:p-5">
      <div className="portal-frame workspace-frame flex min-w-0 flex-1 rounded-[18px] bg-white sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-[22px]">
        <aside
          className={cn(
            "portal-sidebar fixed inset-y-0 left-0 z-[300] flex w-[min(86vw,320px)] shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white text-slate-800 shadow-2xl transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:shadow-none lg:transition-all",
            "translate-y-0 lg:translate-x-0",
            sidebarCollapsed ? "lg:w-[86px]" : "lg:w-[260px]",
          )}
        >
          <Link
            href="/customer"
            className={cn("portal-brand flex h-20 items-center gap-3 border-b border-slate-100 px-6 transition hover:bg-orange-50/60", sidebarCollapsed && "justify-center px-0")}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
              <img src={brandIcon} alt={brandName} className="h-7 w-7 object-contain" />
            </span>
            {!sidebarCollapsed ? <div className="min-w-0">
              <p className="truncate font-semibold text-slate-950">{brandName}</p>
              <p className="text-sm text-slate-500">Customer Portal</p>
            </div> : null}
          </Link>
          <nav className="portal-nav grid gap-1 p-4">
            {nav.map((item) => {
              const Icon = item.icon;
              const activeClass = item.key === active ? "bg-orange-50 text-orange-600" : "";

              return (
                <Link key={item.href} href={item.href} className={cn("sidebar-item", activeClass, sidebarCollapsed && "justify-center px-0")}>
                  <Icon className="h-4 w-4" />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                </Link>
              );
            })}
          </nav>
          {!sidebarCollapsed ? <div className="portal-account mt-auto border-t border-slate-100 p-4">
            <Link href="/customer/account" className={`block rounded-xl p-3 transition hover:bg-orange-50 ${active === "account" ? "bg-orange-50" : "bg-slate-50"}`}>
              <p className="font-semibold text-slate-900">{customerName}</p>
              <p className="mt-1 truncate text-sm text-slate-500">{email || "Chưa có email"}</p>
            </Link>
            <div className="mt-3 flex gap-2">
              <Link href="/select-org" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors" title="Đổi Tổ chức">
                <Building2 className="h-4 w-4" />
                <span>Đổi Tổ chức</span>
              </Link>
              <LogoutButton className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors" label="Thoát" />
            </div>
          </div> : null}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="relative z-[200] flex h-16 flex-shrink-0 items-center gap-2 border-b border-slate-100 bg-white px-3 sm:gap-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 text-[15px] sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  if (window.matchMedia("(max-width: 1023px)").matches) {
                    return;
                  }
                  setSidebarCollapsed((current) => !current);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-500 shadow-sm transition hover:bg-orange-50 hover:text-orange-600"
                title="Mở menu"
                aria-label="Mở menu"
              >
                <span className="lg:hidden"><PanelLeftOpen className="h-4 w-4" /></span>
                <span className="hidden lg:inline">{sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}</span>
              </button>
              <Link href="/customer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-orange-50">
                <img src={brandIcon} alt={brandName} className="h-6 w-6 object-contain" />
              </Link>
              <h1 className="truncate font-semibold text-slate-900">{brandName}</h1>
            </div>

            <div className="mx-auto hidden max-w-sm flex-1 md:block">
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
              <button className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 sm:flex">
                <Bell className="h-4 w-4" />
              </button>
              <div className="relative">
                {!isPending && session?.user ? (
                  <button
                    type="button"
                    aria-label="Menu tài khoản"
                    aria-haspopup="menu"
                    aria-expanded={profileMenuOpen}
                    onClick={() => setProfileMenuOpen((current) => !current)}
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white shadow-sm ring-2 ring-white transition hover:ring-blue-100"
                  >
                    {session.user.image ? (
                      <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold">{session.user.name?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}</span>
                    )}
                  </button>
                ) : (
                  <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                )}
                {profileMenuOpen ? (
                  <div role="menu" className="absolute right-0 top-12 z-[450] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
                    <div className="border-b border-slate-100 px-3 pb-3 pt-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{session?.user?.name || customerName}</p>
                      <p className="truncate text-xs text-slate-500">{session?.user?.email || email || ""}</p>
                    </div>
                    <Link role="menuitem" href="/customer/account" onClick={() => setProfileMenuOpen(false)} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <UserIcon className="h-4 w-4 text-slate-500" /> Tài khoản
                    </Link>
                    <Link role="menuitem" href="/select-org" onClick={() => setProfileMenuOpen(false)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Building2 className="h-4 w-4 text-slate-500" /> Đổi Tổ chức
                    </Link>
                    <LogoutButton className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50" label="Thoát tài khoản" />
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="portal-main scrollable flex-1 overflow-y-auto bg-[#f8fafc]">
            <div className="portal-content mx-auto grid max-w-7xl gap-5 p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function PortalMissingContact({ email }: { email?: string | null }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Chưa liên kết khách hàng</h1>
        <p className="mt-3 text-sm text-slate-500">
          Tài khoản {email || "này"} chưa được gắn với hồ sơ khách hàng trong workspace.
        </p>
      </section>
    </div>
  );
}

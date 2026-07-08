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

import { CommandMenu } from "@/components/CommandMenu";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const brandName = brand?.name || "OngVàng";
  const brandIcon = brand?.favicon || "/brand/ong-vang-logo.svg";

  return (
    <div className="flex h-screen w-full bg-white text-black selection:bg-black selection:text-white font-sans overflow-hidden">
      
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Vercel Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col overflow-y-auto border-r border-[#eaeaea] bg-white transition-all duration-300 lg:relative lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "w-[80px]" : "w-[260px]",
        )}
      >
        <div className={cn("flex h-16 shrink-0 items-center border-b border-[#eaeaea]", sidebarCollapsed ? "justify-center px-0" : "px-4")}>
          <Link
            href="/customer"
            className={cn(
              "flex items-center rounded-lg transition-colors hover:bg-gray-100",
              sidebarCollapsed ? "justify-center p-2" : "w-full justify-between p-2"
            )}
          >
            <div className="flex items-center gap-3 group">
              <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-black to-gray-700 text-white shadow-md transition-transform group-active:scale-95">
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" shapeRendering="geometricPrecision">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              {!sidebarCollapsed ? (
                <div className="flex flex-col text-left">
                  <span className="text-[17px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-600 leading-none">Customer</span>
                  <span className="text-[11px] font-semibold text-gray-400 mt-1 leading-none uppercase tracking-widest">Portal</span>
                </div>
              ) : null}
            </div>
            {!sidebarCollapsed ? (
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" shapeRendering="geometricPrecision" className="text-gray-400">
                <path d="M17 8.517L12 3 7 8.517M7 15.48l5 5.515 5-5.515"></path>
              </svg>
            ) : null}
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;

            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "group relative flex items-center gap-4 rounded-xl px-4 py-3 text-[16px] transition-colors",
                  isActive ? "bg-black text-white font-medium shadow-md" : "text-gray-600 hover:text-black hover:bg-gray-100",
                  sidebarCollapsed && "justify-center px-0 w-12 h-12 mx-auto gap-0"
                )}
              >
                <Icon className={cn("shrink-0", sidebarCollapsed ? "h-6 w-6" : "h-[22px] w-[22px]")} />
                {!sidebarCollapsed ? <span>{item.label}</span> : null}
                
                {/* Instant CSS Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="pointer-events-none absolute left-full ml-3 rounded-md bg-black px-2.5 py-1.5 text-[13px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 z-[100] whitespace-nowrap shadow-md">
                    {item.label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[4px] border-transparent border-r-black"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        {!sidebarCollapsed ? (
          <div className="p-4 mt-auto">
            <div className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-b from-orange-50/50 to-white p-5 text-left transition-all hover:shadow-md hover:shadow-orange-100/50">
              <div className="absolute right-0 top-0 -mr-6 -mt-6 h-32 w-32 rounded-full bg-orange-100/40 blur-2xl transition-all group-hover:bg-orange-200/40" />
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 shadow-sm border border-orange-200">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <div>
                  <p className="text-[15px] font-bold tracking-tight text-gray-900">Quản lý tập trung</p>
                  <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-gray-500">Tất cả dự án và thông tin thanh toán tại một nơi.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col bg-white overflow-hidden">
        
        {/* Vercel Header */}
        <header className="relative z-40 flex h-16 shrink-0 items-center gap-4 border-b border-[#eaeaea] bg-white px-6">
          <div className="flex min-w-0 items-center gap-4">
            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-gray-500 hover:text-black hover:bg-gray-50 transition-colors lg:hidden shrink-0"
              title="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            
            {/* Mobile Branding */}
            <Link href="/customer" className="flex items-center gap-2.5 lg:hidden group">
              <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-black to-gray-700 text-white shadow-md transition-transform group-active:scale-95">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" shapeRendering="geometricPrecision">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[15px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-600 leading-none">Customer</span>
                <span className="text-[10px] font-semibold text-gray-400 mt-0.5 leading-none uppercase tracking-widest">Portal</span>
              </div>
            </Link>

            {/* Desktop Toggle */}
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden h-8 w-8 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-gray-500 hover:text-black hover:bg-gray-50 transition-colors lg:flex shrink-0"
              title="Toggle Desktop Menu"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <div className="mx-auto hidden max-w-sm flex-1 md:block" onClick={() => setCommandOpen(true)}>
            <div className="relative cursor-pointer group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-full rounded-md border border-[#eaeaea] bg-white pl-10 pr-12 text-[14px] text-black placeholder:text-gray-400 group-hover:border-black cursor-pointer focus:outline-none transition-colors"
                readOnly
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 border border-[#eaeaea] rounded px-1.5 py-0.5 text-[10px] text-gray-400 bg-gray-50 font-medium group-hover:border-black group-hover:text-black transition-colors">⌘K</kbd>
            </div>
          </div>

          <div className="relative ml-auto flex items-center gap-4">
            <button className="relative hidden h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:text-black hover:bg-gray-50 transition-colors sm:flex">
              <Bell className="h-4 w-4" />
            </button>
            
            <div className="relative">
              {!isPending && session?.user ? (
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((current) => !current)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-black text-white border border-[#eaeaea] transition-transform hover:scale-105"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[13px] font-medium uppercase">{session.user.name?.charAt(0) || <UserIcon className="h-4 w-4" />}</span>
                  )}
                </button>
              ) : (
                <div className="h-9 w-9 rounded-full bg-gray-100 animate-pulse border border-[#eaeaea]" />
              )}
              
              {profileMenuOpen ? (
                <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[#eaeaea] bg-white p-2 shadow-2xl">
                  <div className="border-b border-[#eaeaea] px-3 pb-3 pt-2">
                    <p className="truncate text-[14px] font-medium text-black">{session?.user?.name || customerName}</p>
                    <p className="truncate text-[12px] text-gray-500">{session?.user?.email || email || ""}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/customer/account" onClick={() => setProfileMenuOpen(false)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
                      <UserIcon className="h-4 w-4" /> Tài khoản
                    </Link>
                    <Link href="/select-org" onClick={() => setProfileMenuOpen(false)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
                      <Building2 className="h-4 w-4" /> Đổi Tổ chức
                    </Link>
                  </div>
                  <div className="border-t border-[#eaeaea] pt-1">
                    <LogoutButton className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors" label="Đăng xuất" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-[#fafafa]">
          {children}
        </main>
      </div>

      {/* Global Command Menu */}
      <CommandMenu open={commandOpen} setOpen={setCommandOpen} />
    </div>
  );
}

export function PortalMissingContact({ email }: { email?: string | null }) {
  return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center font-sans">
      <section className="w-full max-w-lg rounded-2xl border border-[#eaeaea] bg-white p-12 text-center">
        <h1 className="text-[24px] font-medium tracking-tight text-black">Chưa liên kết khách hàng</h1>
        <p className="mt-4 text-[15px] text-gray-500">
          Tài khoản <span className="text-black font-medium">{email || "này"}</span> chưa được gắn với hồ sơ khách hàng trong workspace.
        </p>
      </section>
    </div>
  );
}

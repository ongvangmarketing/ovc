import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  ReceiptText,
} from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";

const nav = [
  { href: "/portal", label: "Tổng quan", icon: LayoutDashboard, key: "overview" },
  { href: "/portal/projects", label: "Dự án", icon: FolderKanban, key: "projects" },
  { href: "/portal/tasks", label: "Nhiệm vụ", icon: ClipboardList, key: "tasks" },
  { href: "/portal/finance", label: "Tài chính", icon: ReceiptText, key: "finance" },
  { href: "/portal/reports", label: "Báo cáo", icon: BarChart3, key: "reports" },
];

export function PortalShell({
  active,
  customerName,
  email,
  children,
}: {
  active: string;
  customerName: string;
  email?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="portal-shell workspace-shell flex min-h-screen overflow-hidden p-5">
      <div className="portal-frame workspace-frame flex min-h-0 flex-1 rounded-[22px] bg-white">
        <aside className="portal-sidebar flex w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-950">OngVàng</p>
              <p className="text-sm text-slate-500">Customer Portal</p>
            </div>
          </div>
          <nav className="portal-nav grid gap-1 p-4">
            {nav.map((item) => {
              const Icon = item.icon;
              const activeClass = item.key === active ? "bg-orange-50 text-orange-600" : "";

              return (
                <Link key={item.href} href={item.href} className={`sidebar-item ${activeClass}`}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="portal-account mt-auto border-t border-slate-100 p-4">
            <Link href="/portal/account" className={`block rounded-xl p-3 transition hover:bg-orange-50 ${active === "account" ? "bg-orange-50" : "bg-slate-50"}`}>
              <p className="font-semibold text-slate-900">{customerName}</p>
              <p className="mt-1 truncate text-sm text-slate-500">{email || "Chưa có email"}</p>
            </Link>
            <LogoutButton className="mt-3 flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600" label="Đổi tài khoản" />
          </div>
        </aside>

        <main className="portal-main scrollable flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="portal-content mx-auto grid max-w-7xl gap-5 p-6">{children}</div>
        </main>
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

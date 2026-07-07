import Link from "next/link";
import { Bell, ChevronRight, LogOut, Building2 } from "lucide-react";

import { db } from "@/lib/db";

type PortalTopbarProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  roleLabel: string;
  parentLabel?: string;
  homeHref: string;
  accent: "emerald" | "blue";
};

export async function PortalTopbar({ user, roleLabel, parentLabel, homeHref, accent }: PortalTopbarProps) {
  const unread = await db.notification.count({ where: { userId: user.id, read: false } });
  const initials = (user.name || user.email || "OV")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const tone = accent === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700";
  const buttonTone = accent === "emerald" ? "hover:bg-emerald-50 hover:text-emerald-700" : "hover:bg-blue-50 hover:text-blue-700";

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/78 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <Link href={homeHref} className="hidden items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-950 sm:flex">
          {parentLabel || "LMS Portal"}
          <ChevronRight className="h-4 w-4" />
          <span className="text-slate-950">{roleLabel}</span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-3">
          <Link href={accent === "emerald" ? "/instructor/grading" : "/student/messages"} className={`relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-100 transition ${buttonTone}`}>
            <Bell className="h-5 w-5" />
            {unread ? <span className={`absolute -right-1 -top-1 min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-black ${tone}`}>{unread}</span> : null}
          </Link>

          <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black ${tone}`}>{initials || "OV"}</div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-bold text-slate-950">{user.name || "OVC User"}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <Link href="/select-org" className={`inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-100 transition ${buttonTone}`} title="Đổi Tổ chức">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Đổi Tổ chức</span>
          </Link>

          <Link href="/api/logout" className={`inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-100 transition ${buttonTone}`}>
            <LogOut className="h-4 w-4" />
            Thoát
          </Link>
        </div>
      </div>
    </header>
  );
}

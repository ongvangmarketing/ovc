import Link from "next/link";
import { Bell, LogOut, Building2 } from "lucide-react";

import { db } from "@/lib/db";

type PortalTopbarProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
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

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#eaeaea] bg-white px-6 font-sans">
      <div className="flex items-center gap-3 text-[14px] font-medium tracking-tight">
        <Link href={homeHref} className="text-gray-500 hover:text-black transition-colors">
          {parentLabel || "Ong Vàng Cloud"}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-black">{roleLabel}</span>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          href="/select-org" 
          className="hidden sm:flex h-9 items-center justify-center gap-2 rounded-md px-3 text-[13px] font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
          title="Đổi Tổ chức"
        >
          <Building2 className="h-4 w-4" />
          <span>Đổi Tổ chức</span>
        </Link>

        <Link 
          href={accent === "emerald" ? "/instructor/grading" : "/student/messages"} 
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread ? (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          ) : null}
        </Link>

        <div className="h-4 w-[1px] bg-[#eaeaea] mx-1"></div>

        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-[#eaeaea] text-[11px] font-medium text-black">
            {user.image ? (
              <img src={user.image} alt={user.name || "Avatar"} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          
          <Link 
            href="/api/logout" 
            className="flex h-9 items-center justify-center rounded-md px-2 text-[13px] font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>
    </header>
  );
}

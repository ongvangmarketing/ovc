"use client";

import Link from "next/link";
import { Bell, LogOut, Building2, User as UserIcon } from "lucide-react";
import { useState } from "react";

type PortalTopbarClientProps = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  initials: string;
  roleLabel: string;
  parentLabel?: string;
  homeHref: string;
  accent: "emerald" | "blue";
  unreadCount: number;
};

export function PortalTopbarClient({ 
  user, 
  initials, 
  roleLabel, 
  parentLabel, 
  homeHref, 
  accent, 
  unreadCount 
}: PortalTopbarClientProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
          className="hidden sm:flex h-9 items-center justify-center gap-2 rounded-md px-3 text-[13px] font-medium uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
          title="Đổi Tổ chức"
        >
          <Building2 className="h-4 w-4" />
          <span>ĐỔI TỔ CHỨC</span>
        </Link>

        <Link 
          href={accent === "emerald" ? "/instructor/grading" : "/student/messages"} 
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
          ) : null}
        </Link>

        <div className="h-4 w-[1px] bg-[#eaeaea] mx-1"></div>

        <div className="relative flex items-center">
          <button 
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-[#eaeaea] text-[11px] font-medium text-black hover:ring-2 hover:ring-gray-200 transition-all cursor-pointer"
          >
            {user.image ? (
              <img src={user.image} alt={user.name || "Avatar"} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </button>
          
          {profileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setProfileMenuOpen(false)}
              ></div>
              <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[#eaeaea] bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100">
                <div className="border-b border-[#eaeaea] px-3 pb-3 pt-2">
                  <p className="truncate text-[14px] font-medium text-black">{user.name || "Customer User"}</p>
                  <p className="truncate text-[12px] text-gray-500">{user.email || ""}</p>
                </div>
                <div className="py-1 border-b border-[#eaeaea]">
                  <Link href="/customer/account" onClick={() => setProfileMenuOpen(false)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
                    <UserIcon className="h-4 w-4" /> 
                    <div className="flex flex-col text-left">
                      <span>Tài khoản</span>
                      <span className="text-[11px] text-gray-400 font-normal mt-0.5">Để chỉnh sửa tài khoản</span>
                    </div>
                  </Link>
                </div>
                <div className="pt-1">
                  <Link href="/api/logout" onClick={() => setProfileMenuOpen(false)} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" /> Thoát
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

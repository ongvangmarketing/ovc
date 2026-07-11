"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Info, LayoutGrid, Key, CalendarClock, Code2, BookmarkCheck } from "lucide-react";

export default function HotelNavigation({ hotelId }: { hotelId: string }) {
  const pathname = usePathname();

  const baseUrl = `/workspace/traveling/hotels/${hotelId}`;

  const navItems = [
    { name: "Dashboard", href: baseUrl, icon: LayoutGrid, exact: true },
    { name: "Lịch & Giá", href: `${baseUrl}/schedule`, icon: CalendarClock, exact: false },
    { name: "Quản lý Đặt phòng", href: `${baseUrl}/bookings`, icon: BookmarkCheck, exact: false },
    { name: "Hạng phòng", href: `${baseUrl}/room-types`, icon: LayoutGrid, exact: false },
    { name: "Cài đặt chỗ nghỉ", href: `${baseUrl}/settings`, icon: Info, exact: false },
    { name: "Công cụ bán hàng", href: `${baseUrl}/embeds`, icon: Code2, exact: false },
  ];

  return (
    <nav className="space-y-1 p-4">
      {navItems.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors ${
              isActive
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Settings, DollarSign, Image as ImageIcon } from "lucide-react";

export default function TourNavigation({ tourId }: { tourId: string }) {
  const pathname = usePathname();

  const links = [
    {
      name: "Tổng quan",
      href: `/agent/tours/${tourId}/overview`,
      icon: LayoutDashboard,
      isActive: pathname === `/agent/tours/${tourId}/overview`
    },
    {
      name: "Lịch trình",
      href: `/agent/tours/${tourId}/itinerary`,
      icon: CalendarDays,
      isActive: pathname === `/agent/tours/${tourId}/itinerary`
    },
    {
      name: "Lịch & Chỗ",
      href: `/agent/tours/${tourId}/schedule`,
      icon: CalendarDays,
      isActive: pathname === `/agent/tours/${tourId}/schedule`
    },
    {
      name: "Cài đặt & Bảng giá",
      href: `/agent/tours/${tourId}/settings`,
      icon: Settings,
      isActive: pathname === `/agent/tours/${tourId}/settings`
    },
  ];

  return (
    <nav className="flex space-x-1 border-b border-[#eaeaea] bg-white px-6">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);

        return (
          <Link
            key={link.name}
            href={link.href}
            className={`
              flex items-center gap-2 border-b-2 px-4 py-4 text-[14px] font-medium transition-colors
              ${
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-gray-400"}`} />
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}

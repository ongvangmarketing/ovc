"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { label: "Tổng quan", href: "/workspace/social-marketing", icon: LayoutDashboard },
  { label: "Facebook Ads", href: "/workspace/social-marketing/facebook", icon: BarChart3 },
  { label: "Facebook Page", href: "/workspace/social-marketing/facebook-page", icon: FileText },
];

export function SocialMarketingTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 rounded-lg border border-gray-200 bg-white p-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.href === "/workspace/social-marketing"
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-gray-500 transition hover:bg-orange-50 hover:text-orange-600",
              active && "bg-orange-50 text-orange-600"
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

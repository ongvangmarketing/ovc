"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { 
  Building2, Globe, Hash, CreditCard, Settings, 
  ShieldCheck, Server, Mail, ScrollText, Bell, Archive, 
  Braces, Activity, Wrench, Users, Database, KeyRound, Palette
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { LucideIcon } from "lucide-react";

type SettingsSidebarLink =
  | { label: string; group: true; href?: never; icon?: never; tab?: never }
  | { href: string; label: string; icon: LucideIcon; tab?: string; group?: false };

export function SettingsSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  const links: SettingsSidebarLink[] = [
    { label: "Cấu hình chung (Hub)", group: true },
    { href: "/workspace/settings/organization", label: "Hồ sơ doanh nghiệp", icon: Building2 },
    { href: "/workspace/settings/domains", label: "Tên miền", icon: Globe },
    
    { label: "Thiết lập hệ thống", group: true },
    { href: "/workspace/settings/auto-code", label: "Cài đặt sinh mã", icon: Hash },
    { href: "/workspace/settings/payment", label: "Cài đặt thanh toán", icon: CreditCard },
    { href: "/workspace/settings?tab=security", label: "Bảo mật", icon: ShieldCheck, tab: "security" },
    { href: "/workspace/settings?tab=email", label: "Hệ thống Email", icon: Server, tab: "email" },
    { href: "/workspace/settings/email-templates", label: "Mẫu Email", icon: Mail },
    { href: "/workspace/settings?tab=email-logs", label: "Email Logs", icon: ScrollText, tab: "email-logs" },
    { href: "/workspace/settings?tab=notifications", label: "Thông báo", icon: Bell, tab: "notifications" },
    { href: "/workspace/settings?tab=backup", label: "Sao lưu", icon: Archive, tab: "backup" },
    { href: "/workspace/settings?tab=integrations", label: "Tích hợp API", icon: Braces, tab: "integrations" },
    { href: "/workspace/settings?tab=logs", label: "Nhật ký hệ thống", icon: Activity, tab: "logs" },
    { href: "/workspace/settings?tab=tools", label: "Công cụ", icon: Wrench, tab: "tools" },

    { label: "Quản lý tổ chức", group: true },
    { href: "/workspace/settings?tab=members", label: "Thành viên", icon: Users, tab: "members" },
    { href: "/workspace/settings?tab=departments", label: "Phòng ban", icon: Database, tab: "departments" },
    { href: "/workspace/settings?tab=roles", label: "Vai trò", icon: KeyRound, tab: "roles" },
  ];

  return (
    <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col h-full overflow-y-auto hidden md:flex shrink-0">
      <div className="p-4 flex flex-col gap-1">
        {links.map((link, idx) => {
          if (link.group) {
            return (
              <div key={`group-${idx}`} className="px-3 py-2 mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                {link.label}
              </div>
            );
          }

          const Icon = link.icon!;
          let isActive = pathname === link.href;
          
          if (link.tab) {
            isActive = pathname === "/workspace/settings" && currentTab === link.tab;
          } else if (link.href === "/workspace/settings" && !currentTab) {
            isActive = pathname === "/workspace/settings" && !currentTab;
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

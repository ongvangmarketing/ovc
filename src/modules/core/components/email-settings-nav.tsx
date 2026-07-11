"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Settings as SettingsIcon, Inbox, LayoutTemplate, ScrollText, ArrowLeft } from "lucide-react";

export function EmailSettingsNav() {
  const pathname = usePathname();

  const links = [
    { id: "email", label: "Cấu hình Email", href: "/workspace/settings/email", icon: SettingsIcon },
    { id: "mailbox", label: "Cài đặt Mailbox", href: "/workspace/settings/mailbox", icon: Inbox },
    { id: "templates", label: "Mẫu Email", href: "/workspace/settings/email-templates", icon: LayoutTemplate },
    { id: "email-logs", label: "Email Logs", href: "/workspace/settings/email-logs", icon: ScrollText },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Link 
          href="/workspace/settings"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black transition-colors border border-[#eaeaea]"
          title="Quay lại Cài đặt chung"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
          Quản lý Email
        </span>
      </div>
      
      <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
        <span className="text-black">Hệ thống Email,</span>{" "}
        <span className="text-gray-400">giao tiếp và lịch sử.</span>
      </h1>
      <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl mb-8">
        Quản lý thiết lập SMTP, kết nối hộp thư, tùy biến giao diện mẫu và xem lịch sử gửi nhận của toàn bộ workspace.
      </p>

      <div className="flex items-center gap-4 border-b border-[#eaeaea] pb-4 overflow-x-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-[14px] font-medium rounded-full transition-colors whitespace-nowrap",
                isActive ? "bg-black text-white" : "text-gray-500 hover:bg-gray-100 hover:text-black"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

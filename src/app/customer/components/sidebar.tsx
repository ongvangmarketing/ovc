"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, ReceiptText, CreditCard, UserCircle2 } from "lucide-react";

const nav = [
  { label: "Bảng điều khiển", href: "/customer", icon: LayoutDashboard },
  { label: "Dự án", href: "/customer/projects", icon: FolderKanban },
  { label: "Tài chính", href: "/customer/finance", icon: CreditCard },
  { label: "Nhiệm vụ", href: "/customer/tasks", icon: ReceiptText },
];

export function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col border-r border-[#eaeaea] bg-white lg:flex font-sans">
      <div className="px-6 py-8">
        <Link href="/customer" className="flex items-center gap-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-105">
            <UserCircle2 className="h-6 w-6" />
          </div>
          <div>
            <strong className="block text-[18px] font-medium tracking-tight text-black">Customer</strong>
            <span className="text-[13px] text-gray-500">Trung tâm Khách hàng</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-6 py-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/customer" && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-[15px] transition-colors ${
                isActive 
                  ? "bg-black text-white font-medium" 
                  : "text-gray-500 hover:text-black hover:bg-gray-50"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6">
        <div className="rounded-xl border border-[#eaeaea] bg-white p-5">
          <p className="text-[14px] font-medium tracking-tight text-black">Quản lý dự án tập trung</p>
          <p className="mt-2 text-[13px] text-gray-500 leading-relaxed">Tất cả thông tin dự án và thanh toán tại một nơi.</p>
        </div>
      </div>
    </aside>
  );
}

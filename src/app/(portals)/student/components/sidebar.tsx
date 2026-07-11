"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, ClipboardCheck, GraduationCap, LayoutDashboard, MessageCircle, Trophy } from "lucide-react";

const nav = [
  { label: "Tổng quan", href: "/student", icon: LayoutDashboard },
  { label: "Khóa học của tôi", href: "/student/courses", icon: BookOpen },
  { label: "Lịch học live", href: "/student/schedule", icon: CalendarDays },
  { label: "Bài tập", href: "/student/assignments", icon: ClipboardCheck },
  { label: "Chứng chỉ", href: "/student/certificates", icon: Trophy },
  { label: "Trao đổi", href: "/student/messages", icon: MessageCircle },
];

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] flex-col border-r border-slate-200 bg-white shadow-sm lg:flex">
      <div className="p-6">
        <Link href="/student" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <strong className="block text-lg font-bold text-slate-900">OVC Student</strong>
            <span className="text-xs font-medium text-slate-500">Learning Portal</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 px-4 py-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-900">Học đều mỗi ngày</p>
          <p className="mt-1.5 text-xs text-slate-500">Ứng dụng theo dõi tiến độ, lịch học và bài tập của bạn.</p>
        </div>
      </div>
    </aside>
  );
}

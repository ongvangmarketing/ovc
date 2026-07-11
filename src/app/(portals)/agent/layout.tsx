import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Map, Car, Ticket, LayoutDashboard, LogOut, Settings } from "lucide-react";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";

export const metadata: Metadata = {
  title: "Agent Portal | OVC Traveling",
  description: "Quản lý dịch vụ Traveling dành cho đại lý.",
};

const navigation = [
  { name: "Tổng quan", href: "/agent", icon: LayoutDashboard, perm: null },
  { name: "Quản lý Đơn hàng", href: "/agent/bookings", icon: Building2, perm: null },
  { name: "Khách sạn & Phòng", href: "/agent/hotels", icon: Building2, perm: "TRAVELING_HOTEL" },
  { name: "Tour Du Lịch", href: "/agent/tours", icon: Map, perm: "TRAVELING_TOUR" },
  { name: "Cho Thuê Xe", href: "/agent/vehicles", icon: Car, perm: "TRAVELING_CAR" },
  { name: "Vé Dịch Vụ", href: "/agent/tickets", icon: Ticket, perm: "TRAVELING_TICKET" },
  { name: "Cài đặt", href: "/agent/settings", icon: Settings, perm: null },
];

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  let authData;
  try {
    authData = await requireAuth();
  } catch (error) {
    // If requireAuth throws (e.g. Unauthorized), we redirect
  }
  
  if (!authData) {
    redirect("/auth/sign-in");
  }

  if (authData.user.role !== "AGENT" && authData.user.role !== "SUPER_ADMIN") {
    redirect("/select-org");
  }

  const { db } = await import("@/lib/db");
  const [org, orgMember] = await Promise.all([
    db.organization.findUnique({
      where: { id: authData.organizationId },
      select: { activeModules: true }
    }),
    db.organizationMember.findFirst({
      where: {
        organizationId: authData.organizationId,
        userId: authData.user.id
      },
      select: { permissions: true }
    })
  ]);
  
  const activeModules = org?.activeModules || [];
  const agentPermissions = orgMember?.permissions || [];
  const isSuperAdmin = authData.user.role === "SUPER_ADMIN";

  const filteredNav = navigation.filter(item => {
    if (!item.perm) return true;
    
    // Check if the parent organization has the module active
    const orgHasModule = activeModules.includes(item.perm) || 
      (item.perm === "TRAVELING_TICKET" && activeModules.includes("TRAVELING_EVENT"));
      
    // Check if the agent was granted permission by the admin
    const agentHasPermission = isSuperAdmin || agentPermissions.includes(item.perm);

    return orgHasModule && agentHasPermission;
  });
  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-orange-500 rounded-md">
              <span className="text-white text-[14px] font-bold">O</span>
            </div>
            <span className="text-[15px] font-semibold text-slate-800">Agent Portal</span>
          </div>
        </div>
        <div className="flex-1 py-6 overflow-y-auto">
          <div className="px-4 mb-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-3">Bảng điều khiển</div>
            <nav className="space-y-1">
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/auth/sign-out"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4 text-slate-400" />
            Đăng xuất
          </Link>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        {children}
      </main>
    </div>
  );
}

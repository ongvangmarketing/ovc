import Link from "next/link";
import { Building2, Gauge, ShieldCheck, Users } from "lucide-react";

import { requireSuperAdmin } from "@/lib/auth/rbac";

const navItems = [
  { label: "Tổng quan", href: "/admin", icon: <Gauge className="h-4 w-4" /> },
  { label: "Tổ chức", href: "/admin/organizations", icon: <Building2 className="h-4 w-4" /> },
  { label: "Admins", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Licensing", href: "/admin/organizations", icon: <ShieldCheck className="h-4 w-4" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-950 p-4 text-white">
        <div className="mb-6 px-2">
          <p className="text-xs font-semibold uppercase text-orange-300">Ong Vàng</p>
          <h2 className="mt-1 text-xl font-bold">Admin</h2>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/10 hover:text-white"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}

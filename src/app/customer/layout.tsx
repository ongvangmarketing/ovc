import Link from "next/link";
import { requireCustomerPortal } from "@/lib/auth/rbac";
import { PortalTopbar } from "@/components/training/portal-topbar";
import { CustomerSidebar } from "./components/sidebar";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireCustomerPortal();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <CustomerSidebar />

      <main className="flex-1 lg:pl-[280px]">
        <PortalTopbar user={session.user} roleLabel="Customer Portal" parentLabel="Ong Vàng Cloud" homeHref="/customer" accent="blue" />
        <div className="min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>
    </div>
  );
}

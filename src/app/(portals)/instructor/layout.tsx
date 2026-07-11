import { requireInstructorPortal } from "@/lib/auth/rbac";
import { PortalTopbar } from "@/components/training/portal-topbar";
import { InstructorSidebar } from "./components/sidebar";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const session = await requireInstructorPortal();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <InstructorSidebar />

      <main className="lg:pl-[280px]">
        <PortalTopbar user={session.user} roleLabel="Instructor" homeHref="/instructor" accent="emerald" />
        <div className="min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>
    </div>
  );
}

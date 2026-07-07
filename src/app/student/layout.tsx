import { requireStudentPortal } from "@/lib/auth/rbac";
import { PortalTopbar } from "@/components/training/portal-topbar";
import { StudentSidebar } from "./components/sidebar";

export default async function NewStudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStudentPortal();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <StudentSidebar />

      <main className="lg:pl-[280px]">
        <PortalTopbar user={session.user} roleLabel="Student" homeHref="/student" accent="blue" />
        <div className="min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { Building2, CheckCircle2, Settings2, Users } from "lucide-react";
import { getOrganizations } from "@/app/actions/organizations";
import { requireSuperAdmin } from "@/lib/auth/rbac";

export default async function SuperAdminPage() {
  await requireSuperAdmin();
  const organizations = await getOrganizations();

  const activeOrganizations = organizations.filter((org) => org.isActive).length;
  const totalMembers = organizations.reduce((sum, org) => sum + org._count.members, 0);
  const enabledModules = organizations.reduce((sum, org) => sum + (org.activeModules?.length || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Super Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Quản trị tổ chức, quyền truy cập và cấu hình module trên toàn hệ thống.</p>
        </div>
        <Link
          href="/admin/organizations"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <Settings2 className="h-4 w-4" />
          Cấu hình tổ chức
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<Building2 className="h-5 w-5" />} label="Tổ chức" value={organizations.length} hint={`${activeOrganizations} đang hoạt động`} />
        <Metric icon={<Users className="h-5 w-5" />} label="Thành viên" value={totalMembers} hint="Tổng user trong workspace" />
        <Metric icon={<CheckCircle2 className="h-5 w-5" />} label="Module bật" value={enabledModules} hint="Tính trên mọi tổ chức" />
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold text-gray-950">Tổ chức gần đây</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {organizations.slice(0, 6).map((org) => (
            <div key={org.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <div className="font-medium text-gray-950">{org.name}</div>
                <div className="text-sm text-gray-500">{org.slug} · {org.owner.email}</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium uppercase text-gray-700">{org.plan}</span>
                <span className={org.isActive ? "text-emerald-600" : "text-red-600"}>
                  {org.isActive ? "Đang hoạt động" : "Tạm khóa"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3 text-gray-500">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <strong className="mt-4 block text-3xl text-gray-950">{value}</strong>
      <p className="mt-1 text-sm text-gray-500">{hint}</p>
    </div>
  );
}

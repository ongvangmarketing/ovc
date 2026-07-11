import { Building2, Save } from "lucide-react";
import {
  createOrganization,
  getOrganizations,
  getPlatformProvisioningOptions,
} from "@/actions/organizations";
import { OrganizationTable } from "./_components/organization-table";

export default async function SuperAdminOrganizationsPage() {
  const [{ modules, plans }, organizations] = await Promise.all([
    getPlatformProvisioningOptions(),
    getOrganizations(),
  ]);

  const activeOrganizations = organizations.filter((org) => org.isActive).length;
  const totalLicenses = organizations.reduce(
    (sum, org) => sum + org.moduleLicenses.filter((license) => license.enabled).length,
    0
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Platform Provisioning</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">Cấu hình tổ chức</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin workspace, gói sử dụng, license module và trạng thái cấp quyền.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="block text-slate-500">Tổ chức</span>
            <span className="font-semibold text-slate-900">{organizations.length} ({activeOrganizations} active)</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="block text-slate-500">Licenses</span>
            <span className="font-semibold text-slate-900">{totalLicenses} active</span>
          </div>
        </div>
      </div>

      <form action={createOrganization} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-950">Thêm tổ chức mới</h2>
            <p className="text-sm text-gray-500">Owner email phải là user đã có trong hệ thống.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Tên tổ chức</label>
            <input name="name" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Slug</label>
            <input name="slug" required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email Owner</label>
            <input name="ownerEmail" required type="email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Gói dịch vụ</label>
            <select name="plan" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
              {plans.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
            <Save className="h-4 w-4" />
            Tạo tổ chức
          </button>
        </div>
      </form>

      <OrganizationTable 
        organizations={organizations} 
        modules={modules}
        plans={plans}
      />
    </div>
  );
}

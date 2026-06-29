import {
  Building2,
  CheckCircle2,
  Circle,
  Clock3,
  Database,
  KeyRound,
  Layers3,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import {
  createOrganization,
  deleteOrganization,
  getOrganizations,
  getPlatformProvisioningOptions,
  toggleOrganizationModule,
  updateOrganization,
} from "@/app/actions/organizations";
import { defaultModuleCodes, normalizeModuleCode, type PlatformModuleCode } from "@/lib/modules/registry";

const statusLabels: Record<string, string> = {
  ACTIVE: "Đang cấp",
  TRIALING: "Dùng thử",
  SUSPENDED: "Tạm khóa",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
};

const categoryLabels: Record<string, string> = {
  WORKSPACE: "Bàn làm việc",
  CRM: "Khách hàng",
  FINANCE: "Tài chính",
  PROJECT: "Dự án",
  EDUCATION: "Đào tạo",
  MARKETING: "Marketing",
  WEBSITE: "Website",
  AUTOMATION: "Tự động hóa",
  AI: "AI",
  SUPPORT: "Hỗ trợ",
  SYSTEM: "Hệ thống",
};

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
        <div className="grid min-w-[360px] grid-cols-3 gap-3">
          <Metric label="Tổ chức" value={organizations.length} hint={`${activeOrganizations} active`} />
          <Metric label="License" value={totalLicenses} hint="Module đang bật" />
          <Metric label="Module" value={modules.length} hint="Nền tảng" />
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

        <OrganizationFields plans={plans} />
        <ModuleMatrix modules={modules} />

        <div className="mt-5 flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
            <Save className="h-4 w-4" />
            Tạo tổ chức
          </button>
        </div>
      </form>

      <div className="space-y-5">
        {organizations.map((org) => {
          const licenseByCode = new Map(
            org.moduleLicenses
              .map((license) => {
                const code = normalizeModuleCode(license.module.code);
                return code ? [code, license] : null;
              })
              .filter(Boolean) as Array<[PlatformModuleCode, (typeof org.moduleLicenses)[number]]>
          );

          const legacyActiveCodes = org.activeModules
            .map((code) => normalizeModuleCode(code))
            .filter((code): code is PlatformModuleCode => Boolean(code));

          const activeCodes = new Set<PlatformModuleCode>(
            org.moduleLicenses.length > 0
              ? Array.from(licenseByCode.entries())
                  .filter(([, license]) => license.enabled && ["ACTIVE", "TRIALING"].includes(license.status))
                  .map(([code]) => code)
              : legacyActiveCodes
          );

          const enabledCount = Array.from(activeCodes).length;
          const primaryPlan = org.moduleLicenses.find((license) => license.plan)?.plan;

          return (
            <section key={org.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-gray-950">{org.name}</h2>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {org.slug} · Owner: {org.owner.email} · {org._count.members} thành viên
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-gray-700 ring-1 ring-gray-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {primaryPlan?.name || org.plan}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-gray-700 ring-1 ring-gray-200">
                      <Layers3 className="h-3.5 w-3.5" />
                      {enabledCount}/{modules.length} module
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 ${
                        org.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {org.isActive ? "Đang hoạt động" : "Tạm khóa"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <form action={updateOrganization.bind(null, org.id)} className="space-y-5">
                  <OrganizationFields organization={org} plans={plans} />
                  <ModuleMatrix modules={modules} licenseByCode={licenseByCode} fallbackActiveCodes={activeCodes} />

                  <div className="flex flex-wrap justify-end gap-3">
                    <button className="inline-flex items-center gap-2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800">
                      <Save className="h-4 w-4" />
                      Lưu cấu hình
                    </button>
                  </div>
                </form>

                <aside className="space-y-4">
                  <ProvisioningCard
                    title="Provisioning"
                    icon={<Database className="h-4 w-4" />}
                    rows={[
                      ["Contacts", org._count.contacts.toString()],
                      ["Projects", org._count.projects.toString()],
                      ["Usage rows", org._count.moduleUsage.toString()],
                    ]}
                  />

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-950">
                      <KeyRound className="h-4 w-4 text-orange-600" />
                      Bật nhanh module
                    </div>
                    <div className="space-y-2">
                      {modules.map((module) => {
                        const code = normalizeModuleCode(module.code);
                        const enabled = code ? activeCodes.has(code) : false;

                        return (
                          <form key={module.id} action={toggleOrganizationModule.bind(null, org.id, module.code)}>
                            <button
                              type="submit"
                              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                                enabled
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                              }`}
                            >
                              <span className="font-medium">{module.name}</span>
                              {enabled ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  </div>

                  <form action={deleteOrganization.bind(null, org.id)}>
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                      Xóa tổ chức
                    </button>
                  </form>
                </aside>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function OrganizationFields({
  organization,
  plans,
}: {
  organization?: {
    name: string;
    slug: string;
    website: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    description: string | null;
    plan: string;
    isActive: boolean;
    owner?: { email: string };
  };
  plans: Array<{ code: string; name: string }>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <Field label="Tên tổ chức" name="name" defaultValue={organization?.name} required />
      <Field label="Slug" name="slug" defaultValue={organization?.slug} required />
      <Field
        label="Owner email"
        name="ownerEmail"
        defaultValue={organization?.owner?.email || "marketing@ovc.vn"}
        disabled={!!organization}
        required={!organization}
      />
      <label>
        <span className="mb-1 block text-xs font-medium text-gray-600">Plan</span>
        <select
          name="plan"
          defaultValue={organization?.plan || plans[0]?.code || "workspace-standard"}
          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400"
        >
          {plans.map((plan) => (
            <option key={plan.code} value={plan.code}>
              {plan.name}
            </option>
          ))}
          {plans.length === 0 ? <option value="workspace-standard">Workspace Standard</option> : null}
        </select>
      </label>
      <Field label="Website" name="website" defaultValue={organization?.website || ""} />
      <Field label="Email" name="email" defaultValue={organization?.email || ""} />
      <Field label="Số điện thoại" name="phone" defaultValue={organization?.phone || ""} />
      <Field label="Địa chỉ" name="address" defaultValue={organization?.address || ""} />

      <label className="lg:col-span-4">
        <span className="mb-1 block text-xs font-medium text-gray-600">Mô tả</span>
        <textarea
          name="description"
          defaultValue={organization?.description || ""}
          className="min-h-20 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
      </label>

      <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" name="isActive" defaultChecked={organization?.isActive ?? true} />
        Đang hoạt động
      </label>
    </div>
  );
}

function ModuleMatrix({
  modules,
  licenseByCode = new Map(),
  fallbackActiveCodes = new Set(defaultModuleCodes),
}: {
  modules: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
    description: string | null;
  }>;
  licenseByCode?: Map<
    PlatformModuleCode,
    {
      enabled: boolean;
      status: string;
      expiresAt: Date | null;
    }
  >;
  fallbackActiveCodes?: Set<PlatformModuleCode>;
}) {
  return (
    <div className="rounded-xl border border-gray-200">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-950">Module license</h3>
        <p className="mt-0.5 text-xs text-gray-500">Bật/tắt module, đặt trạng thái license và hạn sử dụng.</p>
      </div>

      <div className="grid gap-0 divide-y divide-gray-100">
        {modules.map((module) => {
          const code = normalizeModuleCode(module.code);
          if (!code) return null;

          const license = licenseByCode.get(code);
          const enabled = license ? license.enabled && ["ACTIVE", "TRIALING"].includes(license.status) : fallbackActiveCodes.has(code);
          const expiresAt = license?.expiresAt ? license.expiresAt.toISOString().slice(0, 10) : "";

          return (
            <div key={module.id} className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_140px_160px_140px] lg:items-center">
              <label className="flex min-w-0 items-start gap-3">
                <input
                  type="checkbox"
                  name="licensedModules"
                  value={code}
                  defaultChecked={enabled}
                  className="mt-1"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-950">{module.name}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">{module.description}</span>
                </span>
              </label>

              <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                {categoryLabels[module.category] || module.category}
              </span>

              <label>
                <span className="sr-only">Trạng thái {module.name}</span>
                <select
                  name={`licenseStatus_${code}`}
                  defaultValue={license?.status || (enabled ? "ACTIVE" : "SUSPENDED")}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2 text-sm outline-none focus:border-gray-400"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="relative">
                <Clock3 className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name={`expiresAt_${code}`}
                  defaultValue={expiresAt}
                  className="h-9 w-full rounded-lg border border-gray-200 pl-8 pr-2 text-sm outline-none focus:border-gray-400"
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
      />
    </label>
  );
}

function Metric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="text-xs font-semibold uppercase text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-gray-950">{value}</div>
      <div className="text-xs text-gray-500">{hint}</div>
    </div>
  );
}

function ProvisioningCard({
  title,
  icon,
  rows,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-950">
        <span className="text-orange-600">{icon}</span>
        {title}
      </div>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-950">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

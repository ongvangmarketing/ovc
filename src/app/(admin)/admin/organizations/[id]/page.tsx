import { notFound } from "next/navigation";
import { Building2, Users, MapPin, Globe, Mail, Phone, ChevronRight, Activity, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ModuleToggleList } from "./module-toggle-list";
import { AdminService } from "@/modules/core/services/admin.service";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const organization = await AdminService.getOrganizationDetail(id);

  if (!organization) {
    notFound();
  }

  const platformModules = await AdminService.getPlatformModules();

  const activeCodes = new Set(
    organization.moduleLicenses && organization.moduleLicenses.length > 0
      ? organization.moduleLicenses
          .filter((l) => l.enabled && ["ACTIVE", "TRIALING"].includes(l.status))
          .map((l) => l.module.code)
      : organization.activeModules || []
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 font-sans">
      {/* Stripe-like Breadcrumbs */}
      <nav className="flex items-center text-[13px] font-medium text-slate-500 mb-4">
        <Link href="/admin/organizations" className="hover:text-slate-900 transition-colors">Đối tác</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400" />
        <span className="text-slate-900">{organization.name}</span>
      </nav>

      {/* Stripe-like Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-orange-600 shadow-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              {organization.name}
              {organization.isActive && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  Active
                </span>
              )}
            </h1>
            <div className="text-[14px] text-slate-500 mt-0.5 flex items-center gap-2">
              <span className="font-mono text-slate-600">OV{organization.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}</span>
              <span>•</span>
              <span>{organization.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/admin/organizations/${organization.id}/edit`} className="inline-flex h-8 items-center justify-center rounded-md bg-white px-3 text-[13px] font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition">
            Chỉnh sửa
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Mảng kinh doanh */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-[15px] font-semibold text-slate-900">Mảng kinh doanh (Modules)</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">Quản lý các dịch vụ đối tác này được phép cung cấp.</p>
            </div>
            <div className="p-0">
              <ModuleToggleList 
                orgId={organization.id} 
                modules={platformModules} 
                activeCodes={Array.from(activeCodes)} 
              />
            </div>
          </div>

          {/* Members */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900">Nhân sự ({organization._count.members})</h2>
                <p className="text-[13px] text-slate-500 mt-0.5">Những người có quyền truy cập vào tổ chức này.</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {organization.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-[13px] font-semibold text-slate-600 border border-slate-200 shadow-sm">
                      {(m.user.name ?? "U")[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-slate-900">{m.user.name || "Chưa cập nhật"}</div>
                      <div className="text-[12px] text-slate-500 mt-0.5">{m.user.email}</div>
                    </div>
                  </div>
                  <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${
                    m.role === 'OWNER' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Details) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Chi tiết tổ chức</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[12px] font-medium text-slate-500 mb-0.5">Gói dịch vụ</div>
                  <div className="text-[13px] font-medium text-slate-900">{organization.plan || "Cơ bản"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[12px] font-medium text-slate-500 mb-0.5">Email liên hệ</div>
                  <div className="text-[13px] text-slate-900 break-all">{organization.email || "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[12px] font-medium text-slate-500 mb-0.5">Số điện thoại</div>
                  <div className="text-[13px] text-slate-900">{organization.phone || "—"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[12px] font-medium text-slate-500 mb-0.5">Website</div>
                  <div className="text-[13px] text-slate-900 break-all">{organization.website || "—"}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-slate-500">Hiệu suất (Mock)</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-[12px] font-medium text-slate-500 mb-1">Khách hàng (Contacts)</div>
                <div className="text-xl font-semibold text-slate-900">{organization._count.contacts}</div>
              </div>
              <div>
                <div className="text-[12px] font-medium text-slate-500 mb-1">Doanh thu tạm tính</div>
                <div className="text-xl font-semibold text-slate-900">0 ₫</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

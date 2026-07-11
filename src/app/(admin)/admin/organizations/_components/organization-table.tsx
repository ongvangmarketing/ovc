"use client";

import { useState, useTransition } from "react";
import { Building2, Search, Settings, ShieldCheck, LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { switchOrganization } from "@/actions/organizations";

export function OrganizationTable({
  organizations,
  modules,
  plans,
}: {
  organizations: any[];
  modules: any[];
  plans: any[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAccess = (orgId: string) => {
    startTransition(async () => {
      try {
        const res = await switchOrganization(orgId);
        if (res.success) {
          toast.success("Đang chuyển vào workspace...");
          router.push("/workspace");
        } else {
          toast.error(res.error || "Không thể truy cập workspace");
        }
      } catch (error) {
        toast.error("Đã có lỗi xảy ra");
      }
    });
  };

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tổ chức..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Tổ chức</th>
                <th className="px-6 py-4 font-medium">Gói dịch vụ</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Thành viên</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgs.map((org) => {
                const primaryPlan = org.moduleLicenses?.find((l: any) => l.plan)?.plan;
                return (
                  <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{org.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            <span className="font-semibold text-orange-600">OV{org.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}</span> • {org.slug} • {org.owner?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {primaryPlan?.name || org.plan || "Cơ bản"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          org.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {org.isActive ? "Hoạt động" : "Tạm khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {org._count?.members || 0} users
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleAccess(org.id)}
                        disabled={isPending}
                        title="Truy cập Workspace"
                        className="inline-flex items-center justify-center rounded-lg bg-orange-50 p-2 text-orange-600 hover:bg-orange-100 disabled:opacity-50 transition"
                      >
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                      </button>
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition"
                      >
                        <Settings className="h-4 w-4" />
                        Quản lý
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredOrgs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Không tìm thấy tổ chức nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

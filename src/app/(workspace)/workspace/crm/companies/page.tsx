import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Building2, Search, Filter, MoreVertical, Globe, Phone, Mail } from "lucide-react";

import { requireAuth } from "@/lib/auth/require-auth";
import { formatCurrency } from "@/lib/utils/format";
import { searchCompanies } from "@/modules/crm/services/company.service";

export const metadata: Metadata = { title: "Công ty" };

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireAuth();
  const orgId = session.organizationId;
  const { q } = await searchParams;
  const query = q || "";

  const companies = await searchCompanies(orgId, query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[15px] font-medium text-gray-950 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-indigo-600" />
          Danh sách Công ty
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/workspace/crm/companies/new" className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition">
            <Plus className="h-4 w-4 mr-1.5" />
            Thêm công ty
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm công ty..."
              defaultValue={query}
              className="block w-full rounded-lg border-0 py-1.5 pl-9 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <button className="h-9 px-3 inline-flex items-center justify-center rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <Filter className="h-4 w-4 mr-1.5" />
            Bộ lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Tên công ty</th>
                <th className="px-6 py-3 font-medium">Liên hệ</th>
                <th className="px-6 py-3 font-medium">Lĩnh vực</th>
                <th className="px-6 py-3 font-medium">Doanh thu dự kiến</th>
                <th className="px-6 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Building2 className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                    <p className="text-base font-medium text-gray-900">Không tìm thấy công ty nào</p>
                    <p className="mt-1">Thử điều chỉnh lại bộ lọc tìm kiếm.</p>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-medium overflow-hidden border border-indigo-100">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                          ) : (
                            company.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <Link href={`/workspace/crm/companies/${company.id}`} className="font-medium text-gray-950 hover:text-indigo-600">
                            {company.name}
                          </Link>
                          {company.website && (
                            <div className="flex items-center text-xs text-gray-500 mt-0.5 gap-1">
                              <Globe className="h-3 w-3" />
                              <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="hover:underline">
                                {company.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {company.email && (
                          <div className="flex items-center text-xs text-gray-600 gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            {company.email}
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex items-center text-xs text-gray-600 gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {company.phone}
                          </div>
                        )}
                        {!company.email && !company.phone && (
                          <span className="text-gray-400 italic">Chưa có thông tin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {company.industry ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                          {company.industry}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {company.revenue ? formatCurrency(company.revenue.toNumber(), "VND") : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

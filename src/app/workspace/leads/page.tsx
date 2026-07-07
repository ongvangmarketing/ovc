import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { LeadStatus } from "@prisma/client";
import { Plus, Search, Filter, MoreVertical, Inbox, Star, AlertTriangle, ArrowRightLeft, GraduationCap } from "lucide-react";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { LeadService } from "@/lib/services/lead.service";
import { sendPortalAccessEmailForContact } from "@/app/actions/crm";

export const metadata: Metadata = { title: "Trung tâm Lead" };

export default async function LeadCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await requireAuth();
  const orgId = session.organizationId;
  const { q, status } = await searchParams;
  const query = q || "";
  const statusFilter = status;

  async function convertLeadToCustomer(formData: FormData) {
    "use server";
    const session = await requireAuth();
    const leadId = String(formData.get("leadId") || "");
    if (!leadId) return;
    const result = await LeadService.convertToCRM(leadId, session.user.id);
    if (result.contact.email) {
      await sendPortalAccessEmailForContact(result.contact.id);
    }
    redirect(`/workspace/crm/contacts/${result.contact.id}`);
  }

  const leads = await db.lead.findMany({
    where: {
      organizationId: orgId,
      ...(query ? {
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } }
        ]
      } : {}),
      ...(statusFilter ? { status: statusFilter as LeadStatus } : {}),
    },
    include: {
      source: true,
      assignee: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'NEW': return <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Mới</span>;
      case 'CONTACTED': return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Đang chăm sóc</span>;
      case 'QUALIFIED': return <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">Tiềm năng cao</span>;
      case 'DUPLICATE': return <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-700/10"><AlertTriangle className="w-3 h-3 mr-1"/> Trùng lặp</span>;
      case 'SPAM': return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">Spam</span>;
      case 'CONVERTED': return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Đã chốt</span>;
      default: return <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-950 flex items-center gap-2">
          <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
            <Inbox className="h-5 w-5 text-indigo-700" />
          </div>
          Lead Inbox
        </h1>
        <div className="flex items-center gap-2">
          <Link href="/workspace/leads/sources" className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
            Quản lý Nguồn
          </Link>
          <button className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Tạo Lead
          </button>
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
              placeholder="Tìm theo Tên, Email hoặc Số điện thoại..."
              defaultValue={query}
              className="block w-full rounded-lg border-0 py-2 pl-9 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <Link href="/workspace/leads/new" className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Thêm Lead
            </Link>
            <button className="h-9 px-4 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
              <Filter className="h-4 w-4 mr-1.5" />
              Lọc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium w-10">Score</th>
                <th className="px-6 py-3 font-medium">Khách hàng (Lead)</th>
                <th className="px-6 py-3 font-medium">Nguồn gốc</th>
                <th className="px-6 py-3 font-medium">Trạng thái</th>
                <th className="px-6 py-3 font-medium">Phụ trách</th>
                <th className="px-6 py-3 text-right font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Inbox className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                    <p className="text-base font-medium text-gray-900">Không có Lead nào</p>
                    <p className="mt-1">Khi có khách điền form hoặc dữ liệu từ ads, nó sẽ xuất hiện ở đây.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const createStudentHref = `/workspace/training/students/create?${new URLSearchParams({
                    name: lead.fullName || "",
                    email: lead.email || "",
                    phone: lead.phone || "",
                    note: `Tạo từ Lead: ${lead.source?.name || lead.utmSource || "Thủ công"}${lead.note ? ` · ${lead.note}` : ""}`,
                  }).toString()}`;

                  return (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100 text-orange-700 font-bold text-xs ring-1 ring-orange-200">
                        {lead.score}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                          {lead.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/workspace/leads/${lead.id}`} className="font-semibold text-gray-950 hover:text-indigo-600 block">
                            {lead.fullName}
                          </Link>
                          {lead.companyName && <span className="text-xs text-gray-500 block">{lead.companyName}</span>}
                          <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                            {lead.phone && <span>{lead.phone}</span>}
                            {lead.email && <span className="text-gray-300">|</span>}
                            {lead.email && <span>{lead.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.source ? (
                        <div className="flex items-center gap-1.5">
                          {lead.source.icon ? <span className="text-gray-500" dangerouslySetInnerHTML={{ __html: lead.source.icon }} /> : <Star className="h-4 w-4 text-gray-400" />}
                          <span className="font-medium text-gray-700">{lead.source.name}</span>
                        </div>
                      ) : (
                        <div className="text-gray-400 italic text-xs">{lead.utmSource || "Thủ công"}</div>
                      )}
                      {lead.campaign && <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">{lead.campaign}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-6 py-4">
                      {lead.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <img src={lead.assignee.image || `https://ui-avatars.com/api/?name=${lead.assignee.name}`} alt="" className="w-5 h-5 rounded-full" />
                          <span className="text-xs font-medium text-gray-700">{lead.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-200 border-dashed">
                          Chưa phân bổ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                      {lead.status !== 'CONVERTED' ? (
                        <form action={convertLeadToCustomer}>
                          <input type="hidden" name="leadId" value={lead.id} />
                          <button type="submit" className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100" title="Tạo khách hàng CRM">
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            Tạo khách hàng
                          </button>
                        </form>
                      ) : null}
                      <Link href={createStudentHref} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100" title="Tạo học viên">
                        <GraduationCap className="h-4 w-4" />
                        Tạo học viên
                      </Link>
                      <button className="inline-flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

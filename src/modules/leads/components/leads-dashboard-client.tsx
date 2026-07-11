"use client";

import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, FileText } from "lucide-react";

export function LeadsDashboardClient({
  query,
  statusFilter,
  pageSize,
  currentPage,
  totalLeads,
  totalPages,
  tabs,
  leads,
  paginationItems,
  convertLeadToCustomer
}: {
  query: string;
  statusFilter: string;
  pageSize: number;
  currentPage: number;
  totalLeads: number;
  totalPages: number;
  tabs: { name: string; value: string; count: number }[];
  leads: any[];
  paginationItems: (number | string)[];
  convertLeadToCustomer: (formData: FormData) => Promise<void>;
}) {
  const makePageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (statusFilter && statusFilter !== 'ALL') params.set("status", statusFilter);
    params.set("perPage", String(pageSize));
    params.set("page", String(nextPage));
    return `/workspace/leads?${params.toString()}`;
  };
  
  const makeTabHref = (tabStatus: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tabStatus !== 'ALL') params.set("status", tabStatus);
    params.set("perPage", String(pageSize));
    params.set("page", "1");
    return `/workspace/leads?${params.toString()}`;
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'NEW': return <span className="rounded-full border border-[#eaeaea] bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-black">Mới</span>;
      case 'CONTACTED': return <span className="rounded-full bg-gray-50 border border-[#eaeaea] text-gray-600 px-3 py-1 text-[10px] font-medium uppercase tracking-widest">Đang chăm sóc</span>;
      case 'QUALIFIED': return <span className="rounded-full bg-gray-50 border border-[#eaeaea] text-gray-600 px-3 py-1 text-[10px] font-medium uppercase tracking-widest">Tiềm năng</span>;
      case 'DUPLICATE': return <span className="rounded-full bg-gray-50 border border-[#eaeaea] text-gray-600 px-3 py-1 text-[10px] font-medium uppercase tracking-widest">Trùng lặp</span>;
      case 'SPAM': return <span className="rounded-full bg-gray-50 border border-[#eaeaea] text-gray-600 px-3 py-1 text-[10px] font-medium uppercase tracking-widest">Spam</span>;
      case 'CONVERTED': return <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] font-medium uppercase tracking-widest">Đã chốt</span>;
      default: return <span className="rounded-full border border-[#eaeaea] bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-black">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        <div className="mb-10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-medium text-white tracking-wide w-fit">
              Khách hàng
            </span>
            <Link href="/workspace/leads/new" className="hidden h-10 items-center justify-center rounded-md bg-black px-5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 sm:inline-flex">
              <Plus className="h-4 w-4" />
              <span className="ml-2">Tạo Lead</span>
            </Link>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Quản lý</span>{" "}
            <span className="text-gray-400">nguồn Lead.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Theo dõi danh sách khách hàng tiềm năng, phân loại trạng thái và chuyển đổi thành công để tối ưu hóa doanh thu.
          </p>
          <Link href="/workspace/leads/new" className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-md bg-black px-5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 sm:hidden">
            <Plus className="mr-2 h-4 w-4" />
            Tạo Lead
          </Link>
        </div>

        {/* Segmented Controls (Vercel Style) */}
        <nav className="-mx-4 flex flex-nowrap gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <Link
                key={tab.name}
                href={makeTabHref(tab.value)}
                className={`
                  inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors
                  ${isActive 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-500 border-[#eaeaea] hover:border-gray-300 hover:text-black'
                  }
                `}
              >
                {tab.name}
                <span className={`rounded-full px-1.5 text-[11px] ${isActive ? "bg-white/15 text-white/75" : "bg-gray-100 text-gray-400"}`}>
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Vercel Main Container */}
        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-6 border-b border-[#eaeaea] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <form action="/workspace/leads" className="flex items-center gap-3 w-full sm:w-auto">
              <input type="hidden" name="page" value="1" />
              {statusFilter !== 'ALL' && <input type="hidden" name="status" value={statusFilter} />}
              
              <div className="relative w-full sm:w-80">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  name="q"
                  type="text"
                  placeholder="Tìm kiếm..."
                  defaultValue={query}
                  className="block w-full rounded-md border border-[#eaeaea] py-2 pl-9 pr-3 text-black placeholder:text-gray-400 focus:border-gray-400 focus:ring-0 sm:text-[14px] transition-colors"
                />
              </div>
              
              <button type="submit" className="h-[38px] px-4 inline-flex items-center justify-center rounded-md border border-[#eaeaea] bg-white text-[14px] font-medium text-black hover:bg-gray-50 transition-colors shrink-0">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                Lọc
              </button>
            </form>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="border-b border-[#eaeaea]">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">
                    <input type="checkbox" className="rounded-sm text-black border-[#eaeaea] focus:ring-black" />
                  </th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-gray-400 font-medium">Khách hàng</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-gray-400 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-gray-400 font-medium">Liên hệ</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-gray-400 font-medium">Phụ trách</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-gray-400 font-medium">Nguồn</th>
                  <th className="px-6 py-4 text-[11px] uppercase tracking-widest text-gray-400 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FileText className="h-8 w-8 mb-4 opacity-50" />
                        <p className="text-[16px] font-medium text-black">Chưa có dữ liệu</p>
                        <p className="text-[14px] mt-2">Vui lòng điều chỉnh bộ lọc hoặc tạo Lead mới.</p>
                      </div>
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
                      <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4 text-center">
                          <input type="checkbox" className="rounded-sm text-black border-[#eaeaea] focus:ring-black" />
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/workspace/leads/${lead.id}`} className="font-medium text-[14px] text-black hover:underline transition-all">
                            {lead.fullName}
                          </Link>
                          {lead.companyName && <span className="text-[12px] text-gray-500 block mt-1">{lead.companyName}</span>}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(lead.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[14px] text-black">{lead.email || '-'}</span>
                            <span className="text-[12px] text-gray-500">{lead.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {lead.assignee ? (
                            <div className="flex items-center gap-2">
                              <img src={lead.assignee.image || `https://ui-avatars.com/api/?name=${lead.assignee.name}`} alt="" className="w-6 h-6 rounded-full border border-[#eaeaea]" />
                              <span className="text-[14px] text-black">{lead.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-[12px] text-gray-400 uppercase tracking-widest font-medium">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-black text-[14px]">{lead.source ? lead.source.name : (lead.utmSource || "Thủ công")}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {lead.status !== 'CONVERTED' ? (
                              <form action={convertLeadToCustomer}>
                                <input type="hidden" name="leadId" value={lead.id} />
                                <button type="submit" className="rounded-full border border-[#eaeaea] bg-white px-3 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                                  Chuyển CRM
                                </button>
                              </form>
                            ) : null}
                            <Link href={createStudentHref} className="rounded-full border border-[#eaeaea] bg-white px-3 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                              Học viên
                            </Link>
                            <button className="inline-flex h-8 w-8 items-center justify-center text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition">
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

          {/* Pagination Footer */}
          {totalPages > 1 ? (
            <div className="flex items-center justify-between p-6 bg-white border-t border-[#eaeaea]">
              <p className="text-[14px] text-gray-500">
                Hiển thị <span className="font-medium text-black">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-medium text-black">{Math.min(currentPage * pageSize, totalLeads)}</span> của <span className="font-medium text-black">{totalLeads}</span>
              </p>
              <div className="flex items-center gap-1">
                {currentPage > 1 ? (
                  <Link href={makePageHref(currentPage - 1)} className="inline-flex h-8 px-3 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
                    Trước
                  </Link>
                ) : null}
                {paginationItems.map((item, i) => (
                  typeof item === "number" ? (
                    <Link
                      key={`page-${item}`}
                      href={makePageHref(item)}
                      className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-md text-[13px] font-medium transition-colors ${
                        item === currentPage
                          ? "bg-black text-white"
                          : "text-black hover:bg-gray-50"
                      }`}
                    >
                      {item}
                    </Link>
                  ) : (
                    <span key={`ellipsis-${i}`} className="px-1.5 text-[13px] text-gray-400">...</span>
                  )
                ))}
                {currentPage < totalPages ? (
                  <Link href={makePageHref(currentPage + 1)} className="inline-flex h-8 px-3 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
                    Tiếp
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

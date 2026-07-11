// @ts-nocheck
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Download, Eye, Edit, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { CompactPagination } from "@/components/ui/compact-pagination";

const QUOTATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  SENT: "Đã gửi",
  VIEWED: "Đã xem",
  ACCEPTED: "Chấp nhận",
  REJECTED: "Từ chối",
  CONVERTED: "Đã chuyển đổi",
  EXPIRED: "Hết hạn",
};

const QUOTATION_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-white border border-[#eaeaea] text-gray-500",
  SENT: "bg-white border border-[#eaeaea] text-black",
  VIEWED: "bg-white border border-[#eaeaea] text-black",
  ACCEPTED: "bg-gray-100 text-black",
  REJECTED: "bg-white border border-red-200 text-red-600",
  CONVERTED: "bg-black text-white",
  EXPIRED: "bg-white border border-[#eaeaea] text-gray-400",
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getQuotations } from "@/modules/finance/actions/finance.actions";
import { deleteQuotation } from "@/modules/finance/actions/finance.actions";

type FinanceContact = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: { name?: string | null } | null;
};

type QuotationRow = {
  id: string;
  number: string;
  status: string;
  total: number | string;
  createdAt?: string | Date | null;
  contact?: FinanceContact | null;
};

function getCustomerName(contact?: FinanceContact | null) {
  if (!contact) return "Không gắn khách hàng";
  const fullName = contact.name || `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  return contact.company?.name || fullName || contact.email || contact.phone || "Không gắn khách hàng";
}

function displayQuotationNumber(number: string) {
  return number?.startsWith("QUO-") ? number : `QUO-${number}`;
}

const PAGE_SIZE = 20;

export function QuotationsClient() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: quotations = [], isFetching } = useQuery({
    queryKey: ["quotations"],
    queryFn: () => getQuotations(),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const isInitialFetching = isFetching && quotations.length === 0;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      setDeletingId(null);
    }
  });

  const quotationRows = quotations as QuotationRow[];

  const filtered = quotationRows.filter((inv) => {
    const customer = getCustomerName(inv.contact);
    const matchSearch = `${inv.number} ${customer}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = selectedStatus === "ALL" || inv.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const summaryStats = [
    { label: "Tổng báo giá", value: quotationRows.length, isCurrency: false },
    { label: "Giá trị báo giá", value: quotationRows.reduce((sum, item) => sum + Number(item.total), 0), isCurrency: true },
    { label: "Chấp nhận", value: quotationRows.filter((item) => item.status === "ACCEPTED").reduce((sum, item) => sum + Number(item.total), 0), isCurrency: true },
    { label: "Đã chuyển đổi", value: quotationRows.filter((item) => item.status === "CONVERTED").length, isCurrency: false },
  ];

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedQuotations = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const todayDate = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  const statusOptions = ["ALL", "DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "CONVERTED", "EXPIRED"];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8 sm:py-12">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="w-fit rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Báo giá
              </span>
              <span className="text-[13px] font-medium text-gray-500">{todayDate}</span>
            </div>
            <h1 className="mb-3 text-[32px] font-medium leading-[1.15] tracking-tight text-black md:text-[40px]">
              Quản lý <span className="text-gray-400">báo giá.</span>
            </h1>
            <p className="max-w-xl text-[15px] text-gray-500 mt-4">
              {isInitialFetching ? "Đang tải dữ liệu..." : `Hiện có ${quotationRows.length} báo giá trên hệ thống.`}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 md:mt-0">
            <button className="inline-flex h-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-5 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" /> Xuất
            </button>
            <Link href="/workspace/finance/quotations/create" className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" /> Tạo mới
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
          {summaryStats.map((stat) => (
            <div key={stat.label} className="min-w-0 rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm transition-colors duration-200 hover:border-black sm:p-6">
              <p className="mb-4 text-[13px] font-medium leading-snug text-gray-500 sm:text-[11px] sm:font-semibold sm:uppercase sm:tracking-widest">{stat.label}</p>
              <p className="truncate text-[22px] font-medium tracking-tight text-black sm:text-[28px]">
                {stat.isCurrency ? formatCurrency(stat.value as number) : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Filter Bar */}
        <div className="mb-6 flex flex-col items-stretch gap-3 rounded-2xl border border-[#eaeaea] bg-white p-2 shadow-sm md:flex-row md:items-center">
          <div className="relative flex flex-1 items-center">
            <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Tìm số báo giá, khách hàng..."
              className="w-full bg-transparent pl-11 pr-4 py-2 text-[14px] text-black outline-none placeholder:text-gray-400"
            />
          </div>
          <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto border-t border-[#eaeaea] px-3 py-1.5 md:flex-wrap md:overflow-visible md:border-l md:border-t-0">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors sm:px-4",
                  selectedStatus === status
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-600 border-[#eaeaea] hover:bg-gray-50"
                )}
              >
                {status === "ALL" ? "Tất cả" : QUOTATION_STATUS_LABELS[status] || status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-[24px] border border-[#eaeaea] bg-white shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[14px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
              <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
                <tr>
                  <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px]">Số Báo giá</th>
                  <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px]">Khách hàng</th>
                  <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px]">Trạng thái</th>
                  <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px]">Tổng tiền</th>
                  <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px]">Ngày tạo</th>
                  <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {isInitialFetching ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded-full animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400 text-[14px]">
                      Không tìm thấy báo giá nào.
                    </td>
                  </tr>
                ) : (
                  paginatedQuotations.map((inv) => {
                    const statusColor = QUOTATION_STATUS_COLORS[inv.status] || QUOTATION_STATUS_COLORS["DRAFT"];
                    const statusLabel = QUOTATION_STATUS_LABELS[inv.status] || inv.status;
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => { window.location.href = `/workspace/finance/quotations/${inv.id}`; }}
                        className="cursor-pointer hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link href={`/workspace/finance/quotations/${inv.id}`} className="font-medium text-black hover:underline">
                            {displayQuotationNumber(inv.number)}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block truncate font-medium text-black">{getCustomerName(inv.contact)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", statusColor)}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-black">{formatCurrency(Number(inv.total))}</td>
                        <td className="px-6 py-4 text-gray-500">
                          {inv.createdAt ? formatDate(new Date(inv.createdAt)) : "N/A"}
                        </td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 justify-end">
                            <Link
                              href={`/workspace/finance/quotations/${inv.id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/workspace/finance/quotations/${inv.id}/edit`}
                              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              onClick={() => setDeletingId(inv.id)}
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
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
          <CompactPagination
            currentPage={safePage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            itemLabel="báo giá"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Xác nhận xóa Báo giá"
        message="Bạn có chắc chắn muốn xóa báo giá này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa Báo giá"
        isDestructive={true}
      />
    </div>
  );
}

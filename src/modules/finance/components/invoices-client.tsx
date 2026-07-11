"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Download, Eye, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { CompactPagination } from "@/components/ui/compact-pagination";
const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Bản nháp",
  SENT: "Đã gửi",
  VIEWED: "Đã xem",
  PARTIAL: "TT một phần",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-white border border-[#eaeaea] text-gray-500",
  SENT: "bg-white border border-[#eaeaea] text-black",
  VIEWED: "bg-white border border-[#eaeaea] text-black",
  PARTIAL: "bg-gray-100 text-black",
  PAID: "bg-gray-100 text-black",
  OVERDUE: "bg-white border border-red-200 text-red-600",
  CANCELLED: "bg-white border border-[#eaeaea] text-gray-400",
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {  getInvoices  } from "@/modules/finance/actions/finance.actions";
import {  deleteInvoice  } from "@/modules/finance/actions/finance.actions";

const PAGE_SIZE = 20;

type FinanceContact = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: { name?: string | null } | null;
};

function getCustomerName(contact?: FinanceContact | null) {
  if (!contact) return "Không gắn khách hàng";
  const fullName = contact.name || `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
  return contact.company?.name || fullName || contact.email || contact.phone || "Không gắn khách hàng";
}

export function InvoicesClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: invoices = [], error, isError, isFetching } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices(),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
  });
  const isInitialFetching = isFetching && invoices.length === 0;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setDeletingId(null);
    }
  });

  const summaryStats = [
    { label: "Tổng hóa đơn", value: invoices.reduce((s, i) => s + Number(i.total), 0) },
    { label: "Chưa thanh toán", value: invoices.filter((i) => ["SENT", "VIEWED", "PARTIAL"].includes(i.status)).reduce((s, i) => s + Number(i.amountDue), 0) },
    { label: "Quá hạn", value: invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + Number(i.amountDue), 0) },
    { label: "Đã thanh toán", value: invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + Number(i.total), 0) },
  ];
  const totalPages = Math.max(1, Math.ceil(invoices.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedInvoices = invoices.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);



  const todayDate = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="w-fit rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Hóa đơn
              </span>
              <span className="text-[13px] font-medium text-gray-500">{todayDate}</span>
            </div>
            <h1 className="mb-3 text-[32px] font-medium leading-[1.15] tracking-tight text-black md:text-[40px]">
              Quản lý <span className="text-gray-400">hóa đơn.</span>
            </h1>
            <p className="max-w-xl text-[15px] text-gray-500 mt-4">
              Theo dõi tình trạng thanh toán của toàn bộ hóa đơn khách hàng trên hệ thống.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 md:mt-0">
            <button className="inline-flex h-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-5 text-[13px] font-medium text-black transition-colors hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" /> Xuất
            </button>
            <Link href="/workspace/finance/invoices/create" className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800">
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
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-[24px] border border-[#eaeaea] bg-white shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          {isError ? (
            <div className="border-b border-[#eaeaea] bg-red-50 px-6 py-4 text-[13px] font-medium text-red-600">
              Không tải được danh sách hóa đơn. Vui lòng tải lại trang hoặc đăng nhập lại nếu phiên làm việc đã hết hạn.
              {error instanceof Error ? ` (${error.message})` : null}
            </div>
          ) : null}
          {isInitialFetching ? (
            <div className="border-b border-[#eaeaea] bg-[#fafafa] px-6 py-4 text-[13px] font-medium text-gray-500">
              Đang tải danh sách hóa đơn...
            </div>
          ) : null}
          <table className="w-full min-w-[1000px] text-left text-[14px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[180px]">Số Hóa đơn</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[320px]">Khách hàng</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px] whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px] text-right whitespace-nowrap">Tổng tiền</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px] text-right whitespace-nowrap">Còn lại</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px] whitespace-nowrap text-right">Hạn thanh toán</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {paginatedInvoices.map((inv) => {
                const statusColor = INVOICE_STATUS_COLORS[inv.status];
                const statusLabel = INVOICE_STATUS_LABELS[inv.status];
                const isOverdue = inv.status === "OVERDUE";

                return (
                  <tr key={inv.id} onClick={() => router.push(`/workspace/finance/invoices/${inv.id}`)} className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/workspace/finance/invoices/${inv.id}`} className="font-medium text-black hover:underline">
                        {inv.number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block truncate font-medium text-black">{getCustomerName(inv.contact)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest", statusColor)}>{statusLabel}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-black">{formatCurrency(Number(inv.total))}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={Number(inv.amountDue) > 0 ? (isOverdue ? "text-red-600 font-medium" : "text-black font-medium") : "text-gray-400"}>
                        {Number(inv.amountDue) > 0 ? formatCurrency(Number(inv.amountDue)) : "Đã TT"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-500"}>
                        {inv.dueDate ? formatDate(new Date(inv.dueDate)) : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/workspace/finance/invoices/${inv.id}`} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-all" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/workspace/finance/invoices/${inv.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-all" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          onClick={() => setDeletingId(inv.id)}
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <CompactPagination
          currentPage={safePage}
          totalItems={invoices.length}
          pageSize={PAGE_SIZE}
          itemLabel="hóa đơn"
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Xác nhận xóa Hóa đơn"
        message="Bạn có chắc chắn muốn xóa hóa đơn này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa Hóa đơn"
        isDestructive={true}
      />
      </div>
    </div>
  );
}

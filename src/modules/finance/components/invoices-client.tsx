"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Download, Eye, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { ConfirmModal } from "@/components/ui/confirm-modal";
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
import { getInvoices } from "@/app/actions/finance";
import { deleteInvoice } from "@/app/actions/finance-crud";

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



  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-12 bg-white min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[36px] font-medium tracking-tighter text-black leading-none mb-3">Hóa đơn</h1>
          <p className="text-[14px] text-gray-500">{isInitialFetching ? "Đang tải hóa đơn..." : `${invoices.length} hóa đơn`}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg border border-[#eaeaea] text-[14px] font-medium text-black hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Xuất
          </button>
          <Link href="/workspace/finance/invoices/create" className="h-9 px-4 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2 shadow-none">
            <Plus className="w-4 h-4" /> Tạo hóa đơn
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-[#eaeaea] bg-white p-6 hover:border-black transition-colors duration-200">
            <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-4">{stat.label}</p>
            <p className="text-[24px] font-medium tracking-tight text-black">
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          {isError ? (
            <div className="border-b border-[#eaeaea] bg-red-50 px-6 py-4 text-[14px] font-medium text-red-600">
              Không tải được danh sách hóa đơn. Vui lòng tải lại trang hoặc đăng nhập lại nếu phiên làm việc đã hết hạn.
              {error instanceof Error ? ` (${error.message})` : null}
            </div>
          ) : null}
          {isInitialFetching ? (
            <div className="border-b border-[#eaeaea] bg-gray-50 px-6 py-4 text-[14px] font-medium text-gray-500">
              Đang tải danh sách hóa đơn...
            </div>
          ) : null}
          <table className="w-full text-left text-[14px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[180px]">Số Hóa đơn</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[320px]">Khách hàng</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px] whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px] text-right whitespace-nowrap">Tổng tiền</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px] text-right whitespace-nowrap">Còn lại</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px] whitespace-nowrap text-right">Hạn thanh toán</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {invoices.map((inv) => {
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
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-[6px] font-medium text-[11px] uppercase tracking-wide", statusColor)}>{statusLabel}</span>
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
  );
}

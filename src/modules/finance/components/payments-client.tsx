"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import {  deletePayment  } from "@/modules/finance/actions/finance.actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { CompactPagination } from "@/components/ui/compact-pagination";

type PaymentListItem = {
  id: string;
  number?: string | null;
  amount: unknown;
  currency: string;
  method: string;
  status: string;
  reference?: string | null;
  paidAt?: string | Date | null;
  createdAt: string | Date;
  invoice?: {
    id: string;
    number?: string | null;
    title?: string | null;
    contact?: { name?: string | null; email?: string | null; company?: { name?: string | null } | null } | null;
  } | null;
};

const PAGE_SIZE = 20;

const statusLabel: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  FAILED: "Thất bại",
  REFUNDED: "Hoàn tiền",
  CANCELLED: "Đã hủy",
};

const statusColor: Record<string, string> = {
  PENDING: "bg-white border border-[#eaeaea] text-gray-500",
  PROCESSING: "bg-gray-50 border border-[#eaeaea] text-black",
  COMPLETED: "bg-gray-100 text-black",
  FAILED: "bg-white border border-red-200 text-red-600",
  REFUNDED: "bg-white border border-[#eaeaea] text-gray-500",
  CANCELLED: "bg-white border border-[#eaeaea] text-gray-400",
};

const methodLabel: Record<string, string> = {
  BANK_TRANSFER: "Chuyển khoản",
  CASH: "Tiền mặt",
  CARD: "Thẻ",
  MOMO: "MoMo",
  ZALOPAY: "ZaloPay",
  VNPAY: "VNPay",
  STRIPE: "Stripe",
  PAYPAL: "PayPal",
};

function asNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: unknown, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency, maximumFractionDigits: 0 }).format(asNumber(value));
}

function formatDate(value?: string | Date | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function customerName(payment: PaymentListItem) {
  const contact = payment.invoice?.contact;
  return contact?.company?.name || contact?.name || contact?.email || "Không gắn khách hàng";
}

export function PaymentsClient({ initialData }: { initialData: PaymentListItem[] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return initialData;
    return initialData.filter((payment) =>
      [
        payment.id,
        payment.number,
        payment.reference,
        payment.invoice?.number,
        payment.invoice?.title,
        customerName(payment),
        methodLabel[payment.method] || payment.method,
        statusLabel[payment.status] || payment.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [initialData, search]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setDeletingId(null);
      window.location.reload();
    },
  });

  const totalCompleted = filtered
    .filter((payment) => payment.status === "COMPLETED")
    .reduce((sum, payment) => sum + asNumber(payment.amount), 0);
  const totalAmount = filtered.reduce((sum, payment) => sum + asNumber(payment.amount), 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPayments = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const todayDate = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8 sm:py-12">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="w-fit rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Thanh toán
              </span>
              <span className="text-[13px] font-medium text-gray-500">{todayDate}</span>
            </div>
            <h1 className="mb-3 text-[32px] font-medium leading-[1.15] tracking-tight text-black md:text-[40px]">
              Quản lý <span className="text-gray-400">thanh toán.</span>
            </h1>
            <p className="max-w-xl text-[15px] text-gray-500 mt-4">
              Trung tâm tài chính giúp bạn dễ dàng theo dõi, cập nhật thông tin thanh toán, doanh thu và dòng tiền của các giao dịch trên hệ thống OVC.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-3 md:mt-0">
            <Link href="/workspace/finance/payments/create" className="inline-flex h-10 items-center justify-center rounded-full bg-black px-5 text-[13px] font-medium text-white transition-colors hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" /> Tạo mới
            </Link>
          </div>
        </div>


      <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm transition-colors duration-200 hover:border-black sm:p-6">
          <p className="mb-4 text-[13px] font-medium leading-snug text-gray-500 sm:text-[11px] sm:font-semibold sm:uppercase sm:tracking-widest">Tổng phiếu thu</p>
          <p className="truncate text-[22px] font-medium tracking-tight text-black sm:text-[28px]">{formatMoney(totalAmount)}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm transition-colors duration-200 hover:border-black sm:p-6">
          <p className="mb-4 text-[13px] font-medium leading-snug text-gray-500 sm:text-[11px] sm:font-semibold sm:uppercase sm:tracking-widest">Đã hoàn tất</p>
          <p className="truncate text-[22px] font-medium tracking-tight text-black sm:text-[28px]">{formatMoney(totalCompleted)}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm transition-colors duration-200 hover:border-black sm:p-6">
          <p className="mb-4 text-[13px] font-medium leading-snug text-gray-500 sm:text-[11px] sm:font-semibold sm:uppercase sm:tracking-widest">Đang chờ</p>
          <p className="truncate text-[22px] font-medium tracking-tight text-black sm:text-[28px]">{filtered.filter((item) => item.status === "PENDING").length}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm transition-colors duration-200 hover:border-black sm:p-6">
          <p className="mb-4 text-[13px] font-medium leading-snug text-gray-500 sm:text-[11px] sm:font-semibold sm:uppercase sm:tracking-widest">Giao dịch</p>
          <p className="truncate text-[22px] font-medium tracking-tight text-black sm:text-[28px]">{filtered.length}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col items-stretch gap-3 rounded-2xl border border-[#eaeaea] bg-white p-2 shadow-sm md:flex-row md:items-center">
        <div className="relative flex flex-1 items-center">
          <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm mã phiếu, hóa đơn, khách hàng..."
            className="w-full bg-transparent pl-11 pr-4 py-2 text-[14px] text-black outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="flex items-center gap-1.5 border-t border-[#eaeaea] px-3 py-1.5 text-[13px] font-medium text-gray-500 md:border-l md:border-t-0">
          Lọc theo:
          <span className="cursor-pointer rounded-lg border border-black bg-black px-4 py-1.5 text-white transition-colors">
            Tất cả
          </span>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#eaeaea] bg-white shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[14px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Mã phiếu</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Hóa đơn</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[310px]">Khách hàng</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Trạng thái</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-[160px] text-right">Số tiền</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px]">Ngày thanh toán</th>
                <th className="px-6 py-5 font-semibold text-gray-500 uppercase tracking-widest text-[11px] w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {paginatedPayments.map((payment) => {
                const label = statusLabel[payment.status] || payment.status;
                const color = statusColor[payment.status] || "bg-white border border-[#eaeaea] text-gray-500";

                return (
                  <tr key={payment.id} onClick={() => router.push(`/workspace/finance/payments/${payment.id}`)} className="cursor-pointer hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/workspace/finance/payments/${payment.id}`} className="font-medium text-black hover:underline">
                        {payment.number || payment.reference || payment.id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {payment.invoice?.id ? (
                        <Link href={`/workspace/finance/invoices/${payment.invoice.id}`} className="font-medium text-black hover:underline">
                          {payment.invoice.number || "Không có mã"}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Không gắn hóa đơn</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-black font-medium">
                      <span className="block truncate">{customerName(payment)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest", color)}>
                        {label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-black text-right">{formatMoney(payment.amount, payment.currency)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(payment.paidAt || payment.createdAt)}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/workspace/finance/payments/${payment.id}`} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-all" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/workspace/finance/payments/${payment.id}/edit`} className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-all" title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          onClick={() => setDeletingId(payment.id)}
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
          {!filtered.length ? <div className="p-6 text-center text-gray-500">Chưa có giao dịch thanh toán.</div> : null}
        </div>
        <CompactPagination
          currentPage={safePage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          itemLabel="thanh toán"
          onPageChange={setCurrentPage}
        />
      </div>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Xác nhận xóa thanh toán"
        message="Bạn có chắc chắn muốn xóa giao dịch thanh toán này không? Thao tác này không thể hoàn tác."
        confirmText="Xóa"
        isDestructive={true}
      />
      </div>
    </div>
  );
}

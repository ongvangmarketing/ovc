"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils/cn";
import { deletePayment } from "@/app/actions/finance-crud";
import { ConfirmModal } from "@/components/ui/confirm-modal";

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

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-12 bg-white min-h-[calc(100vh-64px)]">
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[36px] font-medium tracking-tighter text-black leading-none mb-3">Thanh toán</h1>
          <p className="text-[14px] text-gray-500">{filtered.length} giao dịch thanh toán</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg border border-[#eaeaea] text-[14px] font-medium text-black hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Xuất
          </button>
          <Link href="/workspace/finance/payments/create" className="h-9 px-4 rounded-lg bg-black text-white text-[14px] font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2 shadow-none">
            <Plus className="w-4 h-4" /> Tạo phiếu thanh toán
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-xl border border-[#eaeaea] bg-white p-6 hover:border-black transition-colors duration-200">
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-4">Tổng phiếu thu</p>
          <p className="text-[24px] font-medium tracking-tight text-black">{formatMoney(totalAmount)}</p>
        </div>
        <div className="rounded-xl border border-[#eaeaea] bg-white p-6 hover:border-black transition-colors duration-200">
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-4">Đã hoàn tất</p>
          <p className="text-[24px] font-medium tracking-tight text-black">{formatMoney(totalCompleted)}</p>
        </div>
        <div className="rounded-xl border border-[#eaeaea] bg-white p-6 hover:border-black transition-colors duration-200">
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-4">Đang chờ</p>
          <p className="text-[24px] font-medium tracking-tight text-black">{filtered.filter((item) => item.status === "PENDING").length}</p>
        </div>
        <div className="rounded-xl border border-[#eaeaea] bg-white p-6 hover:border-black transition-colors duration-200">
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-4">Giao dịch</p>
          <p className="text-[24px] font-medium tracking-tight text-black">{filtered.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap mb-6">
        <div className="relative flex-1 min-w-64 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã phiếu, hóa đơn, khách hàng..."
            className="w-full h-10 pl-10 pr-3 rounded-lg border border-[#eaeaea] bg-white text-[14px] text-black focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px] [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Mã phiếu</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Hóa đơn</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[310px]">Khách hàng</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px]">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-[160px] text-right">Số tiền</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px]">Ngày thanh toán</th>
                <th className="px-6 py-4 font-medium text-gray-500 uppercase tracking-widest text-[11px] w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {filtered.map((payment) => {
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
                      <span className={cn("inline-flex items-center px-2 py-1 rounded-[6px] text-[11px] font-medium uppercase tracking-wide", color)}>
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
      </div>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Xác nhận xóa phiếu thanh toán"
        message="Bạn có chắc chắn muốn xóa phiếu thanh toán này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa phiếu"
        isDestructive
      />
    </div>
  );
}

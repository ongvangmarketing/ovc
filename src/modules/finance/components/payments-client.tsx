"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Edit, Eye, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deletePayment } from "@/app/actions/finance-crud";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type PaymentListItem = {
  id: string;
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
  PENDING: "rgb(245 158 11)",
  PROCESSING: "rgb(37 99 235)",
  COMPLETED: "rgb(16 185 129)",
  FAILED: "rgb(239 68 68)",
  REFUNDED: "rgb(124 58 237)",
  CANCELLED: "rgb(100 116 139)",
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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return initialData;
    return initialData.filter((payment) =>
      [
        payment.id,
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
    <div className="page-container">
      <div className="page-header">
        <div className="ml-auto flex items-center gap-3">
          <button className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Xuất
          </button>
          <Link href="/workspace/finance/payments/create" className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Tạo phiếu thanh toán
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground mb-1">Tổng phiếu thu</p>
          <p className="text-lg font-bold tabular-nums text-foreground">{formatMoney(totalAmount)}</p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground mb-1">Đã hoàn tất</p>
          <p className="text-lg font-bold tabular-nums text-emerald-600">{formatMoney(totalCompleted)}</p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground mb-1">Đang chờ</p>
          <p className="text-lg font-bold tabular-nums text-amber-600">{filtered.filter((item) => item.status === "PENDING").length}</p>
        </div>
        <div className="card-base p-4">
          <p className="text-xs text-muted-foreground mb-1">Giao dịch</p>
          <p className="text-lg font-bold tabular-nums text-foreground">{filtered.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã phiếu, hóa đơn, khách hàng..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto scrollable-x">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Mã phiếu</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Hóa đơn</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Khách hàng</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Trạng thái</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Số tiền</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Ngày thanh toán</th>
                <th className="py-3 px-4 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => {
                const label = statusLabel[payment.status] || payment.status;
                const color = statusColor[payment.status] || "rgb(100 116 139)";

                return (
                  <tr key={payment.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="py-3 px-4">
                      <Link href={`/workspace/finance/payments/${payment.id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                        {payment.reference || payment.id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      {payment.invoice?.id ? (
                        <Link href={`/workspace/finance/invoices/${payment.invoice.id}`} className="text-sm font-medium text-foreground hover:text-blue-600 hover:underline">
                          {payment.invoice.number || "Không có mã"}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Không gắn hóa đơn</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{customerName(payment)}</td>
                    <td className="py-3 px-4">
                      <span className="badge-status text-xs font-medium" style={{ backgroundColor: `${color.replace("rgb", "rgba").replace(")", ", 0.14)")}`, color }}>
                        {label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-sm">{formatMoney(payment.amount, payment.currency)}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(payment.paidAt || payment.createdAt)}</td>
                    <td className="py-3 px-4" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/workspace/finance/payments/${payment.id}`} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all" title="Xem chi tiết">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link href={`/workspace/finance/payments/${payment.id}/edit`} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all" title="Chỉnh sửa">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button type="button" className="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-all" onClick={() => setDeletingId(payment.id)} title="Xóa">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!filtered.length ? <div className="quote-detail-empty m-4">Chưa có giao dịch thanh toán.</div> : null}
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

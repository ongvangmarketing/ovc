"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, Copy, Download, Edit3, Eye, FileText, ReceiptText, Trash2 } from "lucide-react";

import { deletePayment } from "@/app/actions/finance-crud";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useState } from "react";

type PaymentDetailData = {
  id: string;
  amount: unknown;
  currency: string;
  method: string;
  status: string;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  invoice?: {
    id: string;
    number?: string | null;
    title?: string | null;
    total?: unknown;
    amountDue?: unknown;
    status?: string | null;
    contact?: { name?: string | null; email?: string | null; phone?: string | null; company?: { name?: string | null } | null } | null;
    contract?: { id: string; number?: string | null } | null;
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

function formatDateTime(value?: string | Date | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function customerName(data: PaymentDetailData) {
  const contact = data.invoice?.contact;
  return contact?.company?.name || contact?.name || contact?.email || "Không gắn khách hàng";
}

export function PaymentDetailView({ data }: { data: PaymentDetailData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const paymentNumber = data.reference || data.id.slice(-8).toUpperCase();
  const receiptUrl = `/workspace/finance/payments/${data.id}/receipt`;

  const deleteMutation = useMutation({
    mutationFn: () => deletePayment(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      router.push("/workspace/finance/payments");
    },
  });

  const copyId = async () => {
    await navigator.clipboard.writeText(paymentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="quote-detail-page">
      <header className="quote-detail-hero">
        <div className="quote-detail-title">
          <div className="quote-detail-icon">
            <ArrowDownLeft className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1>{paymentNumber}</h1>
              <span className={`quote-status quote-status-${data.status.toLowerCase()}`}>{statusLabel[data.status] || data.status}</span>
            </div>
            <p>{methodLabel[data.method] || data.method} · Ngày thanh toán: {formatDateTime(data.paidAt || data.createdAt)}</p>
          </div>
        </div>
        <div className="quote-detail-top-actions">
          <Link href={receiptUrl} target="_blank" className="quote-detail-top-button">
            <Eye className="h-4 w-4" />
            Xem
          </Link>
          <Link href={`/workspace/finance/payments/${data.id}/edit`} className="quote-detail-top-button">
            <Edit3 className="h-4 w-4" />
            Chỉnh sửa
          </Link>
          <button type="button" onClick={() => setIsDeleteOpen(true)} className="quote-detail-top-button quote-detail-delete">
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        </div>
      </header>

      <section className="quote-detail-summary">
        <div>
          <span>Khách hàng</span>
          <strong>{customerName(data)}</strong>
          <p>{data.invoice?.contact?.phone || "Chưa có số điện thoại"}</p>
          <p>{data.invoice?.contact?.email || "Chưa có email"}</p>
        </div>
        <div>
          <span>Hóa đơn</span>
          <strong>{data.invoice?.number || "Không gắn hóa đơn"}</strong>
          <p>{data.invoice?.id ? "Liên kết hóa đơn thanh toán" : "Chưa liên kết hóa đơn"}</p>
        </div>
        <div>
          <span>Số tiền thanh toán</span>
          <strong className="text-emerald-600">{formatMoney(data.amount, data.currency)}</strong>
          <p>{statusLabel[data.status] || data.status}</p>
        </div>
        <div>
          <span>Tham chiếu</span>
          <strong>{paymentNumber}</strong>
          <p>{methodLabel[data.method] || data.method}</p>
        </div>
      </section>

      <div className="quote-detail-layout">
        <main className="space-y-5">
          <section className="quote-detail-card">
            <h2>Thông tin phiếu thanh toán</h2>
            <div className="quote-side-list">
              <div><span>Mã phiếu</span><strong>{paymentNumber}</strong></div>
              <div><span>Phương thức</span><strong>{methodLabel[data.method] || data.method}</strong></div>
              <div><span>Trạng thái</span><strong>{statusLabel[data.status] || data.status}</strong></div>
              <div><span>Ngày thanh toán</span><strong>{formatDateTime(data.paidAt || data.createdAt)}</strong></div>
              <div><span>Ngày tạo</span><strong>{formatDateTime(data.createdAt)}</strong></div>
              <div><span>Cập nhật</span><strong>{formatDateTime(data.updatedAt)}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Ghi chú</h2>
            <div className="contract-terms">{data.notes || "Chưa có ghi chú."}</div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="quote-detail-card">
            <h2>Tài liệu phiếu thu</h2>
            <div className="contract-document-box">
              <ReceiptText className="h-10 w-10 text-emerald-600" />
              <strong>{paymentNumber}</strong>
              <span>{formatMoney(data.amount, data.currency)}</span>
            </div>
            <Link href={receiptUrl} target="_blank" className="quote-detail-action w-full mt-3">
              <Download className="h-4 w-4" />
              Tải xuống
            </Link>
          </section>

          <section className="quote-detail-card">
            <h2>Giá trị & liên kết</h2>
            <div className="quote-side-list">
              <div><span>Số tiền</span><strong>{formatMoney(data.amount, data.currency)}</strong></div>
              <div><span>Hóa đơn</span><strong>{data.invoice?.number || "--"}</strong></div>
              <div><span>Tổng hóa đơn</span><strong>{formatMoney(data.invoice?.total, data.currency)}</strong></div>
              <div><span>Còn phải thu</span><strong>{formatMoney(data.invoice?.amountDue, data.currency)}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Thao tác</h2>
            <div className="quote-side-actions">
              <Link href={receiptUrl} target="_blank" className="quote-detail-action">
                <Eye className="h-4 w-4" />
                Xem phiếu thu
              </Link>
              {data.invoice?.id ? (
                <Link href={`/workspace/finance/invoices/${data.invoice.id}`} className="quote-detail-action">
                  <FileText className="h-4 w-4" />
                  Xem hóa đơn
                </Link>
              ) : null}
              <Link href={`/workspace/finance/payments/${data.id}/edit`} className="quote-detail-action">
                <Edit3 className="h-4 w-4" />
                Chỉnh sửa
              </Link>
              <button type="button" onClick={copyId} className="quote-detail-action">
                <Copy className="h-4 w-4" />
                {copied ? "Đã copy" : "Copy mã phiếu"}
              </button>
              <button type="button" onClick={() => setIsDeleteOpen(true)} className="quote-detail-action quote-detail-action-danger">
                <Trash2 className="h-4 w-4" />
                Xóa
              </button>
            </div>
          </section>
        </aside>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Xác nhận xóa phiếu thanh toán"
        message="Bạn có chắc chắn muốn xóa phiếu thanh toán này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa phiếu"
        isDestructive
      />
    </div>
  );
}

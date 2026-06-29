"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";

import { createPayment, updatePayment } from "@/app/actions/finance-crud";

type InvoiceOption = {
  id: string;
  number: string;
  title?: string | null;
  currency: string;
  total?: unknown;
  amountDue?: unknown;
  contact?: { name?: string | null; email?: string | null; company?: { name?: string | null } | null } | null;
};

type PaymentInitialData = {
  id: string;
  invoiceId?: string | null;
  amount: unknown;
  currency: string;
  method: string;
  status: string;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string | Date | null;
};

const methods = [
  ["BANK_TRANSFER", "Chuyển khoản"],
  ["CASH", "Tiền mặt"],
  ["CARD", "Thẻ"],
  ["MOMO", "MoMo"],
  ["ZALOPAY", "ZaloPay"],
  ["VNPAY", "VNPay"],
];

const statuses = [
  ["PENDING", "Chờ xử lý"],
  ["PROCESSING", "Đang xử lý"],
  ["COMPLETED", "Hoàn tất"],
  ["FAILED", "Thất bại"],
  ["REFUNDED", "Hoàn tiền"],
  ["CANCELLED", "Đã hủy"],
];

function toDateInput(value?: string | Date | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function asNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: unknown, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency, maximumFractionDigits: 0 }).format(asNumber(value));
}

function invoiceLabel(invoice: InvoiceOption) {
  const customer = invoice.contact?.company?.name || invoice.contact?.name || invoice.contact?.email || "Không gắn khách hàng";
  return `${invoice.number} - ${customer}`;
}

export function PaymentFormClient({
  initialData,
  invoices,
}: {
  initialData?: PaymentInitialData | null;
  invoices: InvoiceOption[];
}) {
  const router = useRouter();
  const [invoiceId, setInvoiceId] = useState(initialData?.invoiceId || invoices[0]?.id || "");
  const selectedInvoice = useMemo(() => invoices.find((invoice) => invoice.id === invoiceId), [invoiceId, invoices]);
  const [amount, setAmount] = useState(String(asNumber(initialData?.amount ?? selectedInvoice?.amountDue ?? selectedInvoice?.total ?? 0)));
  const [currency, setCurrency] = useState(initialData?.currency || selectedInvoice?.currency || "VND");
  const [method, setMethod] = useState(initialData?.method || "BANK_TRANSFER");
  const [status, setStatus] = useState(initialData?.status || "COMPLETED");
  const [reference, setReference] = useState(initialData?.reference || "");
  const [paidAt, setPaidAt] = useState(toDateInput(initialData?.paidAt));
  const [notes, setNotes] = useState(initialData?.notes || "");

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        invoiceId: invoiceId || null,
        amount: asNumber(amount),
        currency,
        method,
        status,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
        paidAt,
      };
      return initialData?.id ? updatePayment(initialData.id, payload) : createPayment(payload);
    },
    onSuccess: (result) => {
      router.push(`/workspace/finance/payments/${result.paymentId}?t=${Date.now()}`);
      router.refresh();
    },
    onError: (error) => alert(error instanceof Error ? error.message : "Không thể lưu phiếu thanh toán."),
  });

  const fillInvoiceDue = () => {
    if (!selectedInvoice) return;
    setCurrency(selectedInvoice.currency || "VND");
    setAmount(String(asNumber(selectedInvoice.amountDue ?? selectedInvoice.total)));
  };

  return (
    <div className="quote-page mx-auto">
      <header className="quote-editor-header">
        <div>
          <p className="quote-kicker">Tài chính / Thanh toán</p>
          <h1>{initialData ? "Chỉnh sửa phiếu thanh toán" : "Tạo phiếu thanh toán"}</h1>
          <p>Ghi nhận thanh toán theo hóa đơn, kênh chuyển khoản hoặc tiền mặt.</p>
        </div>
        <div className="quote-editor-actions">
          <Link href={initialData ? `/workspace/finance/payments/${initialData.id}` : "/workspace/finance/payments"} className="quote-secondary-button">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
          <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="quote-save-button">
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </header>

      <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(); }}>
        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Thông tin thanh toán</h2>
            <span>Liên kết hóa đơn và số tiền thực thu</span>
          </div>
          <div className="quote-grid-3">
            <label>
              <span>Hóa đơn</span>
              <select value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)}>
                <option value="">Không gắn hóa đơn</option>
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>{invoiceLabel(invoice)}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Số tiền</span>
              <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" />
            </label>
            <label>
              <span>Loại tiền</span>
              <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </label>
            <label>
              <span>Phương thức</span>
              <select value={method} onChange={(event) => setMethod(event.target.value)}>
                {methods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>Trạng thái</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span>Ngày thanh toán</span>
              <input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
            </label>
            <label>
              <span>Mã tham chiếu</span>
              <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="VD: GD-0629..." />
            </label>
          </div>
          {selectedInvoice ? (
            <div className="quote-inline-total quote-inline-total-two-col mt-4">
              <div><span>Hóa đơn</span><strong>{selectedInvoice.number}</strong></div>
              <div><span>Còn phải thu</span><strong>{formatMoney(selectedInvoice.amountDue ?? selectedInvoice.total, selectedInvoice.currency)}</strong></div>
              <div><span>Tổng hóa đơn</span><strong>{formatMoney(selectedInvoice.total, selectedInvoice.currency)}</strong></div>
              <button type="button" onClick={fillInvoiceDue} className="quote-secondary-button">Lấy số còn phải thu</button>
            </div>
          ) : null}
        </section>

        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Ghi chú</h2>
          </div>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} placeholder="Ghi chú nội bộ, nội dung chuyển khoản, đối soát..." />
        </section>
      </form>
    </div>
  );
}

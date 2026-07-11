"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save } from "lucide-react";

import {  createPayment, updatePayment  } from "@/modules/finance/actions/finance.actions";
import { formatCurrency } from "@/lib/utils/format";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

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
  number?: string | null;
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

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[15px] font-light text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function invoiceLabel(invoice: InvoiceOption) {
  const customer = invoice.contact?.company?.name || invoice.contact?.name || invoice.contact?.email || "Không gắn khách hàng";
  return `${invoice.number} · ${invoice.title || customer}`;
}

export function PaymentFormClient({
  initialData,
  invoices,
  initialNumber = "",
}: {
  initialData?: PaymentInitialData | null;
  invoices: InvoiceOption[];
  initialNumber?: string;
}) {
  const router = useRouter();
  const [number, setNumber] = useState(initialData?.number || initialData?.reference || initialNumber);
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
        number: number.trim() || undefined,
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
    <div className="mx-auto max-w-[1060px] px-6 py-6">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[15px] font-medium uppercase tracking-widest text-gray-400">
            Tài chính / Thanh toán
          </div>
          <h1 className="text-[48px] md:text-[56px] font-medium tracking-tighter text-black leading-none">{initialData ? "Chỉnh sửa phiếu thanh toán" : "Tạo phiếu thanh toán"}</h1>
          <p className="mt-4 text-[16px] text-gray-500">Ghi nhận thanh toán theo hóa đơn, kênh chuyển khoản hoặc tiền mặt.</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <Link href={initialData ? `/workspace/finance/payments/${initialData.id}` : "/workspace/finance/payments"} className="rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[15px] font-medium text-black transition-colors hover:bg-gray-50">
            Quay lại
          </Link>
          <button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-full bg-black px-6 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-gray-800">
            {saveMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      <form className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10" onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(); }}>
        <section className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:col-span-8 lg:col-start-1">
          <div className="mb-8 flex flex-col gap-2 border-b border-[#eaeaea] pb-4">
            <h2 className="m-0 text-[24px] font-medium tracking-tight text-black">Thông tin thanh toán</h2>
            <span className="text-[15px] text-gray-500">Liên kết hóa đơn và số tiền thực thu</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Số phiếu thanh toán">
              <input value={number} onChange={(event) => setNumber(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="Tự sinh nếu bỏ trống" />
            </Field>
            <Field label="Hóa đơn">
              <select value={invoiceId} onChange={(event) => setInvoiceId(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
                <option value="">Không gắn hóa đơn</option>
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>{invoiceLabel(invoice)}</option>
                ))}
              </select>
            </Field>
            <Field label="Số tiền">
              <input value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" inputMode="decimal" />
            </Field>
            <Field label="Loại tiền">
              <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </Field>
            <Field label="Phương thức">
              <select value={method} onChange={(event) => setMethod(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
                {methods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Trạng thái">
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none">
                {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Ngày thanh toán">
              <input type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" />
            </Field>
            <Field label="Mã tham chiếu">
              <input value={reference} onChange={(event) => setReference(event.target.value)} className="w-full rounded-lg border border-[#eaeaea] bg-gray-50/50 px-4 py-3 text-[15px] text-black transition-colors placeholder:text-gray-300 hover:bg-gray-100 focus:border-[#eaeaea] focus:bg-white focus:ring-1 focus:ring-[#eaeaea] focus:outline-none" placeholder="VD: GD-0629..." />
            </Field>
          </div>
          {selectedInvoice ? (
            <div className="mt-8 rounded-xl border border-[#eaeaea] bg-gray-50/50 p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-[15px]">
                  <span className="text-gray-500">Hóa đơn</span>
                  <strong className="font-medium text-black">{selectedInvoice.number}</strong>
                </div>
                <div className="flex items-center justify-between text-[15px]">
                  <span className="text-gray-500">Còn phải thu</span>
                  <strong className="font-medium text-red-600">{formatMoney(selectedInvoice.amountDue ?? selectedInvoice.total, selectedInvoice.currency)}</strong>
                </div>
                <div className="flex items-center justify-between border-t border-[#eaeaea] pt-4 text-[15px]">
                  <span className="text-gray-500">Tổng hóa đơn</span>
                  <strong className="font-medium text-black">{formatMoney(selectedInvoice.total, selectedInvoice.currency)}</strong>
                </div>
                <button type="button" onClick={fillInvoiceDue} className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border border-[#eaeaea] bg-white px-4 py-2 text-[15px] font-medium text-black transition-colors hover:bg-gray-50">Lấy số còn phải thu</button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 lg:sticky lg:top-8 lg:col-span-4 lg:col-start-9 lg:row-span-12 lg:row-start-1">
          <div className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-4">
            <h2 className="text-[24px] font-medium tracking-tight text-black">Ghi chú</h2>
          </div>
          <TiptapEditor 
            value={notes} 
            onChange={(content) => setNotes(content)} 
            placeholder="Ghi chú nội bộ, nội dung chuyển khoản, đối soát..." 
          />
        </section>
      </form>
    </div>
  );
}

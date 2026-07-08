"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, Copy, Download, Edit3, Eye, FileText, Mail, ReceiptText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

import { deletePayment, getPaymentEmailDraft, sendPaymentEmail, type FinanceEmailSendPayload } from "@/app/actions/finance-crud";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmailComposerModal, type FinanceEmailDraft } from "./email-composer-modal";
import { DocumentNavigator } from "./finance-detail-widgets";
import { useState } from "react";

type PaymentDetailData = {
  id: string;
  number?: string | null;
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
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState<FinanceEmailDraft | null>(null);
  const [isEmailDraftLoading, setIsEmailDraftLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const paymentNumber = data.number || data.reference || data.id.slice(-8).toUpperCase();
  const receiptUrl = `/workspace/finance/payments/${data.id}/receipt`;
  const receiptPdfUrl = `${receiptUrl}/pdf`;
  const isCompanyCustomer = !!data.invoice?.contact?.company;
  const customerCompany = data.invoice?.contact?.company?.name || '';
  const customerTaxCode = data.invoice?.contact?.company?.taxCode || data.invoice?.contact?.taxCode || '';
  const customerAddress = data.invoice?.contact?.company?.address || data.invoice?.contact?.address || '';
  const customerPhone = data.invoice?.contact?.company?.phone || data.invoice?.contact?.phone || '';
  const customerEmail = data.invoice?.contact?.company?.email || data.invoice?.contact?.email || '';
  const customerPerson = data.invoice?.contact ? `${data.invoice.contact.firstName || ''} ${data.invoice.contact.lastName || ''}`.trim() || data.invoice.contact.name : '';

  const deleteMutation = useMutation({
    mutationFn: () => deletePayment(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      router.push("/workspace/finance/payments");
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (payload: FinanceEmailSendPayload) => sendPaymentEmail(data.id, payload),
    onSuccess: () => {
      setIsSendModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => alert(error instanceof Error ? error.message : "Không thể gửi email phiếu thu."),
  });

  const openSendModal = async () => {
    setIsSendModalOpen(true);
    setEmailDraft(null);
    setIsEmailDraftLoading(true);
    try {
      setEmailDraft(await getPaymentEmailDraft(data.id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể chuẩn bị email phiếu thu.");
      setIsSendModalOpen(false);
    } finally {
      setIsEmailDraftLoading(false);
    }
  };

  const copyId = async () => {
    await navigator.clipboard.writeText(paymentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-12 bg-white min-h-[calc(100vh-64px)] animate-in fade-in duration-300">
      <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#eaeaea] pb-6">
        <div className="flex items-center gap-4">
          <div className="hidden">
            <ArrowDownLeft className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[36px] font-medium tracking-tighter text-black leading-none">{paymentNumber}</h1>
              <span className={cn("px-2.5 py-1 rounded-full text-[13px] font-medium border", data.status === "DRAFT" ? "bg-gray-50 border-gray-200 text-gray-700" : data.status === "SENT" ? "bg-blue-50 border-blue-200 text-blue-700" : data.status === "ACCEPTED" ? "bg-green-50 border-green-200 text-green-700" : data.status === "REJECTED" ? "bg-red-50 border-red-200 text-red-700" : "bg-purple-50 border-purple-200 text-purple-700")}>{statusLabel[data.status] || data.status}</span>
            </div>
            <p>{methodLabel[data.method] || data.method} · Ngày thanh toán: {formatDateTime(data.paidAt || data.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={receiptPdfUrl} target="_blank" className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-black rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-4 w-4" />
            Xem PDF
          </Link>
          <button type="button" onClick={openSendModal} disabled={sendEmailMutation.isPending || isEmailDraftLoading} className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-black rounded-lg hover:bg-gray-50 transition-colors">
            <Mail className="h-4 w-4" />
            {sendEmailMutation.isPending ? "Đang gửi" : "Gửi email"}
          </button>
          <Link href={`/workspace/finance/payments/${data.id}/edit`} className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-black rounded-lg hover:bg-gray-50 transition-colors">
            <Edit3 className="h-4 w-4" />
            Chỉnh sửa
          </Link>
          <button type="button" onClick={() => setIsDeleteOpen(true)} className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors">
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 mb-10">
        <div className="lg:col-span-2">
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest block mb-4">Khách hàng</span>
          <strong className="text-[20px] font-medium text-black block leading-tight mb-1">
            {isCompanyCustomer ? customerCompany : (customerPerson || customerEmail || "Chưa có thông tin")}
          </strong>
          {isCompanyCustomer && (
            <p className="text-[15px] text-gray-500 mb-6">
              Mã số thuế: {customerTaxCode || "Chưa cập nhật"}
            </p>
          )}
          {!isCompanyCustomer && <div className="mb-6" />}

          <div className="grid gap-3 max-w-xl">
            {isCompanyCustomer && customerPerson && (
              <div className="flex text-[14px]">
                <span className="text-gray-500 w-32 shrink-0 font-light">Đại diện:</span>
                <span className="text-gray-900">{customerPerson}</span>
              </div>
            )}
            {customerAddress && (
              <div className="flex text-[14px]">
                <span className="text-gray-500 w-32 shrink-0 font-light">Địa chỉ:</span>
                <span className="text-gray-900">{customerAddress}</span>
              </div>
            )}
            <div className="flex text-[14px]">
              <span className="text-gray-500 w-32 shrink-0 font-light">Điện thoại:</span>
              <span className="text-gray-900">{customerPhone || "—"}</span>
            </div>
            <div className="flex text-[14px]">
              <span className="text-gray-500 w-32 shrink-0 font-light">Email:</span>
              <span className="text-gray-900">{customerEmail || "—"}</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-[#eaeaea] pt-6 lg:pt-0 lg:pl-8">
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest block mb-2">Hóa đơn</span>
          <strong className="text-[20px] font-medium text-black block mb-1">{data.invoice?.number || "Không gắn hóa đơn"}</strong>
          <p className="text-[14px] text-gray-600 mb-1">{data.invoice?.id ? "Liên kết hóa đơn thanh toán" : "Chưa liên kết hóa đơn"}</p>
          <p className="text-[14px] text-gray-600">Ngày tạo: {formatDateTime(data.createdAt)}</p>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1 space-y-5">
          <section className="bg-white rounded-xl border border-[#eaeaea] p-6 mb-6">
            <div className="mb-4">
              <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Thông tin phiếu thanh toán</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px] mt-4">
              <div className="text-slate-500 font-light">Mã phiếu</div><div className="font-medium text-right text-black">{paymentNumber}</div>
              <div className="text-slate-500 font-light">Phương thức</div><div className="font-medium text-right text-black">{methodLabel[data.method] || data.method}</div>
              <div className="text-slate-500 font-light">Trạng thái</div><div className="font-medium text-right text-black">{statusLabel[data.status] || data.status}</div>
              <div className="text-slate-500 font-light">Ngày thanh toán</div><div className="font-medium text-right text-black">{formatDateTime(data.paidAt || data.createdAt)}</div>
              <div className="text-slate-500 font-light">Ngày tạo</div><div className="font-medium text-right text-black">{formatDateTime(data.createdAt)}</div>
              <div className="text-slate-500 font-light">Cập nhật</div><div className="font-medium text-right text-black">{formatDateTime(data.updatedAt)}</div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#eaeaea] p-6 mb-6">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Ghi chú</h2>
            <div className="contract-terms">{data.notes || "Chưa có ghi chú."}</div>
          </section>
        </main>

        <aside className="w-full lg:w-[340px] shrink-0 space-y-5">
          <DocumentNavigator
            basePath="/workspace/finance/payments"
            currentNumber={data.number}
            previous={data.previousDocument}
            next={data.nextDocument}
          />
          <section className="bg-white rounded-xl border border-[#eaeaea] p-6 mb-6">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Tài liệu phiếu thu</h2>
            <div className="contract-document-box">
              <ReceiptText className="h-10 w-10 text-emerald-600" />
              <strong>{paymentNumber}</strong>
              <span>{formatMoney(data.amount, data.currency)}</span>
            </div>
            <Link href={receiptPdfUrl} target="_blank" className="w-full flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-black rounded-lg hover:bg-gray-50 transition-colors mt-3">
              <Download className="h-4 w-4" />
              Tải xuống
            </Link>
          </section>

          <section className="bg-white rounded-xl border border-[#eaeaea] p-6 mb-6">
            <div className="mb-4">
              <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Giá trị & liên kết</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px] mt-4">
              <div className="text-slate-500 font-light">Số tiền</div><div className="font-medium text-right text-black">{formatMoney(data.amount, data.currency)}</div>
              <div className="text-slate-500 font-light">Hóa đơn</div><div className="font-medium text-right text-black">{data.invoice?.number || "--"}</div>
              <div className="text-slate-500 font-light mt-2">Tổng hóa đơn</div><div className="font-medium text-right text-black mt-2">{formatMoney(data.invoice?.total, data.currency)}</div>
              <div className="text-slate-500 font-light mt-2">Còn phải thu</div><div className="font-medium text-orange-600 text-[14px] text-right mt-2">{formatMoney(data.invoice?.amountDue, data.currency)}</div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#eaeaea] p-6 mb-6">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Thao tác</h2>
            <div className="grid gap-3">
              <Link href={receiptUrl} target="_blank" className="flex items-center justify-center gap-2 px-4 h-9 bg-black text-white text-[14px] font-medium rounded-lg hover:bg-gray-800 transition-colors w-full">
                <Eye className="h-4 w-4" />
                Xem phiếu thu
              </Link>
              {data.invoice?.id ? (
                <Link href={`/workspace/finance/invoices/${data.invoice.id}`} className="flex items-center justify-center gap-2 px-4 h-9 bg-black text-white text-[14px] font-medium rounded-lg hover:bg-gray-800 transition-colors w-full">
                  <FileText className="h-4 w-4" />
                  Xem hóa đơn
                </Link>
              ) : null}
              <Link href={`/workspace/finance/payments/${data.id}/edit`} className="flex items-center justify-center gap-2 px-4 h-9 bg-black text-white text-[14px] font-medium rounded-lg hover:bg-gray-800 transition-colors w-full">
                <Edit3 className="h-4 w-4" />
                Chỉnh sửa
              </Link>
              <button type="button" onClick={copyId} className="flex items-center justify-center gap-2 px-4 h-9 bg-black text-white text-[14px] font-medium rounded-lg hover:bg-gray-800 transition-colors w-full">
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
      <EmailComposerModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSend={(payload) => sendEmailMutation.mutate(payload)}
        title={`Gửi phiếu thu ${paymentNumber}`}
        draft={emailDraft}
        isLoading={isEmailDraftLoading}
        isPending={sendEmailMutation.isPending}
      />
    </div>
  );
}

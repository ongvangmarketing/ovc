"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDownLeft, Copy, Download, Edit3, Eye, FileText, Mail, ReceiptText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

import {  deletePayment, getPaymentEmailDraft, sendPaymentEmail, type FinanceEmailSendPayload  } from "@/modules/finance/actions/finance.actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EmailComposerModal, type FinanceEmailDraft } from "./email-composer-modal";
import { DocumentNavigator, type FinanceDocumentLink } from "./finance-detail-widgets";
import { useState, useRef, useEffect } from "react";

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
  previousDocument?: FinanceDocumentLink | null;
  nextDocument?: FinanceDocumentLink | null;
  invoice?: {
    id: string;
    number?: string | null;
    title?: string | null;
    total?: unknown;
    amountDue?: unknown;
    status?: string | null;
    contact?: {
      firstName?: string | null;
      lastName?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      taxCode?: string | null;
      address?: string | null;
      company?: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        taxCode?: string | null;
        address?: string | null;
      } | null;
    } | null;
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

const statusColor: Record<string, string> = {
  PENDING: "bg-white border-[#eaeaea] text-gray-500",
  PROCESSING: "bg-gray-50 border-[#eaeaea] text-black",
  COMPLETED: "bg-gray-100 border-gray-200 text-black",
  FAILED: "bg-white border-red-200 text-red-600",
  REFUNDED: "bg-white border-[#eaeaea] text-gray-500",
  CANCELLED: "bg-white border-[#eaeaea] text-gray-400",
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
  const customerPerson = data.invoice?.contact ? `${data.invoice.contact.firstName || ''} ${data.invoice.contact.lastName || ''}`.trim() || data.invoice.contact.name || '' : '';

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

  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (moreMenuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8 sm:py-12 bg-white min-h-[calc(100vh-64px)] animate-in fade-in duration-300">
      <header className="mb-12 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-fit rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Phiếu thu
            </span>
            <h1 className="text-[32px] font-medium tracking-tight text-black leading-none">{paymentNumber}</h1>
            <span className={cn(
              "px-3 py-1 rounded-full text-[12px] font-semibold border",
              statusColor[data.status] || statusColor.PENDING
            )}>
              {statusLabel[data.status] || data.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] text-gray-500">
            <span className="flex items-center gap-1.5"><strong className="font-medium text-black">{methodLabel[data.method] || data.method}</strong></span>
            <span className="text-gray-300">•</span>
            <span>Ngày thanh toán: {formatDateTime(data.paidAt || data.createdAt)}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:mt-0 mt-4">
          <Link href={receiptPdfUrl} target="_blank" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
            <FileText className="h-4 w-4" /> Xem PDF
          </Link>
          <button type="button" onClick={openSendModal} disabled={sendEmailMutation.isPending || isEmailDraftLoading} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
            <Mail className="h-4 w-4" /> {sendEmailMutation.isPending ? "Đang gửi" : "Gửi email"}
          </button>
          <Link href={`/workspace/finance/payments/${data.id}/edit`} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-black px-5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors">
            <Edit3 className="h-4 w-4" /> Chỉnh sửa
          </Link>
          <div ref={moreMenuRef} className="relative">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
              Thêm
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#eaeaea] rounded-[16px] shadow-lg overflow-hidden z-10 flex flex-col py-1.5">
                <Link href={receiptUrl} target="_blank" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
                  <Eye className="h-4 w-4" />
                  <span>Xem bản HTML</span>
                </Link>
                <button type="button" onClick={() => { setMenuOpen(false); copyId(); }} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors text-left w-full">
                  <Copy className="h-4 w-4" />
                  <span>{copied ? "Đã copy mã" : "Copy mã phiếu"}</span>
                </button>
                <div className="h-px bg-[#eaeaea] my-1.5" />
                <button type="button" onClick={() => { setMenuOpen(false); setIsDeleteOpen(true); }} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors text-left w-full">
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa phiếu</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Khách hàng</span>
          </div>
          <strong className="text-[20px] font-medium text-black block leading-tight mb-1">
            {isCompanyCustomer ? customerCompany : (customerPerson || customerEmail || "Chưa có thông tin")}
          </strong>
          {isCompanyCustomer && (
            <p className="text-[14px] text-gray-500 mb-6">Mã số thuế: {customerTaxCode || "Chưa cập nhật"}</p>
          )}
          {!isCompanyCustomer && <div className="mb-6" />}
          
          <div className="grid gap-3 text-[14px]">
            {isCompanyCustomer && customerPerson && (
              <div className="flex gap-4">
                <span className="text-gray-400 w-28 shrink-0">Đại diện</span>
                <span className="text-black">{customerPerson}</span>
              </div>
            )}
            {customerAddress && (
              <div className="flex gap-4">
                <span className="text-gray-400 w-28 shrink-0">Địa chỉ</span>
                <span className="text-black">{customerAddress}</span>
              </div>
            )}
            <div className="flex gap-4">
              <span className="text-gray-400 w-28 shrink-0">Điện thoại</span>
              <span className="text-black">{customerPhone || "—"}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-400 w-28 shrink-0">Email</span>
              <span className="text-black">{customerEmail || "—"}</span>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Hóa đơn & Liên kết</span>
          </div>
          <strong className="text-[20px] font-medium text-black block mb-1">
            {data.invoice?.number || "Không gắn hóa đơn"}
          </strong>
          <p className="text-[14px] text-gray-500 mb-6">{data.invoice?.id ? "Liên kết hóa đơn thanh toán" : "Chưa liên kết hóa đơn"}</p>
          
          <div className="grid gap-3 text-[14px]">
            <div className="flex gap-4">
              <span className="text-gray-400 w-28 shrink-0">Ngày tạo</span>
              <span className="text-black">{formatDateTime(data.createdAt)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1 space-y-6">
          <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-medium text-black mb-6">Thông tin phiếu thanh toán</h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-[14px]">
              <div>
                <span className="text-gray-500 block mb-1">Mã phiếu</span>
                <strong className="text-black font-medium text-[15px]">{paymentNumber}</strong>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Phương thức</span>
                <span className="text-black">{methodLabel[data.method] || data.method}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Trạng thái</span>
                <span className="text-black">{statusLabel[data.status] || data.status}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Ngày thanh toán</span>
                <span className="text-black">{formatDateTime(data.paidAt || data.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Ngày tạo</span>
                <span className="text-black">{formatDateTime(data.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Cập nhật</span>
                <span className="text-black">{formatDateTime(data.updatedAt)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-medium text-black mb-6">Ghi chú</h2>
            <div className="rounded-[16px] bg-gray-50/50 p-6 border border-[#eaeaea]">
              <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: data.notes || "Chưa có ghi chú." }} />
            </div>
          </section>
        </main>

        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 space-y-6">
          <DocumentNavigator
            basePath="/workspace/finance/payments"
            currentNumber={paymentNumber}
            previous={data.previousDocument}
            next={data.nextDocument}
          />
          <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
            <h2 className="text-[14px] font-medium uppercase tracking-widest text-gray-400 mb-4">Tài liệu phiếu thu</h2>
            <div className="flex items-center gap-4 rounded-[16px] border border-[#eaeaea] p-4 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <ReceiptText className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-[14px] font-medium text-black">{paymentNumber}</strong>
                <span className="text-[13px] text-gray-500">{formatMoney(data.amount, data.currency)}</span>
              </div>
            </div>
            <Link href={receiptPdfUrl} target="_blank" className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 text-[14px] font-medium text-black hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" /> Tải xuống PDF
            </Link>
          </section>

          <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
            <h2 className="text-[14px] font-medium uppercase tracking-widest text-gray-400 mb-4">Giá trị & Liên kết</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[14px]">
              <div className="text-gray-500">Số tiền</div><div className="font-medium text-right text-black">{formatMoney(data.amount, data.currency)}</div>
              <div className="text-gray-500 pt-3 border-t border-[#eaeaea]">Hóa đơn</div><div className="font-medium text-right pt-3 border-t border-[#eaeaea] text-black">{data.invoice?.number || "--"}</div>
              <div className="text-gray-500">Tổng hóa đơn</div><div className="font-medium text-right text-black">{formatMoney(data.invoice?.total, data.currency)}</div>
              <div className="text-gray-500">Còn phải thu</div><div className="font-medium text-right text-orange-600">{formatMoney(data.invoice?.amountDue, data.currency)}</div>
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

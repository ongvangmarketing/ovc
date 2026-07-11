"use client";

import { cn } from "@/lib/utils/cn";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  Copy,
  Download,
  Edit3,
  Ellipsis,
  Eye,
  ReceiptText,
  Send,
  ShieldCheck,
  Trash2,
  UserX,
  XCircle,
} from "lucide-react";

import { 
  adminRevokeCustomerSignature,
  adminRevokeSignature,
  adminSignDocument,
  deleteInvoice,
  getDocumentEmailDraft,
  recordPayment,
  sendDocumentEmail,
  type FinanceEmailSendPayload,
 } from "@/modules/finance/actions/finance.actions";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getPaymentChannel, getVietQrUrl, normalizePaymentChannelKeys } from "@/lib/finance/payment-channels";
import { AdminSignModal } from "./admin-sign-modal";
import { EmailComposerModal, type FinanceEmailDraft } from "./email-composer-modal";
import { InvoicePaymentModal } from "./invoice-payment-modal";
import {
  ActivityTimeline,
  AttachmentList,
  DocumentNavigator,
  type FinanceActivity,
  type FinanceAttachment,
  type FinanceDocumentLink,
} from "./finance-detail-widgets";

type PaymentPayload = {
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  paidAt: string;
  sendCustomerEmail: boolean;
};

type InvoiceDetailData = {
  id: string;
  number: string;
  title?: string | null;
  status: string;
  currency: string;
  paymentChannels?: unknown;
  subtotal?: unknown;
  discount?: unknown;
  tax?: unknown;
  total?: unknown;
  amountPaid?: unknown;
  amountDue?: unknown;
  notes?: string | null;
  terms?: string | null;
  dueDate?: string | Date | null;
  issuedAt?: string | Date | null;
  sentAt?: string | Date | null;
  paidAt?: string | Date | null;
  token?: string | null;
  adminSignedAt?: string | Date | null;
  signedAt?: string | Date | null;
  customerSignatureRequired?: boolean;
  createdAt: string | Date;
  activityLogs?: FinanceActivity[];
  files?: FinanceAttachment[];
  previousDocument?: FinanceDocumentLink | null;
  nextDocument?: FinanceDocumentLink | null;
  contact?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string | null;
    phone?: string | null;
    taxCode?: string | null;
    address?: string | null;
    company?: { id?: string; name?: string | null; taxCode?: string | null; address?: string | null; phone?: string | null; email?: string | null; } | null;
  } | null;
  contract?: { id: string; number?: string | null; title?: string | null } | null;
  project?: { name?: string | null } | null;
  creator?: { name?: string | null; email?: string | null } | null;
  organization?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  items?: Array<{
    id: string;
    name: string;
    description?: string | null;
    quantity: unknown;
    unitPrice: unknown;
    discount?: unknown;
    tax?: unknown;
    total: unknown;
  }>;
  payments?: Array<{
    id: string;
    amount: unknown;
    method: string;
    status: string;
    reference?: string | null;
    notes?: string | null;
    paidAt?: string | Date | null;
    createdAt: string | Date;
  }>;
};

const statusLabel: Record<string, string> = {
  DRAFT: "Nháp",
  SENT: "Đã gửi",
  VIEWED: "Đã xem",
  PARTIAL: "Đặt cọc",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
  REFUNDED: "Hoàn tiền",
};

const statusColor: Record<string, string> = {
  DRAFT: "bg-gray-50 border-gray-200 text-gray-700",
  SENT: "bg-white border-[#eaeaea] text-gray-600",
  VIEWED: "bg-white border-[#eaeaea] text-gray-600",
  PARTIAL: "bg-gray-50 border-gray-200 text-black",
  PAID: "bg-gray-100 border-gray-200 text-black",
  OVERDUE: "bg-white border-red-200 text-red-600",
  CANCELLED: "bg-white border-[#eaeaea] text-gray-400",
  REFUNDED: "bg-white border-[#eaeaea] text-gray-500",
};

const detailTabs = [
  { id: "payments", label: "Thanh toán" },
  { id: "channels", label: "Kênh thanh toán" },
  { id: "activity", label: "Lịch sử hoạt động" },
  { id: "files", label: "Tệp đính kèm" },
];

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

function contactName(contact: InvoiceDetailData["contact"]) {
  if (!contact) return "Chưa chọn khách hàng";
  return contact.name || `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || contact.email || "Khách hàng";
}

function plainDescription(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ActionButton({
  icon,
  label,
  onClick,
  href,
  danger,
  disabled,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const isDisabled = disabled || (href !== undefined && !href);
  const className = `quote-detail-action ${danger ? "quote-detail-action-danger" : ""} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`;
  if (href && !isDisabled) return <Link href={href} className={className} title={title}>{icon}{label}</Link>;
  return <button type="button" onClick={onClick} className={className} disabled={isDisabled} title={title}>{icon}{label}</button>;
}

export function InvoiceDetailView({ data }: { data: InvoiceDetailData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("payments");
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isAdminRevokeModalOpen, setIsAdminRevokeModalOpen] = useState(false);
  const [isCustomerRevokeModalOpen, setIsCustomerRevokeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState<FinanceEmailDraft | null>(null);
  const [isEmailDraftLoading, setIsEmailDraftLoading] = useState(false);

  const publicUrl = data.token ? `/document/${data.token}` : "";
  const fullPublicUrl = data.token && typeof window !== "undefined" ? `${window.location.origin}${publicUrl}` : "";
  const customerName = data.contact?.company?.name || contactName(data.contact);
  const isCompanyCustomer = !!data.contact?.company;
  const customerCompany = data.contact?.company?.name || '';
  const customerTaxCode = data.contact?.company?.taxCode || data.contact?.taxCode || '';
  const customerAddress = data.contact?.company?.address || data.contact?.address || '';
  const customerPhone = data.contact?.company?.phone || data.contact?.phone || '';
  const customerEmail = data.contact?.company?.email || data.contact?.email || '';
  const customerPerson = data.contact ? `${data.contact.firstName || ''} ${data.contact.lastName || ''}`.trim() || data.contact.name : '';
  const amountPaid = asNumber(data.amountPaid) || (data.payments || []).reduce((sum, item) => sum + asNumber(item.amount), 0);
  const amountDue = Math.max(0, asNumber(data.total) - amountPaid);
  const paidPercent = asNumber(data.total) > 0 ? Math.min(100, Math.round((amountPaid / asNumber(data.total)) * 100)) : 0;
  const paymentContent = `Thanh toan ${data.number}`;
  const channelKeys = normalizePaymentChannelKeys(data.paymentChannels);
  const hasCustomerCancel = Boolean(data.activityLogs?.some((log) => log.action === "customer_signature_revoked")) || data.status === "CANCELLED";
  const customerSignatureRequired = data.customerSignatureRequired !== false;
  const hasCustomerSignOrCancel = !customerSignatureRequired || Boolean(data.signedAt) || hasCustomerCancel;
  const customerDecisionLabel = customerSignatureRequired ? (data.signedAt ? "Ký kết" : "Hủy") : "Không cần ký";

  const steps = useMemo(
    () => [
      { label: "Tạo hóa đơn", done: true },
      { label: "Đã ký", done: Boolean(data.adminSignedAt) },
      { label: "Đã gửi", done: Boolean(data.sentAt) || data.status === "SENT" },
      { label: customerDecisionLabel, done: hasCustomerSignOrCancel },
      { label: "Thanh toán", done: ["PARTIAL", "PAID"].includes(data.status) || amountPaid > 0 },
    ],
    [amountPaid, data.adminSignedAt, data.sentAt, data.status, hasCustomerSignOrCancel, customerDecisionLabel]
  );
  const fallbackActivities = useMemo(
    () =>
      [
        { action: "created", description: `Tạo hóa đơn ${data.number}`, createdAt: data.createdAt, user: data.creator },
        data.sentAt || data.status === "SENT"
          ? { action: "sent", description: `Gửi hóa đơn ${data.number}`, createdAt: data.sentAt || data.createdAt, user: data.creator }
          : null,
        data.adminSignedAt
          ? { action: "signed", description: `Admin ký hóa đơn ${data.number}`, createdAt: data.adminSignedAt, user: data.creator }
          : null,
        data.signedAt
          ? { action: "signed", description: `Khách hàng ký hóa đơn ${data.number}`, createdAt: data.signedAt, user: data.creator }
          : null,
        amountPaid > 0 || ["PARTIAL", "PAID"].includes(data.status)
          ? { action: "payment", description: `Ghi nhận thanh toán ${formatMoney(amountPaid, data.currency)}`, createdAt: data.paidAt || data.createdAt, user: data.creator }
          : null,
      ].filter(Boolean) as FinanceActivity[],
    [amountPaid, data.adminSignedAt, data.createdAt, data.creator, data.currency, data.number, data.paidAt, data.sentAt, data.signedAt, data.status]
  );

  const deleteMutation = useMutation({
    mutationFn: () => deleteInvoice(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.push("/workspace/finance/invoices");
    },
  });

  const paymentMutation = useMutation({
    mutationFn: (paymentData: PaymentPayload) =>
      recordPayment(
        data.id,
        paymentData.amount,
        paymentData.method,
        paymentData.notes,
        paymentData.paidAt,
        paymentData.sendCustomerEmail
      ),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      setIsPaymentModalOpen(false);
      router.push(`/workspace/finance/payments/${result.paymentId}`);
    },
  });

  const signMutation = useMutation({
    mutationFn: (signature: string) => adminSignDocument("invoice", data.id, signature),
    onSuccess: () => {
      setIsSignModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.refresh();
    },
  });

  const revokeAdminMutation = useMutation({
    mutationFn: () => adminRevokeSignature("invoice", data.id),
    onSuccess: () => {
      setIsAdminRevokeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.refresh();
    },
  });

  const revokeCustomerMutation = useMutation({
    mutationFn: () => adminRevokeCustomerSignature("invoice", data.id),
    onSuccess: () => {
      setIsCustomerRevokeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.refresh();
    },
  });

  const openSendModal = async () => {
    setIsSendModalOpen(true);
    setEmailDraft(null);
    setIsEmailDraftLoading(true);
    try {
      setEmailDraft(await getDocumentEmailDraft("invoice", data.id, window.location.origin));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể chuẩn bị email hóa đơn.");
      setIsSendModalOpen(false);
    } finally {
      setIsEmailDraftLoading(false);
    }
  };

  const sendMutation = useMutation({
    mutationFn: (payload: FinanceEmailSendPayload) => sendDocumentEmail("invoice", data.id, { ...payload, publicBaseUrl: window.location.origin }),
    onSuccess: () => {
      setIsSendModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      router.refresh();
    },
    onError: (error) => alert(error instanceof Error ? error.message : "Không thể gửi hóa đơn."),
  });

  const copyLink = async () => {
    if (!fullPublicUrl) {
      alert("Hóa đơn chưa có public link.");
      return;
    }
    await navigator.clipboard.writeText(fullPublicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const actionItems = [
    data.adminSignedAt
      ? {
          label: "Hủy ký admin",
          icon: <XCircle className="h-4 w-4" />,
          onClick: () => setIsAdminRevokeModalOpen(true),
        }
      : {
          label: "Admin ký",
          icon: <ShieldCheck className="h-4 w-4" />,
          onClick: () => setIsSignModalOpen(true),
        },
    ...(customerSignatureRequired && data.signedAt
      ? [
          {
            label: "Hủy ký khách",
            icon: <UserX className="h-4 w-4" />,
            onClick: () => setIsCustomerRevokeModalOpen(true),
          },
        ]
      : []),
    {
      label: sendMutation.isPending ? "Đang gửi" : "Gửi hóa đơn",
      icon: <Send className="h-4 w-4" />,
      onClick: openSendModal,
      disabled: !data.adminSignedAt || sendMutation.isPending || isEmailDraftLoading,
      title: !data.adminSignedAt ? "Admin cần ký hóa đơn trước khi gửi email." : undefined,
    },
    { label: "Ghi nhận thanh toán", icon: <Banknote className="h-4 w-4" />, onClick: () => setIsPaymentModalOpen(true) },
    {
      label: "PDF",
      icon: <Download className="h-4 w-4" />,
      onClick: () => {
        if (data.token) window.open(`/document/${data.token}/pdf`, "_blank");
        else alert("Hóa đơn chưa có public link.");
      },
    },
    { label: copied ? "Đã copy" : "Copy link", icon: <Copy className="h-4 w-4" />, onClick: copyLink },
  ];

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
      {/* Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8">
        <div>
          <div className="mb-6 flex items-center gap-2 text-[13px] text-gray-400">
            <Link href="/workspace/finance/invoices" className="hover:text-black transition-colors">Hóa đơn</Link>
            <span>/</span>
            <span className="text-black font-medium">{data.number}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-fit rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Hóa đơn
            </span>
            <h1 className="text-[32px] font-medium tracking-tight text-black leading-none">{data.number}</h1>
            <span className={cn(
              "px-3 py-1 rounded-full text-[12px] font-semibold border",
              statusColor[data.status] || statusColor.DRAFT
            )}>
              {statusLabel[data.status] || data.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {publicUrl ? (
            <a href={publicUrl} target="_blank" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
              <Eye className="h-4 w-4" /> Xem public
            </a>
          ) : null}
          <Link href={`/workspace/finance/invoices/${data.id}/edit`} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
            <Edit3 className="h-4 w-4" /> Sửa
          </Link>

          <div ref={moreMenuRef} className="relative">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
              <Ellipsis className="h-4 w-4" /> Thêm
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#eaeaea] rounded-[16px] shadow-lg overflow-hidden z-10 flex flex-col py-1.5">
                {actionItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={item.disabled}
                    title={item.title}
                    onClick={() => {
                      setMenuOpen(false);
                      item.onClick?.();
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors text-left w-full ${item.disabled ? "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-700" : ""}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
                <div className="h-[1px] w-full bg-[#eaeaea] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors text-left w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Xóa</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Customer + Invoice Meta */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Khách hàng</p>
          <strong className="text-[20px] font-medium text-black block leading-tight mb-1">
            {isCompanyCustomer ? customerCompany : (customerPerson || customerEmail || "Chưa có thông tin")}
          </strong>
          {isCompanyCustomer && (
            <p className="text-[14px] text-gray-500 mb-4">MST: {customerTaxCode || "Chưa cập nhật"}</p>
          )}
          <div className="grid gap-2 mt-4">
            {isCompanyCustomer && customerPerson && (
              <div className="flex text-[14px] gap-4">
                <span className="text-gray-400 w-28 shrink-0">Đại diện</span>
                <span className="text-black">{customerPerson}</span>
              </div>
            )}
            {customerAddress && (
              <div className="flex text-[14px] gap-4">
                <span className="text-gray-400 w-28 shrink-0">Địa chỉ</span>
                <span className="text-black">{customerAddress}</span>
              </div>
            )}
            <div className="flex text-[14px] gap-4">
              <span className="text-gray-400 w-28 shrink-0">Điện thoại</span>
              <span className="text-black">{customerPhone || "—"}</span>
            </div>
            <div className="flex text-[14px] gap-4">
              <span className="text-gray-400 w-28 shrink-0">Email</span>
              <span className="text-black">{customerEmail || "—"}</span>
            </div>
          </div>
        </div>
        <div className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Thông tin hóa đơn</p>
          <div className="grid gap-3 text-[14px]">
            <div className="flex justify-between"><span className="text-gray-400">Mã hóa đơn</span><span className="font-medium text-black">{data.number}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Ngày lập</span><span className="font-medium text-black">{formatDate(data.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Hạn thanh toán</span><span className="font-medium text-black">{formatDate(data.dueDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Hợp đồng</span><span className="font-medium text-black text-right max-w-[160px] truncate">{data.contract?.number || "—"}</span></div>
            <div className="pt-3 border-t border-[#eaeaea] flex justify-between">
              <span className="text-gray-400">Tổng thanh toán</span>
              <span className="font-semibold text-black text-[16px]">{formatMoney(data.total, data.currency)}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-6">
        <main className="flex-1 space-y-6">
          <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-medium text-black mb-6">Tiến độ hóa đơn</h2>
            <div className="quote-progress quote-progress-five">
              {steps.map((step) => <div key={step.label} className={step.done ? "done" : ""}><span>✓</span><p>{step.label}</p></div>)}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-medium text-black mb-6">Chi tiết hóa đơn</h2>
            <div className="rounded-[16px] border border-[#eaeaea] overflow-hidden">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-[15px] text-left border-collapse">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-[#eaeaea]">
                    <tr>
                      <th className="px-4 py-3 font-medium border-r border-[#eaeaea] min-w-[280px]">Sản phẩm / Dịch vụ</th>
                      <th className="px-4 py-3 font-medium text-center w-24 border-r border-[#eaeaea]">Số lượng</th>
                      <th className="px-4 py-3 font-medium text-right w-36 border-r border-[#eaeaea]">Đơn giá</th>
                      <th className="px-4 py-3 font-medium text-right w-40">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {data.items?.length ? (
                      data.items.map((item, index) => (
                        <tr key={item.id} className="bg-white text-slate-700 transition-colors hover:bg-slate-50 group">
                          <td className="px-4 py-5 align-top border-r border-[#eaeaea]">
                            <div className="font-medium uppercase text-slate-800 mb-2">
                              {String(index + 1).padStart(2, '0')} {item.name}
                            </div>
                            {item.description && <div className="text-slate-500 mt-1 whitespace-pre-wrap text-[15px]" dangerouslySetInnerHTML={{ __html: item.description }} />}
                          </td>
                          <td className="px-4 py-5 text-center align-top border-r border-[#eaeaea]">
                            {asNumber(item.quantity)}
                          </td>
                          <td className="px-4 py-5 text-right align-top border-r border-[#eaeaea]">
                            {formatMoney(item.unitPrice, data.currency)}
                          </td>
                          <td className="px-4 py-5 text-right align-top font-medium">
                            {formatMoney(item.total, data.currency)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Chưa có hạng mục nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-[18px] font-medium text-black mb-6">Ghi chú & Điều khoản</h2>
            <div className="grid gap-4 mt-4">
              <div className="rounded-[16px] bg-gray-50/50 p-6 border border-[#eaeaea]">
                <strong className="text-[13px] font-medium text-black block mb-2">Ghi chú gửi khách</strong>
                <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: data.notes || "Chưa có ghi chú." }} />
              </div>
              <div className="rounded-[16px] bg-gray-50/50 p-6 border border-[#eaeaea]">
                <strong className="text-[13px] font-medium text-black block mb-2">Điều khoản hóa đơn</strong>
                <div className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: data.terms || "Chưa có điều khoản." }} />
              </div>
            </div>
          </section>

          <nav className="quote-detail-tabs mb-8">
            {detailTabs.map((tab) => (
              <button 
                key={tab.id} 
                type="button" 
                onClick={() => setActiveTab(tab.id)} 
                className={activeTab === tab.id ? "active" : ""}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "payments" ? (
            <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm mb-6">
              <h2 className="text-[16px] font-medium text-black mb-1">Lịch sử thanh toán</h2>
              <div className="contract-installments">
                {data.payments?.length ? data.payments.map((payment) => (
                  <div key={payment.id}>
                    <div>
                      <Link href={`/workspace/finance/payments/${payment.id}`}>
                        <strong>{payment.reference || payment.id.slice(-8).toUpperCase()}</strong>
                      </Link>
                      <p>{payment.method} · {formatDateTime(payment.paidAt || payment.createdAt)}</p>
                    </div>
                    <div><strong>{formatMoney(payment.amount, data.currency)}</strong><p>{payment.status}</p></div>
                  </div>
                )) : <div className="quote-detail-empty">Chưa có giao dịch thanh toán.</div>}
              </div>
            </section>
          ) : null}

          {activeTab === "channels" ? (
            <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm mb-6">
              <h2 className="text-[16px] font-medium text-black mb-1">Kênh thanh toán</h2>
              <div className="invoice-channel-grid">
                {channelKeys.map((key) => {
                  const channel = getPaymentChannel(key);
                  return (
                    <article key={key} className="invoice-channel-card">
                      <img src={getVietQrUrl(key, amountDue, paymentContent)} alt={`VietQR ${channel.label}`} />
                      <div>
                        <strong>{channel.label}</strong>
                        <p>Ngân hàng: {channel.bankName}</p>
                        <p>Số tài khoản: {channel.accountNumber}</p>
                        <p>Chủ tài khoản: {channel.accountName}</p>
                        <p>Số tiền: {formatMoney(amountDue, data.currency)}</p>
                        <p>Nội dung: {paymentContent}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {["activity", "files"].includes(activeTab) ? (
            <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 md:p-8 shadow-sm mb-6">
              <div className="mb-4">
                <h2 className="text-[15px] font-medium uppercase tracking-widest text-gray-400">{activeTab === "activity" ? "Lịch sử hoạt động" : "Tệp đính kèm"}</h2>
              </div>
              {activeTab === "activity" ? (
                <ActivityTimeline logs={data.activityLogs} fallback={fallbackActivities} />
              ) : (
                <AttachmentList files={data.files} />
              )}
            </section>
          ) : null}
        </main>

        <aside className="w-full lg:w-[320px] xl:w-[360px] shrink-0 space-y-6">
          <DocumentNavigator
            basePath="/workspace/finance/invoices"
            currentNumber={data.number}
            previous={data.previousDocument}
            next={data.nextDocument}
          />

          <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
            <h2 className="text-[14px] font-medium uppercase tracking-widest text-gray-400 mb-4">Giá trị & Thanh toán</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[14px]">
              <div className="text-gray-500">Tạm tính</div><div className="font-medium text-right text-black">{formatMoney(data.subtotal, data.currency)}</div>
              <div className="text-gray-500">Chiết khấu</div><div className="font-medium text-right text-red-600">-{formatMoney(data.discount, data.currency)}</div>
              <div className="text-gray-500">Tổng thuế</div><div className="font-medium text-right text-black">{formatMoney(data.tax, data.currency)}</div>
              <div className="text-gray-500 pt-3 border-t border-[#eaeaea]">Tổng hóa đơn</div><div className="font-medium text-right pt-3 border-t border-[#eaeaea] text-black">{formatMoney(data.total, data.currency)}</div>
              <div className="text-gray-500">Còn phải thu</div><div className="font-medium text-right text-orange-600">{formatMoney(amountDue, data.currency)}</div>
            </div>
            <div className="mt-6 flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="bg-emerald-500" style={{ width: `${paidPercent}%` }} />
            </div>
            <p className="mt-3 text-[13px] text-gray-500 text-center">{paidPercent}% đã thanh toán</p>
          </section>

          <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
            <h2 className="text-[14px] font-medium uppercase tracking-widest text-gray-400 mb-4">Tài liệu hóa đơn</h2>
            <div className="flex items-center gap-4 rounded-[16px] border border-[#eaeaea] p-4 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <ReceiptText className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-[14px] font-medium text-black">{data.number}</strong>
                <span className="text-[13px] text-gray-500">{formatMoney(data.total, data.currency)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => data.token && window.open(`/document/${data.token}/pdf`, "_blank")}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-4 text-[14px] font-medium text-black hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" /> Tải xuống PDF
            </button>
          </section>
        </aside>
      </div>

      <InvoicePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={(paymentData) => paymentMutation.mutate(paymentData)}
        amountDue={amountDue}
        isPending={paymentMutation.isPending}
      />

      <AdminSignModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={(signature) => signMutation.mutate(signature)}
        title={`Ký duyệt Hóa đơn ${data.number}`}
        isPending={signMutation.isPending}
      />

      <EmailComposerModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSend={(payload) => sendMutation.mutate(payload)}
        title={`Gửi hóa đơn ${data.number}`}
        draft={emailDraft}
        isLoading={isEmailDraftLoading}
        isPending={sendMutation.isPending}
      />

      <ConfirmModal
        isOpen={isAdminRevokeModalOpen}
        onClose={() => setIsAdminRevokeModalOpen(false)}
        onConfirm={() => revokeAdminMutation.mutate()}
        title="Xác nhận hủy ký admin"
        message="Bạn có chắc chắn muốn hủy chữ ký admin của hóa đơn này không?"
        confirmText="Hủy ký admin"
        isDestructive
      />

      <ConfirmModal
        isOpen={isCustomerRevokeModalOpen}
        onClose={() => setIsCustomerRevokeModalOpen(false)}
        onConfirm={() => revokeCustomerMutation.mutate()}
        title="Xác nhận hủy ký khách"
        message="Bạn có chắc chắn muốn hủy chữ ký khách hàng của hóa đơn này không? Khách hàng sẽ cần ký lại nếu muốn xác nhận."
        confirmText="Hủy ký khách"
        isDestructive
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Xác nhận xóa Hóa đơn"
        message="Bạn có chắc chắn muốn xóa hóa đơn này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa Hóa đơn"
        isDestructive
      />
    </div>
  );
}

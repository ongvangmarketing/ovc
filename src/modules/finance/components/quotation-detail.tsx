"use client";

import { cn } from "@/lib/utils/cn";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Download,
  Edit3,
  Ellipsis,
  Eye,
  FileCheck2,
  FilePlus2,
  FileText,
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
  createInvoiceFromQuotation,
  deleteQuotation,
  getDocumentEmailDraft,
  sendDocumentEmail,
  type FinanceEmailSendPayload,
} from "@/app/actions/finance-crud";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AdminSignModal } from "./admin-sign-modal";
import { EmailComposerModal, type FinanceEmailDraft } from "./email-composer-modal";
import {
  ActivityTimeline,
  AttachmentList,
  DocumentNavigator,
  type FinanceActivity,
  type FinanceAttachment,
  type FinanceDocumentLink,
} from "./finance-detail-widgets";

type QuotationDetailData = {
  id: string;
  number: string;
  title: string;
  status: string;
  currency: string;
  subtotal?: unknown;
  tax?: unknown;
  total?: unknown;
  notes?: string | null;
  terms?: string | null;
  validUntil?: string | Date | null;
  createdAt: string | Date;
  sentAt?: string | Date | null;
  token?: string | null;
  adminSignedAt?: string | Date | null;
  signedAt?: string | Date | null;
  customerSignatureRequired?: boolean;
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
    company?: { id?: string; name?: string | null; taxCode?: string | null; address?: string | null; phone?: string | null; email?: string | null; } | null;
  } | null;
  project?: { name?: string | null } | null;
  deal?: { title?: string | null; name?: string | null } | null;
  creator?: { name?: string | null; email?: string | null } | null;
  items?: Array<{
    id: string;
    name: string;
    description?: string | null;
    quantity: unknown;
    unitPrice: unknown;
    tax?: unknown;
    total: unknown;
  }>;
};

const statusLabel: Record<string, string> = {
  DRAFT: "Bản nháp",
  SENT: "Đã gửi",
  ACCEPTED: "Đã duyệt",
  REJECTED: "Từ chối",
  EXPIRED: "Hết hạn",
  CONVERTED: "Chuyển đổi",
};

const detailTabs = [
  { id: "info", label: "Thông tin báo giá" },
  { id: "activity", label: "Lịch sử hoạt động" },
  { id: "files", label: "Tệp đính kèm" },
];

function asNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: unknown, currency = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(asNumber(value));
}

function formatDate(value?: string | Date | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
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

function contactName(contact: QuotationDetailData["contact"]) {
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
  if (href && !isDisabled) {
    return (
      <Link href={href} className={className} title={title}>
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} disabled={isDisabled} title={title}>
      {icon}
      {label}
    </button>
  );
}

export function QuotationDetailView({ data }: { data: QuotationDetailData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("info");
  const [menuOpen, setMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isAdminRevokeModalOpen, setIsAdminRevokeModalOpen] = useState(false);
  const [isCustomerRevokeModalOpen, setIsCustomerRevokeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState<FinanceEmailDraft | null>(null);
  const [isEmailDraftLoading, setIsEmailDraftLoading] = useState(false);

  const publicUrl = data.token ? `/document/${data.token}` : "";
  const fullPublicUrl = data.token && typeof window !== "undefined" ? `${window.location.origin}${publicUrl}` : "";
  const isCompanyCustomer = !!data.contact?.company;
  const customerCompany = data.contact?.company?.name || '';
  const customerTaxCode = data.contact?.company?.taxCode || data.contact?.taxCode || '';
  const customerAddress = data.contact?.company?.address || data.contact?.address || '';
  const customerPhone = data.contact?.company?.phone || data.contact?.phone || '';
  const customerEmail = data.contact?.company?.email || data.contact?.email || '';
  const customerPerson = data.contact ? `${data.contact.firstName || ''} ${data.contact.lastName || ''}`.trim() || data.contact.name : '';
  const customerSignatureRequired = data.customerSignatureRequired !== false;
  const hasCustomerCancel = Boolean(data.activityLogs?.some((log) => log.action === "customer_signature_revoked")) || data.status === "REJECTED";
  const customerDecisionLabel = customerSignatureRequired ? (data.signedAt ? "Ký kết" : "Hủy") : "Không cần ký";
  const steps = useMemo(
    () => [
      { label: "Tạo báo giá", done: true },
      { label: "Đã ký", done: Boolean(data.adminSignedAt) },
      { label: "Đã gửi", done: Boolean(data.sentAt) || data.status === "SENT" },
      { label: customerDecisionLabel, done: !customerSignatureRequired || Boolean(data.signedAt) || hasCustomerCancel },
      { label: "Chuyển đổi", done: data.status === "CONVERTED" },
    ],
    [customerSignatureRequired, data.adminSignedAt, data.sentAt, data.signedAt, data.status, hasCustomerCancel, customerDecisionLabel]
  );
  const fallbackActivities = useMemo(
    () => [
      { action: "created", description: `Tạo báo giá ${data.number}`, createdAt: data.createdAt, user: data.creator },
      data.sentAt || data.status === "SENT"
        ? { action: "sent", description: `Gửi báo giá ${data.number}`, createdAt: data.sentAt || data.createdAt, user: data.creator }
        : null,
      data.adminSignedAt
        ? { action: "accepted", description: `Admin ký duyệt báo giá ${data.number}`, createdAt: data.adminSignedAt, user: data.creator }
        : null,
      data.signedAt
        ? { action: "accepted", description: `Khách hàng ký báo giá ${data.number}`, createdAt: data.signedAt, user: data.creator }
        : null,
    ].filter(Boolean) as FinanceActivity[],
    [data.adminSignedAt, data.createdAt, data.creator, data.number, data.sentAt, data.signedAt, data.status]
  );

  const openSendModal = async () => {
    setIsSendModalOpen(true);
    setEmailDraft(null);
    setIsEmailDraftLoading(true);
    try {
      setEmailDraft(await getDocumentEmailDraft("quotation", data.id, window.location.origin));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể chuẩn bị email báo giá.");
      setIsSendModalOpen(false);
    } finally {
      setIsEmailDraftLoading(false);
    }
  };

  const sendMutation = useMutation({
    mutationFn: (payload: FinanceEmailSendPayload) => sendDocumentEmail("quotation", data.id, { ...payload, publicBaseUrl: window.location.origin }),
    onSuccess: () => {
      setIsSendModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      router.refresh();
    },
    onError: (error) => alert(error instanceof Error ? error.message : "Không thể gửi báo giá."),
  });

  const signMutation = useMutation({
    mutationFn: (signature: string) => adminSignDocument("quotation", data.id, signature),
    onSuccess: () => {
      setIsSignModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      router.refresh();
    },
  });

  const revokeAdminMutation = useMutation({
    mutationFn: () => adminRevokeSignature("quotation", data.id),
    onSuccess: () => {
      setIsAdminRevokeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      router.refresh();
    },
  });

  const revokeCustomerMutation = useMutation({
    mutationFn: () => adminRevokeCustomerSignature("quotation", data.id),
    onSuccess: () => {
      setIsCustomerRevokeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      router.refresh();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteQuotation(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      router.push("/workspace/finance/quotations");
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: () => createInvoiceFromQuotation(data.id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      router.push(`/workspace/finance/invoices/${result.invoiceId}`);
    },
    onError: (error) => alert(error instanceof Error ? error.message : "Không thể tạo hóa đơn."),
  });

  const copyLink = async () => {
    if (!fullPublicUrl) {
      alert("Báo giá chưa có public link.");
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
          label: "Admin ký duyệt",
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
      label: sendMutation.isPending ? "Đang gửi" : "Gửi báo giá",
      icon: <Send className="h-4 w-4" />,
      onClick: openSendModal,
      disabled: !data.adminSignedAt || sendMutation.isPending || isEmailDraftLoading,
      title: !data.adminSignedAt ? "Admin cần ký báo giá trước khi gửi email." : undefined,
    },
    {
      label: "Tạo hợp đồng",
      icon: <FileCheck2 className="h-4 w-4" />,
      onClick: () => router.push(`/workspace/finance/contracts/create?quotationId=${data.id}`),
    },
    {
      label: "Tạo hóa đơn",
      icon: <FilePlus2 className="h-4 w-4" />,
      onClick: () => createInvoiceMutation.mutate(),
    },
    {
      label: "PDF",
      icon: <Download className="h-4 w-4" />,
      onClick: () => {
        if (data.token) window.open(`/document/${data.token}/pdf`, "_blank");
      },
    },
    {
      label: copied ? "Đã copy" : "Copy link",
      icon: <Copy className="h-4 w-4" />,
      onClick: copyLink,
    },
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
    <div className="mx-auto w-full max-w-[1440px] px-6 py-10 lg:px-12 bg-white min-h-[calc(100vh-64px)] animate-in fade-in duration-300">
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#eaeaea] pb-6">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <FileText className="h-4 w-4 text-orange-500" />
            Tài chính / Báo giá / Chi tiết báo giá
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[36px] font-medium tracking-tighter text-black leading-none">{data.number}</h1>
            <span className={cn("px-2.5 py-1 rounded-full text-[13px] font-medium border", data.status === "DRAFT" ? "bg-gray-50 border-gray-200 text-gray-700" : data.status === "SENT" ? "bg-blue-50 border-blue-200 text-blue-700" : data.status === "ACCEPTED" ? "bg-green-50 border-green-200 text-green-700" : data.status === "REJECTED" ? "bg-red-50 border-red-200 text-red-700" : "bg-purple-50 border-purple-200 text-purple-700")}>
              {statusLabel[data.status] || data.status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {publicUrl ? (
            <a href={publicUrl} target="_blank" className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-black rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="h-4 w-4" /> Xem public
            </a>
          ) : null}
          <Link href={`/workspace/finance/quotations/${data.id}/edit`} className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-black rounded-lg hover:bg-gray-50 transition-colors">
            <Edit3 className="h-4 w-4" /> Sửa
          </Link>
          
          <div ref={moreMenuRef} className="relative">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-black rounded-lg hover:bg-gray-50 transition-colors">
              <Ellipsis className="h-4 w-4" /> Thêm
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#eaeaea] rounded-lg shadow-sm overflow-hidden z-10 flex flex-col py-1">
                {actionItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={item.disabled}
                    title={item.title}
                    onClick={() => {
                      setMenuOpen(false);
                      item.onClick();
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors text-left w-full ${item.disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-700" : ""}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          
          <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-red-600 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors">
            <Trash2 className="h-4 w-4" /> Xóa
          </button>
        </div>
      </div>

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
          <span className="text-[13px] text-gray-500 font-medium uppercase tracking-widest block mb-2">Báo giá</span>
          <strong className="text-[20px] font-medium text-black block mb-1">{data.number}</strong>
          <p className="text-[14px] text-gray-600 mb-1">{data.project?.name || data.deal?.title || data.deal?.name || "Chưa gắn dự án"}</p>
          <p className="text-[14px] text-gray-600">Ngày lập: {formatDate(data.createdAt)}</p>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-6">
        <main className="flex-1 space-y-6">
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

          {activeTab === "info" ? (
            <>
              <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
                <div className="quote-progress quote-progress-five">
                  {steps.map((step) => (
                    <div key={step.label} className={step.done ? "done" : ""}>
                      <span>✓</span>
                      <p>{step.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
                <div className="mb-4">
<h2 className="text-[16px] font-medium text-black">Sản phẩm & dịch vụ</h2>
<span className="text-[14px] text-gray-500 block mt-1">Danh sách các hạng mục trong báo giá.</span>
</div>
                <div className="quotation-items-list mt-2">
                  {data.items?.length ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-4">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-gray-50/50 text-gray-500 border-b border-[#eaeaea]">
                            <tr>
                              <th className="px-4 py-3 font-medium border-r border-[#eaeaea] min-w-[280px]">Nội dung dịch vụ</th>
                              <th className="px-4 py-3 font-medium text-center w-24 border-r border-[#eaeaea]">Đơn vị</th>
                              <th className="px-4 py-3 font-medium text-center w-16 border-r border-[#eaeaea]">SL</th>
                              <th className="px-4 py-3 font-medium text-right w-36 border-r border-[#eaeaea]">Đơn giá (VND)</th>
                              <th className="px-4 py-3 font-medium text-center w-16 border-r border-[#eaeaea]">Thuế</th>
                              <th className="px-4 py-3 font-medium text-right w-40">Thành tiền (VND)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eaeaea]">
                            {data.items.map((item, index) => (
                              <tr key={item.id} className="bg-white text-slate-700 transition-colors hover:bg-slate-50 group">
                                <td className="px-4 py-5 align-top border-r border-[#eaeaea]">
                                  <div className="font-medium uppercase text-slate-800 mb-2">
                                    {String(index + 1).padStart(2, '0')} {item.name}
                                  </div>
                                  {item.description && <div className="text-slate-500 mt-1 whitespace-pre-wrap text-[14px]" dangerouslySetInnerHTML={{ __html: item.description }} />}
                                </td>
                                <td className="px-4 py-5 text-center align-top border-r border-[#eaeaea]">
                                  Lần
                                </td>
                                <td className="px-4 py-5 text-center align-top border-r border-[#eaeaea]">
                                  {asNumber(item.quantity)}
                                </td>
                                <td className="px-4 py-5 text-right align-top border-r border-[#eaeaea]">
                                  {formatMoney(item.unitPrice, data.currency)}
                                </td>
                                <td className="px-4 py-5 text-center align-top border-r border-[#eaeaea]">
                                  {asNumber(item.tax)}%
                                </td>
                                <td className="px-4 py-5 text-right align-top font-medium">
                                  {formatMoney(item.total, data.currency)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="quote-detail-empty">Chưa có hạng mục nào.</div>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
                <div className="mb-4">
<h2 className="text-[16px] font-medium text-black">Ghi chú & điều khoản</h2>
<span className="text-[14px] text-gray-500 block mt-1">Các thông tin gửi kèm cho khách hàng.</span>
</div>
                <div className="grid gap-4 mt-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <strong className="text-sm font-medium text-slate-800 block mb-2">Ghi chú gửi khách</strong>
                    <div className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: data.notes || "Chưa có ghi chú." }} />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <strong className="text-sm font-medium text-slate-800 block mb-2">Điều khoản</strong>
                    <div className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: data.terms || "Chưa có điều khoản." }} />
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
              <div className="mb-4">
<h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400">{activeTab === "activity" ? "Lịch sử hoạt động" : "Tệp đính kèm"}</h2>
</div>
              <div className="mt-4">
                {activeTab === "activity" ? (
                  <ActivityTimeline logs={data.activityLogs} fallback={fallbackActivities} />
                ) : (
                  <AttachmentList files={data.files} />
                )}
              </div>
            </section>
          )}
        </main>

        <aside className="w-full lg:w-[340px] space-y-6">
          <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
            <div className="mb-4">
<h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Dự án</h2>
</div>
            <div className="flex flex-col gap-4 text-sm mt-4">
              <div>
                <div className="text-slate-500 font-light mb-1">Dự án</div>
                <div className="text-slate-800">{data.project?.name || data.deal?.title || data.deal?.name || "Không gắn dự án"}</div>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <div className="text-slate-500 font-light mb-1">Người tạo</div>
                <div className="text-slate-800">{data.creator?.name || "Administrator"}</div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
            <div className="mb-4">
<h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Thông tin báo giá</h2>
</div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px] mt-4">
              <div className="text-slate-500 font-light">Mã báo giá</div><div className="font-medium text-right text-black">{data.number}</div>
              <div className="text-slate-500 font-light">Trạng thái</div><div className="font-medium text-right text-black">{statusLabel[data.status] || data.status}</div>
              <div className="text-slate-500 font-light">Ngày tạo</div><div className="font-medium text-right text-black">{formatDateTime(data.createdAt)}</div>
              <div className="text-slate-500 font-light">Hiệu lực đến</div><div className="font-medium text-right text-black">{formatDate(data.validUntil)}</div>
              <div className="text-slate-500 font-light">Admin ký</div><div className="font-medium text-right text-black">{formatDateTime(data.adminSignedAt)}</div>
              <div className="text-slate-500 font-light">Khách ký</div><div className="font-medium text-right text-black">{customerSignatureRequired ? formatDateTime(data.signedAt) : "Không cần ký"}</div>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#eaeaea] p-6">
            <div className="mb-4">
<h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Giá trị & thanh toán</h2>
</div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px] mt-4">
              <div className="text-slate-500 font-light">Tạm tính</div><div className="font-medium text-right text-black">{formatMoney(data.subtotal, data.currency)}</div>
              <div className="text-slate-500 font-light">Thuế VAT</div><div className="font-medium text-right text-black">{formatMoney(data.tax, data.currency)}</div>
              <div className="text-slate-500 font-light mt-2">Tổng giá trị</div><div className="font-medium text-orange-600 text-[14px] text-right mt-2">{formatMoney(data.total, data.currency)}</div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Tài liệu báo giá</h2>
            <div className="contract-document-box">
              <FileText className="h-10 w-10 text-emerald-600" />
              <strong>{data.number}</strong>
              <span>{formatMoney(data.total, data.currency)}</span>
            </div>
            <button type="button" onClick={() => data.token && window.open(`/document/${data.token}/pdf`, "_blank")} className="w-full flex items-center justify-center gap-2 px-4 h-9 bg-white border border-[#eaeaea] text-[14px] font-medium text-black rounded-lg hover:bg-gray-50 transition-colors mt-3">
              <Download className="h-4 w-4" />
              Tải xuống
            </button>
          </section>

          <section className="quote-detail-card">
            <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-4">Thao tác</h2>
            <div className="grid gap-3">
              {actionItems.map((item) => (
                <ActionButton
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  title={item.title}
                />
              ))}
              <ActionButton icon={<Eye className="h-4 w-4" />} label="Xem" href={publicUrl} title={!publicUrl ? "Báo giá chưa có public link." : undefined} />
              <ActionButton icon={<Trash2 className="h-4 w-4" />} label="Xóa" onClick={() => setIsDeleteModalOpen(true)} danger />
            </div>
          </section>
        </aside>
      </div>

      <AdminSignModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onConfirm={(signature) => signMutation.mutate(signature)}
        title={`Ký duyệt Báo giá ${data.number}`}
        isPending={signMutation.isPending}
      />

      <EmailComposerModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSend={(payload) => sendMutation.mutate(payload)}
        title={`Gửi báo giá ${data.number}`}
        draft={emailDraft}
        isLoading={isEmailDraftLoading}
        isPending={sendMutation.isPending}
      />

      <ConfirmModal
        isOpen={isAdminRevokeModalOpen}
        onClose={() => setIsAdminRevokeModalOpen(false)}
        onConfirm={() => revokeAdminMutation.mutate()}
        title="Xác nhận hủy ký admin"
        message="Bạn có chắc chắn muốn hủy chữ ký admin của báo giá này không?"
        confirmText="Hủy ký admin"
        isDestructive
      />

      <ConfirmModal
        isOpen={isCustomerRevokeModalOpen}
        onClose={() => setIsCustomerRevokeModalOpen(false)}
        onConfirm={() => revokeCustomerMutation.mutate()}
        title="Xác nhận hủy ký khách"
        message="Bạn có chắc chắn muốn hủy chữ ký khách hàng của báo giá này không? Khách hàng sẽ cần ký lại nếu muốn xác nhận."
        confirmText="Hủy ký khách"
        isDestructive
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Xác nhận xóa Báo giá"
        message="Bạn có chắc chắn muốn xóa báo giá này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa Báo giá"
        isDestructive
      />
    </div>
  );
}

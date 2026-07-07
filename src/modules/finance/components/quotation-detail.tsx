"use client";

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
    company?: { name?: string | null } | null;
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
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <FileText className="h-4 w-4 text-orange-500" />
            Tài chính / Báo giá / Chi tiết báo giá
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-medium text-slate-950">{data.number}</h1>
            <span className={`quote-status quote-status-${data.status.toLowerCase()}`}>
              {statusLabel[data.status] || data.status}
            </span>
          </div>
        </div>

        <div className="quote-detail-top-actions">
          {publicUrl ? (
            <a href={publicUrl} target="_blank" className="quote-detail-top-button">
              <Eye className="h-4 w-4" /> Xem public
            </a>
          ) : null}
          <Link href={`/workspace/finance/quotations/${data.id}/edit`} className="quote-detail-top-button">
            <Edit3 className="h-4 w-4" /> Sửa
          </Link>
          
          <div ref={moreMenuRef} className="relative">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="quote-detail-top-button">
              <Ellipsis className="h-4 w-4" /> Thêm
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-10 flex flex-col py-1">
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
                    className={`flex items-center gap-2 px-3 py-2 text-sm text-left ${item.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50"}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          
          <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="quote-detail-top-button quote-detail-delete">
            <Trash2 className="h-4 w-4" /> Xóa
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <main className="flex-1 space-y-6">
          <nav className="flex gap-4 border-b border-slate-200">
            {detailTabs.map((tab) => (
              <button 
                key={tab.id} 
                type="button" 
                onClick={() => setActiveTab(tab.id)} 
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab.id 
                    ? "border-orange-500 text-orange-600" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "info" ? (
            <>
              <section className="quote-panel">
                <div className="quote-panel-header">
                  <h2>Quy trình xử lý</h2>
                  <span>Tiến độ xử lý báo giá.</span>
                </div>
                <div className="quote-progress quote-progress-five mt-4">
                  {steps.map((step) => (
                    <div key={step.label} className={step.done ? "done" : ""}>
                      <span>✓</span>
                      <p>{step.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="quote-panel">
                <div className="quote-panel-header">
                  <h2>Sản phẩm & dịch vụ</h2>
                  <span>Danh sách các hạng mục trong báo giá.</span>
                </div>
                <div className="quotation-items-list mt-2">
                  {data.items?.length ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-4">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead className="bg-[#ee8f15] text-white">
                            <tr>
                              <th className="px-4 py-3 font-medium border-r border-[#fa9f2a] min-w-[280px]">Nội dung dịch vụ</th>
                              <th className="px-4 py-3 font-medium text-center w-24 border-r border-[#fa9f2a]">Đơn vị</th>
                              <th className="px-4 py-3 font-medium text-center w-16 border-r border-[#fa9f2a]">SL</th>
                              <th className="px-4 py-3 font-medium text-right w-36 border-r border-[#fa9f2a]">Đơn giá (VND)</th>
                              <th className="px-4 py-3 font-medium text-center w-16 border-r border-[#fa9f2a]">Thuế</th>
                              <th className="px-4 py-3 font-medium text-right w-40">Thành tiền (VND)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {data.items.map((item, index) => (
                              <tr key={item.id} className="bg-white text-slate-700 transition-colors hover:bg-slate-50 group">
                                <td className="px-4 py-5 align-top border-r border-slate-100">
                                  <div className="font-medium uppercase text-slate-800 mb-2">
                                    {String(index + 1).padStart(2, '0')} {item.name}
                                  </div>
                                  {item.description && <div className="text-slate-500 mt-1 whitespace-pre-wrap text-[14px]" dangerouslySetInnerHTML={{ __html: item.description }} />}
                                </td>
                                <td className="px-4 py-5 text-center align-top border-r border-slate-100">
                                  Lần
                                </td>
                                <td className="px-4 py-5 text-center align-top border-r border-slate-100">
                                  {asNumber(item.quantity)}
                                </td>
                                <td className="px-4 py-5 text-right align-top border-r border-slate-100">
                                  {formatMoney(item.unitPrice, data.currency)}
                                </td>
                                <td className="px-4 py-5 text-center align-top border-r border-slate-100">
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

              <section className="quote-panel">
                <div className="quote-panel-header">
                  <h2>Ghi chú & điều khoản</h2>
                  <span>Các thông tin gửi kèm cho khách hàng.</span>
                </div>
                <div className="grid gap-4 mt-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <strong className="text-sm font-semibold text-slate-800 block mb-2">Ghi chú gửi khách</strong>
                    <div className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: data.notes || "Chưa có ghi chú." }} />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <strong className="text-sm font-semibold text-slate-800 block mb-2">Điều khoản</strong>
                    <div className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: data.terms || "Chưa có điều khoản." }} />
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="quote-panel">
              <div className="quote-panel-header">
                <h2>{activeTab === "activity" ? "Lịch sử hoạt động" : "Tệp đính kèm"}</h2>
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
          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Khách hàng & Dự án</h2>
            </div>
            <div className="flex flex-col gap-4 mt-4 text-sm">
              <div>
                <div className="text-slate-500 mb-1">Khách hàng</div>
                <div className="font-medium text-slate-800">{data.contact?.company?.name || contactName(data.contact)}</div>
                {data.contact?.phone && <div className="text-slate-600 mt-0.5">{data.contact.phone}</div>}
                {data.contact?.email && <div className="text-slate-600 mt-0.5">{data.contact.email}</div>}
              </div>
              <div className="pt-3 border-t border-slate-100">
                <div className="text-slate-500 mb-1">Dự án</div>
                <div className="font-medium text-slate-800">{data.project?.name || data.deal?.title || data.deal?.name || "Không gắn dự án"}</div>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <div className="text-slate-500 mb-1">Người tạo</div>
                <div className="font-medium text-slate-800">{data.creator?.name || "Administrator"}</div>
              </div>
            </div>
          </section>

          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Thông tin báo giá</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mt-4">
              <div className="text-slate-500">Mã báo giá</div><div className="font-medium text-right">{data.number}</div>
              <div className="text-slate-500">Trạng thái</div><div className="font-medium text-right">{statusLabel[data.status] || data.status}</div>
              <div className="text-slate-500">Ngày tạo</div><div className="font-medium text-right">{formatDateTime(data.createdAt)}</div>
              <div className="text-slate-500">Hiệu lực đến</div><div className="font-medium text-right">{formatDate(data.validUntil)}</div>
              <div className="text-slate-500">Admin ký</div><div className="font-medium text-right">{formatDateTime(data.adminSignedAt)}</div>
              <div className="text-slate-500">Khách ký</div><div className="font-medium text-right">{customerSignatureRequired ? formatDateTime(data.signedAt) : "Không cần ký"}</div>
            </div>
          </section>

          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Giá trị & thanh toán</h2>
            </div>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mt-4">
              <div className="text-slate-500">Tạm tính</div><div className="font-medium text-right">{formatMoney(data.subtotal, data.currency)}</div>
              <div className="text-slate-500">Thuế VAT</div><div className="font-medium text-right">{formatMoney(data.tax, data.currency)}</div>
              <div className="text-slate-500 font-semibold mt-2">Tổng giá trị</div><div className="font-bold text-orange-600 text-lg text-right mt-2">{formatMoney(data.total, data.currency)}</div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Tài liệu báo giá</h2>
            <div className="contract-document-box">
              <FileText className="h-10 w-10 text-emerald-600" />
              <strong>{data.number}</strong>
              <span>{formatMoney(data.total, data.currency)}</span>
            </div>
            <button type="button" onClick={() => data.token && window.open(`/document/${data.token}/pdf`, "_blank")} className="quote-detail-action w-full mt-3">
              <Download className="h-4 w-4" />
              Tải xuống
            </button>
          </section>

          <section className="quote-detail-card">
            <h2>Thao tác</h2>
            <div className="quote-side-actions">
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

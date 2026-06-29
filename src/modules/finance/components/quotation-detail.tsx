"use client";

import { useMemo, useState } from "react";
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
  sendDocumentEmail,
} from "@/app/actions/finance-crud";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AdminSignModal } from "./admin-sign-modal";
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
  const className = `quote-detail-action ${danger ? "quote-detail-action-danger" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;
  if (href && !disabled) {
    return (
      <Link href={href} className={className} title={title}>
        {icon}
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} disabled={disabled} title={title}>
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
  const [copied, setCopied] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isAdminRevokeModalOpen, setIsAdminRevokeModalOpen] = useState(false);
  const [isCustomerRevokeModalOpen, setIsCustomerRevokeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const publicUrl = data.token ? `/document/${data.token}` : "";
  const fullPublicUrl = data.token && typeof window !== "undefined" ? `${window.location.origin}${publicUrl}` : "";
  const hasCustomerCancel = Boolean(data.activityLogs?.some((log) => log.action === "customer_signature_revoked")) || data.status === "REJECTED";
  const customerDecisionLabel = data.signedAt ? "Ký kết" : "Hủy";
  const steps = useMemo(
    () => [
      { label: "Tạo báo giá", done: true },
      { label: "Đã ký", done: Boolean(data.adminSignedAt) },
      { label: "Đã gửi", done: Boolean(data.sentAt) || data.status === "SENT" },
      { label: customerDecisionLabel, done: Boolean(data.signedAt) || hasCustomerCancel },
      { label: "Chuyển đổi", done: data.status === "CONVERTED" },
    ],
    [data.adminSignedAt, data.sentAt, data.signedAt, data.status, hasCustomerCancel, customerDecisionLabel]
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

  const sendMutation = useMutation({
    mutationFn: () => sendDocumentEmail("quotation", data.id, data.contact?.email || ""),
    onSuccess: () => {
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
    ...(data.signedAt
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
      onClick: () => sendMutation.mutate(),
      disabled: !data.adminSignedAt || sendMutation.isPending,
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

  return (
    <div className="quote-detail-page">
      <header className="quote-detail-hero">
        <div className="quote-detail-title">
          <div className="quote-detail-icon">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1>{data.number}</h1>
              <span className={`quote-status quote-status-${data.status.toLowerCase()}`}>
                {statusLabel[data.status] || data.status}
              </span>
            </div>
            <p>
              Ngày tạo: {formatDate(data.createdAt)} · Hiệu lực đến: {formatDate(data.validUntil)}
            </p>
          </div>
        </div>

        <div className="quote-detail-top-actions">
          {publicUrl ? (
            <a href={publicUrl} target="_blank" className="quote-detail-top-button">
              <Eye className="h-4 w-4" />
              Xem
            </a>
          ) : null}
          <Link href={`/workspace/finance/quotations/${data.id}/edit`} className="quote-detail-top-button">
            <Edit3 className="h-4 w-4" />
            Chỉnh sửa
          </Link>
          <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="quote-detail-top-button quote-detail-delete">
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="quote-detail-more">
              <Ellipsis className="h-4 w-4" />
            </button>
            {menuOpen ? (
              <div className="quote-detail-menu">
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
                    className={item.disabled ? "opacity-50 cursor-not-allowed" : undefined}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="quote-detail-summary">
        <div>
          <span>Khách hàng</span>
          <strong>{data.contact?.company?.name || contactName(data.contact)}</strong>
          <p>{data.contact?.phone || "Chưa có số điện thoại"}</p>
          <p>{data.contact?.email || "Chưa có email"}</p>
        </div>
        <div>
          <span>Dự án</span>
          <strong>{data.project?.name || data.deal?.title || data.deal?.name || "Không gắn dự án"}</strong>
          <p>Báo giá {data.number}</p>
        </div>
        <div>
          <span>Người tạo</span>
          <strong>{data.creator?.name || "Administrator"}</strong>
          <p>{data.creator?.email || "Administrator"}</p>
        </div>
        <div>
          <DocumentNavigator
            basePath="/workspace/finance/quotations"
            currentNumber={data.number}
            previous={data.previousDocument}
            next={data.nextDocument}
          />
        </div>
      </section>

      <div className="quote-detail-layout">
        <main className="space-y-5">
          <nav className="quote-detail-tabs">
            {detailTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "active" : ""}>
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "info" ? (
            <>
              <section className="quote-detail-card">
                <h2>Quy trình xử lý</h2>
                <div className="quote-progress quote-progress-five">
                  {steps.map((step) => (
                    <div key={step.label} className={step.done ? "done" : ""}>
                      <span>✓</span>
                      <p>{step.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="quote-detail-card">
                <h2>Sản phẩm & dịch vụ</h2>
                <div className="quotation-items-list">
                  {data.items?.length ? (
                    data.items.map((item, index) => (
                      <article key={item.id} className="quotation-item-card">
                        <div>
                          <div className="quotation-item-title">
                            <span>{index + 1}</span>
                            <strong>{item.name}</strong>
                          </div>
                          {item.description ? <p className="quotation-item-description">{plainDescription(item.description)}</p> : null}
                        </div>
                        <div className="quotation-item-meta">
                          <span><small>Đơn vị</small>Lần</span>
                          <span><small>SL</small>{asNumber(item.quantity)}</span>
                          <span><small>Đơn giá</small>{formatMoney(item.unitPrice, data.currency)}</span>
                          <span><small>Thuế</small>{asNumber(item.tax)}%</span>
                          <strong>{formatMoney(item.total, data.currency)}</strong>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="quote-detail-empty">Chưa có hạng mục nào.</div>
                  )}
                </div>
              </section>

              <section className="quote-detail-card">
                <h2>Ghi chú & điều khoản</h2>
                <div className="grid gap-3">
                  <div className="contract-terms">
                    <strong>Ghi chú gửi khách</strong>
                    <p>{plainDescription(data.notes) || "Chưa có ghi chú."}</p>
                  </div>
                  <div className="contract-terms">
                    <strong>Điều khoản</strong>
                    <p>{plainDescription(data.terms) || "Chưa có điều khoản."}</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="quote-detail-card">
              <h2>{activeTab === "activity" ? "Lịch sử hoạt động" : "Tệp đính kèm"}</h2>
              {activeTab === "activity" ? (
                <ActivityTimeline logs={data.activityLogs} fallback={fallbackActivities} />
              ) : (
                <AttachmentList files={data.files} />
              )}
            </section>
          )}
        </main>

        <aside className="space-y-5">
          <section className="quote-detail-card">
            <h2>Thông tin báo giá</h2>
            <div className="quote-side-list">
              <div><span>Mã báo giá</span><strong>{data.number}</strong></div>
              <div><span>Trạng thái</span><strong>{statusLabel[data.status] || data.status}</strong></div>
              <div><span>Ngày tạo</span><strong>{formatDateTime(data.createdAt)}</strong></div>
              <div><span>Hiệu lực đến</span><strong>{formatDate(data.validUntil)}</strong></div>
              <div><span>Admin ký</span><strong>{formatDateTime(data.adminSignedAt)}</strong></div>
              <div><span>Khách ký</span><strong>{formatDateTime(data.signedAt)}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Giá trị & thanh toán</h2>
            <div className="quote-side-list">
              <div><span>Tạm tính</span><strong>{formatMoney(data.subtotal, data.currency)}</strong></div>
              <div><span>Thuế VAT</span><strong>{formatMoney(data.tax, data.currency)}</strong></div>
              <div><span>Tổng giá trị</span><strong>{formatMoney(data.total, data.currency)}</strong></div>
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
              <ActionButton icon={<Eye className="h-4 w-4" />} label="Xem" href={publicUrl || "#"} />
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

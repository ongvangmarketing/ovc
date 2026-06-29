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
  createInvoiceFromContract,
  createInvoiceFromInstallment,
  deleteContract,
  sendDocumentEmail,
} from "@/app/actions/finance-crud";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getPaymentChannel, getVietQrUrl, normalizePaymentChannelKeys } from "@/lib/finance/payment-channels";
import { AdminSignModal } from "./admin-sign-modal";
import {
  ActivityTimeline,
  AttachmentList,
  DocumentNavigator,
  type FinanceActivity,
  type FinanceAttachment,
  type FinanceDocumentLink,
} from "./finance-detail-widgets";

type ContractDetailData = {
  id: string;
  number: string;
  title: string;
  status: string;
  currency: string;
  total?: unknown;
  paymentChannels?: unknown;
  notes?: string | null;
  terms?: string | null;
  validFrom?: string | Date | null;
  validUntil?: string | Date | null;
  createdAt: string | Date;
  sentAt?: string | Date | null;
  adminSignedAt?: string | Date | null;
  signedAt?: string | Date | null;
  token?: string | null;
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
  deal?: { title?: string | null; name?: string | null; project?: { name?: string | null } | null } | null;
  creator?: { name?: string | null; email?: string | null } | null;
  organization?: { name?: string | null; email?: string | null; phone?: string | null } | null;
  items?: Array<{
    id: string;
    name: string;
    description?: string | null;
    quantity: unknown;
    unitPrice: unknown;
    total: unknown;
  }>;
  paymentInstallments?: Array<{
    id: string;
    name: string;
    amount: unknown;
    dueDate?: string | Date | null;
    status: string;
    invoiceId?: string | null;
    invoice?: { id: string; number?: string | null } | null;
  }>;
};

const statusLabel: Record<string, string> = {
  DRAFT: "Nháp",
  SENT: "Đã gửi",
  SIGNED: "Đã ký",
  EXPIRED: "Hết hạn",
  CANCELLED: "Đã hủy",
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

function contactName(contact: ContractDetailData["contact"]) {
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

export function ContractDetailView({ data }: { data: ContractDetailData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("payments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isCustomerRevokeModalOpen, setIsCustomerRevokeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const publicUrl = data.token ? `/document/${data.token}` : "";
  const fullPublicUrl = data.token && typeof window !== "undefined" ? `${window.location.origin}${publicUrl}` : "";
  const customerName = data.contact?.company?.name || contactName(data.contact);
  const supplierName = data.organization?.name || "Ong Vàng Workspace";
  const paidAmount = useMemo(
    () =>
      (data.paymentInstallments || [])
        .filter((item) => ["PAID", "COMPLETED"].includes(item.status))
        .reduce((sum, item) => sum + asNumber(item.amount), 0),
    [data.paymentInstallments]
  );
  const remainingAmount = Math.max(0, asNumber(data.total) - paidAmount);
  const paidPercent = asNumber(data.total) > 0 ? Math.min(100, Math.round((paidAmount / asNumber(data.total)) * 100)) : 0;
  const channelKeys = normalizePaymentChannelKeys(data.paymentChannels);
  const paymentContent = `Thanh toan ${data.number}`;
  const hasCustomerCancel = Boolean(data.activityLogs?.some((log) => log.action === "customer_signature_revoked")) || data.status === "CANCELLED";
  const hasCustomerSignOrCancel = Boolean(data.signedAt) || hasCustomerCancel;
  const customerDecisionLabel = data.signedAt ? "Ký kết" : "Hủy";

  const steps = useMemo(
    () => [
      { label: "Tạo hợp đồng", done: true },
      { label: "Đã ký", done: Boolean(data.adminSignedAt) },
      { label: "Đã gửi", done: Boolean(data.sentAt) || data.status === "SENT" },
      { label: customerDecisionLabel, done: hasCustomerSignOrCancel },
      { label: "Hiệu lực", done: Boolean(data.signedAt) && data.status === "SIGNED" && (!data.validUntil || new Date(data.validUntil) >= new Date()) },
      { label: "Hết hạn", done: data.status === "EXPIRED" },
    ],
    [data.adminSignedAt, data.sentAt, data.signedAt, data.status, data.validUntil, hasCustomerSignOrCancel, customerDecisionLabel]
  );
  const fallbackActivities = useMemo(
    () =>
      [
        { action: "created", description: `Tạo hợp đồng ${data.number}`, createdAt: data.createdAt, user: data.creator },
        data.sentAt || data.status === "SENT"
          ? { action: "sent", description: `Gửi hợp đồng ${data.number}`, createdAt: data.sentAt || data.createdAt, user: data.creator }
          : null,
        data.adminSignedAt
          ? { action: "signed", description: `Admin ký hợp đồng ${data.number}`, createdAt: data.adminSignedAt, user: data.creator }
          : null,
        data.signedAt
          ? { action: "signed", description: `Khách hàng ký hợp đồng ${data.number}`, createdAt: data.signedAt, user: data.creator }
          : null,
      ].filter(Boolean) as FinanceActivity[],
    [data.adminSignedAt, data.createdAt, data.creator, data.number, data.sentAt, data.signedAt, data.status]
  );

  const sendMutation = useMutation({
    mutationFn: () => sendDocumentEmail("contract", data.id, data.contact?.email || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      router.refresh();
    },
    onError: (error) => alert(error instanceof Error ? error.message : "Không thể gửi hợp đồng."),
  });

  const signMutation = useMutation({
    mutationFn: (signature: string) => adminSignDocument("contract", data.id, signature),
    onSuccess: () => {
      setIsSignModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      router.refresh();
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () => adminRevokeSignature("contract", data.id),
    onSuccess: () => {
      setIsRevokeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      router.refresh();
    },
  });

  const revokeCustomerMutation = useMutation({
    mutationFn: () => adminRevokeCustomerSignature("contract", data.id),
    onSuccess: () => {
      setIsCustomerRevokeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      router.refresh();
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (installmentId: string) => createInvoiceFromInstallment(installmentId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      router.push(`/workspace/finance/invoices/${result.invoiceId}`);
      router.refresh();
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : "Không thể tạo hóa đơn.");
    },
  });

  const createFullInvoiceMutation = useMutation({
    mutationFn: () => createInvoiceFromContract(data.id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      router.push(`/workspace/finance/invoices/${result.invoiceId}`);
      router.refresh();
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : "Không thể tạo hóa đơn.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteContract(data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      router.push("/workspace/finance/contracts");
    },
  });

  const copyLink = async () => {
    if (!fullPublicUrl) {
      alert("Hợp đồng chưa có public link.");
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
          onClick: () => setIsRevokeModalOpen(true),
        }
      : {
          label: "Admin ký",
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
      label: sendMutation.isPending ? "Đang gửi" : "Gửi hợp đồng",
      icon: <Send className="h-4 w-4" />,
      onClick: () => sendMutation.mutate(),
      disabled: !data.adminSignedAt || sendMutation.isPending,
      title: !data.adminSignedAt ? "Admin cần ký hợp đồng trước khi gửi email." : undefined,
    },
    {
      label: "Tạo hóa đơn",
      icon: <FilePlus2 className="h-4 w-4" />,
      onClick: () => {
        const nextInstallment = data.paymentInstallments?.find((item) => !item.invoiceId);
        if (nextInstallment) createInvoiceMutation.mutate(nextInstallment.id);
        else createFullInvoiceMutation.mutate();
      },
    },
    {
      label: "PDF",
      icon: <Download className="h-4 w-4" />,
      onClick: () => {
        if (data.token) window.open(`/document/${data.token}/pdf`, "_blank");
        else alert("Hợp đồng chưa có public link.");
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
            <FileCheck2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1>{data.number}</h1>
              <span className={`quote-status quote-status-${data.status.toLowerCase()}`}>{statusLabel[data.status] || data.status}</span>
            </div>
            <p>
              {data.title} · Hiệu lực: {formatDate(data.validFrom)} - {formatDate(data.validUntil)}
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
          <Link href={`/workspace/finance/contracts/${data.id}/edit`} className="quote-detail-top-button">
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
          <span>Bên A khách hàng</span>
          <strong>{customerName}</strong>
          <p>{data.contact?.phone || "Chưa có số điện thoại"}</p>
          <p>{data.contact?.email || "Chưa có email"}</p>
        </div>
        <div>
          <span>Bên B nhà cung cấp</span>
          <strong>{supplierName}</strong>
          <p>{data.organization?.phone || "Chưa có số điện thoại"}</p>
          <p>{data.organization?.email || "Chưa có email"}</p>
        </div>
        <div>
          <span>Giá trị hợp đồng</span>
          <strong className="text-emerald-600">{formatMoney(data.total, data.currency)}</strong>
          <p>Đã thanh toán: {formatMoney(paidAmount, data.currency)}</p>
          <p>Còn lại: {formatMoney(remainingAmount, data.currency)}</p>
        </div>
        <div>
          <DocumentNavigator
            basePath="/workspace/finance/contracts"
            currentNumber={data.number}
            previous={data.previousDocument}
            next={data.nextDocument}
          />
        </div>
      </section>

      <div className="quote-detail-layout">
        <main className="space-y-5">
          <section className="quote-detail-card">
            <h2>Quy trình hợp đồng</h2>
            <div className="quote-progress quote-progress-six">
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
            <div className="quote-detail-table contract-detail-table">
              <div className="quote-detail-table-head">
                <span>#</span>
                <span>Sản phẩm / Dịch vụ</span>
                <span>SL</span>
                <span>Đơn giá</span>
                <span>Thành tiền</span>
              </div>
              {data.items?.length ? (
                data.items.map((item, index) => (
                  <div key={item.id} className="quote-detail-table-row">
                    <span>{index + 1}</span>
                    <div>
                      <strong>{item.name}</strong>
                      {item.description ? <p>{plainDescription(item.description)}</p> : null}
                    </div>
                    <span>{asNumber(item.quantity)}</span>
                    <span>{formatMoney(item.unitPrice, data.currency)}</span>
                    <strong>{formatMoney(item.total, data.currency)}</strong>
                  </div>
                ))
              ) : (
                <div className="quote-detail-empty">Chưa có hạng mục nào.</div>
              )}
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Điều khoản</h2>
            <div className="contract-terms">{plainDescription(data.terms) || "Chưa có điều khoản."}</div>
          </section>

          <nav className="quote-detail-tabs">
            {detailTabs.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "active" : ""}>
                {tab.label}
              </button>
            ))}
          </nav>

          {activeTab === "payments" ? (
            <section className="quote-detail-card">
              <h2>Thanh toán</h2>
              <div className="contract-installments">
                {data.paymentInstallments?.length ? (
                  data.paymentInstallments.map((item, index) => (
                    <div key={item.id}>
                      <div>
                        <strong>{item.name || `Đợt ${index + 1}`}</strong>
                        <p>Hạn thanh toán: {formatDate(item.dueDate)}</p>
                      </div>
                      <div>
                        <strong>{formatMoney(item.amount, data.currency)}</strong>
                        <p>{item.status}</p>
                      </div>
                      {item.invoiceId ? (
                        <Link href={`/workspace/finance/invoices/${item.invoiceId}`} className="quote-detail-action">
                          <FileText className="h-4 w-4" />
                          {item.invoice?.number || "Xem hóa đơn"}
                        </Link>
                      ) : (
                        <button type="button" onClick={() => createInvoiceMutation.mutate(item.id)} className="quote-detail-action">
                          <FilePlus2 className="h-4 w-4" />
                          Tạo hóa đơn
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="quote-detail-empty">Chưa có đợt thanh toán.</div>
                )}
              </div>
            </section>
          ) : null}

          {activeTab === "channels" ? (
            <section className="quote-detail-card">
              <h2>Kênh thanh toán</h2>
              <div className="invoice-channel-grid">
                {channelKeys.map((key) => {
                  const channel = getPaymentChannel(key);
                  return (
                    <article key={key} className="invoice-channel-card">
                      <img src={getVietQrUrl(key, remainingAmount || asNumber(data.total), paymentContent)} alt={`VietQR ${channel.label}`} />
                      <div>
                        <strong>{channel.label}</strong>
                        <p>Ngân hàng: {channel.bankName}</p>
                        <p>Số tài khoản: {channel.accountNumber}</p>
                        <p>Chủ tài khoản: {channel.accountName}</p>
                        <p>Số tiền: {formatMoney(remainingAmount || data.total, data.currency)}</p>
                        <p>Nội dung: {paymentContent}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {["activity", "files"].includes(activeTab) ? (
            <section className="quote-detail-card">
              <h2>{activeTab === "activity" ? "Lịch sử hoạt động" : "Tệp đính kèm"}</h2>
              {activeTab === "activity" ? (
                <ActivityTimeline logs={data.activityLogs} fallback={fallbackActivities} />
              ) : (
                <AttachmentList files={data.files} />
              )}
            </section>
          ) : null}
        </main>

        <aside className="space-y-5">
          <section className="quote-detail-card">
            <h2>Thông tin hợp đồng</h2>
            <div className="quote-side-list">
              <div><span>Mã hợp đồng</span><strong>{data.number}</strong></div>
              <div><span>Loại hợp đồng</span><strong>{data.title || "Dịch vụ"}</strong></div>
              <div><span>Ngày tạo</span><strong>{formatDateTime(data.createdAt)}</strong></div>
              <div><span>Ngày ký</span><strong>{formatDate(data.signedAt || data.adminSignedAt)}</strong></div>
              <div><span>Admin ký</span><strong>{formatDateTime(data.adminSignedAt)}</strong></div>
              <div><span>Khách ký</span><strong>{formatDateTime(data.signedAt)}</strong></div>
              <div><span>Hiệu lực</span><strong>{formatDate(data.validFrom)} - {formatDate(data.validUntil)}</strong></div>
              <div><span>Tình trạng</span><strong>{statusLabel[data.status] || data.status}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Giá trị & thanh toán</h2>
            <div className="quote-side-list">
              <div><span>Tổng giá trị</span><strong>{formatMoney(data.total, data.currency)}</strong></div>
              <div><span>Đã thanh toán</span><strong>{formatMoney(paidAmount, data.currency)}</strong></div>
              <div><span>Còn lại</span><strong>{formatMoney(remainingAmount, data.currency)}</strong></div>
            </div>
            <div className="contract-payment-bar"><span style={{ width: `${paidPercent}%` }} /></div>
            <p className="mt-4 text-[14px] font-light text-slate-500">{paidPercent}% đã thanh toán</p>
          </section>

          <section className="quote-detail-card">
            <h2>Tài liệu hợp đồng</h2>
            <div className="contract-document-box">
              <FileCheck2 className="h-10 w-10 text-emerald-600" />
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
        title={`Ký duyệt Hợp đồng ${data.number}`}
        isPending={signMutation.isPending}
      />

      <ConfirmModal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        onConfirm={() => revokeMutation.mutate()}
        title="Xác nhận hủy ký duyệt"
        message="Bạn có chắc chắn muốn hủy chữ ký admin của hợp đồng này không?"
        confirmText="Hủy ký"
        isDestructive
      />

      <ConfirmModal
        isOpen={isCustomerRevokeModalOpen}
        onClose={() => setIsCustomerRevokeModalOpen(false)}
        onConfirm={() => revokeCustomerMutation.mutate()}
        title="Xác nhận hủy ký khách"
        message="Bạn có chắc chắn muốn hủy chữ ký khách hàng của hợp đồng này không? Khách hàng sẽ cần ký lại nếu muốn xác nhận."
        confirmText="Hủy ký khách"
        isDestructive
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Xác nhận xóa Hợp đồng"
        message="Bạn có chắc chắn muốn xóa hợp đồng này không? Dữ liệu đã xóa không thể khôi phục."
        confirmText="Xóa Hợp đồng"
        isDestructive
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
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
  recordPayment,
  sendDocumentEmail,
} from "@/app/actions/finance-crud";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getPaymentChannel, getVietQrUrl, normalizePaymentChannelKeys } from "@/lib/finance/payment-channels";
import { AdminSignModal } from "./admin-sign-modal";
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
    company?: { name?: string | null } | null;
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
  const className = `quote-detail-action ${danger ? "quote-detail-action-danger" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;
  if (href && !disabled) return <Link href={href} className={className} title={title}>{icon}{label}</Link>;
  return <button type="button" onClick={onClick} className={className} disabled={disabled} title={title}>{icon}{label}</button>;
}

export function InvoiceDetailView({ data }: { data: InvoiceDetailData }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("payments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isAdminRevokeModalOpen, setIsAdminRevokeModalOpen] = useState(false);
  const [isCustomerRevokeModalOpen, setIsCustomerRevokeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const publicUrl = data.token ? `/document/${data.token}` : "";
  const fullPublicUrl = data.token && typeof window !== "undefined" ? `${window.location.origin}${publicUrl}` : "";
  const customerName = data.contact?.company?.name || contactName(data.contact);
  const amountPaid = asNumber(data.amountPaid) || (data.payments || []).reduce((sum, item) => sum + asNumber(item.amount), 0);
  const amountDue = Math.max(0, asNumber(data.total) - amountPaid);
  const paidPercent = asNumber(data.total) > 0 ? Math.min(100, Math.round((amountPaid / asNumber(data.total)) * 100)) : 0;
  const paymentContent = `Thanh toan ${data.number}`;
  const channelKeys = normalizePaymentChannelKeys(data.paymentChannels);
  const hasCustomerCancel = Boolean(data.activityLogs?.some((log) => log.action === "customer_signature_revoked")) || data.status === "CANCELLED";
  const hasCustomerSignOrCancel = Boolean(data.signedAt) || hasCustomerCancel;
  const customerDecisionLabel = data.signedAt ? "Ký kết" : "Hủy";

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
    mutationFn: (paymentData: PaymentPayload) => recordPayment(data.id, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setIsPaymentModalOpen(false);
      router.refresh();
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

  const sendMutation = useMutation({
    mutationFn: () => sendDocumentEmail("invoice", data.id, data.contact?.email || ""),
    onSuccess: () => {
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
      label: sendMutation.isPending ? "Đang gửi" : "Gửi hóa đơn",
      icon: <Send className="h-4 w-4" />,
      onClick: () => sendMutation.mutate(),
      disabled: !data.adminSignedAt || sendMutation.isPending,
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

  return (
    <div className="quote-detail-page">
      <header className="quote-detail-hero">
        <div className="quote-detail-title">
          <div className="quote-detail-icon">
            <ReceiptText className="h-7 w-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1>{data.number}</h1>
              <span className={`quote-status quote-status-${data.status.toLowerCase()}`}>{statusLabel[data.status] || data.status}</span>
            </div>
            <p>Hạn thanh toán: {formatDate(data.dueDate)}</p>
          </div>
        </div>

        <div className="quote-detail-top-actions">
          {publicUrl ? <a href={publicUrl} target="_blank" className="quote-detail-top-button"><Eye className="h-4 w-4" />Xem</a> : null}
          <Link href={`/workspace/finance/invoices/${data.id}/edit`} className="quote-detail-top-button"><Edit3 className="h-4 w-4" />Chỉnh sửa</Link>
          <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="quote-detail-top-button quote-detail-delete"><Trash2 className="h-4 w-4" />Xóa</button>
          <div className="relative">
            <button type="button" onClick={() => setMenuOpen((current) => !current)} className="quote-detail-more"><Ellipsis className="h-4 w-4" /></button>
            {menuOpen ? (
              <div className="quote-detail-menu">
                {actionItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={item.disabled}
                    title={item.title}
                    onClick={() => { setMenuOpen(false); item.onClick(); }}
                    className={item.disabled ? "opacity-50 cursor-not-allowed" : undefined}
                  >
                    {item.icon}{item.label}
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
          <strong>{customerName}</strong>
          <p>{data.contact?.phone || "Chưa có số điện thoại"}</p>
          <p>{data.contact?.email || "Chưa có email"}</p>
        </div>
        <div>
          <span>Liên kết</span>
          <strong>{data.contract?.number || data.project?.name || "Không gắn liên kết"}</strong>
          <p>{data.contract?.title || data.project?.name || "Chưa có dự án/hợp đồng"}</p>
        </div>
        <div>
          <span>Tổng hóa đơn</span>
          <strong className="text-emerald-600">{formatMoney(data.total, data.currency)}</strong>
          <p>Đã thanh toán: {formatMoney(amountPaid, data.currency)}</p>
          <p>Còn lại: {formatMoney(amountDue, data.currency)}</p>
        </div>
        <div>
          <DocumentNavigator
            basePath="/workspace/finance/invoices"
            currentNumber={data.number}
            previous={data.previousDocument}
            next={data.nextDocument}
          />
        </div>
      </section>

      <div className="quote-detail-layout">
        <main className="space-y-5">
          <section className="quote-detail-card">
            <h2>Quy trình hóa đơn</h2>
            <div className="quote-progress quote-progress-five">
              {steps.map((step) => <div key={step.label} className={step.done ? "done" : ""}><span>✓</span><p>{step.label}</p></div>)}
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Nội dung công việc</h2>
            <div className="quote-detail-table contract-detail-table">
              <div className="quote-detail-table-head">
                <span>#</span><span>Sản phẩm / Dịch vụ</span><span>SL</span><span>Đơn giá</span><span>Thành tiền</span>
              </div>
              {data.items?.length ? data.items.map((item, index) => (
                <div key={item.id} className="quote-detail-table-row">
                  <span>{index + 1}</span>
                  <div><strong>{item.name}</strong>{item.description ? <p>{plainDescription(item.description)}</p> : null}</div>
                  <span>{asNumber(item.quantity)}</span>
                  <span>{formatMoney(item.unitPrice, data.currency)}</span>
                  <strong>{formatMoney(item.total, data.currency)}</strong>
                </div>
              )) : <div className="quote-detail-empty">Chưa có hạng mục nào.</div>}
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
              <h2>Lịch sử thanh toán</h2>
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
            <section className="quote-detail-card">
              <h2>Kênh thanh toán</h2>
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
            <h2>Thông tin hóa đơn</h2>
            <div className="quote-side-list">
              <div><span>Mã hóa đơn</span><strong>{data.number}</strong></div>
              <div><span>Ngày lập</span><strong>{formatDate(data.issuedAt || data.createdAt)}</strong></div>
              <div><span>Hạn thanh toán</span><strong>{formatDate(data.dueDate)}</strong></div>
              <div><span>Trạng thái</span><strong>{statusLabel[data.status] || data.status}</strong></div>
              <div><span>Admin ký</span><strong>{formatDateTime(data.adminSignedAt)}</strong></div>
              <div><span>Khách ký</span><strong>{formatDateTime(data.signedAt)}</strong></div>
            </div>
          </section>

          <section className="quote-detail-card">
            <h2>Giá trị & thanh toán</h2>
            <div className="quote-side-list">
              <div><span>Tạm tính</span><strong>{formatMoney(data.subtotal, data.currency)}</strong></div>
              <div><span>Chiết khấu</span><strong>-{formatMoney(data.discount, data.currency)}</strong></div>
              <div><span>Tổng thuế</span><strong>{formatMoney(data.tax, data.currency)}</strong></div>
              <div><span>Tổng hóa đơn</span><strong>{formatMoney(data.total, data.currency)}</strong></div>
              <div><span>Còn phải thu</span><strong>{formatMoney(amountDue, data.currency)}</strong></div>
            </div>
            <div className="contract-payment-bar"><span style={{ width: `${paidPercent}%` }} /></div>
            <p className="mt-4 text-[14px] font-light text-slate-500">{paidPercent}% đã thanh toán</p>
          </section>

          <section className="quote-detail-card">
            <h2>Tài liệu hóa đơn</h2>
            <div className="contract-document-box">
              <ReceiptText className="h-10 w-10 text-emerald-600" />
              <strong>{data.number}</strong>
              <span>{formatMoney(data.total, data.currency)}</span>
            </div>
            <button type="button" onClick={() => data.token && window.open(`/document/${data.token}/pdf`, "_blank")} className="quote-detail-action w-full mt-3">
              <Download className="h-4 w-4" />Tải xuống
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

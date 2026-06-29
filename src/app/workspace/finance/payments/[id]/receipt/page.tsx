import { notFound } from "next/navigation";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { ReceiptPrintButton } from "./print-button";

export const metadata = {
  title: "Phiếu thu | Ong Vàng Workspace",
};

type ReceiptPageProps = {
  params: Promise<{ id: string }>;
};

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

function formatDate(value?: Date | string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: Date | string | null) {
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

function methodLabel(method: string) {
  const labels: Record<string, string> = {
    BANK_TRANSFER: "Chuyển khoản",
    CASH: "Tiền mặt",
    CARD: "Thẻ ngân hàng",
    MOMO: "MoMo",
    ZALOPAY: "ZaloPay",
    VNPAY: "VNPay",
    STRIPE: "Stripe",
    PAYPAL: "PayPal",
  };
  return labels[method] || method || "Khác";
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Chờ xử lý",
    PROCESSING: "Đang xử lý",
    COMPLETED: "Đã thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Hoàn tiền",
    CANCELLED: "Đã hủy",
  };
  return labels[status] || status;
}

function cleanText(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default async function PaymentReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params;
  const session = await requireAuth();
  const payment = await db.payment.findFirst({
    where: { id, organizationId: session.organizationId },
    include: {
      organization: true,
      invoice: {
        include: {
          contact: { include: { company: true } },
          payments: true,
        },
      },
    },
  });

  if (!payment) return notFound();

  const organization = payment.organization;
  const invoice = payment.invoice;
  const contact = invoice?.contact;
  const company = contact?.company;
  const contactName = `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim();
  const customerName = company?.name || contactName || contact?.email || "Khách hàng";
  const customerPhone = company?.phone || contact?.phone || contact?.mobile || "";
  const customerEmail = company?.email || contact?.email || "";
  const receiptCode = payment.reference || `PT-${payment.id.slice(-8).toUpperCase()}`;
  const invoiceCode = invoice?.number || "--";
  const paidAt = payment.paidAt || payment.createdAt;
  const invoicePaid =
    invoice?.payments?.reduce((sum, item) => sum + asNumber(item.amount), 0) ??
    asNumber(payment.amount);
  const invoiceTotal = asNumber(invoice?.total);
  const remaining = Math.max(0, invoiceTotal - invoicePaid);
  const notes = cleanText(payment.notes);

  return (
    <main className="receipt-screen">
      <style>{`
        .receipt-screen {
          inset: 0;
          min-height: 100vh;
          overflow: auto;
          position: fixed;
          background: #f6f7fb;
          color: #1f2937;
          font-family: Inter, Arial, sans-serif;
          padding: 40px 16px;
          z-index: 1000;
        }
        .receipt-toolbar {
          align-items: center;
          display: flex;
          justify-content: flex-end;
          margin: 0 auto 16px;
          max-width: 960px;
        }
        .receipt-print-button {
          align-items: center;
          background: #ffffff;
          border: 1px solid #d9e1ec;
          border-radius: 10px;
          color: #334155;
          cursor: pointer;
          display: inline-flex;
          font-size: 14px;
          font-weight: 500;
          gap: 8px;
          height: 40px;
          padding: 0 16px;
        }
        .receipt-sheet {
          background: #fff;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          margin: 0 auto;
          max-width: 960px;
          min-height: 1180px;
          padding: 4%;
        }
        .receipt-top {
          display: grid;
          gap: 32px;
          grid-template-columns: 1fr 1fr;
        }
        .receipt-brand {
          align-items: flex-start;
          display: flex;
          gap: 12px;
        }
        .receipt-logo {
          align-items: center;
          background: #fff7ed;
          border-radius: 16px;
          color: #f97316;
          display: flex;
          font-size: 24px;
          font-weight: 800;
          height: 56px;
          justify-content: center;
          width: 56px;
        }
        .receipt-logo img {
          max-height: 48px;
          max-width: 48px;
          object-fit: contain;
        }
        .receipt-company-name,
        .receipt-national-title {
          color: #111827;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.35;
          text-transform: uppercase;
        }
        .receipt-company-line,
        .receipt-meta {
          color: #475569;
          font-size: 13px;
          line-height: 1.55;
        }
        .receipt-national {
          text-align: center;
        }
        .receipt-national-subtitle {
          color: #111827;
          font-size: 13px;
          font-weight: 700;
          margin-top: 2px;
        }
        .receipt-star {
          color: #f97316;
          font-size: 13px;
          margin: 6px 0;
        }
        .receipt-title {
          margin: 44px 0 28px;
          text-align: center;
        }
        .receipt-title h1 {
          color: #111827;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 0;
          margin: 0;
          text-transform: uppercase;
        }
        .receipt-accent {
          background: #f59e0b;
          border-radius: 999px;
          height: 3px;
          margin: 10px auto 0;
          width: 112px;
        }
        .receipt-section {
          margin-top: 18px;
        }
        .receipt-section-label {
          background: #f59e0b;
          border-radius: 8px 8px 0 0;
          color: #fff;
          display: inline-flex;
          font-size: 13px;
          font-weight: 800;
          padding: 8px 14px;
          text-transform: uppercase;
        }
        .receipt-box {
          border: 1px solid #f59e0b;
          border-radius: 0 10px 10px;
          padding: 18px;
          position: relative;
        }
        .receipt-row {
          display: grid;
          gap: 10px;
          grid-template-columns: 150px 12px 1fr;
          min-height: 26px;
        }
        .receipt-row span {
          color: #334155;
          font-size: 13px;
          font-weight: 700;
        }
        .receipt-row b {
          color: #64748b;
          font-size: 13px;
        }
        .receipt-row div {
          color: #1f2937;
          font-size: 13px;
          line-height: 1.45;
        }
        .receipt-stamp {
          border: 2px solid #10b981;
          border-radius: 8px;
          color: #059669;
          font-size: 13px;
          font-weight: 800;
          padding: 10px 12px;
          position: absolute;
          right: 18px;
          text-align: center;
          text-transform: uppercase;
          top: 18px;
          transform: rotate(-4deg);
        }
        .receipt-stamp small {
          display: block;
          font-size: 10px;
          font-weight: 600;
          margin-top: 4px;
          text-transform: none;
        }
        .receipt-value-table {
          border-collapse: collapse;
          margin-top: 14px;
          width: 100%;
        }
        .receipt-value-table td {
          border-bottom: 1px solid #fed7aa;
          color: #334155;
          font-size: 13px;
          padding: 10px 8px;
        }
        .receipt-value-table td:last-child {
          color: #111827;
          font-weight: 800;
          text-align: right;
        }
        .receipt-value-table .grand td {
          color: #f97316;
          font-size: 15px;
          font-weight: 800;
        }
        .receipt-sign-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: 1fr 1fr;
        }
        .receipt-sign-box {
          border: 1px solid #fed7aa;
          border-radius: 10px;
          min-height: 170px;
          padding: 16px;
          text-align: center;
        }
        .receipt-sign-party {
          color: #111827;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .receipt-sign-sub {
          color: #64748b;
          font-size: 12px;
          margin-top: 3px;
        }
        .receipt-sign-status {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 999px;
          color: #059669;
          display: inline-flex;
          font-size: 12px;
          font-weight: 800;
          margin: 16px 0 12px;
          padding: 5px 10px;
        }
        .receipt-sign-lines {
          color: #475569;
          font-size: 12px;
          line-height: 1.65;
          margin: 0 auto;
          max-width: 280px;
          text-align: left;
        }
        .receipt-footer {
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          display: flex;
          font-size: 12px;
          justify-content: space-between;
          margin-top: 36px;
          padding-top: 14px;
        }
        @media print {
          body * { visibility: hidden !important; }
          .receipt-screen, .receipt-screen * { visibility: visible !important; }
          .receipt-screen { background: #fff; padding: 0; }
          .receipt-toolbar { display: none; }
          .receipt-sheet { box-shadow: none; max-width: none; min-height: auto; position: absolute; inset: 0; }
        }
        @media (max-width: 760px) {
          .receipt-sheet { padding: 24px; }
          .receipt-top,
          .receipt-sign-grid { grid-template-columns: 1fr; }
          .receipt-national { text-align: left; }
          .receipt-stamp { position: static; transform: none; margin-top: 16px; width: fit-content; }
          .receipt-row { grid-template-columns: 1fr; gap: 2px; }
          .receipt-row b { display: none; }
          .receipt-footer { display: block; }
        }
      `}</style>
      <div className="receipt-toolbar">
        <ReceiptPrintButton />
      </div>
      <section className="receipt-sheet">
        <header className="receipt-top">
          <div className="receipt-brand">
            <div className="receipt-logo">
              {organization.logo ? <img src={organization.logo} alt={organization.name} /> : "OV"}
            </div>
            <div>
              <div className="receipt-company-name">{organization.name}</div>
              <div className="receipt-company-line">MST: Đang cập nhật</div>
              <div className="receipt-company-line">{organization.address || "Đang cập nhật"}</div>
              <div className="receipt-company-line">
                {[organization.phone, organization.email, organization.website].filter(Boolean).join(" | ") || "Đang cập nhật"}
              </div>
            </div>
          </div>
          <div className="receipt-national">
            <div className="receipt-national-title">Cộng hòa xã hội chủ nghĩa Việt Nam</div>
            <div className="receipt-national-subtitle">Độc lập - Tự do - Hạnh phúc</div>
            <div className="receipt-star">----- ★ -----</div>
            <div className="receipt-meta">Số: <strong>{receiptCode}</strong></div>
            <div className="receipt-meta">Ngày thu: <strong>{formatDate(paidAt)}</strong></div>
          </div>
        </header>

        <div className="receipt-title">
          <h1>Phiếu thu</h1>
          <div className="receipt-accent" />
        </div>

        <section className="receipt-section">
          <div className="receipt-section-label">Thông tin thanh toán</div>
          <div className="receipt-box">
            <div className="receipt-row"><span>Tên khách hàng</span><b>:</b><div><strong>{customerName}</strong></div></div>
            <div className="receipt-row"><span>Điện thoại</span><b>:</b><div>{customerPhone || "Đang cập nhật"}</div></div>
            <div className="receipt-row"><span>Email</span><b>:</b><div>{customerEmail || "Đang cập nhật"}</div></div>
            <div className="receipt-row"><span>Hóa đơn</span><b>:</b><div>{invoiceCode}</div></div>
            <div className="receipt-row"><span>Số tiền thu</span><b>:</b><div><strong>{formatMoney(payment.amount, payment.currency)}</strong></div></div>
            <div className="receipt-row"><span>Phương thức</span><b>:</b><div>{methodLabel(payment.method)}</div></div>
            <div className="receipt-row"><span>Mã giao dịch</span><b>:</b><div>{receiptCode}</div></div>
            <div className="receipt-row"><span>Ghi chú</span><b>:</b><div>{notes || "---"}</div></div>
            <div className="receipt-stamp">
              {statusLabel(payment.status)}
              <small>{formatDate(paidAt)}</small>
            </div>
          </div>
        </section>

        <section className="receipt-section">
          <div className="receipt-section-label">Giá trị thanh toán</div>
          <div className="receipt-box">
            <table className="receipt-value-table">
              <tbody>
                <tr><td>Tổng giá trị hóa đơn</td><td>{formatMoney(invoice?.total, payment.currency)}</td></tr>
                <tr><td>Đã thanh toán</td><td>{formatMoney(invoicePaid, payment.currency)}</td></tr>
                <tr className="grand"><td>Còn lại</td><td>{formatMoney(remaining, payment.currency)}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="receipt-section">
          <div className="receipt-section-label">Xác nhận</div>
          <div className="receipt-box">
            <div className="receipt-sign-grid">
              <div className="receipt-sign-box">
                <div className="receipt-sign-party">Người lập phiếu</div>
                <div className="receipt-sign-sub">Kế toán / Công ty</div>
                <div className="receipt-sign-status">Đã xác nhận</div>
                <div className="receipt-sign-lines">
                  <div>Họ tên: {session.user?.name || "Super Admin"}</div>
                  <div>Chức danh: Người phụ trách</div>
                  <div>Thời gian: {formatDateTime(payment.createdAt)}</div>
                </div>
              </div>
              <div className="receipt-sign-box">
                <div className="receipt-sign-party">Người nộp tiền</div>
                <div className="receipt-sign-sub">Khách hàng</div>
                <div className="receipt-sign-status">Đã thanh toán</div>
                <div className="receipt-sign-lines">
                  <div>Họ tên: {customerName}</div>
                  <div>Hóa đơn: {invoiceCode}</div>
                  <div>Thời gian: {formatDateTime(paidAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="receipt-footer">
          <div>{organization.name} - {organization.email || "Đang cập nhật"} - {organization.phone || "Đang cập nhật"}</div>
          <div>Phiếu thu {receiptCode}</div>
        </footer>
      </section>
    </main>
  );
}

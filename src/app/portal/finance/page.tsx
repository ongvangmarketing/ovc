import type { Metadata } from "next";
import { ReceiptText } from "lucide-react";
import { formatCurrency, getCustomerPortalData } from "../portal-data";
import { PortalFinanceTabs } from "../portal-dashboard-sections";
import { PortalMissingContact, PortalShell } from "../portal-shell";

export const metadata: Metadata = {
  title: "Tài chính | Portal Khách hàng",
};

function asNumber(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function PortalFinancePage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return <PortalMissingContact email={data.session.user.email} />;
  }

  const groups = [
    {
      key: "quotations" as const,
      label: "Báo giá",
      items: data.quotations.map((item) => ({
        id: item.id,
        code: item.number,
        title: item.title,
        status: item.status,
        date: item.createdAt?.toISOString() || null,
        amount: asNumber(item.total),
        href: item.token ? `/document/${item.token}` : "/portal/finance",
      })),
    },
    {
      key: "contracts" as const,
      label: "Hợp đồng",
      items: data.contracts.map((item) => ({
        id: item.id,
        code: item.number,
        title: item.title,
        status: item.status,
        date: item.createdAt?.toISOString() || null,
        amount: asNumber(item.total),
        href: item.token ? `/document/${item.token}` : "/portal/finance",
      })),
    },
    {
      key: "invoices" as const,
      label: "Hóa đơn",
      items: data.invoices.map((item) => ({
        id: item.id,
        code: item.number,
        title: item.title || item.number,
        status: item.status,
        date: (item.dueDate || item.createdAt)?.toISOString() || null,
        amount: asNumber(item.total),
        href: item.token ? `/document/${item.token}` : "/portal/finance",
      })),
    },
    {
      key: "payments" as const,
      label: "Thanh toán",
      items: data.payments.map((item) => ({
        id: item.id,
        code: item.reference || item.id,
        title: `Hóa đơn ${item.invoice.number}`,
        status: item.status,
        date: (item.paidAt || item.createdAt)?.toISOString() || null,
        amount: asNumber(item.amount),
        href: "/portal/finance",
      })),
    },
  ];

  return (
    <PortalShell active="finance" customerName={data.customerName} email={data.contact.email}>
      <section className="quote-detail-hero">
        <div className="quote-detail-title">
          <div className="quote-detail-icon"><ReceiptText className="h-6 w-6" /></div>
          <div>
            <h1>Tài chính</h1>
            <p>Báo giá, hợp đồng, hóa đơn và thanh toán của {data.customerName}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <Metric label="Tổng báo giá" value={formatCurrency(data.quotations.reduce((sum, item) => sum + Number(item.total || 0), 0))} />
        <Metric label="Giá trị hợp đồng" value={formatCurrency(data.contracts.reduce((sum, item) => sum + Number(item.total || 0), 0))} />
        <Metric label="Tổng hóa đơn" value={formatCurrency(data.totals.totalInvoiced)} />
        <Metric label="Công nợ" value={formatCurrency(data.totals.totalDue)} danger />
      </section>

      <PortalFinanceTabs groups={groups} />
    </PortalShell>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="quote-detail-card">
      <span className="text-slate-500">{label}</span>
      <strong className={`mt-2 block text-xl ${danger ? "text-red-500" : "text-slate-950"}`}>{value}</strong>
    </div>
  );
}

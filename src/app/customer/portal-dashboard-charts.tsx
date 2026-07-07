"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { SelectBox } from "@/components/ui/select-box";

type RevenueMonth = {
  key: string;
  label: string;
  value: number;
};

type PortalInvoicePoint = {
  createdAt: string | null;
  total: number;
  amountPaid: number;
  amountDue: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function PortalRevenueChart({
  months,
  totalRevenue,
  invoices = [],
}: {
  months: RevenueMonth[];
  totalRevenue: number;
  invoices?: PortalInvoicePoint[];
}) {
  const [chartMetric, setChartMetric] = useState<"revenue" | "debt">("revenue");
  const [chartRange, setChartRange] = useState<"30d" | "3m" | "6m" | "12m">("6m");
  const fallbackSeries = months;
  const newestInvoiceDate = invoices.reduce<Date | null>((latest, invoice) => {
    if (!invoice.createdAt) return latest;
    const date = new Date(invoice.createdAt);
    if (Number.isNaN(date.getTime())) return latest;
    return !latest || date.getTime() > latest.getTime() ? date : latest;
  }, null) || new Date();
  const rangeCount = chartRange === "30d" ? 30 : Number(chartRange.replace("m", ""));
  const chartSeries = invoices.length
    ? Array.from({ length: rangeCount }).map((_, index) => {
      const date = chartRange === "30d"
        ? new Date(newestInvoiceDate.getFullYear(), newestInvoiceDate.getMonth(), newestInvoiceDate.getDate() - (29 - index))
        : new Date(newestInvoiceDate.getFullYear(), newestInvoiceDate.getMonth() - (rangeCount - 1 - index), 1);
      return {
        key: chartRange === "30d" ? date.toISOString().slice(0, 10) : monthKey(date),
        label: chartRange === "30d" ? `${date.getDate()}/${date.getMonth() + 1}` : monthLabel(date),
        value: 0,
      };
    })
    : fallbackSeries;
  invoices.forEach((invoice) => {
    if (!invoice.createdAt) return;
    const date = new Date(invoice.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key = chartRange === "30d" ? date.toISOString().slice(0, 10) : monthKey(date);
    const period = chartSeries.find((item) => item.key === key);
    if (period) period.value += chartMetric === "revenue" ? invoice.total : invoice.amountDue;
  });
  const rangeTotal = chartSeries.reduce((sum, item) => sum + item.value, 0);
  const hasRevenueData = chartSeries.some((item) => item.value > 0);

  return (
    <section className="quote-detail-card portal-revenue-card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2>{chartMetric === "revenue" ? "Doanh thu theo thời gian" : "Công nợ theo trạng thái"}</h2>
          <strong>{formatCurrency(invoices.length ? rangeTotal : totalRevenue)}</strong>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <SelectBox ariaLabel="Loại biểu đồ portal" value={chartMetric} onChange={(value) => setChartMetric(value as "revenue" | "debt")} options={[{ value: "revenue", label: "Doanh thu" }, { value: "debt", label: "Công nợ" }]} className="w-[118px]" />
          <SelectBox ariaLabel="Thời gian biểu đồ portal" value={chartRange} onChange={(value) => setChartRange(value as "30d" | "3m" | "6m" | "12m")} options={[{ value: "30d", label: "30 ngày" }, { value: "3m", label: "3 tháng" }, { value: "6m", label: "6 tháng" }, { value: "12m", label: "12 tháng" }]} className="w-[118px]" />
        </div>
      </div>
      <div className="h-[310px]">
        {hasRevenueData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartSeries} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="portalRevenueArea" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7049ff" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#7049ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#edf0f7" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#8a849f", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8a849f", fontSize: 12 }} width={58} tickFormatter={(value) => `${Number(value).toLocaleString("vi-VN")}`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Area type="monotone" dataKey="value" name={chartMetric === "revenue" ? "Doanh thu" : "Công nợ"} stroke="#7049ff" strokeWidth={2.5} fill="url(#portalRevenueArea)" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            Chưa có {chartMetric === "revenue" ? "doanh thu" : "công nợ"} trong kỳ
          </div>
        )}
      </div>
    </section>
  );
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

export function PortalDebtDonut({
  paidAmount,
  dueAmount,
}: {
  paidAmount: number;
  dueAmount: number;
}) {
  const [hovered, setHovered] = useState<"paid" | "due" | null>(null);
  const total = paidAmount + dueAmount;
  const paidPercent = total ? Math.round((paidAmount / total) * 100) : 0;
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const paidLength = total ? (paidAmount / total) * circumference : 0;
  const dueLength = total ? circumference - paidLength : 0;

  const tooltip = useMemo(() => {
    if (hovered === "paid") return { label: "Đã thu", value: paidAmount };
    if (hovered === "due") return { label: "Còn phải thu", value: dueAmount };
    return null;
  }, [dueAmount, hovered, paidAmount]);

  return (
    <section className="quote-detail-card">
      <h2>Công nợ theo trạng thái</h2>
      <div className="customer-donut-wrap">
        <div className="customer-donut-chart">
          <svg viewBox="0 0 140 140" className="customer-donut-svg" aria-label="Biểu đồ công nợ">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="24" />
            {total ? (
              <>
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="24"
                  strokeDasharray={`${paidLength} ${circumference - paidLength}`}
                  strokeLinecap="butt"
                  transform="rotate(-90 70 70)"
                  onMouseEnter={() => setHovered("paid")}
                  onMouseLeave={() => setHovered(null)}
                />
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="24"
                  strokeDasharray={`${dueLength} ${circumference - dueLength}`}
                  strokeDashoffset={-paidLength}
                  strokeLinecap="butt"
                  transform="rotate(-90 70 70)"
                  onMouseEnter={() => setHovered("due")}
                  onMouseLeave={() => setHovered(null)}
                />
              </>
            ) : null}
            <circle cx="70" cy="70" r="34" fill="#fff" />
            <text x="70" y="66" textAnchor="middle" className="customer-donut-center">{paidPercent}%</text>
            <text x="70" y="84" textAnchor="middle" className="customer-donut-center-sub">đã thu</text>
          </svg>
          {tooltip ? (
            <div className="customer-donut-tooltip">
              <span>{tooltip.label}</span>
              <strong>{formatCurrency(tooltip.value)}</strong>
            </div>
          ) : null}
        </div>
        <div className="customer-donut-legend">
          <button type="button" onMouseEnter={() => setHovered("paid")} onMouseLeave={() => setHovered(null)}><i className="paid" />Đã thu</button>
          <button type="button" onMouseEnter={() => setHovered("due")} onMouseLeave={() => setHovered(null)}><i className="debt" />Còn phải thu</button>
        </div>
      </div>
    </section>
  );
}

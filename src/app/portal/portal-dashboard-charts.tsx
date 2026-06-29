"use client";

import { useMemo, useState } from "react";

type RevenueMonth = {
  key: string;
  label: string;
  value: number;
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
}: {
  months: RevenueMonth[];
  totalRevenue: number;
}) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const maxRevenue = Math.max(...months.map((item) => item.value), 1);
  const hasRevenueData = months.some((item) => item.value > 0);
  const points = months.map((item, index) => {
    const x = 32 + index * 112;
    const y = 210 - (item.value / maxRevenue) * 170;
    return { ...item, x, y };
  });
  const path = points.map((item, index) => `${index === 0 ? "M" : "L"} ${item.x} ${item.y}`).join(" ");
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath = firstPoint && lastPoint ? `${path} L ${lastPoint.x} 220 L ${firstPoint.x} 220 Z` : "";
  const hovered = points.find((item) => item.key === hoveredKey);

  return (
    <section className="quote-detail-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2>Doanh thu theo thời gian</h2>
          <strong>{formatCurrency(totalRevenue)}</strong>
        </div>
        <div className="customer-filter-pills"><span>Doanh thu</span><span>6 tháng</span></div>
      </div>
      <div className="customer-chart-wrap">
        <svg viewBox="0 0 640 260" className="customer-line-chart">
          <defs>
            <linearGradient id="portalRevenueFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[40, 80, 120, 160, 200].map((y) => <line key={y} x1="0" x2="640" y1={y} y2={y} stroke="#e5eaf2" strokeDasharray="6 6" />)}
          {hasRevenueData ? <path d={areaPath} fill="url(#portalRevenueFill)" /> : null}
          {hasRevenueData ? <path d={path} fill="none" stroke="#f59e0b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" /> : null}
          {points.map((point) => (
            <g key={point.key}>
              {hasRevenueData ? (
                <>
                  <circle cx={point.x} cy={point.y} r={hoveredKey === point.key ? "7" : "5"} fill="#f59e0b" stroke="#fff" strokeWidth="3" />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="18"
                    fill="transparent"
                    onMouseEnter={() => setHoveredKey(point.key)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onFocus={() => setHoveredKey(point.key)}
                    tabIndex={0}
                    role="img"
                    aria-label={`${point.label}: ${formatCurrency(point.value)}`}
                  />
                </>
              ) : null}
              <text x={point.x} y="248" textAnchor="middle">{point.label}</text>
            </g>
          ))}
          {!hasRevenueData ? <text x="320" y="130" textAnchor="middle" className="customer-chart-empty">Chưa có doanh thu trong 6 tháng</text> : null}
        </svg>
        {hovered ? (
          <div className="customer-chart-tooltip" style={{ left: `${(hovered.x / 640) * 100}%`, top: `${(hovered.y / 260) * 100}%` }}>
            <span>{hovered.label}</span>
            <strong>{formatCurrency(hovered.value)}</strong>
          </div>
        ) : null}
      </div>
    </section>
  );
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

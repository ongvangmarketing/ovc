"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PagePoint = { date: string; reach: number; impressions: number; engagements: number; leads: number };
type AdsPoint = { date: string; spend: number; reach: number; impressions: number; clicks: number; leads: number };

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("vi-VN");

export function PortalPageChart({ data }: { data: PagePoint[] }) {
  if (!data.length) return <EmptyChart label="Chưa có dữ liệu Page theo ngày" />;

  return (
    <div className="mt-4 h-56 rounded-2xl border border-emerald-100 bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="portalPageReach" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip formatter={(value, name) => [number.format(Number(value)), name === "engagements" ? "Engagement" : String(name)]} />
          <Area type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={2.5} fill="url(#portalPageReach)" />
          <Area type="monotone" dataKey="engagements" stroke="#2563eb" strokeWidth={2} fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PortalAdsChart({ data }: { data: AdsPoint[] }) {
  if (!data.length) return <EmptyChart label="Chưa có dữ liệu Ads theo ngày" />;

  return (
    <div className="mt-4 h-56 rounded-2xl border border-orange-100 bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip formatter={(value, name) => [name === "spend" ? money.format(Number(value)) : number.format(Number(value)), name === "spend" ? "Chi tiêu" : String(name)]} />
          <Bar dataKey="spend" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          <Bar dataKey="leads" fill="#2563eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="mt-4 flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
      {label}
    </div>
  );
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const data = [
  { month: "T1", revenue: 48000000, target: 50000000 },
  { month: "T2", revenue: 62000000, target: 55000000 },
  { month: "T3", revenue: 54000000, target: 60000000 },
  { month: "T4", revenue: 79000000, target: 65000000 },
  { month: "T5", revenue: 91000000, target: 75000000 },
  { month: "T6", revenue: 107000000, target: 85000000 },
  { month: "T7", revenue: 98000000, target: 90000000 },
  { month: "T8", revenue: 115000000, target: 100000000 },
  { month: "T9", revenue: 121000000, target: 110000000 },
  { month: "T10", revenue: 109000000, target: 115000000 },
  { month: "T11", revenue: 135000000, target: 120000000 },
  { month: "T12", revenue: 128400000, target: 130000000 },
];

function formatVND(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  return `${(value / 1_000).toFixed(0)}K`;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-w-[160px]">
      <p className="text-sm font-bold text-gray-800 mb-3">{label}</p>
      <div className="space-y-2">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-600 font-medium flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name === "revenue" ? "Doanh thu" : "Mục tiêu"}
            </span>
            <span className="font-bold text-gray-900 tabular-nums">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function RevenueChart() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card-base bg-white/40 backdrop-blur-xl border border-white/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full min-h-[400px] flex flex-col rounded-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Tổng quan Doanh thu</h3>
          <p className="text-sm text-gray-500 font-medium">Doanh thu so với mục tiêu năm 2026</p>
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
              tickFormatter={formatVND}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#94a3b8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorTarget)"
              activeDot={false}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "#2563eb" }}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

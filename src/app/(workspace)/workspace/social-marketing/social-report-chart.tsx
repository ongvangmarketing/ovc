"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SocialReportChart({ data }: { data: Array<{ date: string; spend: number; clicks: number; leads: number }> }) {
  if (!data.length) {
    return <div className="flex h-64 items-center justify-center text-sm text-gray-500">Chưa có dữ liệu trong khoảng thời gian này.</div>;
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={54} />
          <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb", fontSize: 12 }} />
          <Line type="monotone" dataKey="spend" name="Chi tiêu" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="clicks" name="Lượt nhấp" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="leads" name="Khách hàng tiềm năng" stroke="#16a34a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


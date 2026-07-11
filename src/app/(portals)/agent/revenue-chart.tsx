"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '01/07', revenue: 4000000 },
  { name: '05/07', revenue: 3000000 },
  { name: '10/07', revenue: 2000000 },
  { name: '15/07', revenue: 2780000 },
  { name: '20/07', revenue: 1890000 },
  { name: '25/07', revenue: 2390000 },
  { name: '30/07', revenue: 3490000 },
];

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
        <XAxis 
          dataKey="name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          dy={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          tickFormatter={(value) => `${value / 1000000}M`}
        />
        <Tooltip 
          cursor={{ fill: '#f3f4f6' }}
          contentStyle={{ 
            borderRadius: '12px', 
            border: '1px solid #eaeaea',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
          }}
          formatter={(value: any) => [`${new Intl.NumberFormat('vi-VN').format(value)} ₫`, 'Doanh thu']}
        />
        <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

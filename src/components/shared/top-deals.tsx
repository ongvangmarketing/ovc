"use client";

import { TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const deals = [
  {
    id: "1",
    title: "Hệ thống ERP cho Công ty ABC",
    company: "ABC Corporation",
    value: 180000000,
    stage: "Đề xuất",
    probability: 75,
    color: "#F59E0B",
  },
  {
    id: "2",
    title: "Phần mềm quản lý nhân sự",
    company: "XYZ Solutions",
    value: 95000000,
    stage: "Đàm phán",
    probability: 85,
    color: "#10B981",
  },
  {
    id: "3",
    title: "Website thương mại điện tử",
    company: "Shop Online Co.",
    value: 65000000,
    stage: "Liên hệ",
    probability: 40,
    color: "#3B82F6",
  },
  {
    id: "4",
    title: "App di động nội bộ",
    company: "Tech Startup VN",
    value: 120000000,
    stage: "Demo",
    probability: 60,
    color: "#8B5CF6",
  },
  {
    id: "5",
    title: "Tích hợp CRM - ERP",
    company: "Global Traders Ltd",
    value: 75000000,
    stage: "Báo giá",
    probability: 55,
    color: "#F97316",
  },
];

const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300 } }
};

export function TopDeals() {
  return (
    <div className="card-base bg-white/40 backdrop-blur-xl border border-white/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Deals Tiềm Năng</h3>
          <p className="text-sm text-gray-500 font-medium">Top deals có khả năng chốt cao</p>
        </div>
        <Link
          href="/workspace/crm"
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
        </Link>
      </div>

      <motion.div 
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar"
      >
        {deals.map((deal) => (
          <motion.div
            key={deal.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.8)" }}
            className="flex items-center justify-between p-3 rounded-xl border border-white/60 bg-white/40 shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 group-hover:rotate-12"
                style={{ backgroundColor: deal.color }}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {deal.title}
                </p>
                <p className="text-xs font-medium text-gray-500">{deal.company}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 tabular-nums">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(deal.value)}
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {deal.stage}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {deal.probability}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

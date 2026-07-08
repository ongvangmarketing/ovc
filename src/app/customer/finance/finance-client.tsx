"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Download, FileCheck2, FileText, Mail, ReceiptText, ArrowRight, Activity } from "lucide-react";
import { formatCurrency, formatDate, statusClass, statusLabel } from "../utils";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomerFinancePage({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState<"invoices" | "quotations" | "contracts">("invoices");

  if (!data.contact) {
    return null;
  }

  const { totals, invoices, quotations, contracts } = data;

  const tabs = [
    { id: "invoices", label: "Hóa đơn", count: invoices.length, icon: ReceiptText },
    { id: "quotations", label: "Báo giá", count: quotations.length, icon: FileText },
    { id: "contracts", label: "Hợp đồng", count: contracts.length, icon: FileCheck2 },
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case "invoices": return invoices;
      case "quotations": return quotations;
      case "contracts": return contracts;
      default: return [];
    }
  };

  const activeData = getCurrentData();

  return (
    <div className="bg-white min-h-screen text-black selection:bg-black selection:text-white pb-24 font-sans">
      
      {/* Vercel Header Section */}
      <div className="pt-16 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto border-b border-[#eaeaea]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <div className="max-w-3xl">
            <h1 className="text-[40px] md:text-[56px] font-medium tracking-tighter leading-[1.05] text-black">
              Tài chính
            </h1>
            <p className="text-[18px] text-gray-500 max-w-2xl mt-4 tracking-tight leading-snug">
              Quản lý toàn bộ hóa đơn, báo giá và hợp đồng. Thanh toán nhanh chóng, an toàn.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 min-w-max">
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-2">Đã thanh toán</p>
              <p className="text-[28px] font-medium tracking-tighter text-black leading-none">{formatCurrency(totals.totalPaid)}</p>
            </div>
            <div className="hidden sm:block w-[1px] bg-[#eaeaea]"></div>
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-2">Dư nợ hiện tại</p>
              <p className="text-[28px] font-medium tracking-tighter text-red-600 leading-none">{formatCurrency(totals.totalDue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-[1440px] mx-auto pt-10">
        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden shadow-sm">
          
          <div className="flex items-center gap-8 border-b border-[#eaeaea] px-8 pt-6 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 pb-5 text-[15px] font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {tab.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-medium ${activeTab === tab.id ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <motion.div layoutId="finance-tab-indicator" className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="p-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {activeData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white border-b border-[#eaeaea]">
                        <tr>
                          <th className="px-8 py-5 text-[11px] font-medium uppercase tracking-widest text-gray-400">Mã số</th>
                          <th className="px-8 py-5 text-[11px] font-medium uppercase tracking-widest text-gray-400">Trạng thái</th>
                          <th className="px-8 py-5 text-[11px] font-medium uppercase tracking-widest text-gray-400">Ngày tạo / Hạn</th>
                          <th className="px-8 py-5 text-[11px] font-medium uppercase tracking-widest text-gray-400 text-right">Giá trị</th>
                          <th className="px-8 py-5 text-[11px] font-medium uppercase tracking-widest text-gray-400 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#eaeaea]">
                        {activeData.map((item: any) => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-8 py-6 align-top">
                              <Link href={item.token ? `/document/${item.token}` : "#"} className="flex flex-col">
                                <span className="text-[15px] font-medium text-black group-hover:text-gray-600 transition-colors">{item.number}</span>
                                {item.title && <span className="text-[13px] text-gray-500 mt-1 line-clamp-1 max-w-[300px]">{item.title}</span>}
                              </Link>
                            </td>
                            <td className="px-8 py-6 align-top">
                              <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-widest ${
                                item.status === "PAID" || item.status === "COMPLETED" ? "border-transparent bg-emerald-50 text-emerald-700" : 
                                item.status === "PENDING" || item.status === "DRAFT" ? "border-[#eaeaea] bg-white text-gray-600" :
                                "border-transparent bg-gray-100 text-gray-600"
                              }`}>
                                {statusLabel(item.status)}
                              </span>
                            </td>
                            <td className="px-8 py-6 align-top text-[15px] text-gray-500">
                              {formatDate(item.dueDate || item.createdAt)}
                            </td>
                            <td className="px-8 py-6 align-top text-right">
                              <span className="text-[16px] font-medium text-black">{formatCurrency(item.total)}</span>
                              {item.amountDue > 0 && (
                                <div className="text-[13px] font-medium text-red-500 mt-1">Còn nợ: {formatCurrency(item.amountDue)}</div>
                              )}
                            </td>
                            <td className="px-8 py-6 align-top text-right">
                              <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.token && (
                                  <Link 
                                    href={`/document/${item.token}/pdf`} 
                                    className="flex h-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-4 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                                  >
                                    PDF
                                  </Link>
                                )}
                                <Link 
                                  href={item.token ? `/document/${item.token}` : "#"} 
                                  className="flex h-10 items-center justify-center rounded-full bg-black px-5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
                                >
                                  Chi tiết
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
                      <ReceiptText className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-[20px] font-medium tracking-tight text-black">Chưa có dữ liệu</h3>
                    <p className="mt-2 text-[15px] text-gray-500 max-w-sm">Không có dữ liệu {activeTab === "invoices" ? "hóa đơn" : activeTab === "quotations" ? "báo giá" : "hợp đồng"} nào được tìm thấy.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

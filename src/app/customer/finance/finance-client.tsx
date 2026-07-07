"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Download, FileCheck2, FileText, Mail, ReceiptText, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, statusClass, statusLabel } from "../utils";

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
    <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 shadow-sm shrink-0">
            <CreditCard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý Tài chính</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi toàn bộ dòng tiền, hóa đơn và hợp đồng của bạn.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="rounded-xl border border-slate-100 bg-emerald-50 px-5 py-3">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Đã thanh toán</div>
            <div className="text-xl font-bold text-emerald-700">{formatCurrency(totals.totalPaid)}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-red-50 px-5 py-3">
            <div className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">Công nợ hiện tại</div>
            <div className="text-xl font-bold text-red-700">{formatCurrency(totals.totalDue)}</div>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-6 border-b border-slate-200 px-6 pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className={`ml-1.5 rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-0">
          {activeData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Mã số</th>
                    <th className="px-6 py-4 font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 font-semibold">Ngày tạo / Hạn</th>
                    <th className="px-6 py-4 font-semibold text-right">Giá trị</th>
                    <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeData.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={item.token ? `/document/${item.token}` : "#"} className="font-semibold text-slate-900 hover:text-blue-600 flex flex-col">
                          {item.number}
                          {item.title && <span className="text-xs font-normal text-slate-500 mt-0.5 line-clamp-1">{item.title}</span>}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase ${statusClass(item.status)}`}>
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(item.dueDate || item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900">{formatCurrency(item.total)}</span>
                        {item.amountDue > 0 && (
                          <div className="text-xs font-medium text-red-500 mt-1">Còn nợ: {formatCurrency(item.amountDue)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {item.token && (
                            <Link 
                              href={`/document/${item.token}/pdf`} 
                              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Download className="h-3.5 w-3.5" /> PDF
                            </Link>
                          )}
                          <Link 
                            href={item.token ? `/document/${item.token}` : "#"} 
                            className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Chi tiết <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <ReceiptText className="h-8 w-8 text-slate-300" />
              </div>
              <p>Không có dữ liệu {activeTab === "invoices" ? "hóa đơn" : activeTab === "quotations" ? "báo giá" : "hợp đồng"}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

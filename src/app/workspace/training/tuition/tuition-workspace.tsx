"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Search,
  CreditCard,
  DollarSign,
  Receipt,
  AlertCircle,
  ChevronDown,
  Download,
  CheckSquare,
  Square,
  Mail,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { TrainingTuitionRow } from "@/lib/training";
import { tuitionMockData } from "./tuition.mock";
import type { TuitionPaymentStatus, TuitionSortDir, TuitionSortKey } from "./tuition.types";

const statusConfig: Record<TuitionPaymentStatus, { label: string; tone: string }> = {
  PENDING: { label: "Chưa nộp", tone: "bg-red-50 text-red-600 border-red-200" },
  PARTIAL: { label: "Đóng 1 phần", tone: "bg-amber-50 text-amber-600 border-amber-200" },
  PAID: { label: "Hoàn thành", tone: "bg-emerald-50 text-emerald-600 border-emerald-200" },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
};

export function TuitionWorkspace({ initialTuition }: { initialTuition: TrainingTuitionRow[] }) {
  const router = useRouter();
  const [tuition] = useState<TrainingTuitionRow[]>(
    initialTuition.length > 0 ? initialTuition : tuitionMockData
  );
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TuitionPaymentStatus>("ALL");
  const [sortKey, setSortKey] = useState<TuitionSortKey>("student");
  const [sortDir, setSortDir] = useState<TuitionSortDir>("asc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // Stats
  const stats = useMemo(() => {
    const totalFee = tuition.reduce((acc, t) => acc + t.tuitionFee, 0);
    const totalPaid = tuition.reduce((acc, t) => acc + t.paidAmount, 0);
    const totalRemaining = tuition.reduce((acc, t) => acc + t.remainingAmount, 0);
    const collectionRate = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : 0;
    
    return {
      totalFee,
      totalPaid,
      totalRemaining,
      collectionRate,
      count: tuition.length,
    };
  }, [tuition]);

  // Filter & Sort
  const processedData = useMemo(() => {
    let result = [...tuition];
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        t => t.student.toLowerCase().includes(q) || 
             t.course.toLowerCase().includes(q) || 
             t.className.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter !== "ALL") {
      result = result.filter(t => t.paymentStatus === statusFilter);
    }
    
    result.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
    
    return result;
  }, [tuition, query, statusFilter, sortKey, sortDir]);

  const handleSort = (key: TuitionSortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(processedData.map(d => d.id)));
    }
  };

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <header className="mb-5 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
              <Receipt className="h-4 w-4 text-orange-500" />
              Đào tạo / Học phí
            </div>
            <h1 className="text-2xl font-semibold text-slate-950">Quản lý học phí</h1>
            <p className="mt-1 text-[14px] font-light text-slate-500">Theo dõi doanh thu, công nợ và hóa đơn học phí HP.</p>
          </div>
          <button 
            className="quote-action-button quote-action-secondary"
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
        
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Tổng doanh thu dự kiến" value={formatCurrency(stats.totalFee)} icon={<DollarSign className="w-5 h-5 text-indigo-500" />} tone="bg-indigo-50" />
          <StatCard label="Thực thu" value={formatCurrency(stats.totalPaid)} icon={<CreditCard className="w-5 h-5 text-emerald-500" />} tone="bg-emerald-50" />
          <StatCard label="Công nợ" value={formatCurrency(stats.totalRemaining)} icon={<AlertCircle className="w-5 h-5 text-red-500" />} tone="bg-red-50" />
          <StatCard label="Tỷ lệ thu hồi" value={`${stats.collectionRate}%`} icon={<Receipt className="w-5 h-5 text-blue-500" />} tone="bg-blue-50">
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.collectionRate}%` }} />
            </div>
          </StatCard>
        </div>
      </header>

      <section className="quote-panel overflow-hidden p-0">
          
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto">
                {(["ALL", "PENDING", "PARTIAL", "PAID"] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                      statusFilter === status ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {status === "ALL" ? "Tất cả" : statusConfig[status as TuitionPaymentStatus].label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {selectedRows.size > 0 && (
                  <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-700">{selectedRows.size} đã chọn</span>
                    <button onClick={() => { toast.success(`Đã gửi email nhắc phí cho ${selectedRows.size} học viên`); setSelectedRows(new Set()); }} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg flex items-center gap-1.5 hover:bg-indigo-100"><Mail className="w-4 h-4"/> Nhắc phí</button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm học viên, lớp..."
                  className="quote-input pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="min-h-[560px] overflow-auto">
            {processedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Receipt className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-base font-medium text-slate-900">Không có dữ liệu</h3>
                <p className="text-sm text-slate-500 mt-1">Vui lòng điều chỉnh bộ lọc</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-4 w-12 text-center">
                      <button onClick={toggleAll} className="text-slate-400 hover:text-indigo-600 transition-colors">
                        {selectedRows.size === processedData.length && processedData.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                      </button>
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("student")}>
                      Học viên {sortKey === "student" && <ChevronDown className={cn("inline w-4 h-4", sortDir==="asc"?"rotate-180":"")} />}
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500">Lớp học</th>
                    <th className="px-6 py-4 font-medium text-slate-500 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort("tuitionFee")}>
                      Học phí {sortKey === "tuitionFee" && <ChevronDown className={cn("inline w-4 h-4", sortDir==="asc"?"rotate-180":"")} />}
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500 text-right cursor-pointer hover:bg-slate-100" onClick={() => handleSort("remainingAmount")}>
                      Công nợ {sortKey === "remainingAmount" && <ChevronDown className={cn("inline w-4 h-4", sortDir==="asc"?"rotate-180":"")} />}
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedData.map((row) => (
                    <tr 
                      key={row.id}
                      onClick={() => router.push(`/workspace/training/tuition/${row.id}`)}
                      className={cn("cursor-pointer transition-colors hover:bg-slate-50", selectedRows.has(row.id) && "bg-indigo-50/50")}
                    >
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleRow(row.id)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                          {selectedRows.has(row.id) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{row.student}</div>
                        <div className="text-xs text-slate-500">{row.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{row.className}</div>
                        <div className="text-xs text-slate-500">{row.course}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 text-right">
                        {formatCurrency(row.tuitionFee)}
                      </td>
                      <td className="px-6 py-4 font-medium text-red-600 text-right">
                        {row.remainingAmount > 0 ? formatCurrency(row.remainingAmount) : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border", (statusConfig[row.paymentStatus as TuitionPaymentStatus] || { tone: "bg-slate-50 text-slate-600 border-slate-200" }).tone)}>
                          {(statusConfig[row.paymentStatus as TuitionPaymentStatus] || { label: "Chưa rõ" }).label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, tone, children }: { label: string; value: string; icon: React.ReactNode; tone: string; children?: React.ReactNode }) {
  return (
    <div className="quote-panel p-5">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-100", tone)}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {children}
    </div>
  );
}

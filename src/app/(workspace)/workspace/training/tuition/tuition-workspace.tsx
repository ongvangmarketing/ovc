"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Search,
  CreditCard,
  DollarSign,
  Receipt,
  AlertCircle,
  ArrowUpDown,
  Mail,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { tuitionMockData } from "./tuition.mock";
import type { TuitionPaymentStatus, TuitionSortDir, TuitionSortKey } from "./tuition.types";

const statusConfig: Record<TuitionPaymentStatus, { label: string; cls: string }> = {
  PENDING: { label: "Chưa nộp", cls: "border-[#eaeaea] bg-white text-gray-600" },
  PARTIAL: { label: "Đóng 1 phần", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  PAID:    { label: "Hoàn thành", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
};

const formatMoney = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

const getStatus = (row: TrainingTypes.TrainingTuitionRow): TuitionPaymentStatus => {
  if (row.paymentStatus === "PAID" || row.paymentStatus === "paid") return "PAID";
  if (row.paymentStatus === "PARTIAL" || row.paymentStatus === "partial") return "PARTIAL";
  return "PENDING";
};

export function TuitionWorkspace({ initialTuition }: { initialTuition: TrainingTypes.TrainingTuitionRow[] }) {
  const router = useRouter();
  const [tuition] = useState<TrainingTypes.TrainingTuitionRow[]>(
    initialTuition.length > 0 ? initialTuition : tuitionMockData
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TuitionPaymentStatus>("ALL");
  const [sortKey, setSortKey] = useState<TuitionSortKey>("student");
  const [sortDir, setSortDir] = useState<TuitionSortDir>("asc");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const totalFee = tuition.reduce((a, t) => a + t.tuitionFee, 0);
    const totalPaid = tuition.reduce((a, t) => a + t.paidAmount, 0);
    const totalRemaining = tuition.reduce((a, t) => a + t.remainingAmount, 0);
    const rate = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : 0;
    const pending = tuition.filter(t => getStatus(t) === "PENDING").length;
    return { totalFee, totalPaid, totalRemaining, rate, count: tuition.length, pending };
  }, [tuition]);

  const processedData = useMemo(() => {
    let result = [...tuition];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        t => t.student.toLowerCase().includes(q) ||
             t.course.toLowerCase().includes(q) ||
             t.className.toLowerCase().includes(q) ||
             t.email.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter(t => getStatus(t) === statusFilter);
    }
    result.sort((a, b) => {
      const vA = a[sortKey], vB = b[sortKey];
      if (typeof vA === "string" && typeof vB === "string")
        return sortDir === "asc" ? vA.localeCompare(vB) : vB.localeCompare(vA);
      if (typeof vA === "number" && typeof vB === "number")
        return sortDir === "asc" ? vA - vB : vB - vA;
      return 0;
    });
    return result;
  }, [tuition, query, statusFilter, sortKey, sortDir]);

  const handleSort = (key: TuitionSortKey) => {
    if (sortKey === key) setSortDir(p => p === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () =>
    setSelectedRows(selectedRows.size === processedData.length ? new Set() : new Set(processedData.map(d => d.id)));

  return (
    <div className="mx-auto w-full max-w-[1440px] px-6 py-10 min-h-[calc(100vh-64px)] bg-white">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#eaeaea]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">Đào tạo / Học phí</p>
          <h1 className="text-[40px] md:text-[48px] font-medium tracking-tighter leading-none text-black">Quản lý học phí</h1>
          <p className="mt-3 text-[15px] text-gray-500">Theo dõi doanh thu, công nợ và hóa đơn học phí toàn bộ hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <button
              onClick={() => { toast.success(`Đã gửi email nhắc phí cho ${selectedRows.size} học viên`); setSelectedRows(new Set()); }}
              className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Nhắc phí ({selectedRows.size})
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Doanh thu dự kiến", value: formatMoney(stats.totalFee), icon: <DollarSign className="h-4 w-4" />, sub: `${stats.count} học viên` },
          { label: "Thực thu", value: formatMoney(stats.totalPaid), icon: <CreditCard className="h-4 w-4" />, sub: `Tỷ lệ ${stats.rate}%` },
          { label: "Công nợ", value: formatMoney(stats.totalRemaining), icon: <AlertCircle className="h-4 w-4" />, sub: `${stats.pending} chưa nộp`, warn: stats.totalRemaining > 0 },
          { label: "Tỷ lệ thu hồi", value: `${stats.rate}%`, icon: <TrendingUp className="h-4 w-4" />, bar: true },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#eaeaea] bg-white p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">{s.label}</p>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", s.warn ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500")}>
                {s.icon}
              </span>
            </div>
            <p className={cn("text-[26px] font-medium tracking-tighter leading-none", s.warn ? "text-red-600" : "text-black")}>{s.value}</p>
            {s.sub && <p className="mt-2 text-[12px] text-gray-400">{s.sub}</p>}
            {s.bar && (
              <div className="mt-3 h-1 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-black transition-all" style={{ width: `${stats.rate}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="mt-8 rounded-2xl border border-[#eaeaea] overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 border-b border-[#eaeaea] bg-white">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(["ALL", "PENDING", "PARTIAL", "PAID"] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3.5 py-1.5 text-[12px] font-medium rounded-md transition-colors whitespace-nowrap",
                  statusFilter === s ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
                )}
              >
                {s === "ALL" ? "Tất cả" : statusConfig[s].label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm học viên, lớp..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-[#eaeaea] bg-white pl-9 pr-3 text-[13px] placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {processedData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-[#eaeaea] mb-4">
                <Receipt className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-[14px] font-medium text-black">Không có dữ liệu</p>
              <p className="mt-1 text-[13px] text-gray-400">Điều chỉnh bộ lọc hoặc thêm học phí mới</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-[#eaeaea] bg-gray-50/50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === processedData.length && processedData.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-[#eaeaea] accent-black"
                    />
                  </th>
                  {([
                    { key: "student", label: "Học viên" },
                    { key: null, label: "Lớp học" },
                    { key: "tuitionFee", label: "Học phí", right: true },
                    { key: "remainingAmount", label: "Còn lại", right: true },
                    { key: null, label: "Trạng thái", center: true },
                  ] as { key: TuitionSortKey | null; label: string; right?: boolean; center?: boolean }[]).map(col => (
                    <th
                      key={col.label}
                      onClick={() => col.key && handleSort(col.key)}
                      className={cn(
                        "px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-gray-400",
                        col.key && "cursor-pointer hover:text-black transition-colors select-none",
                        col.right && "text-right",
                        col.center && "text-center"
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {col.key && <ArrowUpDown className={cn("h-3 w-3", sortKey === col.key ? "text-black" : "text-gray-300")} />}
                      </span>
                    </th>
                  ))}
                  <th className="w-10 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {processedData.map(row => {
                  const st = getStatus(row);
                  const cfg = statusConfig[st];
                  return (
                    <tr
                      key={row.id}
                      onClick={() => router.push(`/workspace/training/tuition/${row.id}`)}
                      className="group cursor-pointer hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="h-4 w-4 rounded border-[#eaeaea] accent-black"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-medium text-black">{row.student}</p>
                        <p className="text-[12px] text-gray-400">{row.email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] text-black">{row.className}</p>
                        <p className="text-[12px] text-gray-400">{row.course}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <p className="text-[13px] font-medium text-black">{formatMoney(row.tuitionFee)}</p>
                        <p className="text-[12px] text-gray-400">Đã thu: {formatMoney(row.paidAmount)}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <p className={cn("text-[13px] font-medium", row.remainingAmount > 0 ? "text-red-600" : "text-emerald-600")}>
                          {row.remainingAmount > 0 ? formatMoney(row.remainingAmount) : "✓"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest", cfg.cls)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-600 transition-colors" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer count */}
        <div className="border-t border-[#eaeaea] px-4 py-3 flex items-center justify-between bg-gray-50/50">
          <p className="text-[12px] text-gray-400">
            {processedData.length} / {tuition.length} học phí
            {selectedRows.size > 0 && ` — ${selectedRows.size} đã chọn`}
          </p>
        </div>
      </div>
    </div>
  );
}

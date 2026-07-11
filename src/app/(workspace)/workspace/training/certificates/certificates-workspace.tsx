"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Award,
  CheckCircle2,
  Medal,
  Search,
  Settings,
  Users,
  ArrowUpDown,
  Download
} from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { certMockData } from "./certificates.mock";
import type { EnrollmentStatus } from "@prisma/client";
import type { CertSortDir, CertSortKey } from "./certificates.types";

const statusConfig: Record<EnrollmentStatus, { label: string; tone: string }> = {
  PENDING: { label: "CHỜ XÁC NHẬN", tone: "bg-amber-50 text-amber-700 border-amber-100" },
  ACTIVE: { label: "ĐANG HỌC", tone: "bg-blue-50 text-blue-700 border-blue-100" },
  COMPLETED: { label: "HOÀN THÀNH", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  DROPPED: { label: "BỎ HỌC", tone: "bg-red-50 text-red-700 border-red-100" },
  SUSPENDED: { label: "TẠM DỪNG", tone: "bg-gray-50 text-gray-700 border-[#eaeaea]" },
};

export function CertificatesWorkspace({ initialCerts }: { initialCerts: TrainingTypes.TrainingCertificateRow[] }) {
  const router = useRouter();
  const [certs, setCerts] = useState<TrainingTypes.TrainingCertificateRow[]>(
    initialCerts.length > 0 ? initialCerts : certMockData
  );
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EnrollmentStatus>("ALL");
  const [sortKey, setSortKey] = useState<CertSortKey>("student");
  const [sortDir, setSortDir] = useState<CertSortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Stats
  const stats = useMemo(() => {
    const total = certs.length;
    const completed = certs.filter(c => c.status === "COMPLETED").length;
    const issued = certs.filter(c => c.issuedAt !== null).length;
    const avgProgress = total > 0 ? Math.round(certs.reduce((acc, c) => acc + c.progress, 0) / total) : 0;
    
    return { total, completed, issued, avgProgress };
  }, [certs]);

  // Filter & Sort
  const processedData = useMemo(() => {
    let result = [...certs];
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        c => c.student.toLowerCase().includes(q) || c.course.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter !== "ALL") {
      result = result.filter(c => c.status === statusFilter);
    }
    
    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
    
    return result;
  }, [certs, query, statusFilter, sortKey, sortDir]);

  const handleSort = (key: CertSortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === processedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedData.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const issueCertificate = (id: string) => {
    setCerts(prev => prev.map(c => c.id === id ? { ...c, issuedAt: new Date().toISOString() } : c));
    toast.success("Chứng chỉ đã được cấp thành công!");
  };

  const handleBulkIssue = () => {
    setCerts(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, issuedAt: new Date().toISOString() } : c));
    toast.success(`Đã cấp chứng chỉ cho ${selectedIds.size} học viên`);
    setSelectedIds(new Set());
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#fafafa]">
      
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-[#eaeaea] bg-white px-6 py-6 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[48px] font-medium tracking-tighter leading-none text-black">Chứng chỉ</h1>
            <p className="mt-3 text-[16px] text-gray-500 leading-relaxed">
              Theo dõi tiến độ học tập và quản lý việc cấp phát chứng chỉ.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex h-10 items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-6 text-[14px] font-medium text-black hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Thiết lập mẫu chứng chỉ
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="TỔNG HỌC VIÊN" value={stats.total} icon={<Users className="w-5 h-5 text-gray-400" />} />
          <StatCard label="ĐỦ ĐIỀU KIỆN" value={stats.completed} icon={<CheckCircle2 className="w-5 h-5 text-gray-400" />} />
          <StatCard label="ĐÃ CẤP CHỨNG CHỈ" value={stats.issued} icon={<Award className="w-5 h-5 text-gray-400" />} />
          <StatCard label="TIẾN ĐỘ TRUNG BÌNH" value={`${stats.avgProgress}%`} icon={<Medal className="w-5 h-5 text-gray-400" />} />
        </div>
      </div>

      {/* ── Filters & Content ── */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div className="mx-auto max-w-full rounded-2xl border border-[#eaeaea] bg-white">
          
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#eaeaea] p-4 sm:flex-row sm:items-center">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {(["ALL", "COMPLETED", "ACTIVE", "PENDING", "DROPPED", "SUSPENDED"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap",
                    statusFilter === status 
                      ? "bg-black text-white" 
                      : "border border-[#eaeaea] text-black hover:bg-gray-50"
                  )}
                >
                  {status === "ALL" ? "TẤT CẢ" : statusConfig[status].label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm học viên, khóa học..."
                className="flex h-9 w-full rounded-full border border-[#eaeaea] bg-white pl-9 pr-4 text-[13px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex h-12 items-center justify-between border-b border-[#eaeaea] bg-gray-50 px-5">
              <span className="text-[13px] font-medium text-black">Đã chọn {selectedIds.size} học viên</span>
              <div className="flex gap-2">
                <button 
                  onClick={handleBulkIssue}
                  className="rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors"
                >
                  Cấp chứng chỉ hàng loạt
                </button>
              </div>
            </div>
          )}

          {/* List Area */}
          <div className="min-h-[400px]">
            {processedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Search className="w-8 h-8 text-gray-300 mb-3" />
                <h3 className="text-[14px] font-medium text-black">Không tìm thấy dữ liệu</h3>
                <p className="text-[13px] text-gray-500 mt-1 mb-4">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                <button 
                  onClick={() => { setQuery(""); setStatusFilter("ALL"); }}
                  className="text-[13px] text-black font-medium hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b border-[#eaeaea]">
                    <tr>
                      <th className="w-12 px-5 py-4">
                        <input type="checkbox" checked={selectedIds.size === processedData.length && processedData.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("student")}>
                        <div className="flex items-center gap-1.5">Học viên <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("course")}>
                        <div className="flex items-center gap-1.5">Khóa học <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("progress")}>
                        <div className="flex items-center gap-1.5">Tiến độ <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Trạng thái</th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 text-center">Chứng chỉ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {processedData.map((item) => (
                      <tr 
                        key={item.id}
                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleSelect(item.id)}
                      >
                        <td className="px-5 py-4">
                          <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => {}} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[14px] font-medium text-black">{item.student}</div>
                          <div className="text-[13px] text-gray-400 mt-0.5">{item.email}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[13px] text-black">{item.course}</div>
                          <div className="text-[12px] text-gray-400 mt-0.5">{item.className}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3 w-32">
                            <span className="text-[13px] font-medium text-black w-9">{item.progress}%</span>
                            <div className="flex-1 h-1.5 bg-[#eaeaea] rounded-full overflow-hidden">
                              <div 
                                className={cn("h-full rounded-full transition-all bg-black")} 
                                style={{ width: `${item.progress}%` }} 
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-widest", statusConfig[item.status].tone)}>
                            {statusConfig[item.status].label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {item.issuedAt ? (
                            <div className="flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span className="text-[13px] text-gray-500">
                                {new Date(item.issuedAt).toLocaleDateString("vi-VN")}
                              </span>
                              <button 
                                onClick={(e) => { e.stopPropagation(); toast.success("Đang tải chứng chỉ xuống..."); }}
                                className="ml-2 p-1.5 text-gray-400 hover:text-black hover:bg-[#eaeaea] rounded-full transition-colors"
                                title="Tải xuống"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ) : item.status === "COMPLETED" ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); issueCertificate(item.id); }}
                              className="rounded-full bg-black px-4 py-1.5 text-[12px] font-medium text-white hover:bg-gray-800 transition-colors"
                            >
                              Cấp ngay
                            </button>
                          ) : (
                            <span className="text-[13px] text-gray-400 italic">Chưa đủ ĐK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-[#eaeaea] p-4 text-center">
            <span className="text-[12px] font-medium uppercase tracking-widest text-gray-400">
              Hiển thị {processedData.length} kết quả
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#eaeaea] bg-white p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400">{label}</div>
        {icon && <div className="hidden sm:block">{icon}</div>}
      </div>
      <div className="text-[32px] font-medium tracking-tight text-black">{value}</div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Award,
  CheckCircle2,
  ChevronDown,
  Download,
  FileBadge,
  Medal,
  MoreHorizontal,
  Search,
  Settings,
  Users,
  X
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { TrainingCertificateRow } from "@/lib/training";
import { certMockData } from "./certificates.mock";
import type { CertSortDir, CertSortKey, CertStatus } from "./certificates.types";

const statusConfig: Record<CertStatus, { label: string; tone: string }> = {
  COMPLETED: { label: "Hoàn thành", tone: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  IN_PROGRESS: { label: "Đang học", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  ENROLLED: { label: "Mới đăng ký", tone: "bg-slate-50 text-slate-700 border-slate-200" },
  DROPPED: { label: "Bỏ học", tone: "bg-red-50 text-red-700 border-red-200" },
};

const getProgressTone = (progress: number) => {
  if (progress === 100) return "bg-emerald-500";
  if (progress >= 80) return "bg-indigo-500";
  if (progress >= 50) return "bg-amber-500";
  return "bg-red-500";
};

export function CertificatesWorkspace({ initialCerts }: { initialCerts: TrainingCertificateRow[] }) {
  const [certs, setCerts] = useState<TrainingCertificateRow[]>(
    initialCerts.length > 0 ? initialCerts : certMockData
  );
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CertStatus>("ALL");
  const [sortKey, setSortKey] = useState<CertSortKey>("student");
  const [sortDir, setSortDir] = useState<CertSortDir>("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const selectedCert = useMemo(() => certs.find(c => c.id === selectedId), [certs, selectedId]);

  const issueCertificate = (id: string) => {
    setCerts(prev => prev.map(c => c.id === id ? { ...c, issuedAt: new Date().toISOString() } : c));
    toast.success("Chứng chỉ đã được cấp thành công!");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[15px] font-medium text-slate-900 tracking-tight flex items-center gap-2">
              Quản lý chứng chỉ
            </h1>
          </div>
          <button 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4" />
            Thiết lập mẫu chứng chỉ
          </button>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard label="Tổng học viên" value={stats.total} icon={<Users className="w-5 h-5 text-indigo-500" />} />
          <StatCard label="Đủ điều kiện" value={stats.completed} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} />
          <StatCard label="Đã cấp chứng chỉ" value={stats.issued} icon={<Award className="w-5 h-5 text-amber-500" />} />
          <StatCard label="Tiến độ trung bình" value={`${stats.avgProgress}%`} icon={<Medal className="w-5 h-5 text-blue-500" />} />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden p-4">
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto">
              {(["ALL", "COMPLETED", "IN_PROGRESS", "ENROLLED", "DROPPED"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                    statusFilter === status 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {status === "ALL" ? "Tất cả" : statusConfig[status as CertStatus].label}
                </button>
              ))}
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm học viên..."
                className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all w-full"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto">
            {processedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FileBadge className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-base font-medium text-slate-900">Không tìm thấy hồ sơ</h3>
                <p className="text-sm text-slate-500 mt-1">Điều chỉnh từ khóa tìm kiếm</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("student")}>
                      Học viên {sortKey === "student" && <ChevronDown className={cn("inline w-4 h-4 ml-1", sortDir==="asc"?"rotate-180":"")} />}
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500">Khóa học / Lớp</th>
                    <th className="px-6 py-4 font-medium text-slate-500">Trạng thái</th>
                    <th className="px-6 py-4 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("progress")}>
                      Tiến độ {sortKey === "progress" && <ChevronDown className={cn("inline w-4 h-4 ml-1", sortDir==="asc"?"rotate-180":"")} />}
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort("issuedAt")}>
                      Cấp chứng chỉ {sortKey === "issuedAt" && <ChevronDown className={cn("inline w-4 h-4 ml-1", sortDir==="asc"?"rotate-180":"")} />}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedData.map((row) => (
                    <tr 
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={cn("cursor-pointer transition-colors hover:bg-slate-50", selectedId === row.id && "bg-indigo-50/50")}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{row.student}</div>
                        <div className="text-xs text-slate-500">{row.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{row.course}</div>
                        <div className="text-xs text-slate-500">{row.className}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", statusConfig[row.status as any as CertStatus].tone)}>
                          {statusConfig[row.status as any as CertStatus].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", getProgressTone(row.progress))} style={{ width: `${row.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600 w-8">{row.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.issuedAt ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-0.5" />
                            <span className="text-[10px] font-medium text-emerald-600">
                              {new Date(row.issuedAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Side Drawer */}
        <AnimatePresence>
          {selectedId && selectedCert && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-96 bg-white rounded-2xl border border-slate-200 ml-6 flex flex-col z-20 shadow-sm overflow-hidden shrink-0"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-medium text-[15px] text-slate-900">Hồ sơ chứng chỉ</h2>
                <button onClick={() => setSelectedId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-6">
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[15px] font-medium text-slate-900">{selectedCert.student}</h3>
                    <p className="text-sm text-slate-500 mt-1">{selectedCert.email}</p>
                  </div>
                  <span className={cn("px-2.5 py-1 text-xs font-medium rounded-full border", statusConfig[selectedCert.status as any as CertStatus].tone)}>
                    {statusConfig[selectedCert.status as any as CertStatus].label}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                  <div>
                    <div className="text-xs font-medium text-slate-500 mb-1">Khóa học</div>
                    <div className="font-medium text-slate-900">{selectedCert.course}</div>
                    <div className="text-sm text-slate-600">{selectedCert.className}</div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-end mb-2">
                      <div className="text-xs font-medium text-slate-500">Tiến độ hoàn thành</div>
                      <div className="text-sm font-medium text-slate-900">{selectedCert.progress}%</div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", getProgressTone(selectedCert.progress))} style={{ width: `${selectedCert.progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  {selectedCert.issuedAt ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center text-center">
                      <Award className="w-10 h-10 text-emerald-500 mb-2" />
                      <div className="font-medium text-emerald-700">Chứng chỉ đã được cấp</div>
                      <div className="text-sm text-emerald-600 mt-1">Ngày cấp: {new Date(selectedCert.issuedAt).toLocaleDateString("vi-VN")}</div>
                      
                      <button className="mt-4 w-full py-2 bg-white text-emerald-700 border border-emerald-200 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Tải chứng chỉ (PDF)
                      </button>
                    </div>
                  ) : selectedCert.progress >= 80 ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700 flex gap-2">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <div>Học viên đã đủ điều kiện để được cấp chứng chỉ hoàn thành khóa học.</div>
                      </div>
                      <button 
                        onClick={() => issueCertificate(selectedCert.id)}
                        className="w-full py-2.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <Award className="w-4 h-4" /> Phát hành chứng chỉ
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 text-center">
                      Học viên chưa đủ điều kiện cấp chứng chỉ (Yêu cầu tiến độ &ge; 80%)
                    </div>
                  )}
                </div>

              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-medium text-slate-900">{value}</div>
    </div>
  );
}

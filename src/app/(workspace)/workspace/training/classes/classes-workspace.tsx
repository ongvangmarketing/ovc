"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Columns3,
  MapPin,
  Plus,
  Search,
  Table2,
  Users,
  ArrowRight
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { classMockData } from "./classes.mock";
import type { ClassSortKey, ClassStatus, ClassViewMode, ClassWorkspaceItem } from "./classes.types";

const statusConfig: Record<ClassStatus, { label: string; tone: string; dot: string; icon: React.ElementType }> = {
  opening: { label: "ĐANG MỞ", tone: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500", icon: CheckCircle2 },
  upcoming: { label: "SẮP MỞ", tone: "bg-blue-50 text-blue-700 border-blue-100", dot: "bg-blue-500", icon: CalendarDays },
  full: { label: "ĐẦY LỚP", tone: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-500", icon: Users },
  closed: { label: "ĐÃ ĐÓNG", tone: "bg-gray-50 text-gray-600 border-[#eaeaea]", dot: "bg-gray-400", icon: BookOpen },
};

const statusOrder: ClassStatus[] = ["opening", "upcoming", "full", "closed"];

function dateLabel(value: string | null) {
  if (!value) return "Chưa xác định";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function deriveStatus(item: TrainingTypes.TrainingClassRow): ClassStatus {
  const now = Date.now();
  const start = item.startDate ? new Date(item.startDate).getTime() : null;
  const end = item.endDate ? new Date(item.endDate).getTime() : null;
  if (!item.isActive || (end && end < now)) return "closed";
  if (item.maxStudents > 0 && item.students >= item.maxStudents) return "full";
  if (start && start > now) return "upcoming";
  return "opening";
}

function toClassView(item: TrainingTypes.TrainingClassRow): ClassWorkspaceItem {
  const status = deriveStatus(item);
  const capacityRate = item.maxStudents > 0 ? Math.round((item.students / item.maxStudents) * 100) : 0;
  const missingLocation = !item.location || item.location === "Chưa cập nhật";
  return {
    ...item,
    status,
    capacityRate,
    risk: missingLocation ? "Thiếu địa điểm học" : capacityRate >= 85 ? "Sắp đầy lớp" : status === "upcoming" && item.students < 5 ? "Cần chạy Ads" : null,
    nextAction: missingLocation ? "Cập nhật địa điểm" : capacityRate >= 85 ? "Mở thêm lớp mới" : "Kiểm tra tiến độ tuyển sinh",
    activity: ["Lớp được khởi tạo trên hệ thống", `Phân công giảng viên: ${item.instructor}`],
  };
}

export function ClassesWorkspace({ initialClasses }: { initialClasses: TrainingTypes.TrainingClassRow[] }) {
  const router = useRouter();
  const [classes] = useState<ClassWorkspaceItem[]>(() => {
    const mapped = initialClasses.map(toClassView);
    return mapped.length ? mapped : classMockData;
  });
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClassStatus | "all">("all");
  const [view, setView] = useState<ClassViewMode>("board");
  const [sortKey, setSortKey] = useState<ClassSortKey>("startDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const stats = useMemo(() => ({
    total: classes.length,
    opening: classes.filter(item => item.status === "opening").length,
    capacity: classes.reduce((sum, item) => sum + item.maxStudents, 0),
    risks: classes.filter(item => item.risk).length,
  }), [classes]);

  const filtered = useMemo(() => {
    let result = [...classes];
    
    if (statusFilter !== "all") {
      result = result.filter(c => c.status === statusFilter);
    }
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q) || 
        c.course.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q)
      );
    }
    
    result.sort((a, b) => {
      if (sortKey === "startDate") {
        const valA = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
        const valB = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      if (sortKey === "status") {
        const valA = statusOrder.indexOf(a.status);
        const valB = statusOrder.indexOf(b.status);
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      if (sortKey === "students") {
        const valA = a.students;
        const valB = b.students;
        return sortDir === "asc" ? valA - valB : valB - valA;
      }

      return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });
    
    return result;
  }, [classes, query, statusFilter, sortKey, sortDir]);

  const handleSort = (key: ClassSortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#fafafa]">
      
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-[#eaeaea] bg-white px-6 py-6 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[48px] font-medium tracking-tighter leading-none text-black">Lớp học</h1>
            <p className="mt-3 text-[16px] text-gray-500 leading-relaxed">
              Điều phối sĩ số, lịch học và phân công giảng viên.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/workspace/training/classes/create"
              className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Mở lớp mới
            </Link>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="TỔNG LỚP HỌC" value={stats.total} />
          <StatCard label="LỚP ĐANG MỞ" value={stats.opening} />
          <StatCard label="TỔNG SỨC CHỨA" value={stats.capacity} />
          <StatCard label="RỦI RO" value={stats.risks} />
        </div>
      </div>

      {/* ── Filters & Content ── */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div className="mx-auto max-w-full rounded-2xl border border-[#eaeaea] bg-white">
          
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#eaeaea] p-4 sm:flex-row sm:items-center">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setStatusFilter("all")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap",
                  statusFilter === "all" ? "bg-black text-white" : "border border-[#eaeaea] text-black hover:bg-gray-50"
                )}
              >
                TẤT CẢ
              </button>
              {statusOrder.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap",
                    statusFilter === s ? "bg-black text-white" : "border border-[#eaeaea] text-black hover:bg-gray-50"
                  )}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm lớp, giảng viên..."
                  className="flex h-9 w-full rounded-full border border-[#eaeaea] bg-white pl-9 pr-4 text-[13px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center rounded-full border border-[#eaeaea] bg-gray-50 p-0.5">
                <button 
                  onClick={() => setView("board")}
                  className={cn("p-1.5 rounded-full transition-colors", view === "board" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black")}
                >
                  <Columns3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setView("table")}
                  className={cn("p-1.5 rounded-full transition-colors", view === "table" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black")}
                >
                  <Table2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex h-12 items-center justify-between border-b border-[#eaeaea] bg-gray-50 px-5">
              <span className="text-[13px] font-medium text-black">Đã chọn {selectedIds.size} lớp học</span>
              <div className="flex gap-2">
                <button className="rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                  Cập nhật trạng thái
                </button>
                <button className="rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                  Phân công GV
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="min-h-[400px]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <CalendarDays className="w-8 h-8 text-gray-300 mb-3" />
                <h3 className="text-[14px] font-medium text-black">Không tìm thấy Lớp học</h3>
                <p className="text-[13px] text-gray-500 mt-1 mb-4">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                <button 
                  onClick={() => { setQuery(""); setStatusFilter("all"); }}
                  className="text-[13px] text-black font-medium hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : view === "board" ? (
              // BOARD / CARD VIEW
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {filtered.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => router.push(`/workspace/training/classes/${item.id}`)}
                    className="flex flex-col rounded-xl border border-[#eaeaea] bg-white p-5 cursor-pointer hover:border-black transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest", statusConfig[item.status].tone)}>
                        {(() => {
                          const Icon = statusConfig[item.status].icon;
                          return <Icon className="h-3 w-3" />;
                        })()}
                        {statusConfig[item.status].label}
                      </span>
                    </div>
                    <h3 className="font-medium text-black text-[15px] leading-tight mb-1">{item.name}</h3>
                    <p className="text-[13px] text-gray-500 mb-4">{item.course} · {item.code}</p>

                    <div className="space-y-4 mt-auto">
                      <div>
                        <div className="flex justify-between items-center text-[12px] mb-1.5 text-gray-500">
                          <span>Sĩ số ({item.students}/{item.maxStudents})</span>
                          <span className="font-medium text-black">{item.capacityRate}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#eaeaea] rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", item.capacityRate >= 100 ? "bg-red-500" : item.capacityRate >= 80 ? "bg-amber-500" : "bg-black")} 
                            style={{ width: `${Math.min(item.capacityRate, 100)}%` }} 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-[12px] text-gray-500">
                        <div className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5" />{dateLabel(item.startDate)}</div>
                        <div className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{item.location}</span></div>
                      </div>
                    </div>

                    {item.risk && (
                      <div className="mt-4 border-t border-[#eaeaea] pt-3">
                        <div className="text-amber-600 text-[12px] font-medium flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> {item.risk}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // TABLE VIEW
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b border-[#eaeaea]">
                    <tr>
                      <th className="w-12 px-5 py-4">
                        <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-1.5">Lớp học <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Giảng viên</th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("students")}>
                        <div className="flex items-center gap-1.5">Sĩ số <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("startDate")}>
                        <div className="flex items-center gap-1.5">Khai giảng <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Trạng thái</th>
                      <th className="px-5 py-4 text-right font-medium text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {filtered.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => router.push(`/workspace/training/classes/${item.id}`)}
                        className="group cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[14px] font-medium text-black group-hover:underline decoration-gray-300 underline-offset-4">{item.name}</div>
                          <div className="text-[13px] text-gray-400 mt-0.5">{item.course}</div>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-gray-600">{item.instructor}</td>
                        <td className="px-5 py-4">
                          <div className="text-[13px] font-medium text-black">{item.students}/{item.maxStudents}</div>
                          <div className="w-16 h-1 bg-[#eaeaea] rounded-full overflow-hidden mt-1.5">
                            <div className="h-full bg-black" style={{ width: `${Math.min(item.capacityRate, 100)}%` }} />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-gray-600">{dateLabel(item.startDate)}</td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest", statusConfig[item.status].tone)}>
                            {(() => {
                              const Icon = statusConfig[item.status].icon;
                              return <Icon className="h-3 w-3" />;
                            })()}
                            {statusConfig[item.status].label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ArrowRight className="inline-block h-4 w-4 text-gray-300 opacity-0 transition-all group-hover:opacity-100 group-hover:text-black group-hover:-translate-x-1" />
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
              Hiển thị {filtered.length} kết quả
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-[#eaeaea] bg-white p-5 hover:border-gray-300 transition-colors">
      <div className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">{label}</div>
      <div className="text-[32px] font-medium tracking-tight text-black">{value}</div>
    </div>
  );
}

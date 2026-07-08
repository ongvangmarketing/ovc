"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Columns3,
  MapPin,
  Plus,
  Search,
  Table2,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { TrainingClassRow } from "@/lib/training";
import { classMockData } from "./classes.mock";
import type { ClassSortKey, ClassStatus, ClassViewMode, ClassWorkspaceItem } from "./classes.types";

const statusConfig: Record<ClassStatus, { label: string; tone: string; dot: string }> = {
  opening: { label: "Đang mở", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  upcoming: { label: "Sắp mở", tone: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  full: { label: "Đầy lớp", tone: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  closed: { label: "Đã đóng", tone: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

const statusOrder: ClassStatus[] = ["opening", "upcoming", "full", "closed"];

function dateLabel(value: string | null) {
  if (!value) return "Chưa xác định";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function deriveStatus(item: TrainingClassRow): ClassStatus {
  const now = Date.now();
  const start = item.startDate ? new Date(item.startDate).getTime() : null;
  const end = item.endDate ? new Date(item.endDate).getTime() : null;
  if (!item.isActive || (end && end < now)) return "closed";
  if (item.maxStudents > 0 && item.students >= item.maxStudents) return "full";
  if (start && start > now) return "upcoming";
  return "opening";
}

function toClassView(item: TrainingClassRow): ClassWorkspaceItem {
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

export function ClassesWorkspace({ initialClasses }: { initialClasses: TrainingClassRow[] }) {
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

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <header className="mb-5 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
              <CalendarDays className="h-4 w-4 text-orange-500" />
              Đào tạo / Lớp học
            </div>
            <h1 className="text-[15px] font-medium text-slate-950">Quản lý Lớp học</h1>
            <p className="mt-1 text-[14px] font-light text-slate-500">Điều phối sĩ số, lịch học và phân công giảng viên.</p>
          </div>
          <Link 
            href="/workspace/training/classes/create"
            className="quote-action-button quote-action-primary"
          >
            <Plus className="w-4 h-4" /> Mở lớp mới
          </Link>
        </div>
        
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Tổng lớp học" value={stats.total} icon={<CalendarDays className="w-5 h-5 text-indigo-500" />} tone="bg-indigo-50" />
          <StatCard label="Lớp đang mở" value={stats.opening} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} tone="bg-emerald-50" />
          <StatCard label="Tổng sức chứa" value={stats.capacity} icon={<Users className="w-5 h-5 text-blue-500" />} tone="bg-blue-50" />
          <StatCard label="Lớp có rủi ro" value={stats.risks} icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} tone="bg-amber-50" />
        </div>
      </header>

      <section className="quote-panel overflow-hidden p-0">
          
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto">
              {(["all", ...statusOrder] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                    statusFilter === s ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {s === "all" ? "Tất cả" : statusConfig[s as ClassStatus].label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tìm lớp, giảng viên..."
                  className="quote-input pl-9"
                />
              </div>
              <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                <button onClick={() => setView("board")} className={cn("p-1.5 rounded-md flex items-center gap-1", view==="board" ? "bg-white shadow-sm text-indigo-600":"text-slate-500")}><Columns3 className="w-4 h-4" /><span className="text-xs font-medium pr-1">Card</span></button>
                <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md flex items-center gap-1", view==="table" ? "bg-white shadow-sm text-indigo-600":"text-slate-500")}><Table2 className="w-4 h-4" /><span className="text-xs font-medium pr-1">List</span></button>
              </div>
            </div>
          </div>

          <div className="min-h-[560px] overflow-auto bg-slate-50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center bg-white m-4 rounded-xl border border-dashed border-slate-300">
                <CalendarDays className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-base font-medium text-slate-900">Không tìm thấy Lớp học</h3>
              </div>
            ) : view === "board" ? (
              // BOARD / CARD VIEW
              <div className="grid gap-4 p-4 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => router.push(`/workspace/training/classes/${item.id}`)}
                    className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-orange-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900 text-base">{item.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{item.course} · {item.code}</p>
                      </div>
                      <span className={cn("px-2 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full border shrink-0", statusConfig[item.status].tone)}>
                        {statusConfig[item.status].label}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1 text-slate-600">
                          <span>Sĩ số ({item.students}/{item.maxStudents})</span>
                          <span className="font-medium">{item.capacityRate}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all", item.capacityRate >= 100 ? "bg-rose-500" : item.capacityRate >= 80 ? "bg-amber-500" : "bg-indigo-500")} 
                            style={{ width: `${Math.min(item.capacityRate, 100)}%` }} 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{dateLabel(item.startDate)}</div>
                        <div className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{item.location}</span></div>
                      </div>
                    </div>

                    {item.risk && (
                      <div className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> {item.risk}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // TABLE VIEW
              <div className="bg-white m-4 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer" onClick={() => handleSort("name")}>
                        Lớp học {sortKey==="name"&&<ChevronDown className="inline w-3.5 h-3.5"/>}
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">Giảng viên</th>
                      <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer" onClick={() => handleSort("students")}>
                        Sĩ số {sortKey==="students"&&<ChevronDown className="inline w-3.5 h-3.5"/>}
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer" onClick={() => handleSort("startDate")}>
                        Khai giảng {sortKey==="startDate"&&<ChevronDown className="inline w-3.5 h-3.5"/>}
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map(item => (
                      <tr 
                        key={item.id} 
                        onClick={() => router.push(`/workspace/training/classes/${item.id}`)}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.course}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{item.instructor}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{item.students}/{item.maxStudents}</div>
                          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-indigo-500" style={{ width: `${Math.min(item.capacityRate, 100)}%` }} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{dateLabel(item.startDate)}</td>
                        <td className="px-4 py-3">
                          <span className={cn("px-2 py-1 text-[10px] font-medium uppercase tracking-wider rounded border", statusConfig[item.status].tone)}>
                            {statusConfig[item.status].label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number | string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="quote-panel p-4">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-100", tone)}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-medium text-slate-900">{value}</div>
    </div>
  );
}

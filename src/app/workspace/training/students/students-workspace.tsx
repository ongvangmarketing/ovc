"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Columns3,
  GraduationCap,
  Plus,
  Search,
  Table2,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { TrainingStudentRow } from "@/lib/training";
import { studentMockData } from "./students.mock";
import type { StudentSortKey, StudentStatus, StudentViewMode, StudentWorkspaceItem } from "./students.types";

const statusConfig: Record<StudentStatus, { label: string; tone: string; dot: string }> = {
  new: { label: "Mới", tone: "bg-slate-100 text-slate-700", dot: "bg-slate-500" },
  learning: { label: "Đang học", tone: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-500" },
  risk: { label: "Cần chăm sóc", tone: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  completed: { label: "Hoàn thành", tone: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
};

const statusOrder: StudentStatus[] = ["risk", "learning", "new", "completed"];

function deriveStatus(item: TrainingStudentRow): StudentStatus {
  if (item.enrollments > 0 && item.progress < 25) return "risk";
  if (item.active > 0) return "learning";
  if (item.completed > 0) return "completed";
  return "new";
}

function toStudentView(item: TrainingStudentRow): StudentWorkspaceItem {
  const status = deriveStatus(item);
  return {
    ...item,
    status,
    owner: status === "risk" ? "CSKH đào tạo" : "Training OVC",
    nextAction: status === "risk" ? "Gọi nhắc lịch học và bài tập" : status === "new" ? "Gán khóa học phù hợp" : status === "completed" ? "Chuẩn bị chứng chỉ" : "Theo dõi tiến độ tuần này",
    note: status === "risk" ? "Cần can thiệp trước khi học viên bỏ nhịp." : "Theo dõi tiến độ học tập thường xuyên.",
    activity: [`Tiến độ hiện tại ${item.progress}%`, `${item.enrollments} lượt ghi danh`, item.active > 0 ? "Đang học lớp hiện tại" : "Chưa có lớp đang học"],
  };
}

export function StudentsWorkspace({ initialStudents }: { initialStudents: TrainingStudentRow[] }) {
  const router = useRouter();
  const [students] = useState<StudentWorkspaceItem[]>(() => {
    const mapped = initialStudents.map(toStudentView);
    return mapped.length ? mapped : studentMockData;
  });
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">("all");
  const [view, setView] = useState<StudentViewMode>("table");
  const [sortKey, setSortKey] = useState<StudentSortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const stats = useMemo(() => ({
    total: students.length,
    learning: students.filter((item) => item.status === "learning").length,
    risk: students.filter((item) => item.status === "risk").length,
    completed: students.reduce((sum, item) => sum + item.completed, 0),
  }), [students]);

  const filtered = useMemo(() => {
    let result = [...students];
    
    if (statusFilter !== "all") {
      result = result.filter(s => s.status === statusFilter);
    }
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.email.toLowerCase().includes(q) || 
        s.phone.toLowerCase().includes(q)
      );
    }
    
    result.sort((a, b) => {
      let valA: string | number = a[sortKey];
      let valB: string | number = b[sortKey];
      
      if (sortKey === "status") {
        valA = statusOrder.indexOf(a.status);
        valB = statusOrder.indexOf(b.status);
      }
      
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
    
    return result;
  }, [students, query, statusFilter, sortKey, sortDir]);

  const handleSort = (key: StudentSortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
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
              <Users className="h-4 w-4 text-orange-500" />
              Đào tạo / Học viên
            </div>
            <h1 className="text-2xl font-semibold text-slate-950">Học viên</h1>
            <p className="mt-1 text-[14px] font-light text-slate-500">Quản lý hồ sơ, tiến độ học tập và chăm sóc học viên.</p>
          </div>
          <Link
            href="/workspace/training/students/create"
            className="quote-action-button quote-action-primary"
          >
            <Plus className="w-4 h-4" /> Thêm học viên
          </Link>
        </div>
        
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Tổng học viên" value={stats.total} icon={<Users className="w-5 h-5 text-indigo-500" />} tone="bg-indigo-50" />
          <StatCard label="Đang học" value={stats.learning} icon={<GraduationCap className="w-5 h-5 text-emerald-500" />} tone="bg-emerald-50" />
          <StatCard label="Cần chăm sóc" value={stats.risk} icon={<AlertTriangle className="w-5 h-5 text-rose-500" />} tone="bg-rose-50" />
          <StatCard label="Hoàn thành" value={stats.completed} icon={<CheckCircle2 className="w-5 h-5 text-blue-500" />} tone="bg-blue-50" />
        </div>
      </header>

      <section className="quote-panel overflow-hidden p-0">
          
          {/* Toolbar */}
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
                  {s === "all" ? "Tất cả" : statusConfig[s as StudentStatus].label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tìm học viên, SĐT..."
                  className="quote-input pl-9"
                />
              </div>
              
              <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md", view==="table" ? "bg-white shadow-sm text-indigo-600":"text-slate-500")}><Table2 className="w-4 h-4" /></button>
                <button onClick={() => setView("board")} className={cn("p-1.5 rounded-md", view==="board" ? "bg-white shadow-sm text-indigo-600":"text-slate-500")}><Columns3 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="min-h-[560px] overflow-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <GraduationCap className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-base font-medium text-slate-900">Không tìm thấy hồ sơ</h3>
              </div>
            ) : view === "table" ? (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("name")}>
                      Học viên {sortKey === "name" && <ChevronDown className={cn("inline w-4 h-4", sortDir==="asc"?"rotate-180":"")} />}
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500">Khóa & Lớp</th>
                    <th className="px-6 py-4 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("status")}>
                      Trạng thái {sortKey === "status" && <ChevronDown className={cn("inline w-4 h-4", sortDir==="asc"?"rotate-180":"")} />}
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("progress")}>
                      Tiến độ {sortKey === "progress" && <ChevronDown className={cn("inline w-4 h-4", sortDir==="asc"?"rotate-180":"")} />}
                    </th>
                    <th className="px-6 py-4 font-medium text-slate-500">Next Action</th>
                    <th className="px-6 py-4 text-right font-medium text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(row => (
                    <tr 
                      key={row.id}
                      onClick={() => router.push(`/workspace/training/students/${row.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-50 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0">
                            {row.name.charAt(0)}
                          </div>
                          <div>
                            <Link
                              href={`/workspace/training/students/${row.id}`}
                              onClick={(event) => event.stopPropagation()}
                              className="font-semibold text-slate-900 transition hover:text-orange-600"
                            >
                              {row.name}
                            </Link>
                            <div className="text-xs text-slate-500">{row.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{row.enrollments} khóa học</div>
                        <div className="text-xs text-slate-500">{row.active} lớp đang học</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full border", statusConfig[row.status].tone)}>
                          {statusConfig[row.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", row.status === "risk" ? "bg-rose-500" : "bg-indigo-500")} style={{ width: `${row.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{row.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600 font-medium group-hover:text-indigo-600 transition-colors">
                          {row.nextAction}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/workspace/training/students/${row.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="quote-action-button quote-action-secondary inline-flex"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="grid gap-4 p-6 lg:grid-cols-4">
                {statusOrder.map((status) => { 
                  const list = filtered.filter(i => i.status === status); 
                  return (
                    <section key={status} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <h2 className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                          <span className={cn("h-2 w-2 rounded-full", statusConfig[status].dot)} />
                          {statusConfig[status].label}
                        </h2>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600">{list.length}</span>
                      </div>
                      <div className="space-y-3">
                        {list.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => router.push(`/workspace/training/students/${item.id}`)}
                            className="cursor-pointer rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-orange-300 hover:shadow-md"
                          >
                            <h3 className="font-bold text-slate-900 text-sm truncate">{item.name}</h3>
                            <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                              <span>Tiến độ</span>
                              <span className="font-semibold text-slate-900">{item.progress}%</span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div className={cn("h-full rounded-full", status === "risk" ? "bg-rose-500" : "bg-indigo-500")} style={{ width: `${item.progress}%` }} />
                            </div>
                            <div className="mt-3 text-xs font-medium text-slate-600 bg-slate-50 p-1.5 rounded-md truncate">
                              {item.nextAction}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ); 
                })}
              </div>
            )}
          </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number | string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="quote-panel p-5">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-slate-100", tone)}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

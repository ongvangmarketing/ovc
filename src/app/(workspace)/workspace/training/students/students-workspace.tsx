"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  Columns3,
  GraduationCap,
  Plus,
  Search,
  Table2,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { studentMockData } from "./students.mock";
import type { StudentSortKey, StudentStatus, StudentViewMode, StudentWorkspaceItem } from "./students.types";

const statusConfig: Record<StudentStatus, { label: string; tone: string; icon: React.ElementType }> = {
  new: { label: "MỚI", tone: "bg-white border-[#eaeaea] text-black", icon: Users },
  learning: { label: "ĐANG HỌC", tone: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: GraduationCap },
  risk: { label: "CẦN CHĂM SÓC", tone: "bg-gray-50 text-gray-600 border-[#eaeaea]", icon: AlertCircle },
  completed: { label: "HOÀN THÀNH", tone: "bg-white border-[#eaeaea] text-black", icon: CheckCircle2 },
};

const statusOrder: StudentStatus[] = ["risk", "learning", "new", "completed"];

function deriveStatus(item: TrainingTypes.TrainingStudentRow): StudentStatus {
  if (item.enrollments > 0 && item.progress < 25) return "risk";
  if (item.active > 0) return "learning";
  if (item.completed > 0) return "completed";
  return "new";
}

function toStudentView(item: TrainingTypes.TrainingStudentRow): StudentWorkspaceItem {
  const status = deriveStatus(item);
  return {
    ...item,
    status,
    owner: status === "risk" ? "CSKH đào tạo" : "Training OVC",
    nextAction: status === "risk" ? "Gọi nhắc lịch học" : status === "new" ? "Gán khóa học" : status === "completed" ? "Chuẩn bị chứng chỉ" : "Theo dõi tiến độ",
    note: status === "risk" ? "Cần can thiệp trước khi bỏ nhịp." : "Tiến độ học tập thường xuyên.",
    activity: [`Tiến độ ${item.progress}%`, `${item.enrollments} lượt ghi danh`, item.active > 0 ? "Đang học" : "Chưa có lớp"],
  };
}

export function StudentsWorkspace({ initialStudents }: { initialStudents: TrainingTypes.TrainingStudentRow[] }) {
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(i => i.id)));
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
            <h1 className="text-[48px] font-medium tracking-tighter leading-none text-black">Học viên</h1>
            <p className="mt-3 text-[16px] text-gray-500 leading-relaxed">
              Quản lý hồ sơ, tiến độ học tập và chăm sóc học viên của bạn.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/workspace/training/students/create"
              className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" /> Thêm học viên
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="TỔNG HỌC VIÊN" value={stats.total} />
          <StatCard label="ĐANG HỌC" value={stats.learning} />
          <StatCard label="CẦN CHĂM SÓC" value={stats.risk} />
          <StatCard label="HOÀN THÀNH" value={stats.completed} />
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
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tìm học viên..."
                  className="flex h-9 w-full rounded-full border border-[#eaeaea] bg-white pl-9 pr-4 text-[13px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                />
              </div>
              
              <div className="flex items-center rounded-full border border-[#eaeaea] bg-gray-50 p-0.5">
                <button onClick={() => setView("table")} className={cn("p-1.5 rounded-full transition-colors", view==="table" ? "bg-white text-black shadow-sm":"text-gray-400 hover:text-black")}><Table2 className="w-4 h-4" /></button>
                <button onClick={() => setView("board")} className={cn("p-1.5 rounded-full transition-colors", view==="board" ? "bg-white text-black shadow-sm":"text-gray-400 hover:text-black")}><Columns3 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex h-12 items-center justify-between border-b border-[#eaeaea] bg-gray-50 px-5">
              <span className="text-[13px] font-medium text-black">Đã chọn {selectedIds.size} học viên</span>
              <div className="flex gap-2">
                <button className="rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                  Gửi Email
                </button>
                <button className="rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                  Gán khóa học
                </button>
              </div>
            </div>
          )}

          {/* Main Area */}
          <div className="min-h-[400px]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <GraduationCap className="w-8 h-8 text-gray-300 mb-3" />
                <h3 className="text-[14px] font-medium text-black">Không tìm thấy học viên</h3>
              </div>
            ) : view === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b border-[#eaeaea]">
                    <tr>
                      <th className="w-12 px-5 py-4">
                        <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-1.5">Học viên <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Khóa & Lớp</th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("status")}>
                        <div className="flex items-center gap-1.5">Trạng thái <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("progress")}>
                        <div className="flex items-center gap-1.5">Tiến độ <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Ghi chú / Hành động</th>
                      <th className="px-5 py-4 text-right font-medium text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {filtered.map(row => (
                      <tr 
                        key={row.id}
                        onClick={() => router.push(`/workspace/training/students/${row.id}`)}
                        className="group cursor-pointer transition-colors hover:bg-gray-50"
                      >
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-[#eaeaea] bg-gray-50 flex items-center justify-center text-[14px] font-medium text-black shrink-0">
                              {row.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-[14px] font-medium text-black group-hover:underline decoration-gray-300 underline-offset-4">
                                {row.name}
                              </div>
                              <div className="text-[13px] text-gray-400">{row.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[13px] font-medium text-black">{row.enrollments} khóa học</div>
                          <div className="text-[13px] text-gray-400">{row.active} lớp đang học</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest", statusConfig[row.status].tone)}>
                            {(() => {
                              const Icon = statusConfig[row.status].icon;
                              return <Icon className="h-3 w-3" />;
                            })()}
                            {statusConfig[row.status].label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full transition-all", row.status === "risk" ? "bg-gray-400" : row.progress === 100 ? "bg-emerald-500" : "bg-black")} style={{ width: `${row.progress}%` }} />
                            </div>
                            <span className="text-[13px] font-medium text-black w-8">{row.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[13px] text-gray-500 max-w-[200px] truncate">
                            {row.nextAction}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ArrowRight className="inline-block h-4 w-4 text-gray-300 opacity-0 transition-all group-hover:opacity-100 group-hover:text-black group-hover:-translate-x-1" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-6 p-6 lg:grid-cols-4">
                {statusOrder.map((status) => { 
                  const list = filtered.filter(i => i.status === status); 
                  const Icon = statusConfig[status].icon;
                  return (
                    <section key={status} className="flex flex-col gap-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#eaeaea]">
                        <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-gray-500">
                          <Icon className="h-3.5 w-3.5" />
                          {statusConfig[status].label}
                        </h2>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-black">{list.length}</span>
                      </div>
                      <div className="space-y-3">
                        {list.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => router.push(`/workspace/training/students/${item.id}`)}
                            className="cursor-pointer rounded-xl border border-[#eaeaea] bg-white p-4 transition-colors hover:border-black"
                          >
                            <h3 className="font-medium text-black text-[14px] truncate mb-1">{item.name}</h3>
                            <div className="text-[12px] text-gray-500 mb-4">{item.email}</div>
                            
                            <div className="flex justify-between items-center mb-1.5 text-[11px] font-medium uppercase tracking-widest text-gray-400">
                              <span>Tiến độ</span>
                              <span className="text-black">{item.progress}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-gray-100 overflow-hidden mb-4">
                              <div className={cn("h-full rounded-full", item.status === "risk" ? "bg-gray-400" : item.progress === 100 ? "bg-emerald-500" : "bg-black")} style={{ width: `${item.progress}%` }} />
                            </div>
                            <div className="text-[12px] text-gray-600 truncate">
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

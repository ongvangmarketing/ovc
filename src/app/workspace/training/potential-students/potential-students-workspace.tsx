"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarClock, 
  CheckCircle2, 
  ChevronDown, 
  Clock3,
  Columns3, 
  Plus, 
  Search, 
  Sparkles, 
  Table2, 
  Users,
  Star
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import type { TrainingPotentialStudentRow } from "@/lib/training";
import { potentialStudentMockData } from "./potential-students.mock";
import type { PotentialLeadSortKey, PotentialLeadStatus, PotentialLeadView, PotentialLeadViewMode } from "./potential-students.types";

const statusConfig: Record<PotentialLeadStatus, { label: string; tone: string; dot: string }> = {
  new: { label: "Lead mới", tone: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  contacted: { label: "Đã liên hệ", tone: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  scheduled: { label: "Có lịch hẹn", tone: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  converted: { label: "Chốt Deal", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  lost: { label: "Thất bại", tone: "bg-slate-50 text-slate-600 border-slate-200", dot: "bg-slate-400" },
};

const statusOrder: PotentialLeadStatus[] = ["new", "contacted", "scheduled", "converted", "lost"];

function normalizeStatus(status: string): PotentialLeadStatus {
  const value = status.toLowerCase();
  if (value === "converted") return "converted";
  if (value === "scheduled" || value === "appointment") return "scheduled";
  if (value === "contacted" || value === "follow_up") return "contacted";
  if (value === "lost" || value === "cancelled") return "lost";
  return "new";
}

function toLeadView(item: TrainingPotentialStudentRow, index: number): PotentialLeadView {
  const status = normalizeStatus(item.status);
  return {
    ...item,
    status,
    score: Math.max(35, 96 - index * 3),
    owner: "Marketing OVC",
    lastActivity: item.nextFollowUpAt ? "Đã có lịch hẹn tư vấn" : "Cần liên hệ gấp",
  };
}

function formatDate(value: string | null) {
  if (!value) return "Chưa có lịch";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function PotentialStudentsWorkspace({ initialStudents }: { initialStudents: TrainingPotentialStudentRow[] }) {
  const router = useRouter();
  const [leads] = useState<PotentialLeadView[]>(() => {
    const mapped = initialStudents.map(toLeadView);
    return mapped.length ? mapped : potentialStudentMockData;
  });
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PotentialLeadStatus | "all">("all");
  const [view, setView] = useState<PotentialLeadViewMode>("board");
  const [sortKey, setSortKey] = useState<PotentialLeadSortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredLeads = useMemo(() => {
    let result = [...leads];
    
    if (statusFilter !== "all") {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(lead => 
        lead.name.toLowerCase().includes(q) || 
        lead.email.toLowerCase().includes(q) || 
        lead.phone.toLowerCase().includes(q) || 
        lead.source.toLowerCase().includes(q)
      );
    }
    
    result.sort((a, b) => {
      let valA: string | number = a[sortKey] ?? "";
      let valB: string | number = b[sortKey] ?? "";
      
      if (sortKey === "nextFollowUpAt") {
        valA = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : 0;
        valB = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : 0;
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
  }, [leads, query, statusFilter, sortKey, sortDir]);

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    scheduled: leads.filter(l => l.status === "scheduled").length,
    converted: leads.filter(l => l.status === "converted").length,
  }), [leads]);

  const handleSort = (key: PotentialLeadSortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "score" || key === "nextFollowUpAt" ? "desc" : "asc");
    }
  };

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <header className="mb-5 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Đào tạo / Học viên tiềm năng
            </div>
            <h1 className="text-[15px] font-medium text-slate-950">Học viên tiềm năng</h1>
            <p className="mt-1 text-[14px] font-light text-slate-500">Chăm sóc lead đào tạo trước khi chuyển thành học viên.</p>
          </div>
          <Link
            href="/workspace/training/potential-students/create"
            className="quote-action-button quote-action-primary"
          >
            <Plus className="w-4 h-4" /> Tạo lead mới
          </Link>
        </div>
        
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Tổng lead" value={stats.total} icon={<Users className="w-5 h-5 text-indigo-500" />} tone="bg-indigo-50" />
          <StatCard label="Lead mới" value={stats.new} icon={<Clock3 className="w-5 h-5 text-blue-500" />} tone="bg-blue-50" />
          <StatCard label="Có lịch hẹn" value={stats.scheduled} icon={<CalendarClock className="w-5 h-5 text-amber-500" />} tone="bg-amber-50" />
          <StatCard label="Đã chốt Deal" value={stats.converted} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} tone="bg-emerald-50" />
        </div>
      </header>

      <section className="quote-panel overflow-hidden p-0">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tìm lead, SĐT, Email..."
                  className="quote-input pl-9"
                />
              </div>
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
                    {s === "all" ? "Tất cả" : statusConfig[s as PotentialLeadStatus].label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button onClick={() => setView("board")} className={cn("p-1.5 rounded-md flex items-center gap-1", view==="board" ? "bg-white shadow-sm text-indigo-600":"text-slate-500")}><Columns3 className="w-4 h-4" /><span className="text-xs font-medium pr-1">Board</span></button>
              <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md flex items-center gap-1", view==="table" ? "bg-white shadow-sm text-indigo-600":"text-slate-500")}><Table2 className="w-4 h-4" /><span className="text-xs font-medium pr-1">Table</span></button>
            </div>
          </div>

          <div className="min-h-[560px] overflow-auto bg-slate-50">
            {filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center bg-white m-4 rounded-xl border border-dashed border-slate-300">
                <Sparkles className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-base font-medium text-slate-900">Không tìm thấy Lead</h3>
              </div>
            ) : view === "board" ? (
              // KANBAN BOARD
              <div className="flex h-full gap-4 p-4 overflow-x-auto items-start">
                {statusOrder.map((status) => {
                  const list = filteredLeads.filter(l => l.status === status);
                  return (
                    <div key={status} className="flex max-h-full w-72 shrink-0 flex-col rounded-2xl border border-slate-200 bg-slate-100/50 shadow-sm">
                      <div className="p-3 border-b border-slate-200 bg-white/50 rounded-t-2xl flex justify-between items-center sticky top-0">
                        <div className="font-medium text-slate-800 text-sm flex items-center gap-2">
                          <span className={cn("w-2.5 h-2.5 rounded-full", statusConfig[status].dot)}></span>
                          {statusConfig[status].label}
                        </div>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs font-medium rounded-full">{list.length}</span>
                      </div>
                      <div className="p-3 overflow-y-auto space-y-3 flex-1">
                        {list.map(lead => (
                          <div 
                            key={lead.id}
                            onClick={() => router.push(`/workspace/training/potential-students/${lead.id}`)}
                            className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-orange-300 hover:shadow-md"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-slate-900 text-sm truncate">{lead.name}</h4>
                              {lead.score >= 80 && <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                            </div>
                            <div className="text-xs text-slate-500 truncate mb-3">{lead.interestedIn}</div>
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-1 text-indigo-600 font-medium bg-indigo-50 px-2 py-1 rounded">
                                <CalendarClock className="w-3.5 h-3.5" />
                                {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleDateString("vi-VN") : "No date"}
                              </div>
                              <span className="font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                                {lead.score}đ
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // TABLE VIEW
              <div className="m-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer" onClick={() => handleSort("name")}>
                        Lead {sortKey==="name"&&<ChevronDown className="inline w-3.5 h-3.5"/>}
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500">Liên hệ</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Khóa quan tâm</th>
                      <th className="px-4 py-3 font-medium text-slate-500">Trạng thái</th>
                      <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer" onClick={() => handleSort("score")}>
                        Score {sortKey==="score"&&<ChevronDown className="inline w-3.5 h-3.5"/>}
                      </th>
                      <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer" onClick={() => handleSort("nextFollowUpAt")}>
                        Follow-up {sortKey==="nextFollowUpAt"&&<ChevronDown className="inline w-3.5 h-3.5"/>}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeads.map(lead => (
                      <tr 
                        key={lead.id} 
                        onClick={() => router.push(`/workspace/training/potential-students/${lead.id}`)}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-slate-600">{lead.email}</div>
                          <div className="text-xs text-slate-500">{lead.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{lead.interestedIn}</td>
                        <td className="px-4 py-3">
                          <span className={cn("px-2 py-1 text-[10px] font-medium uppercase tracking-wider rounded border", statusConfig[lead.status].tone)}>
                            {statusConfig[lead.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("font-medium", lead.score >= 80 ? "text-amber-500" : "text-slate-700")}>{lead.score}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(lead.nextFollowUpAt)}</td>
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

"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, GraduationCap, MoreHorizontal, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";
import type { OverviewStudent, StudentSortKey, StudentStatus } from "../training-overview.types";

const statusConfig: Record<StudentStatus, { label: string; tone: string; dot: string }> = {
  new: { label: "Mới", tone: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  learning: { label: "Đang học", tone: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  risk: { label: "Cần chăm sóc", tone: "bg-rose-50 text-rose-700", dot: "bg-rose-500" },
  completed: { label: "Hoàn thành", tone: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
};

const sortOptions: { value: StudentSortKey; label: string }[] = [
  { value: "progress", label: "Tiến độ thấp nhất" },
  { value: "active", label: "Đang học nhiều nhất" },
  { value: "status", label: "Theo trạng thái" },
  { value: "name", label: "Theo tên" },
];

interface OverviewStudentListProps {
  students: OverviewStudent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<OverviewStudent>) => void;
}

export function OverviewStudentList({ students, selectedId, onSelect, onUpdate }: OverviewStudentListProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<StudentSortKey>("progress");
  const [actionOpenId, setActionOpenId] = useState<string | null>(null);

  const statusOrder: StudentStatus[] = ["risk", "learning", "new", "completed"];

  const filtered = useMemo(() => {
    return students
      .filter((s) => {
        if (!query) return true;
        return `${s.name} ${s.email} ${s.phone}`.toLowerCase().includes(query.toLowerCase());
      })
      .sort((a, b) => {
        if (sortKey === "progress") return a.progress - b.progress;
        if (sortKey === "active") return b.active - a.active;
        if (sortKey === "status") return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        return a.name.localeCompare(b.name);
      });
  }, [students, query, sortKey]);

  function changeStatus(id: string, status: StudentStatus) {
    onUpdate(id, { status, nextAction: status === "risk" ? "Gọi chăm sóc ngay" : "Theo dõi tiến độ tuần này" });
    setActionOpenId(null);
    toast.success("Đã cập nhật trạng thái học viên");
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-slate-950">Học viên</h2>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {filtered.length}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="student-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm học viên, email..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          <label className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600">
            <ChevronDown className="h-3.5 w-3.5" />
            <select
              id="student-sort-select"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as StudentSortKey)}
              className="bg-transparent text-sm outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <Link
            href="/workspace/training/students/create"
            id="student-new-btn"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-medium text-white transition hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm HV
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {!filtered.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
            <GraduationCap className="h-7 w-7" />
          </div>
          <p className="font-medium text-slate-700">Không tìm thấy học viên</p>
          <p className="text-sm text-slate-500">Thử thay đổi từ khóa tìm kiếm.</p>
          <button
            onClick={() => setQuery("")}
            className="mt-1 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
          >
            Xóa tìm kiếm
          </button>
        </motion.div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Học viên</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Tiến độ</th>
                <th className="px-4 py-3">Hành động tiếp theo</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((student) => {
                  const cfg = statusConfig[student.status];
                  const isSel = selectedId === student.id;
                  return (
                    <motion.tr
                      key={student.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => onSelect(student.id)}
                      className={cn(
                        "cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-orange-50/50",
                        isSel && "bg-orange-50"
                      )}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600">
                            {student.name.split(" ").slice(-1)[0]?.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong className="block font-medium text-slate-950">{student.name}</strong>
                            <span className="text-xs text-slate-500">{student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", cfg.tone)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                student.status === "risk" ? "bg-rose-500" : student.status === "completed" ? "bg-violet-500" : "bg-orange-500"
                              )}
                              style={{ width: `${Math.min(student.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-700">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="max-w-[220px] px-4 py-3.5">
                        <p className="truncate text-xs text-slate-600">{student.nextAction}</p>
                      </td>
                      <td className="relative px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end">
                          <div className="relative">
                            <button
                              id={`action-menu-student-${student.id}`}
                              onClick={() => setActionOpenId(actionOpenId === student.id ? null : student.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            <AnimatePresence>
                              {actionOpenId === student.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl"
                                >
                                  <button
                                    onClick={() => changeStatus(student.id, "learning")}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-50"
                                  >
                                    Đánh dấu đang học
                                  </button>
                                  <button
                                    onClick={() => changeStatus(student.id, "risk")}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                                  >
                                    Gắn cần chăm sóc
                                  </button>
                                  <button
                                    onClick={() => changeStatus(student.id, "completed")}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-violet-700 transition hover:bg-violet-50"
                                  >
                                    Đánh dấu hoàn thành
                                  </button>
                                  <div className="my-1 border-t border-slate-100" />
                                  <Link
                                    href={`/workspace/training/students/${student.id}`}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                                    onClick={() => setActionOpenId(null)}
                                  >
                                    Xem hồ sơ chi tiết
                                  </Link>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-400">{filtered.length} / {students.length} học viên</span>
          <Link href="/workspace/training/students" className="text-xs font-medium text-orange-600 transition hover:underline">
            Xem tất cả →
          </Link>
        </div>
      )}
    </section>
  );
}

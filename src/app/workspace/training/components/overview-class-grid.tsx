"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, MapPin, MoreHorizontal, Plus, Search, Users, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";
import type { ClassStatus, OverviewClass } from "../training-overview.types";

const statusConfig: Record<ClassStatus, { label: string; tone: string; dot: string }> = {
  upcoming: { label: "Sắp mở", tone: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  opening: { label: "Đang mở", tone: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  full: { label: "Đầy lớp", tone: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  closed: { label: "Đã đóng", tone: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};

const statusFilters: { value: ClassStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "opening", label: "Đang mở" },
  { value: "upcoming", label: "Sắp mở" },
  { value: "full", label: "Đầy lớp" },
  { value: "closed", label: "Đã đóng" },
];

function formatDate(value: string | null) {
  if (!value) return "Chưa đặt";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

interface OverviewClassGridProps {
  classes: OverviewClass[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<OverviewClass>) => void;
}

export function OverviewClassGrid({ classes, selectedId, onSelect, onUpdate }: OverviewClassGridProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClassStatus | "all">("all");
  const [actionOpenId, setActionOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return classes
      .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
      .filter((c) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return `${c.name} ${c.course} ${c.instructor} ${c.code}`.toLowerCase().includes(q);
      });
  }, [classes, query, statusFilter]);

  function toggleActive(id: string, current: boolean) {
    onUpdate(id, { isActive: !current, status: !current ? "opening" : "closed" });
    setActionOpenId(null);
    toast.success(!current ? "Đã mở lại lớp học" : "Đã đóng lớp học");
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-slate-950">Lớp học</h2>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            {filtered.length}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <label className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="class-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm lớp học, giảng viên..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                id={`class-filter-${f.value}`}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-3 py-2 text-xs font-medium transition",
                  statusFilter === f.value
                    ? "bg-white text-orange-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Link
            href="/workspace/training/classes/create"
            id="class-new-btn"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-medium text-white transition hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Mở lớp
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
            <Users className="h-7 w-7" />
          </div>
          <p className="font-medium text-slate-700">Không có lớp học phù hợp</p>
          <p className="text-sm text-slate-500">Thử đổi bộ lọc hoặc mở lớp học mới.</p>
          <button
            onClick={() => { setQuery(""); setStatusFilter("all"); }}
            className="mt-1 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
          >
            Xóa bộ lọc
          </button>
        </motion.div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {filtered.map((cls) => {
              const cfg = statusConfig[cls.status];
              const isSel = selectedId === cls.id;
              return (
                <motion.article
                  key={cls.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  onClick={() => onSelect(cls.id)}
                  className={cn(
                    "group cursor-pointer rounded-xl border bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md",
                    isSel ? "border-orange-300 ring-4 ring-orange-50" : "border-slate-100"
                  )}
                >
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium text-slate-950">{cls.name}</h3>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{cls.course}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cfg.tone)}>
                        {cfg.label}
                      </span>
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`action-menu-class-${cls.id}`}
                          onClick={() => setActionOpenId(actionOpenId === cls.id ? null : cls.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                        <AnimatePresence>
                          {actionOpenId === cls.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-0 top-7 z-20 w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl"
                            >
                              <button
                                onClick={() => toggleActive(cls.id, cls.isActive)}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                                  cls.isActive ? "text-red-600 hover:bg-red-50" : "text-emerald-700 hover:bg-emerald-50"
                                )}
                              >
                                {cls.isActive ? "Đóng lớp học" : "Mở lại lớp học"}
                              </button>
                              <Link
                                href={`/workspace/training/classes/${cls.id}`}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                                onClick={() => setActionOpenId(null)}
                              >
                                Xem chi tiết
                              </Link>
                              <Link
                                href={`/workspace/training/classes/${cls.id}/edit`}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                                onClick={() => setActionOpenId(null)}
                              >
                                Chỉnh sửa
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="mb-3">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Sĩ số
                      </span>
                      <strong className="text-slate-800">{cls.students}/{cls.maxStudents}</strong>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          cls.capacityRate >= 100 ? "bg-amber-500" : cls.capacityRate >= 80 ? "bg-orange-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${Math.min(cls.capacityRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      <span>{formatDate(cls.startDate)} — {formatDate(cls.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{cls.location}</span>
                    </div>
                  </div>

                  {/* Next action */}
                  <p className="mt-3 truncate rounded-lg bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-600">
                    {cls.nextAction}
                  </p>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-400">{filtered.length} / {classes.length} lớp học</span>
          <Link href="/workspace/training/classes" className="text-xs font-medium text-orange-600 transition hover:underline">
            Xem tất cả →
          </Link>
        </div>
      )}
    </section>
  );
}

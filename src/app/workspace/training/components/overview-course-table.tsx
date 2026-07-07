"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  ChevronDown,
  Columns3,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Table2,
  X,
} from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";
import type { CourseSortDir, CourseSortKey, CourseStatus, CourseViewMode, OverviewCourse } from "../training-overview.types";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

const statusConfig: Record<CourseStatus, { label: string; tone: string }> = {
  DRAFT: { label: "Bản nháp", tone: "bg-slate-100 text-slate-700" },
  PUBLISHED: { label: "Đã xuất bản", tone: "bg-orange-100 text-orange-700" },
  ARCHIVED: { label: "Lưu trữ", tone: "bg-zinc-100 text-zinc-600" },
};

const levelLabel: Record<string, string> = {
  beginner: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

const statusFilters: { value: CourseStatus | "all"; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "PUBLISHED", label: "Đã xuất bản" },
  { value: "DRAFT", label: "Bản nháp" },
  { value: "ARCHIVED", label: "Lưu trữ" },
];

interface OverviewCourseTableProps {
  courses: OverviewCourse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<OverviewCourse>) => void;
}

export function OverviewCourseTable({ courses, selectedId, onSelect, onUpdate }: OverviewCourseTableProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CourseStatus | "all">("all");
  const [sortKey, setSortKey] = useState<CourseSortKey>("enrollments");
  const [sortDir, setSortDir] = useState<CourseSortDir>("desc");
  const [view, setView] = useState<CourseViewMode>("table");
  const [actionOpenId, setActionOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return courses
      .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
      .filter((c) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return `${c.title} ${c.instructor} ${c.description}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortKey === "title") diff = a.title.localeCompare(b.title);
        else if (sortKey === "price") diff = a.price - b.price;
        else if (sortKey === "enrollments") diff = a.enrollments - b.enrollments;
        else if (sortKey === "classes") diff = a.classes - b.classes;
        return sortDir === "asc" ? diff : -diff;
      });
  }, [courses, query, statusFilter, sortKey, sortDir]);

  function toggleSort(key: CourseSortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function changeStatus(id: string, status: CourseStatus) {
    onUpdate(id, { status });
    setActionOpenId(null);
    toast.success(`Đã cập nhật trạng thái khóa học`);
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-950">Khóa học</h2>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
            {filtered.length}
          </span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/* Search */}
          <label id="course-search-label" className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="course-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm khóa học, giảng viên..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-50"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          {/* Status filter */}
          <label className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-600 transition focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50">
            <Filter className="h-3.5 w-3.5" />
            <select
              id="course-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CourseStatus | "all")}
              className="bg-transparent text-sm outline-none"
            >
              {statusFilters.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </label>

          {/* View toggle */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            {(["table", "board"] as CourseViewMode[]).map((v) => {
              const Icon = v === "table" ? Table2 : Columns3;
              return (
                <button
                  key={v}
                  id={`course-view-${v}`}
                  onClick={() => setView(v)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-bold transition",
                    view === v ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {v === "table" ? "Bảng" : "Lưới"}
                </button>
              );
            })}
          </div>

          <Link
            href="/workspace/courses/create"
            id="course-new-btn"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-white transition hover:bg-primary/90 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm khóa
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <Search className="h-7 w-7" />
          </div>
          <p className="font-semibold text-slate-700">Không tìm thấy khóa học</p>
          <p className="text-sm text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</p>
          <button
            onClick={() => { setQuery(""); setStatusFilter("all"); }}
            className="mt-1 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
          >
            Xóa bộ lọc
          </button>
        </motion.div>
      )}

      {/* Table view */}
      {filtered.length > 0 && view === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Khóa học</th>
                <th className="px-4 py-3">Giảng viên</th>
                <th className="px-4 py-3">Trạng thái</th>
                <SortTh label="Lớp/Học viên" sortKey="enrollments" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortTh label="Học phí" sortKey="price" current={sortKey} dir={sortDir} onSort={toggleSort} className="text-right" />
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((course) => (
                  <motion.tr
                    key={course.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => onSelect(course.id)}
                    className={cn(
                      "cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-orange-50/50",
                      selectedId === course.id && "bg-orange-50"
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <strong className="block font-semibold text-slate-950">{course.title}</strong>
                      <span className="line-clamp-1 text-xs text-slate-500">{course.description}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{course.instructor}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", statusConfig[course.status].tone)}>
                        {statusConfig[course.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {course.classes} lớp · {course.enrollments} HV
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-950">
                      {currency.format(course.price)}
                    </td>
                    <td className="relative px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/workspace/courses/${course.id}`}
                          id={`view-course-${course.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-orange-50 hover:text-orange-600"
                          title="Vận hành"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/workspace/courses/${course.id}/edit`}
                          id={`edit-course-${course.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-orange-50 hover:text-orange-600"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <div className="relative">
                          <button
                            id={`action-menu-course-${course.id}`}
                            onClick={() => setActionOpenId(actionOpenId === course.id ? null : course.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                          <AnimatePresence>
                            {actionOpenId === course.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl"
                              >
                                {course.status !== "PUBLISHED" && (
                                  <button
                                    onClick={() => changeStatus(course.id, "PUBLISHED")}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-orange-50 hover:text-orange-700"
                                  >
                                    Xuất bản khóa học
                                  </button>
                                )}
                                {course.status !== "DRAFT" && (
                                  <button
                                    onClick={() => changeStatus(course.id, "DRAFT")}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                                  >
                                    Chuyển về nháp
                                  </button>
                                )}
                                {course.status !== "ARCHIVED" && (
                                  <button
                                    onClick={() => changeStatus(course.id, "ARCHIVED")}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-50"
                                  >
                                    Lưu trữ
                                  </button>
                                )}
                                <div className="my-1 border-t border-slate-100" />
                                <Link
                                  href={`/workspace/courses/${course.id}`}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
                                  onClick={() => setActionOpenId(null)}
                                >
                                  Xem chi tiết
                                </Link>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Board / Grid view */}
      {filtered.length > 0 && view === "board" && (
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence initial={false}>
            {filtered.map((course) => (
              <motion.article
                key={course.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                onClick={() => onSelect(course.id)}
                className={cn(
                  "cursor-pointer rounded-xl border bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md",
                  selectedId === course.id ? "border-orange-300 ring-4 ring-orange-50" : "border-slate-100"
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-950">{course.title}</h3>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-bold", statusConfig[course.status].tone)}>
                    {statusConfig[course.status].label}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-slate-500">{course.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{course.instructor}</span>
                  <span>{levelLabel[course.level] ?? course.level}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-bold text-slate-950">{currency.format(course.price)}</span>
                  <span className="text-xs text-slate-500">{course.enrollments} HV · {course.classes} lớp</span>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-xs text-slate-400">
            {filtered.length} / {courses.length} khóa học
          </span>
          <Link
            href="/workspace/courses"
            className="text-xs font-semibold text-orange-600 transition hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
      )}
    </section>
  );
}

function SortTh({
  label,
  sortKey,
  current,
  dir,
  onSort,
  className,
}: {
  label: string;
  sortKey: CourseSortKey;
  current: CourseSortKey;
  dir: CourseSortDir;
  onSort: (key: CourseSortKey) => void;
  className?: string;
}) {
  const active = current === sortKey;
  return (
    <th
      className={cn("cursor-pointer px-4 py-3 select-none", className)}
      onClick={() => onSort(sortKey)}
    >
      <span className={cn("inline-flex items-center gap-1 transition hover:text-slate-700", active ? "text-orange-600" : "")}>
        {label}
        <ArrowUpDown className={cn("h-3 w-3", active ? "text-orange-600" : "text-slate-300")} />
        {active && (
          <ChevronDown className={cn("h-3 w-3 transition", active && dir === "asc" ? "rotate-180" : "")} />
        )}
      </span>
    </th>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  Columns3,
  LayoutList,
  Plus,
  Search,
  Table2,
  Users,
  X,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils/cn";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { courseMockData } from "./courses.mock";
import type { CourseSortDir, CourseSortKey, CourseStatus, CourseViewMode } from "./courses.types";

const statusConfig: Record<CourseStatus, { label: string; tone: string; icon: React.ElementType }> = {
  DRAFT: { label: "BẢN NHÁP", tone: "bg-white border-[#eaeaea] text-black", icon: BookOpen },
  PUBLISHED: { label: "ĐÃ XUẤT BẢN", tone: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
  ARCHIVED: { label: "LƯU TRỮ", tone: "bg-gray-50 text-gray-600 border-[#eaeaea]", icon: BookOpen },
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
};

export function CoursesWorkspace({ initialCourses }: { initialCourses: TrainingTypes.TrainingCourseRow[] }) {
  const router = useRouter();
  const [courses, setCourses] = useState<TrainingTypes.TrainingCourseRow[]>(
    initialCourses.length > 0 ? initialCourses : courseMockData
  );
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CourseStatus>("ALL");
  const [sortKey, setSortKey] = useState<CourseSortKey>("title");
  const [sortDir, setSortDir] = useState<CourseSortDir>("asc");
  const [viewMode, setViewMode] = useState<CourseViewMode>("table");
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Stats
  const stats = useMemo(() => {
    return {
      total: courses.length,
      published: courses.filter(c => c.status === "PUBLISHED").length,
      classes: courses.reduce((acc, c) => acc + c.classes, 0),
      enrollments: courses.reduce((acc, c) => acc + c.enrollments, 0),
    };
  }, [courses]);

  // Filter & Sort
  const processedCourses = useMemo(() => {
    let result = [...courses];
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        c => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q)
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
  }, [courses, query, statusFilter, sortKey, sortDir]);

  const handleSort = (key: CourseSortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === processedCourses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedCourses.map(c => c.id)));
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
            <h1 className="text-[48px] font-medium tracking-tighter leading-none text-black">Khóa học</h1>
            <p className="mt-3 text-[16px] text-gray-500 leading-relaxed">
              Quản lý danh sách khóa học và giáo trình đào tạo.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              id="btn-create-course"
              onClick={() => setQuickCreateOpen(true)}
              className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo khóa học
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="TỔNG KHÓA HỌC" value={stats.total} />
          <StatCard label="ĐÃ XUẤT BẢN" value={stats.published} />
          <StatCard label="TỔNG SỐ LỚP" value={stats.classes} />
          <StatCard label="HỌC VIÊN" value={stats.enrollments} />
        </div>
      </div>

      {/* ── Filters & Content ── */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div className="mx-auto max-w-full rounded-2xl border border-[#eaeaea] bg-white">
          
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#eaeaea] p-4 sm:flex-row sm:items-center">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap",
                  statusFilter === "ALL" ? "bg-black text-white" : "border border-[#eaeaea] text-black hover:bg-gray-50"
                )}
              >
                TẤT CẢ
              </button>
              {(["PUBLISHED", "DRAFT", "ARCHIVED"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap",
                    statusFilter === status ? "bg-black text-white" : "border border-[#eaeaea] text-black hover:bg-gray-50"
                  )}
                >
                  {statusConfig[status].label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm khóa học, giảng viên..."
                  className="flex h-9 w-full rounded-full border border-[#eaeaea] bg-white pl-9 pr-4 text-[13px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center rounded-full border border-[#eaeaea] bg-gray-50 p-0.5">
                <button 
                  onClick={() => setViewMode("table")}
                  className={cn("p-1.5 rounded-full transition-colors", viewMode === "table" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black")}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("board")}
                  className={cn("p-1.5 rounded-full transition-colors", viewMode === "board" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-black")}
                >
                  <Table2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex h-12 items-center justify-between border-b border-[#eaeaea] bg-gray-50 px-5">
              <span className="text-[13px] font-medium text-black">Đã chọn {selectedIds.size} khóa học</span>
              <div className="flex gap-2">
                <button className="rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                  Xuất bản
                </button>
                <button className="rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                  Lưu trữ
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="min-h-[400px]">
            {processedCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <BookOpen className="w-8 h-8 text-gray-300 mb-3" />
                <h3 className="text-[14px] font-medium text-black">Không tìm thấy khóa học</h3>
                <p className="text-[13px] text-gray-500 mt-1 mb-4">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                <button 
                  onClick={() => { setQuery(""); setStatusFilter("ALL"); }}
                  className="text-[13px] text-black font-medium hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b border-[#eaeaea]">
                    <tr>
                      <th className="w-12 px-5 py-4">
                        <input type="checkbox" checked={selectedIds.size === processedCourses.length && processedCourses.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("title")}>
                        <div className="flex items-center gap-1.5">Khóa học <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("price")}>
                        <div className="flex items-center gap-1.5">Học phí <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Giảng viên</th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("classes")}>
                        <div className="flex items-center gap-1.5">Lớp học <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("enrollments")}>
                        <div className="flex items-center gap-1.5">Học viên <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Trạng thái</th>
                      <th className="px-5 py-4 text-right font-medium text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {processedCourses.map(course => (
                      <tr 
                        key={course.id}
                        onClick={() => router.push(`/workspace/courses/${course.id}`)}
                        className="group cursor-pointer transition-colors hover:bg-gray-50"
                      >
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.has(course.id)} onChange={() => toggleSelect(course.id)} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[14px] font-medium text-black group-hover:underline decoration-gray-300 underline-offset-4">{course.title}</div>
                          <div className="text-[13px] text-gray-400 truncate max-w-[200px] mt-0.5">{course.description}</div>
                        </td>
                        <td className="px-5 py-4 text-[13px] font-medium text-black">{formatCurrency(course.price, course.currency)}</td>
                        <td className="px-5 py-4 text-[13px] text-gray-600">{course.instructor}</td>
                        <td className="px-5 py-4 text-[13px] text-gray-600">{course.classes} lớp</td>
                        <td className="px-5 py-4 text-[13px] text-gray-600">{course.enrollments} hs</td>
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest", statusConfig[course.status].tone)}>
                            {(() => {
                              const Icon = statusConfig[course.status].icon;
                              return <Icon className="h-3 w-3" />;
                            })()}
                            {statusConfig[course.status].label}
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {processedCourses.map(course => (
                  <div 
                    key={course.id}
                    onClick={() => router.push(`/workspace/courses/${course.id}`)}
                    className="flex flex-col rounded-xl border border-[#eaeaea] bg-white p-5 cursor-pointer hover:border-black transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest", statusConfig[course.status].tone)}>
                        {statusConfig[course.status].label}
                      </span>
                      <span className="text-[13px] font-semibold text-black">{formatCurrency(course.price, course.currency)}</span>
                    </div>
                    <h3 className="font-medium text-black text-[15px] line-clamp-2 leading-tight">{course.title}</h3>
                    <p className="text-[13px] text-gray-500 mt-2 line-clamp-2">{course.description}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between text-[12px] font-medium text-gray-400">
                      <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {course.enrollments} học viên</div>
                      <div className="flex items-center gap-1.5"><Columns3 className="w-3.5 h-3.5" /> {course.classes} lớp</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-[#eaeaea] p-4 text-center">
            <span className="text-[12px] font-medium uppercase tracking-widest text-gray-400">
              Hiển thị {processedCourses.length} kết quả
            </span>
          </div>

        </div>
      </div>

      {/* Quick Create Modal */}
      <AnimatePresence>
        {quickCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-[#eaeaea] w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-[#eaeaea] flex items-center justify-between">
                <h3 className="text-[16px] font-medium text-black">Tạo khóa học nhanh</h3>
                <button onClick={() => setQuickCreateOpen(false)} className="text-gray-400 hover:text-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">Tên khóa học</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-[#eaeaea] rounded-lg text-[14px] outline-none focus:border-black transition-colors" placeholder="VD: Lập trình ReactJS..." />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-2">Học phí (VND)</label>
                  <input type="number" className="w-full px-4 py-2.5 border border-[#eaeaea] rounded-lg text-[14px] outline-none focus:border-black transition-colors" placeholder="VD: 3000000" />
                </div>
                <button 
                  onClick={() => {
                    toast.success("Khóa học đã được tạo thành công dưới dạng Bản nháp.");
                    setQuickCreateOpen(false);
                  }}
                  className="w-full py-3 bg-black text-white rounded-full text-[14px] font-medium hover:bg-gray-800 transition-colors mt-2"
                >
                  Lưu khóa học
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

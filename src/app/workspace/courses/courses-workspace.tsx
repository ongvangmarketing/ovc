"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Archive,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Columns3,
  Filter,
  GraduationCap,
  LayoutList,
  MoreHorizontal,
  Plus,
  Search,
  Table2,
  Users,
  X,
  Edit2,
  Eye
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import type { TrainingCourseRow } from "@/lib/training";
import { courseMockData } from "./courses.mock";
import type { CourseSortDir, CourseSortKey, CourseStatus, CourseViewMode } from "./courses.types";

const statusConfig: Record<CourseStatus, { label: string; tone: string }> = {
  DRAFT: { label: "Bản nháp", tone: "bg-slate-100 text-slate-700" },
  PUBLISHED: { label: "Đã xuất bản", tone: "bg-emerald-50 text-emerald-700" },
  ARCHIVED: { label: "Lưu trữ", tone: "bg-amber-50 text-amber-700" },
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
};

export function CoursesWorkspace({ initialCourses }: { initialCourses: TrainingCourseRow[] }) {
  const [courses, setCourses] = useState<TrainingCourseRow[]>(
    initialCourses.length > 0 ? initialCourses : courseMockData
  );
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | CourseStatus>("ALL");
  const [sortKey, setSortKey] = useState<CourseSortKey>("title");
  const [sortDir, setSortDir] = useState<CourseSortDir>("asc");
  const [viewMode, setViewMode] = useState<CourseViewMode>("table");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleStatusChange = (id: string, newStatus: CourseStatus) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    toast.success(`Đã cập nhật trạng thái thành ${statusConfig[newStatus].label}`);
  };

  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedId), [courses, selectedId]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Khóa học
            </h1>
            <p className="text-slate-500 mt-1">Quản lý danh sách khóa học và giáo trình đào tạo</p>
          </div>
          <button 
            id="btn-create-course"
            onClick={() => setQuickCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo khóa học mới
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard label="Tổng khóa học" value={stats.total} icon={BookOpen} />
          <StatCard label="Đã xuất bản" value={stats.published} icon={CheckCircle2} />
          <StatCard label="Tổng số lớp" value={stats.classes} icon={Columns3} />
          <StatCard label="Học viên" value={stats.enrollments} icon={Users} />
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 p-6 overflow-y-auto">
          {/* Controls */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm khóa học, giảng viên..."
                  className="pl-9 pr-4 py-1.5 text-sm outline-none w-full md:w-64 bg-transparent"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                <button 
                  onClick={() => setViewMode("table")}
                  className={cn("p-1.5 rounded-md transition-colors", viewMode === "table" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("board")}
                  className={cn("p-1.5 rounded-md transition-colors", viewMode === "board" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                >
                  <Table2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex gap-1">
                {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                      statusFilter === status ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {status === "ALL" ? "Tất cả" : statusConfig[status as CourseStatus].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          {processedCourses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Không tìm thấy khóa học</h3>
              <p className="text-slate-500 mt-1 mb-4">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              <button 
                onClick={() => { setQuery(""); setStatusFilter("ALL"); }}
                className="text-primary font-medium hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : viewMode === "table" ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("title")}>
                      <div className="flex items-center gap-1">Khóa học {sortKey === "title" && <ChevronDown className={cn("w-4 h-4 transition-transform", sortDir==="asc" ? "rotate-180":"")} />}</div>
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("price")}>
                      <div className="flex items-center gap-1">Học phí {sortKey === "price" && <ChevronDown className={cn("w-4 h-4 transition-transform", sortDir==="asc" ? "rotate-180":"")} />}</div>
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">Giảng viên</th>
                    <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("classes")}>
                      Lớp học
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => handleSort("enrollments")}>
                      Học viên
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedCourses.map(course => (
                    <tr 
                      key={course.id}
                      onClick={() => setSelectedId(course.id)}
                      className={cn("cursor-pointer transition-colors hover:bg-slate-50/80", selectedId === course.id && "bg-orange-50/50")}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{course.title}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{course.description}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(course.price, course.currency)}</td>
                      <td className="px-4 py-3 text-slate-700">{course.instructor}</td>
                      <td className="px-4 py-3 text-slate-700">{course.classes} lớp</td>
                      <td className="px-4 py-3 text-slate-700">{course.enrollments} hs</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusConfig[course.status].tone)}>
                          {statusConfig[course.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {processedCourses.map(course => (
                <motion.div 
                  layoutId={`card-${course.id}`}
                  key={course.id}
                  onClick={() => setSelectedId(course.id)}
                  className={cn(
                    "bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all",
                    selectedId === course.id ? "border-primary ring-1 ring-primary" : "border-slate-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusConfig[course.status].tone)}>
                      {statusConfig[course.status].label}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(course.price, course.currency)}</span>
                  </div>
                  <h3 className="font-medium text-slate-900 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.enrollments}</div>
                    <div className="flex items-center gap-1"><Columns3 className="w-4 h-4" /> {course.classes}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Side Drawer */}
        <AnimatePresence>
          {selectedId && selectedCourse && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 bg-white border-l border-slate-200 flex flex-col z-20 absolute right-0 top-0 bottom-0 shadow-2xl xl:relative xl:shadow-none"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="font-semibold text-slate-900">Chi tiết khóa học</h2>
                <button onClick={() => setSelectedId(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-6">
                <div>
                  <span className={cn("px-2 py-1 text-xs font-medium rounded-full", statusConfig[selectedCourse.status].tone)}>
                    {statusConfig[selectedCourse.status].label}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-3">{selectedCourse.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{selectedCourse.description}</p>
                </div>

                <div className="space-y-3">
                  <DetailRow label="Học phí" value={formatCurrency(selectedCourse.price, selectedCourse.currency)} />
                  <DetailRow label="Thời lượng" value={`${selectedCourse.duration || 0} giờ`} />
                  <DetailRow label="Cấp độ" value={selectedCourse.level} />
                  <DetailRow label="Giảng viên" value={selectedCourse.instructor} />
                  <DetailRow label="Lớp đang mở" value={`${selectedCourse.classes} lớp`} />
                  <DetailRow label="Học viên" value={`${selectedCourse.enrollments} người`} />
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-medium text-slate-900 mb-3">Hành động</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCourse.status !== "PUBLISHED" && (
                      <button onClick={() => handleStatusChange(selectedCourse.id, "PUBLISHED")} className="px-3 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-lg font-medium hover:bg-emerald-100 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Xuất bản
                      </button>
                    )}
                    {selectedCourse.status !== "ARCHIVED" && (
                      <button onClick={() => handleStatusChange(selectedCourse.id, "ARCHIVED")} className="px-3 py-2 text-sm bg-amber-50 text-amber-700 rounded-lg font-medium hover:bg-amber-100 flex items-center justify-center gap-2">
                        <Archive className="w-4 h-4" /> Lưu trữ
                      </button>
                    )}
                    <Link href={`/workspace/courses/${selectedCourse.id}`} className="px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 flex items-center justify-center gap-2">
                      <Edit2 className="w-4 h-4" /> Cập nhật
                    </Link>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Create Modal */}
      <AnimatePresence>
        {quickCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Tạo khóa học nhanh</h3>
                <button onClick={() => setQuickCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên khóa học</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="VD: Lập trình ReactJS..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Học phí (VND)</label>
                  <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="VD: 3000000" />
                </div>
                <button 
                  onClick={() => {
                    toast.success("Khóa học đã được tạo thành công dưới dạng Bản nháp.");
                    setQuickCreateOpen(false);
                  }}
                  className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors mt-2"
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

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="text-sm text-slate-500 font-medium">{label}</div>
        <div className="text-xl font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right">{value}</span>
    </div>
  );
}

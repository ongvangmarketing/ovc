"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Filter, Search, UploadCloud } from "lucide-react";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

type AssignmentListProps = {
  assignments: any[];
  lessonToCourse: Record<string, { courseId: string; courseTitle: string }>;
};

export function AssignmentList({ assignments, lessonToCourse }: AssignmentListProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "grading" | "graded">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssignments = assignments.filter((item) => {
    const submission = item.submissions?.[0];
    
    // Status filter
    if (filter === "pending" && submission) return false;
    if (filter === "grading" && (!submission || submission.score !== null)) return false;
    if (filter === "graded" && (!submission || submission.score === null)) return false;
    
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const course = item.lessonId ? lessonToCourse[item.lessonId] : null;
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchCourse = course?.courseTitle?.toLowerCase().includes(q);
      if (!matchTitle && !matchCourse) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button 
            onClick={() => setFilter("all")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilter("pending")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Chưa nộp
          </button>
          <button 
            onClick={() => setFilter("grading")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === "grading" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Chờ chấm
          </button>
          <button 
            onClick={() => setFilter("graded")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${filter === "graded" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
          >
            Đã chấm
          </button>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên bài tập..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid gap-4">
        {filteredAssignments.map((item) => {
          const course = item.lessonId ? lessonToCourse[item.lessonId] : null;
          const submission = item.submissions?.[0];
          
          let statusBadge;
          if (!submission) {
            statusBadge = <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Chưa nộp</span>;
          } else if (submission.score == null) {
            statusBadge = <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Chờ chấm</span>;
          } else {
            statusBadge = <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Đã chấm: {submission.score}/{item.maxScore}</span>;
          }

          return (
            <div key={item.id} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {statusBadge}
                    <span className="text-xs font-medium text-slate-500">
                      Hạn nộp: {item.dueDate ? dateFormat.format(new Date(item.dueDate)) : "Không có hạn"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{course?.courseTitle || "Khóa học chung"}</p>
                  
                  {item.description && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                      {item.description}
                    </div>
                  )}
                  
                  {submission?.feedback && (
                    <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                      <strong>Nhận xét từ GV:</strong> {submission.feedback}
                    </div>
                  )}
                </div>
                
                <div className="shrink-0">
                  {course ? (
                    <Link 
                      href={`/student/courses/${course.courseId}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white sm:w-auto"
                    >
                      Mở trong phòng học
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredAssignments.length === 0 && (
          <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <FileText className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-lg font-semibold text-slate-900">Không tìm thấy bài tập</p>
            <p className="mt-1 text-sm text-slate-500">Hãy thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  UserCheck,
} from "lucide-react";

import type { TrainingInstructorRow } from "@/lib/training";
import { instructorMockData } from "./instructors.mock";
import type { InstructorSortDir, InstructorSortKey } from "./instructors.types";

export function InstructorsWorkspace({ initialInstructors }: { initialInstructors: TrainingInstructorRow[] }) {
  const router = useRouter();
  const [instructors] = useState<TrainingInstructorRow[]>(
    initialInstructors.length > 0 ? initialInstructors : instructorMockData
  );
  
  const [query, setQuery] = useState("");
  const sortKey: InstructorSortKey = "name";
  const sortDir: InstructorSortDir = "asc";

  // Stats
  const stats = useMemo(() => {
    return {
      total: instructors.length,
      totalCourses: instructors.reduce((acc, i) => acc + i.courses, 0),
      totalClasses: instructors.reduce((acc, i) => acc + i.classes, 0),
    };
  }, [instructors]);

  // Filter & Sort
  const processedData = useMemo(() => {
    let result = [...instructors];
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        i => i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.phone.includes(q)
      );
    }
    
    result.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === "number" && typeof valB === "number") {
        return sortDir === "asc" ? valA - valB : valB - valA;
      }
      return 0;
    });
    
    return result;
  }, [instructors, query, sortKey, sortDir]);

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <header className="mb-5 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
              <UserCheck className="h-4 w-4 text-orange-500" />
              Đào tạo / Giảng viên
            </div>
            <h1 className="text-[15px] font-medium text-slate-950">Danh sách giáo viên</h1>
            <p className="mt-1 text-[14px] font-light text-slate-500">Quản lý hồ sơ giảng viên, lớp phụ trách và khóa đang dạy.</p>
          </div>
          <Link
            id="btn-create-instructor"
            href="/workspace/training/instructors/create"
            className="quote-action-button quote-action-primary"
          >
            <Plus className="w-4 h-4" />
            Thêm giáo viên
          </Link>
        </div>
        
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Tổng giáo viên" value={stats.total} />
          <StatCard label="Khóa học phụ trách" value={stats.totalCourses} />
          <StatCard label="Lớp đang dạy" value={stats.totalClasses} />
        </div>
      </header>

      <section className="quote-panel overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..."
                className="quote-input pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="min-h-[560px] overflow-auto">
            {processedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Search className="w-8 h-8 text-slate-300 mb-3" />
                <h3 className="text-base font-medium text-slate-900">Không tìm thấy giáo viên</h3>
                <p className="text-sm text-slate-500 mt-1">Vui lòng thử từ khóa khác</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 sticky top-0 z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium text-slate-500 w-16">STT</th>
                    <th className="px-6 py-4 font-medium text-slate-500">Tên giáo viên</th>
                    <th className="px-6 py-4 font-medium text-slate-500">Email</th>
                    <th className="px-6 py-4 font-medium text-slate-500">Điện thoại</th>
                    <th className="px-6 py-4 font-medium text-slate-500 text-center">Khóa học</th>
                    <th className="px-6 py-4 font-medium text-slate-500 text-center">Lớp học</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedData.map((instructor, idx) => (
                    <tr 
                      key={instructor.id}
                      onClick={() => router.push(`/workspace/training/instructors/${instructor.id}`)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-xs shrink-0">
                            {instructor.name ? instructor.name.split(" ").slice(-1)[0]?.charAt(0) ?? "?" : "?"}
                          </div>
                          <span className="font-medium text-indigo-600">{instructor.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{instructor.email}</td>
                      <td className="px-6 py-4 text-slate-600">{instructor.phone}</td>
                      <td className="px-6 py-4 text-slate-600 text-center">{instructor.courses}</td>
                      <td className="px-6 py-4 text-slate-600 text-center">{instructor.classes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="quote-panel p-4">
      <div className="text-3xl font-medium text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
    </div>
  );
}

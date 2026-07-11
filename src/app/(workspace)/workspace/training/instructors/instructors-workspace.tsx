"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  Plus,
  Search,
  ArrowRight
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { instructorMockData } from "./instructors.mock";
import type { InstructorSortDir, InstructorSortKey } from "./instructors.types";

export function InstructorsWorkspace({ initialInstructors }: { initialInstructors: TrainingTypes.TrainingInstructorRow[] }) {
  const router = useRouter();
  const [instructors] = useState<TrainingTypes.TrainingInstructorRow[]>(
    initialInstructors.length > 0 ? initialInstructors : instructorMockData
  );
  
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<InstructorSortKey>("name");
  const [sortDir, setSortDir] = useState<InstructorSortDir>("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const handleSort = (key: InstructorSortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === processedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedData.map(c => c.id)));
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
            <h1 className="text-[48px] font-medium tracking-tighter leading-none text-black">Giảng viên</h1>
            <p className="mt-3 text-[16px] text-gray-500 leading-relaxed">
              Quản lý hồ sơ giảng viên, lớp phụ trách và khóa đang dạy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              id="btn-create-instructor"
              href="/workspace/training/instructors/create"
              className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm giảng viên
            </Link>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="TỔNG GIẢNG VIÊN" value={stats.total} />
          <StatCard label="KHÓA HỌC PHỤ TRÁCH" value={stats.totalCourses} />
          <StatCard label="LỚP ĐANG DẠY" value={stats.totalClasses} />
        </div>
      </div>

      {/* ── Filters & Content ── */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div className="mx-auto max-w-full rounded-2xl border border-[#eaeaea] bg-white">
          
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#eaeaea] p-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm giảng viên..."
                className="flex h-9 w-full rounded-full border border-[#eaeaea] bg-white pl-9 pr-4 text-[13px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex h-12 items-center justify-between border-b border-[#eaeaea] bg-gray-50 px-5">
              <span className="text-[13px] font-medium text-black">Đã chọn {selectedIds.size} giảng viên</span>
              <div className="flex gap-2">
                <button className="rounded-full border border-[#eaeaea] bg-white px-4 py-1.5 text-[12px] font-medium text-black hover:bg-gray-50 transition-colors">
                  Khóa tài khoản
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="min-h-[400px]">
            {processedData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Search className="w-8 h-8 text-gray-300 mb-3" />
                <h3 className="text-[14px] font-medium text-black">Không tìm thấy giảng viên</h3>
                <p className="text-[13px] text-gray-500 mt-1 mb-4">Vui lòng thử từ khóa khác</p>
                <button 
                  onClick={() => setQuery("")}
                  className="text-[13px] text-black font-medium hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white border-b border-[#eaeaea]">
                    <tr>
                      <th className="w-12 px-5 py-4">
                        <input type="checkbox" checked={selectedIds.size === processedData.length && processedData.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-1.5">Giảng viên <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400">Email / Số điện thoại</th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 text-center cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("courses")}>
                        <div className="flex items-center justify-center gap-1.5">Khóa học <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-[11px] font-medium uppercase tracking-widest text-gray-400 text-center cursor-pointer hover:text-black transition-colors" onClick={() => handleSort("classes")}>
                        <div className="flex items-center justify-center gap-1.5">Lớp học <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="px-5 py-4 text-right font-medium text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {processedData.map((instructor) => (
                      <tr 
                        key={instructor.id}
                        onClick={() => router.push(`/workspace/training/instructors/${instructor.id}`)}
                        className="group cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedIds.has(instructor.id)} onChange={() => toggleSelect(instructor.id)} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full border border-[#eaeaea] bg-white text-black flex items-center justify-center font-medium text-[11px] uppercase shrink-0">
                              {instructor.name ? instructor.name.split(" ").slice(-1)[0]?.charAt(0) ?? "?" : "?"}
                            </div>
                            <span className="text-[14px] font-medium text-black group-hover:underline decoration-gray-300 underline-offset-4">{instructor.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-[13px] text-black">{instructor.email}</div>
                          <div className="text-[12px] text-gray-400 mt-0.5">{instructor.phone}</div>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-black font-medium text-center">{instructor.courses}</td>
                        <td className="px-5 py-4 text-[13px] text-black font-medium text-center">{instructor.classes}</td>
                        <td className="px-5 py-4 text-right">
                          <ArrowRight className="inline-block h-4 w-4 text-gray-300 opacity-0 transition-all group-hover:opacity-100 group-hover:text-black group-hover:-translate-x-1" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-[#eaeaea] p-4 text-center">
            <span className="text-[12px] font-medium uppercase tracking-widest text-gray-400">
              Hiển thị {processedData.length} kết quả
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

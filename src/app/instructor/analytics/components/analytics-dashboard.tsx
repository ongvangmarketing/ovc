"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, BarChart3, Filter, Mail, Phone, Search } from "lucide-react";
import Link from "next/link";

type Enrollment = any;

interface AnalyticsDashboardProps {
  enrollments: Enrollment[];
  atRiskCount: number;
}

export function AnalyticsDashboard({ enrollments, atRiskCount }: AnalyticsDashboardProps) {
  const [filter, setFilter] = useState<"all" | "at_risk" | "top">("at_risk");
  const [search, setSearch] = useState("");

  const filtered = enrollments.filter(e => {
    if (filter === "at_risk" && e.progress >= 20) return false;
    if (filter === "top" && e.progress <= 80) return false;
    
    if (search && !e.student.name.toLowerCase().includes(search.toLowerCase()) && !e.student.email.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      
      {/* Main Column - Student CRM */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
          
          <div className="border-b border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-bold text-slate-900 text-lg">Quản lý Học viên</h2>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Tìm học viên..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full sm:w-[240px] text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setFilter("all")} 
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Tất cả
                </button>
                <button 
                  onClick={() => setFilter("at_risk")} 
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === "at_risk" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-orange-600"}`}
                >
                  Nguy cơ
                </button>
                <button 
                  onClick={() => setFilter("top")} 
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${filter === "top" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-emerald-600"}`}
                >
                  Xuất sắc
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Học viên</th>
                  <th className="px-6 py-4">Khóa / Lớp</th>
                  <th className="px-6 py-4">Tiến độ</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{e.student.name}</div>
                      <div className="text-slate-500 mt-0.5">{e.student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{e.course.title}</div>
                      <div className="text-slate-500 mt-0.5">{e.class?.name || "Chưa xếp lớp"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${e.progress < 20 ? 'bg-orange-500' : e.progress > 80 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                            style={{ width: `${e.progress}%` }} 
                          />
                        </div>
                        <span className={`font-semibold ${e.progress < 20 ? 'text-orange-600' : e.progress > 80 ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {e.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Gửi Email">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Gọi điện">
                          <Phone className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      Không tìm thấy học viên nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sidebar Column - Funnel & Quick Actions */}
      <div className="space-y-6">
        
        {/* Drop-off Funnel Chart (Mock for now) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Phễu hoàn thành khóa học</h3>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Đăng ký (Bài 1)</span>
                <span className="font-bold text-slate-900">100%</span>
              </div>
              <div className="h-8 w-full bg-blue-100 rounded-lg relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-blue-500 w-full" />
              </div>
            </div>
            
            <div className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Vượt qua Bài 3</span>
                <span className="font-bold text-slate-900">75%</span>
              </div>
              <div className="h-8 w-full bg-blue-100 rounded-lg relative overflow-hidden flex justify-center">
                <div className="absolute inset-y-0 bg-blue-400 w-[75%]" />
              </div>
            </div>
            
            <div className="relative">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Hoàn thành Khóa</span>
                <span className="font-bold text-slate-900">42%</span>
              </div>
              <div className="h-8 w-full bg-blue-100 rounded-lg relative overflow-hidden flex justify-center">
                <div className="absolute inset-y-0 bg-emerald-500 w-[42%]" />
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-5 border-t border-slate-100 bg-orange-50/50 -mx-5 px-5 pb-1 rounded-b-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block mb-1">Điểm rớt cao nhất: Bài 4 - Thực hành</strong>
                Có dấu hiệu học viên bỏ cuộc nhiều ở bài này. Đề xuất: Thêm video hướng dẫn phụ trợ hoặc giảm độ khó bài tập.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

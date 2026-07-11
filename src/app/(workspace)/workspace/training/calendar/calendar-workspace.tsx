"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  User,
  Plus
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { calendarMockData } from "./calendar.mock";
import type { ScheduleFilter } from "./calendar.types";

const tabs = [
  { id: "all", label: "TẤT CẢ LỊCH" },
  { id: "CLASS", label: "LỊCH THEO LỚP" },
  { id: "LESSON", label: "LỊCH THEO BUỔI" },
] as const;

export function CalendarWorkspace({ initialSchedules }: { initialSchedules: TrainingTypes.TrainingScheduleRow[] }) {
  const router = useRouter();
  const [schedules] = useState<TrainingTypes.TrainingScheduleRow[]>(
    initialSchedules.length > 0 ? initialSchedules : calendarMockData
  );
  
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ScheduleFilter>("all");

  // Stats
  const stats = useMemo(() => {
    return {
      total: schedules.length,
      classes: schedules.filter(s => s.source === "CLASS").length,
      lessons: schedules.filter(s => s.source === "LESSON").length,
    };
  }, [schedules]);

  // Filter
  const processedData = useMemo(() => {
    let result = [...schedules];
    
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        s => s.title.toLowerCase().includes(q) || 
             s.instructor.toLowerCase().includes(q) || 
             s.course.toLowerCase().includes(q)
      );
    }
    
    if (activeTab !== "all") {
      result = result.filter(s => s.source === activeTab);
    }
    
    result.sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    
    return result;
  }, [schedules, query, activeTab]);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[#fafafa]">
      
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 shrink-0 border-b border-[#eaeaea] bg-white px-6 py-6 md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[48px] font-medium tracking-tighter leading-none text-black">Lịch học</h1>
            <p className="mt-3 text-[16px] text-gray-500 leading-relaxed">
              Theo dõi lịch giảng dạy, buổi học định kỳ và sự kiện đặc biệt.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex h-10 items-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tạo lịch học
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="TỔNG LỊCH HỌC" value={stats.total} />
          <StatCard label="LỊCH THEO LỚP" value={stats.classes} />
          <StatCard label="LỊCH THEO BUỔI" value={stats.lessons} />
        </div>
      </div>

      {/* ── Filters & Content ── */}
      <div className="flex-1 overflow-auto p-6 md:p-10">
        <div className="mx-auto max-w-full rounded-2xl border border-[#eaeaea] bg-white">
          
          {/* Toolbar */}
          <div className="flex flex-col justify-between gap-4 border-b border-[#eaeaea] p-4 sm:flex-row sm:items-center">
            
            <div className="flex items-center gap-4">
              <div className="text-[14px] font-medium text-black uppercase tracking-widest flex items-center gap-2">
                <span>THÁNG 4, 2025</span>
              </div>
              <div className="flex items-center gap-1 border border-[#eaeaea] rounded-full p-0.5">
                <button className="p-1 hover:bg-gray-50 rounded-full text-gray-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-1 hover:bg-gray-50 rounded-full text-gray-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar border border-[#eaeaea] rounded-full p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ScheduleFilter)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-black text-white" 
                      : "bg-white text-gray-500 hover:text-black hover:bg-gray-50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm lớp, giảng viên..."
                className="flex h-9 w-full rounded-full border border-[#eaeaea] bg-white pl-9 pr-4 text-[13px] placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List Area */}
          <div className="min-h-[400px] p-6">
            <div className="space-y-4 max-w-4xl mx-auto">
              {processedData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <CalendarDays className="w-8 h-8 text-gray-300 mb-2" />
                  <span className="text-[14px] text-black font-medium">Không có lịch học nào</span>
                  <p className="text-[13px] text-gray-500 mt-1">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
              ) : (
                processedData.map((schedule) => (
                  <div 
                    key={schedule.id}
                    onClick={() => router.push(`/workspace/training/classes/${schedule.id}`)}
                    className="bg-white border border-[#eaeaea] rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-6 cursor-pointer hover:border-black transition-colors group"
                  >
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center min-w-[80px] px-4 py-3 border border-[#eaeaea] rounded-lg group-hover:bg-gray-50 transition-colors">
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-1">
                        {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString("vi-VN", { weekday: "short" }) : "N/A"}
                      </span>
                      <span className="text-[20px] font-medium text-black leading-none">
                        {schedule.startDate ? new Date(schedule.startDate).getDate() : "--"}
                      </span>
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "px-2.5 py-1 text-[9px] font-medium uppercase tracking-widest rounded-full border",
                          schedule.source === "CLASS" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
                        )}>
                          {schedule.source === "CLASS" ? "LỊCH THEO LỚP" : "LỊCH THEO BUỔI"}
                        </span>
                        {schedule.mode === "ONLINE" && (
                          <span className="px-2.5 py-1 text-[9px] font-medium uppercase tracking-widest rounded-full bg-black text-white">
                            ONLINE
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-black text-[16px] truncate group-hover:underline decoration-gray-300 underline-offset-4">{schedule.title}</h3>
                      <div className="text-[13px] text-gray-500 mt-1 truncate">{schedule.course}</div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-col md:items-end gap-2 md:min-w-[200px]">
                      <div className="flex items-center gap-2 text-[13px] text-black font-medium">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{schedule.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-gray-500">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{schedule.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[13px] text-gray-500">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{schedule.location}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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

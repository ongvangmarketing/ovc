"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  User,
  X,
  Plus
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import type { TrainingScheduleRow } from "@/lib/training";
import { calendarMockData } from "./calendar.mock";
import type { ScheduleFilter, ScheduleSortDir, ScheduleSortKey } from "./calendar.types";

const tabs = [
  { id: "all", label: "Tất cả lịch" },
  { id: "CLASS", label: "Lịch theo Lớp" },
  { id: "LESSON", label: "Lịch theo Buổi" },
] as const;

export function CalendarWorkspace({ initialSchedules }: { initialSchedules: TrainingScheduleRow[] }) {
  const [schedules, setSchedules] = useState<TrainingScheduleRow[]>(
    initialSchedules.length > 0 ? initialSchedules : calendarMockData
  );
  
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ScheduleFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const selectedSchedule = useMemo(() => schedules.find(s => s.id === selectedId), [schedules, selectedId]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-slate-50/50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[15px] font-medium text-slate-900 tracking-tight flex items-center gap-2">
              Lịch học
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white font-medium rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tạo lịch học
            </button>
          </div>
        </div>

        {/* Dashboard-style tabs */}
        <div className="flex items-center gap-2 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ScheduleFilter)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                activeTab === tab.id 
                  ? "bg-indigo-500 text-white border-indigo-500" 
                  : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden p-4 gap-6">
        
        <div className="flex-1 flex flex-col min-w-0">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <div className="text-[15px] font-medium text-slate-900 flex items-center gap-2">
                  <span className="capitalize">Tháng 4, 2025</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Tìm lớp, giảng viên..."
                  className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all w-full"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Calendar/List Area */}
            <div className="flex-1 overflow-auto p-4 bg-slate-50">
              <div className="space-y-3 max-w-4xl mx-auto">
                {processedData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl border border-dashed border-slate-300">
                    <CalendarDays className="w-8 h-8 text-slate-300 mb-2" />
                    <span className="text-slate-500 font-medium">Không có lịch học nào</span>
                  </div>
                ) : (
                  processedData.map((schedule) => (
                    <div 
                      key={schedule.id}
                      onClick={() => setSelectedId(schedule.id)}
                      className={cn(
                        "bg-white border rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer hover:shadow-md transition-all group",
                        selectedId === schedule.id ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-200"
                      )}
                    >
                      {/* Date Block */}
                      <div className="flex flex-col items-center justify-center min-w-[80px] px-4 py-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                        <span className="text-xs font-medium text-slate-500 uppercase">
                          {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString("vi-VN", { weekday: "short" }) : "N/A"}
                        </span>
                        <span className="text-[15px] font-medium text-slate-900">
                          {schedule.startDate ? new Date(schedule.startDate).getDate() : "--"}
                        </span>
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded flex items-center gap-1",
                            schedule.source === "CLASS" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
                          )}>
                            {schedule.source === "CLASS" ? "Lịch theo Lớp" : "Lịch theo Buổi"}
                          </span>
                          {schedule.mode === "ONLINE" && (
                            <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded bg-blue-100 text-blue-700">
                              Online
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-slate-900 text-base truncate">{schedule.title}</h3>
                        <div className="text-sm text-slate-500 truncate">{schedule.course}</div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-col md:items-end gap-1.5 md:min-w-[200px]">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{schedule.schedule}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{schedule.instructor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{schedule.location}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Side Drawer */}
        <AnimatePresence>
          {selectedId && selectedSchedule && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-96 bg-white rounded-2xl border border-slate-200 flex flex-col z-20 shadow-sm overflow-hidden shrink-0"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-indigo-500 text-white">
                <h2 className="font-medium text-[15px]">Chi tiết lịch học</h2>
                <button onClick={() => setSelectedId(null)} className="p-1.5 text-indigo-100 hover:text-white hover:bg-indigo-600 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 mb-3">
                    {selectedSchedule.source === "CLASS" ? "Lớp học định kỳ" : "Buổi học đơn lẻ"}
                  </div>
                  <h3 className="text-[15px] font-medium text-slate-900 leading-tight">{selectedSchedule.title}</h3>
                  <div className="text-sm font-medium text-slate-500 mt-1">{selectedSchedule.course}</div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{selectedSchedule.schedule}</div>
                      <div className="text-sm text-slate-500">
                        {selectedSchedule.startDate ? new Date(selectedSchedule.startDate).toLocaleDateString("vi-VN") : "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{selectedSchedule.instructor}</div>
                      <div className="text-sm text-slate-500">Giảng viên phụ trách</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{selectedSchedule.location}</div>
                      <div className="text-sm text-slate-500">Địa điểm / Nền tảng</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <Link 
                    href={selectedSchedule.href}
                    className="w-full py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center"
                  >
                    Vào không gian lớp học
                  </Link>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

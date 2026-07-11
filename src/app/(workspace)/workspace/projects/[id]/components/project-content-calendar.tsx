"use client";

import React, { useState, useMemo } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isToday } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ContentPlanModal } from "./content-plan-modal";

interface ProjectContentCalendarProps {
  projectId: string;
  contentPlans: any[];
  readOnly?: boolean;
  guestMode?: boolean;
  guestShareToken?: string;
}

export function ProjectContentCalendar({ projectId, contentPlans, readOnly, guestMode, guestShareToken }: ProjectContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDayClick = (day: Date) => {
    if (readOnly) return;
    setSelectedDate(day);
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handlePlanClick = (e: React.MouseEvent, plan: any) => {
    e.stopPropagation();
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const getPlansForDay = (day: Date) => {
    return contentPlans.filter(p => p.scheduledAt && isSameDay(new Date(p.scheduledAt), day));
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-white text-gray-400 border-[#eaeaea] border-dashed",
    PENDING: "bg-gray-50 text-gray-600 border-[#eaeaea]",
    APPROVED: "bg-white text-black border-black",
    REJECTED: "bg-gray-100 text-gray-400 border-gray-200 line-through",
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 bg-white rounded-2xl shadow-sm border border-[#eaeaea] overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-[#eaeaea] bg-white">
        <div className="flex items-center gap-4">
          <h2 className="text-[18px] font-medium text-black capitalize tracking-tight">
            {format(currentDate, "MMMM yyyy", { locale: vi })}
          </h2>
          <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-[#eaeaea]">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 hover:text-black transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 hover:bg-gray-50 rounded-md text-[12px] font-medium text-black transition-colors">
              Hôm nay
            </button>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-50 rounded-md text-gray-500 hover:text-black transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        {!readOnly && (
          <button 
            onClick={() => { setSelectedPlan(null); setSelectedDate(new Date()); setIsModalOpen(true); }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 h-9 rounded-md text-[13px] font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Tạo bài đăng
          </button>
        )}
      </div>

      <div className="grid grid-cols-7 gap-px bg-[#eaeaea] overflow-hidden flex-1 min-h-[600px]">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
          <div key={day} className="bg-gray-50 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-widest border-b border-[#eaeaea]">
            {day}
          </div>
        ))}
        
        {daysInMonth.map((day, idx) => {
          const plans = getPlansForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={idx}
              onClick={() => handleDayClick(day)}
              className={cn(
                "min-h-[120px] bg-white p-3 transition-colors relative group border-b border-r border-[#eaeaea]",
                !isCurrentMonth && "bg-gray-50/50",
                !readOnly && "hover:bg-gray-50/80 cursor-pointer"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-medium transition-colors",
                  today ? "bg-black text-white shadow-sm" : isCurrentMonth ? "text-black" : "text-gray-300"
                )}>
                  {format(day, "d")}
                </span>
              </div>
              
              <div className="flex flex-col gap-2">
                {plans.map(plan => (
                  <div
                    key={plan.id}
                    onClick={(e) => handlePlanClick(e, plan)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md border text-[12px] font-medium truncate cursor-pointer transition-colors hover:border-black",
                      statusColors[plan.clientStatus || "DRAFT"] || statusColors["DRAFT"]
                    )}
                  >
                    {plan.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <ContentPlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          projectId={projectId}
          initialData={selectedPlan}
          defaultDate={selectedDate}
          readOnly={readOnly}
          guestMode={guestMode}
          guestShareToken={guestShareToken}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Calendar as CalendarIcon, Kanban as KanbanIcon, Table as TableIcon, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ProjectContentCalendar } from "./project-content-calendar";
import { ProjectContentTable } from "./project-content-table";

type ViewMode = "calendar" | "kanban" | "table";

interface ContentOmniViewProps {
  projectId: string;
  contentPlans: any[];
  readOnly?: boolean;
  guestMode?: boolean;
  guestShareToken?: string;
}

export function ContentOmniView({ projectId, contentPlans, readOnly, guestMode, guestShareToken }: ContentOmniViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const views = [
    { id: "calendar", label: "Lịch", icon: CalendarIcon },
    // { id: "kanban", label: "Kanban", icon: KanbanIcon }, // Tạm ẩn theo yêu cầu
    { id: "table", label: "Danh sách", icon: TableIcon },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Omni-View Header */}
      <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
        <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-lg">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setViewMode(view.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                viewMode === view.id
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              )}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm nội dung..." 
              className="pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Lọc
          </button>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-auto bg-slate-50/20">
        {viewMode === "calendar" && (
          <ProjectContentCalendar 
            projectId={projectId} 
            contentPlans={contentPlans}
            readOnly={readOnly}
            guestMode={guestMode}
            guestShareToken={guestShareToken}
          />
        )}
        {viewMode === "kanban" && (
          <div className="p-8 text-center text-slate-500">
            {/* TODO: Kanban View component here */}
            Giao diện Kanban đang được xây dựng...
          </div>
        )}
        {viewMode === "table" && (
          <ProjectContentTable
            projectId={projectId} 
            contentPlans={contentPlans}
            readOnly={readOnly}
            guestMode={guestMode}
            guestShareToken={guestShareToken}
          />
        )}
      </div>
    </div>
  );
}

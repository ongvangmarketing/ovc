import { CalendarDays, Clock, MapPin, Video } from "lucide-react";

import { getStudentLearningPortalData } from "@/lib/training/learning-portals";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" });

export default async function NewStudentSchedulePage() {
  const data = await getStudentLearningPortalData();

  // Group schedules by month or upcoming (just a simple mock grouping for UI)
  const upcomingSchedules = data.schedules; // In a real app, we'd filter these

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-8 animate-in fade-in duration-500">
      
      <header className="mb-8 flex items-end justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch học Live</h1>
          <p className="mt-1 text-sm text-slate-500">Xem lịch các buổi học trực tuyến và ngoại tuyến sắp diễn ra.</p>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2 rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
            <button className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900">Sắp tới</button>
            <button className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">Tháng này</button>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {upcomingSchedules.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 pl-6 space-y-8 ml-3">
            {upcomingSchedules.map((item, index) => {
              const isOnline = item.mode?.toLowerCase() === "online";
              const Icon = isOnline ? Video : MapPin;
              
              return (
                <div key={item.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[35px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-slate-200 transition-colors group-hover:ring-blue-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors" />
                  </div>
                  
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isOnline ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                            <Icon className="h-3 w-3" />
                            {item.mode || "Offline"}
                          </span>
                          <span className="text-sm font-medium text-slate-500">{item.course} · {item.className}</span>
                        </div>
                        <h2 className="mt-3 text-xl font-bold text-slate-900">{item.title}</h2>
                        
                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                              <CalendarDays className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{item.startsAt ? dateFormat.format(new Date(item.startsAt)) : "Chưa xếp lịch"}</div>
                              <div className="text-xs text-slate-500">{item.startsAt ? timeFormat.format(new Date(item.startsAt)) : ""}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">Địa điểm</div>
                              <div className="text-xs text-slate-500">{item.location || "Đang cập nhật"}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {item.onlineUrl ? (
                        <div className="shrink-0 pt-2 sm:pt-0">
                          <a 
                            href={item.onlineUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                          >
                            Vào phòng học
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <CalendarDays className="mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900">Không có lịch học</h3>
            <p className="mt-1 text-sm text-slate-500">Bạn chưa có lịch học nào sắp diễn ra.</p>
          </div>
        )}
      </div>
    </div>
  );
}

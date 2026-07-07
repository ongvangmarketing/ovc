import { CalendarClock, MapPin, MonitorPlay, Plus, UsersRound, Calendar, Clock, Video } from "lucide-react";

import { getInstructorLearningPortalData } from "@/lib/training/learning-portals";
import { createInstructorSchedule } from "../actions";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

export default async function InstructorSchedulePage() {
  const data = await getInstructorLearningPortalData();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 animate-in fade-in duration-500">
      
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CalendarClock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lịch giảng dạy</h1>
            <p className="mt-1 text-sm text-slate-500">Có {data.schedules.length} buổi dạy sắp tới trong lịch trình của bạn.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        
        {/* Timeline (Left) */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Các buổi sắp diễn ra</h2>
          {data.schedules.length > 0 ? (
            <div className="relative border-l-2 border-slate-100 pl-6 space-y-8 ml-3">
              {data.schedules.map((item) => {
                const isOnline = item.mode?.toLowerCase() === "online";
                const Icon = isOnline ? Video : MapPin;
                
                return (
                  <div key={item.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-[35px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-slate-200 transition-colors group-hover:ring-emerald-500">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
                    </div>
                    
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${isOnline ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                              <Icon className="h-3 w-3" />
                              {item.mode || "Offline"}
                            </span>
                            <span className="text-sm font-medium text-slate-500">{item.course}</span>
                          </div>
                          <h3 className="mt-3 text-xl font-bold text-slate-900">{item.title}</h3>
                          
                          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="h-4 w-4 text-emerald-600" />
                              <div>
                                <div className="font-medium text-slate-900">{item.startsAt ? dateFormat.format(new Date(item.startsAt)) : "Chưa xếp lịch"}</div>
                                {item.endsAt && <div className="text-xs text-slate-500">Đến {dateFormat.format(new Date(item.endsAt))}</div>}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <UsersRound className="h-4 w-4 text-emerald-600" />
                              <div>
                                <div className="font-medium text-slate-900">{item.className}</div>
                                <div className="text-xs text-slate-500">{item.location || "Đang cập nhật"}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {item.onlineUrl && (
                          <div className="shrink-0 pt-2 sm:pt-0">
                            <a 
                              href={item.onlineUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
                            >
                              <MonitorPlay className="h-4 w-4" />
                              Mở lớp Online
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <CalendarClock className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900">Không có lịch dạy</h3>
              <p className="mt-1 text-sm text-slate-500">Bạn chưa có lịch dạy nào sắp diễn ra.</p>
            </div>
          )}
        </div>

        {/* Schedule Form (Right) */}
        <div>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" /> Tạo buổi dạy mới
              </h2>
            </div>
            <form action={createInstructorSchedule} className="grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Khóa</span>
                <select name="courseId" required className={fieldClass}>
                  {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Bài học</span>
                <select name="lessonId" required className={fieldClass}>
                  {data.courses.flatMap((course) => course.sections.flatMap((section) => section.lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>{course.title} / {lesson.title}</option>
                  ))))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Lớp</span>
                  <select name="classId" className={fieldClass}>
                    <option value="">Lớp chung</option>
                    {data.courses.flatMap((course) => course.classList.map((item) => <option key={item.id} value={item.id}>{item.name}</option>))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Hình thức</span>
                  <select name="mode" defaultValue="ONLINE" className={fieldClass}>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Tiêu đề buổi dạy</span>
                <input name="title" className={fieldClass} placeholder="VD: Buổi live Q&A" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Bắt đầu</span>
                  <input name="startsAt" type="datetime-local" required className={fieldClass} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Kết thúc</span>
                  <input name="endsAt" type="datetime-local" className={fieldClass} />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Link học Online</span>
                <input name="onlineUrl" className={fieldClass} placeholder="https://meet.google.com/..." />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Địa điểm / Ghi chú</span>
                <input name="location" className={fieldClass} placeholder="Phòng học online OVC" />
              </label>
              <button type="submit" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
                Lên lịch dạy
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

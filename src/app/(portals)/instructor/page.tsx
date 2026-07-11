import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  Presentation,
  UsersRound,
  Video,
} from "lucide-react";

import { getInstructorLearningPortalData } from "@/lib/training/learning-portals";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function formatDate(value: string | null) {
  if (!value) return "Chưa xếp lịch";
  return dateFormat.format(new Date(value));
}

export default async function InstructorDashboard() {
  const data = await getInstructorLearningPortalData();
  const focusCourse = data.courses[0];

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500">
      
      {/* Enterprise SaaS Header */}
      <header className="mb-8 flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50">
            <Presentation className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Chào mừng, {data.user.name}!</h1>
            <p className="mt-1 text-sm text-slate-500">Đây là trung tâm quản lý lớp học và lịch giảng dạy của bạn.</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><Layers3 className="h-4 w-4 text-emerald-500" /> {data.stats.courses} Khóa học</span>
              <span className="flex items-center gap-1.5"><UsersRound className="h-4 w-4 text-blue-500" /> {data.stats.students} Học viên</span>
              <span className="flex items-center gap-1.5"><ClipboardCheck className="h-4 w-4 text-orange-500" /> {data.stats.pendingSubmissions} Bài chờ chấm</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link href="/instructor/schedule" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50">
            <Video className="h-4 w-4" /> Lịch dạy
          </Link>
          <Link href="/instructor/courses" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100">
            <BookOpenCheck className="h-4 w-4" /> Giáo trình
          </Link>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        
        {/* Main Content Column */}
        <div className="space-y-8">
          
          {/* Active Course Section */}
          {focusCourse ? (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Khóa học ưu tiên</h2>
                <Link href="/instructor/courses" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Xem tất cả</Link>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">{focusCourse.status}</span>
                    <h3 className="mt-3 text-xl font-bold text-slate-900">{focusCourse.title}</h3>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{focusCourse.description}</p>
                  </div>
                  <Link href={`/instructor/courses/${focusCourse.id}`} className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
                    Chi tiết <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 mb-1">Lớp học</div>
                    <div className="text-xl font-bold text-slate-900">{focusCourse.classes}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 mb-1">Học viên</div>
                    <div className="text-xl font-bold text-slate-900">{focusCourse.students}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 mb-1">Bài học</div>
                    <div className="text-xl font-bold text-slate-900">{focusCourse.publishedLessons}/{focusCourse.lessons}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <div className="text-xs font-medium text-slate-500 mb-1">Tiến độ TB</div>
                    <div className="text-xl font-bold text-emerald-600">{focusCourse.averageProgress}%</div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <GraduationCap className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-900">Chưa được gán khóa học</h3>
              <p className="mt-1 text-sm text-slate-500">Tài khoản này chưa phụ trách khóa học nào.</p>
            </div>
          )}

          {/* Running Courses */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Các khóa đang vận hành</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.courses.map((course) => (
                <Link key={course.id} href={`/instructor/courses/${course.id}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 line-clamp-1">{course.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Presentation className="h-3.5 w-3.5" /> {course.classes} lớp</span>
                    <span className="flex items-center gap-1.5"><UsersRound className="h-3.5 w-3.5" /> {course.students} HV</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500">Tiến độ TB</span>
                    <span className="text-emerald-600">{course.averageProgress}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${course.averageProgress}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Upcoming Schedule */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 pb-4 border-b border-slate-100">
              <CalendarClock className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Lịch dạy sắp tới</h2>
            </div>
            <div className="space-y-4">
              {data.schedules.length ? data.schedules.map((item) => (
                <Link key={item.id} href={`/instructor/courses/${item.courseId}`} className="group relative block pl-4">
                  <div className="absolute bottom-0 left-0 top-1 w-[2px] rounded-full bg-slate-200 group-hover:bg-emerald-500 transition-colors" />
                  <div className="absolute left-[-3px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
                  <h3 className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">{item.title}</h3>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{formatDate(item.startsAt)}</span>
                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">{item.mode}</span>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-500 truncate">{item.course} · {item.className}</div>
                </Link>
              )) : <div className="text-sm text-slate-500 text-center py-4">Không có lịch dạy sắp tới</div>}
            </div>
          </div>

          {/* Pending Grading */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-slate-400" />
                <h2 className="font-semibold text-slate-900">Bài chờ chấm</h2>
              </div>
              {data.stats.pendingSubmissions > 0 && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">{data.stats.pendingSubmissions}</span>
              )}
            </div>
            <div className="space-y-3">
              {data.submissions.filter(s => s.score === null).slice(0, 5).map((item) => (
                <Link key={item.id} href="/instructor/grading" className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="mt-1 text-[11px] text-slate-500">{item.student}</p>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                  </div>
                </Link>
              ))}
              {data.submissions.filter(s => s.score === null).length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">Tuyệt vời, không còn bài tồn!</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

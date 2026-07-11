import Link from "next/link";
import { BookOpen, Calendar, ChevronRight, Clock, FileText, PlayCircle, User } from "lucide-react";

import { getStudentLearningPortalData } from "@/lib/training/learning-portals";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function formatDate(value: string | null) {
  if (!value) return "Chưa xếp lịch";
  return dateFormat.format(new Date(value));
}

export default async function NewStudentDashboard() {
  const data = await getStudentLearningPortalData();
  const mainCourse = data.courses[0];

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500">
      
      {/* Enterprise SaaS Header */}
      <header className="mb-8 flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50/50">
            <User className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Chào mừng trở lại, {data.user.name}!</h1>
            <p className="mt-1 text-sm text-slate-500">Hãy tiếp tục lộ trình học tập của bạn. Bạn đang làm rất tốt!</p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-blue-500" /> {data.stats.courses} Khóa học</span>
              <span className="flex items-center gap-1.5"><CheckCircleIcon className="h-4 w-4 text-emerald-500" /> {data.stats.completedLessons} Bài hoàn thành</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-orange-500" /> {data.stats.upcomingSchedules} Lịch sắp tới</span>
            </div>
          </div>
        </div>
        
        {/* Overall Progress Widget */}
        <div className="flex min-w-[240px] flex-col items-center justify-center rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <div className="text-sm font-medium text-slate-500">Tiến độ tổng thể</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900">{data.stats.averageProgress}</span>
            <span className="text-lg font-semibold text-slate-400">%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600 transition-all duration-1000" style={{ width: `${data.stats.averageProgress}%` }} />
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        
        {/* Main Content Column */}
        <div className="space-y-8">
          
          {/* Continue Learning Section */}
          {mainCourse ? (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Tiếp tục học</h2>
                <Link href="/student/courses" className="text-sm font-medium text-blue-600 hover:text-blue-700">Xem tất cả</Link>
              </div>
              <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail Placeholder */}
                  <div className="relative flex min-h-[200px] w-full items-center justify-center bg-slate-900 md:w-[320px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <PlayCircle className="relative h-16 w-16 text-white/80 transition group-hover:scale-110 group-hover:text-white" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-xs font-semibold text-white/70">BÀI TIẾP THEO</div>
                      <div className="mt-1 truncate font-medium text-white">{mainCourse.nextLesson}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{mainCourse.status}</span>
                          <h3 className="mt-3 text-xl font-bold text-slate-900">{mainCourse.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">Giảng viên: {mainCourse.instructor}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="w-full md:flex-1">
                        <div className="mb-2 flex items-center justify-between text-sm font-medium">
                          <span className="text-slate-600">Tiến độ khóa học</span>
                          <span className="text-slate-900">{mainCourse.progress}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${mainCourse.progress}%` }} />
                        </div>
                      </div>
                      <Link href={`/student/courses/${mainCourse.courseId}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 w-full md:w-auto justify-center">
                        Vào học ngay <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* Enrolled Courses Grid */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Lộ trình học tập</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {data.courses.map((course) => (
                <Link key={course.id} href={`/student/courses/${course.courseId}`} className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
                  <div>
                    <div className="mb-3 flex items-center gap-3 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {course.completedLessons}/{course.totalLessons} bài</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-2">{course.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 line-clamp-1">{course.className}</p>
                  </div>
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-500">Đã hoàn thành</span>
                      <span className="text-slate-900">{course.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Schedule Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Calendar className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Lịch học sắp tới</h2>
            </div>
            <div className="space-y-4">
              {data.schedules.length ? data.schedules.map((item) => (
                <div key={item.id} className="group relative pl-4">
                  <div className="absolute bottom-0 left-0 top-1 w-[2px] rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
                  <div className="absolute left-[-3px] top-1.5 h-2 w-2 rounded-full border-2 border-white bg-slate-300 group-hover:bg-blue-500 transition-colors" />
                  <h3 className="font-medium text-slate-900">{item.title}</h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> {formatDate(item.startsAt)}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{item.mode}</span>
                    <span className="text-xs text-slate-500 truncate">{item.course}</span>
                  </div>
                </div>
              )) : <div className="text-sm text-slate-500 text-center py-4">Không có lịch học sắp tới</div>}
            </div>
          </div>

          {/* Assignments Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 pb-4 border-b border-slate-100">
              <FileText className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900">Bài tập gần đây</h2>
            </div>
            <div className="space-y-3">
              {data.submissions.length ? data.submissions.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="mt-1 text-[11px] text-slate-500">Nộp: {formatDate(item.submittedAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.score === null ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {item.score === null ? "Chờ chấm" : `${item.score}/${item.maxScore}`}
                    </span>
                  </div>
                </div>
              )) : <div className="text-sm text-slate-500 text-center py-4">Chưa có bài tập nào</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

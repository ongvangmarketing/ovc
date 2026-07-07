import Link from "next/link";
import { BookOpen, Calendar, CheckCircle2, ChevronRight, PlayCircle, Search, Trophy } from "lucide-react";

import { getStudentLearningPortalData } from "@/lib/training/learning-portals";

function cleanText(value?: string | null) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function NewStudentCoursesPage() {
  const data = await getStudentLearningPortalData();

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500">
      
      {/* Header section with search (visual only for now, but feels like an app) */}
      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Khóa học của tôi</h1>
          <p className="mt-1 text-sm text-slate-500">Tiếp tục hành trình học tập và theo dõi tiến độ của bạn.</p>
        </div>
        
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm khóa học..." 
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </header>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {data.courses.map((course) => (
          <div key={course.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
            
            {/* Card Header (Thumbnail replacement) */}
            <div className="relative flex h-40 w-full items-center justify-center bg-slate-900 p-6">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
              <BookOpen className="relative h-12 w-12 text-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:text-white/40" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <Trophy className="h-3.5 w-3.5" />
                  {course.className}
                </span>
                <span className="text-xs font-bold text-white">{course.progress}%</span>
              </div>
            </div>
            
            {/* Card Content */}
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                  {cleanText(course.description) || "Mở phòng học để xem bài, nộp bài tập và đặt câu hỏi cho giảng viên."}
                </p>
              </div>
              
              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {course.completedLessons}/{course.totalLessons} bài
                  </span>
                  <span>Đã học</span>
                </div>
                
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-blue-600 transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                </div>
                
                <Link 
                  href={`/student/courses/${course.courseId}`} 
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white"
                >
                  <PlayCircle className="h-4 w-4" />
                  Vào phòng học
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!data.courses.length ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-900">Chưa có khóa học</h3>
          <p className="mt-1 text-sm text-slate-500">Bạn chưa được gán vào khóa học nào.</p>
        </div>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, BookMarked, ClipboardCheck, PlayCircle, Timer, Video, GraduationCap, FileText, CheckCircle2 } from "lucide-react";

import { getInstructorLearningPortalData } from "@/lib/training/learning-portals";

export default async function InstructorCoursesPage() {
  const data = await getInstructorLearningPortalData();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 animate-in fade-in duration-500">
      
      <header className="mb-8 flex items-end justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <BookMarked className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Khóa học phụ trách</h1>
            <p className="mt-1 text-sm text-slate-500">Quản lý syllabus, tài liệu và tiến độ các khóa học được phân công.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        {data.courses.length ? data.courses.map((course) => (
          <article key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="grid lg:grid-cols-[1fr_350px]">
              
              {/* Course Info */}
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{course.status}</span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{course.level}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{course.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{course.description}</p>
                
                <div className="mt-6 flex flex-wrap gap-6 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{course.classes} Lớp</div>
                      <div className="text-xs text-slate-500">{course.students} Học viên</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      <Video className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{course.publishedLessons}/{course.lessons} Bài</div>
                      <div className="text-xs text-slate-500">Đã publish</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{course.assignments}</div>
                      <div className="text-xs text-slate-500">Bài tập lớn</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link 
                    href={`/instructor/courses/${course.id}`} 
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Vào không gian giảng dạy <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Course Outline Quick View */}
              <div className="bg-slate-50 p-6 border-l border-slate-100 lg:h-full lg:overflow-y-auto">
                <h3 className="mb-4 text-sm font-bold text-slate-900">Nội dung tóm tắt</h3>
                <div className="space-y-4">
                  {course.sections.slice(0, 3).map((section, idx) => (
                    <div key={section.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{idx + 1}. {section.title}</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {section.lessons.slice(0, 2).map(lesson => (
                          <div key={lesson.id} className="flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="truncate">{lesson.title}</span>
                          </div>
                        ))}
                        {section.lessons.length > 2 && (
                          <div className="text-xs text-slate-400 pl-5">+ {section.lessons.length - 2} bài học khác</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {course.sections.length > 3 && (
                    <div className="text-sm font-medium text-emerald-600">
                      Và {course.sections.length - 3} chương khác...
                    </div>
                  )}
                </div>
              </div>

            </div>
          </article>
        )) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <BookMarked className="mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900">Không có khóa học</h3>
            <p className="mt-1 text-sm text-slate-500">Tài khoản này chưa được phân công khóa học nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}

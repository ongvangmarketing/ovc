"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, ClipboardCheck, Edit3, Layout, Layers3, PlayCircle, Plus, Save, UsersRound, Video } from "lucide-react";

import { createInstructorAssignment, createInstructorLesson, createInstructorSection, gradeInstructorSubmission, updateInstructorLesson } from "../../../actions";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

type CourseManagerProps = {
  course: any;
  lessons: any[];
  assignments: any[];
  averageProgress: number;
};

export function CourseManagerApp({ course, lessons, assignments, averageProgress }: CourseManagerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "grading">("overview");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(lessons[0]?.id || null);

  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];

  function getEmbedUrl(url?: string | null) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
    return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
  }

  const embedUrl = getEmbedUrl(activeLesson?.videoUrl);

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] animate-in fade-in duration-500 bg-slate-50">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <Link href="/instructor/courses" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
            <p className="mt-1 text-sm text-slate-500">Quản lý nội dung, bài tập và theo dõi học viên.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "overview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              <Layout className="h-4 w-4" /> Tổng quan
            </button>
            <button 
              onClick={() => setActiveTab("curriculum")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "curriculum" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              <BookOpen className="h-4 w-4" /> Giáo trình
            </button>
            <button 
              onClick={() => setActiveTab("grading")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "grading" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
            >
              <ClipboardCheck className="h-4 w-4" /> Chấm điểm
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 mx-auto w-full max-w-[1400px]">
        
        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm font-medium text-slate-500 mb-1">Số lớp học</div>
                <div className="text-2xl font-bold text-slate-900">{course._count.classes}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm font-medium text-slate-500 mb-1">Học viên</div>
                <div className="text-2xl font-bold text-slate-900">{course._count.enrollments}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-sm font-medium text-slate-500 mb-1">Bài học</div>
                <div className="text-2xl font-bold text-slate-900">{lessons.length}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
                <div className="text-sm font-medium text-emerald-700 mb-1">Tiến độ TB</div>
                <div className="text-2xl font-bold text-emerald-700">{averageProgress}%</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><UsersRound className="h-5 w-5 text-emerald-600" /> Danh sách lớp học</h3>
                <div className="space-y-3">
                  {course.classes.length ? course.classes.map((cls: any) => (
                    <div key={cls.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="font-semibold text-slate-900">{cls.name}</div>
                      <div className="mt-1 flex items-center justify-between text-sm text-slate-500">
                        <span>{cls.code || "Chưa có mã"}</span>
                        <span>{cls._count.enrollments}/{cls.maxStudents} học viên</span>
                      </div>
                    </div>
                  )) : <div className="text-sm text-slate-500">Chưa có lớp nào.</div>}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-600" /> Lịch học sắp tới</h3>
                <div className="space-y-3">
                  {lessons.flatMap(l => l.schedules.map((s: any) => ({ ...s, lessonTitle: l.title }))).slice(0, 5).map((schedule: any) => (
                    <div key={schedule.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="font-semibold text-slate-900">{schedule.title || schedule.lessonTitle}</div>
                      <div className="mt-1 flex items-center justify-between text-sm text-slate-500">
                        <span>{schedule.class?.name || "Lớp chung"}</span>
                        <span className="text-emerald-600 font-medium">{schedule.startsAt ? dateFormat.format(new Date(schedule.startsAt)) : ""}</span>
                      </div>
                    </div>
                  ))}
                  {lessons.flatMap(l => l.schedules).length === 0 && <div className="text-sm text-slate-500">Không có lịch học.</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: CURRICULUM */}
        {activeTab === "curriculum" && (
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            
            {/* Outline Sidebar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-180px)]">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Syllabus</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {course.sections.map((section: any, idx: number) => (
                  <div key={section.id}>
                    <div className="font-medium text-sm text-slate-900 mb-2">{idx + 1}. {section.title}</div>
                    <div className="space-y-1">
                      {section.lessons.map((lesson: any) => (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${activeLessonId === lesson.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          <span className="truncate">{lesson.title}</span>
                          {lesson.isPublished && <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${activeLessonId === lesson.id ? 'text-emerald-600' : 'text-slate-300 group-hover:text-emerald-500'}`} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Builder Area */}
            <div className="space-y-6 h-[calc(100vh-180px)] overflow-y-auto pr-2">
              
              {/* Preview Player */}
              <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-sm flex aspect-video items-center justify-center">
                {embedUrl ? (
                  <iframe className="h-full w-full" src={embedUrl} allowFullScreen />
                ) : (
                  <div className="text-center text-slate-400">
                    <Video className="mx-auto h-10 w-10 mb-2 opacity-50" />
                    <p className="text-sm">Không có video preview</p>
                  </div>
                )}
              </div>

              {/* Edit Current Lesson */}
              {activeLesson && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                    <Edit3 className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900">Sửa bài học hiện tại: {activeLesson.title}</h3>
                  </div>
                  <form action={updateInstructorLesson.bind(null, course.id, activeLesson.id)} className="grid md:grid-cols-2 gap-4">
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">Tiêu đề</span>
                      <input name="title" required defaultValue={activeLesson.title} className={fieldClass} />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">Video URL</span>
                      <input name="videoUrl" defaultValue={activeLesson.videoUrl || ""} className={fieldClass} />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">Loại</span>
                      <select name="type" defaultValue={activeLesson.type} className={fieldClass}>
                        <option value="VIDEO">Video</option>
                        <option value="LIVE">Live</option>
                        <option value="ASSIGNMENT">Assignment</option>
                      </select>
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">Thời lượng (phút)</span>
                      <input name="duration" type="number" min="0" defaultValue={activeLesson.duration || ""} className={fieldClass} />
                    </label>
                    <div className="md:col-span-2 flex gap-4 mt-2">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input name="isPublished" type="checkbox" defaultChecked={activeLesson.isPublished} className="rounded text-emerald-600 focus:ring-emerald-500" />
                        Publish (Hiển thị với học viên)
                      </label>
                    </div>
                    <div className="md:col-span-2 pt-2 border-t border-slate-100 flex justify-end">
                      <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
                        <Save className="h-4 w-4" /> Cập nhật
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Add New Lesson/Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Tạo Học Phần Mới (Section)</h3>
                  <form action={createInstructorSection.bind(null, course.id)} className="space-y-4">
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">Tên học phần</span>
                      <input name="title" required className={fieldClass} placeholder="VD: Chương 1..." />
                    </label>
                    <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                      <Plus className="h-4 w-4" /> Thêm Section
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Tạo Bài Học Mới (Lesson)</h3>
                  <form action={createInstructorLesson.bind(null, course.id)} className="space-y-4">
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">Chọn Học phần</span>
                      <select name="sectionId" required className={fieldClass}>
                        {course.sections.map((sec: any) => <option key={sec.id} value={sec.id}>{sec.title}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="mb-1.5 block text-xs font-semibold text-slate-600">Tên bài học</span>
                      <input name="title" required className={fieldClass} placeholder="Nhập tên..." />
                    </label>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                      <Plus className="h-4 w-4" /> Thêm Lesson
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: GRADING */}
        {activeTab === "grading" && (
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            
            {/* Create Assignment */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 self-start">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Plus className="h-5 w-5 text-emerald-600" /> Tạo bài tập mới</h3>
              <form action={createInstructorAssignment.bind(null, course.id)} className="space-y-4">
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Gắn vào bài học</span>
                  <select name="lessonId" required className={fieldClass}>
                    {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Tên bài tập</span>
                  <input name="title" required className={fieldClass} />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-semibold text-slate-600">Hạn nộp</span>
                  <input name="dueDate" type="date" className={fieldClass} />
                </label>
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  Tạo bài tập
                </button>
              </form>
            </div>

            {/* Submissions List */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Danh sách bài nộp ({assignments.reduce((acc, a) => acc + a.submissions.length, 0)})</h3>
              <div className="grid gap-4">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                      <div className="font-semibold text-slate-900">{assignment.title}</div>
                      <div className="text-xs font-medium text-slate-500">Max: {assignment.maxScore} đ</div>
                    </div>
                    <div className="p-5 space-y-4">
                      {assignment.submissions.length ? assignment.submissions.map((sub: any) => (
                        <div key={sub.id} className="border border-slate-100 rounded-xl p-4 bg-white">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="font-bold text-slate-900">{sub.student.name}</div>
                              <div className="text-xs text-slate-500 mt-0.5">Nộp: {dateFormat.format(new Date(sub.submittedAt))}</div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${sub.score === null ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {sub.score === null ? 'Chờ chấm' : `${sub.score}/${assignment.maxScore}`}
                            </span>
                          </div>
                          {sub.content && <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg mb-3">{sub.content}</div>}
                          
                          <form action={gradeInstructorSubmission} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <input type="hidden" name="submissionId" value={sub.id} />
                            <input name="score" type="number" min="0" max={assignment.maxScore} defaultValue={sub.score ?? ""} required className="w-20 rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-500" placeholder="Điểm" />
                            <input name="feedback" defaultValue={sub.feedback || ""} className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-500" placeholder="Nhập feedback..." />
                            <button type="submit" className="bg-emerald-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors">Lưu</button>
                          </form>
                        </div>
                      )) : <div className="text-sm text-slate-500 text-center py-2">Chưa có bài nộp.</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

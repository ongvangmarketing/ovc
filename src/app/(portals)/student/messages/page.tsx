import { MessageCircle, Send } from "lucide-react";

import { askStudentQuestion } from "@/app/(portals)/student/actions";
import { getStudentLearningPortalData } from "@/lib/training/learning-portals";
import { requireStudentPortal } from "@/lib/auth/rbac";
import { StudentService } from "@/modules/training/services/student.service";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function StudentMessagesPage() {
  const [data, session] = await Promise.all([getStudentLearningPortalData(), requireStudentPortal()]);
  const instructors = Array.from(new Set(data.courses.map((course) => course.instructor)));
  const questions = await StudentService.getLearningQuestions(session.organizationId!, session.user.id, 20);

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 px-5 py-6 lg:px-8">
      <header className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-200/70">
        <MessageCircle className="h-8 w-8 text-blue-600" />
        <h1 className="mt-4 text-3xl font-black text-slate-950">Trao đổi</h1>
        <p className="mt-2 text-sm text-slate-500">Đặt câu hỏi theo khóa học, giảng viên nhận thông báo và phản hồi trong luồng học tập.</p>
      </header>
      <section className="rounded-[28px] border border-white bg-white p-5 shadow-xl shadow-slate-200/70">
        <h2 className="text-xl font-black text-slate-950">Gửi câu hỏi mới</h2>
        <form action={askStudentQuestion} className="mt-5 grid gap-3">
          <select name="courseId" className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300">
            {data.courses.map((course) => <option key={course.courseId} value={course.courseId}>{course.title}</option>)}
          </select>
          <textarea name="question" rows={5} placeholder="Viết câu hỏi cho giảng viên..." className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-300" />
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white">
            <Send className="h-5 w-5" />
            Gửi câu hỏi
          </button>
        </form>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {instructors.map((name) => (
          <article key={name} className="rounded-[24px] border border-white bg-white p-5 shadow-lg shadow-slate-200/70">
            <p className="text-sm text-slate-500">Giảng viên phụ trách</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{name}</h2>
            <p className="mt-3 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">Các câu hỏi gửi từ học viên sẽ tạo thông báo cho giảng viên phụ trách khóa.</p>
          </article>
        ))}
      </div>
      <section className="rounded-[28px] border border-white bg-white p-5 shadow-xl shadow-slate-200/70">
        <h2 className="text-xl font-black text-slate-950">Câu hỏi đã gửi</h2>
        <div className="mt-5 space-y-3">
          {questions.map((question) => (
            <article key={question.id} className="rounded-2xl bg-blue-50 p-4">
              <p className="text-sm font-semibold text-slate-800">{question.description}</p>
              <p className="mt-2 text-xs text-blue-600">{dateFormat.format(question.createdAt)}</p>
            </article>
          ))}
          {!questions.length ? <p className="rounded-2xl border border-dashed border-blue-200 p-6 text-center text-sm text-slate-500">Chưa có câu hỏi nào.</p> : null}
        </div>
      </section>
    </div>
  );
}

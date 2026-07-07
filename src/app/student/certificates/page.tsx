import { Trophy } from "lucide-react";

import { getStudentLearningPortalData } from "@/lib/training/learning-portals";

export default async function StudentCertificatesPage() {
  const data = await getStudentLearningPortalData();
  const completed = data.courses.filter((course) => course.progress >= 100);

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-5 py-6 lg:px-8">
      <header className="rounded-[28px] bg-white p-6 shadow-xl shadow-slate-200/70">
        <Trophy className="h-8 w-8 text-amber-500" />
        <h1 className="mt-4 text-3xl font-black text-slate-950">Chứng chỉ</h1>
        <p className="mt-2 text-sm text-slate-500">Khóa hoàn thành 100% sẽ đủ điều kiện cấp chứng chỉ.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {data.courses.map((course) => (
          <article key={course.id} className="rounded-[24px] border border-white bg-white p-5 shadow-lg shadow-slate-200/70">
            <h2 className="text-xl font-bold text-slate-950">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{course.completedLessons}/{course.totalLessons} bài học · {course.progress}%</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${course.progress}%` }} /></div>
            <p className="mt-4 text-sm font-bold text-slate-700">{course.progress >= 100 ? "Đủ điều kiện cấp chứng chỉ" : "Chưa đủ điều kiện"}</p>
          </article>
        ))}
      </div>
      {!completed.length ? <p className="rounded-3xl border border-dashed border-amber-200 bg-white p-8 text-center text-sm text-slate-500">Chưa có chứng chỉ hoàn thành.</p> : null}
    </div>
  );
}

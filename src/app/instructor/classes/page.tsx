import { Plus, Trash2, UsersRound, Presentation, BarChart } from "lucide-react";

import { requireInstructorPortal } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { getInstructorLearningPortalData } from "@/lib/training/learning-portals";
import { addInstructorStudentToCourse, removeInstructorEnrollment } from "./actions";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

export default async function InstructorClassesPage() {
  const [data, session] = await Promise.all([getInstructorLearningPortalData(), requireInstructorPortal()]);
  const orgStudents = await db.organizationMember.findMany({
    where: { organizationId: session.organizationId, user: { role: "STUDENT", isActive: true } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { user: { name: "asc" } },
  });
  const students = orgStudents.map((item) => item.user);

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 animate-in fade-in duration-500">
      
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UsersRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý lớp & Học viên</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi sĩ số, thêm học viên và quản lý tiến độ các lớp đang phụ trách.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-8">
        {data.courses.length ? data.courses.map((course) => (
          <article key={course.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            
            {/* Course Header Bar */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{course.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">Mã khóa: {course.id.slice(0, 8)}</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-white rounded-lg border border-slate-200 px-4 py-2 flex items-center gap-3">
                    <Presentation className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Số lớp</div>
                      <div className="text-sm font-bold text-slate-900">{course.classes}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 px-4 py-2 flex items-center gap-3">
                    <UsersRound className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Học viên</div>
                      <div className="text-sm font-bold text-slate-900">{course.students}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 px-4 py-2 flex items-center gap-3">
                    <BarChart className="h-4 w-4 text-emerald-500" />
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">Tiến độ</div>
                      <div className="text-sm font-bold text-emerald-600">{course.averageProgress}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              
              {/* Classes List */}
              <div className="p-6 bg-white">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Danh sách Lớp học</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {course.classList.length ? course.classList.map((item) => {
                    const capacity = item.maxStudents || 30;
                    const fillRate = Math.min(100, Math.round((item.students / capacity) * 100));
                    return (
                      <div key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:border-emerald-200">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <strong className="text-slate-900">{item.name}</strong>
                            <p className="mt-1 text-xs text-slate-500">Mã: {item.code || "Chưa có"}</p>
                          </div>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                            {item.isActive ? "Active" : "Closed"}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs font-medium">
                          <span className="text-slate-500">Sĩ số</span>
                          <span className={item.students >= capacity ? "text-orange-600" : "text-slate-900"}>{item.students}/{capacity}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div className={`h-full rounded-full ${item.students >= capacity ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${fillRate}%` }} />
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                          <span>Khai giảng: {item.startDate ? dateFormat.format(new Date(item.startDate)) : "-"}</span>
                          <span>Bế giảng: {item.endDate ? dateFormat.format(new Date(item.endDate)) : "-"}</span>
                        </div>
                      </div>
                    );
                  }) : <div className="text-sm text-slate-500 col-span-2 p-4 text-center border border-dashed rounded-xl border-slate-300">Khóa này chưa có lớp.</div>}
                </div>
              </div>

              {/* Students Management */}
              <div className="p-6 bg-slate-50 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Ghi danh học viên</h3>
                  <p className="text-xs text-slate-500 mt-1">Thêm học viên vào khóa học/lớp cụ thể.</p>
                </div>
                
                <form action={addInstructorStudentToCourse} className="mb-6 grid gap-3 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                  <input type="hidden" name="courseId" value={course.id} />
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Chọn học viên</span>
                    <select name="studentId" required className={fieldClass}>
                      <option value="">-- Chọn học viên --</option>
                      {students.filter((student) => !course.enrolledStudentIds.includes(student.id)).map((student) => (
                        <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Xếp vào lớp (Tùy chọn)</span>
                    <select name="classId" className={fieldClass}>
                      <option value="">-- Để trống nếu học tự do --</option>
                      {course.classList.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700">
                    <Plus className="h-4 w-4" /> Ghi danh
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto pr-2">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                    Học viên gần đây
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 rounded-full">{course.latestStudents.length}</span>
                  </h4>
                  <div className="space-y-2">
                    {course.latestStudents.length ? course.latestStudents.map((student) => (
                      <div key={student.id} className="rounded-lg bg-white p-3 border border-slate-200 shadow-sm flex items-center justify-between group">
                        <div className="min-w-0 pr-3">
                          <strong className="block text-sm font-medium text-slate-900 truncate">{student.name}</strong>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500 truncate max-w-[100px]">{student.className || "Lớp chung"}</span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">{student.progress}%</span>
                          </div>
                        </div>
                        <form action={removeInstructorEnrollment}>
                          <input type="hidden" name="enrollmentId" value={student.enrollmentId} />
                          <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" title="Xóa học viên">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    )) : <div className="text-xs text-center text-slate-400 py-4">Chưa có học viên nào</div>}
                  </div>
                </div>

              </div>
            </div>
          </article>
        )) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <UsersRound className="mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900">Không có lớp học</h3>
            <p className="mt-1 text-sm text-slate-500">Tài khoản instructor này chưa được gán khóa/lớp nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Enrollment } from "@prisma/client";

import type { TrainingFormOptions } from "@/lib/training";

type Action = (formData: FormData) => Promise<void>;

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50";
const labelClass = "space-y-1.5 text-sm font-semibold text-slate-600";

function dateInput(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function money(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") return value.toNumber();
  return Number(value || 0);
}

export function TuitionFormClient({
  action,
  enrollment,
  options,
}: {
  action: Action;
  enrollment?: (Enrollment & { course?: { id: string; title: string; price: unknown }; student?: { id: string; name: string; email: string }; class?: { id: string; name: string } | null }) | null;
  options: TrainingFormOptions;
}) {
  const initialClassId = enrollment?.classId || "";
  const initialCourseId = enrollment?.courseId || options.classes.find((item) => item.id === initialClassId)?.courseId || options.courses[0]?.id || "";
  const initialFee = money(enrollment?.tuitionFee || enrollment?.course?.price || options.classes.find((item) => item.id === initialClassId)?.price || options.courses.find((item) => item.id === initialCourseId)?.price);
  const [courseId, setCourseId] = useState(initialCourseId);
  const [classId, setClassId] = useState(initialClassId);
  const [tuitionFee, setTuitionFee] = useState(String(initialFee || 0));
  const filteredClasses = useMemo(() => options.classes.filter((item) => !courseId || item.courseId === courseId), [courseId, options.classes]);

  function applyCourse(nextCourseId: string) {
    setCourseId(nextCourseId);
    const course = options.courses.find((item) => item.id === nextCourseId);
    setTuitionFee(String(course?.price ?? 0));
    const firstClass = options.classes.find((item) => item.courseId === nextCourseId);
    setClassId(firstClass?.id || "");
  }

  function applyClass(nextClassId: string) {
    setClassId(nextClassId);
    const selectedClass = options.classes.find((item) => item.id === nextClassId);
    if (!selectedClass) return;
    setCourseId(selectedClass.courseId);
    setTuitionFee(String(selectedClass.price || 0));
  }

  return (
    <form action={action} className="quote-panel space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{enrollment ? "Chỉnh sửa gán lớp & học phí" : "Gán lớp & học phí"}</h2>
          <p className="mt-1 text-sm text-slate-500">Chọn học viên, gán vào lớp đang/sắp khai giảng, hệ thống tự lấy học phí và sinh hóa đơn HP bên Tài chính.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/workspace/training/tuition" className="quote-action-button">Quay lại</Link>
          <button type="submit" className="quote-action-button quote-action-primary">Lưu & tạo hóa đơn HP</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>Học viên
          <select name="studentId" required disabled={!!enrollment} defaultValue={enrollment?.studentId || options.students[0]?.id || ""} className={`${inputClass} disabled:bg-slate-50`}>
            {options.students.map((student) => <option key={student.id} value={student.id}>{student.name} - {student.email}</option>)}
          </select>
        </label>
        <label className={labelClass}>Khóa học
          <select name="courseId" required disabled={!!enrollment} value={courseId} onChange={(event) => applyCourse(event.target.value)} className={`${inputClass} disabled:bg-slate-50`}>
            {options.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </label>
        <label className={labelClass}>Lớp đang/sắp khai giảng
          <select name="classId" value={classId} onChange={(event) => applyClass(event.target.value)} className={inputClass}>
            <option value="">Chưa xếp lớp</option>
            {filteredClasses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.courseTitle}{item.startDate ? ` · KG ${new Date(item.startDate).toLocaleDateString("vi-VN")}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>Trạng thái học
          <select name="status" defaultValue={enrollment?.status || "ACTIVE"} className={inputClass}>
            <option value="PENDING">Chờ học</option>
            <option value="ACTIVE">Đang học</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="DROPPED">Đã nghỉ</option>
            <option value="SUSPENDED">Tạm dừng</option>
          </select>
        </label>
        <label className={labelClass}>Học phí tự lấy từ lớp/khóa, có thể sửa
          <input name="tuitionFee" type="number" min="0" value={tuitionFee} onChange={(event) => setTuitionFee(event.target.value)} className={inputClass} />
        </label>
        <label className={labelClass}>Đã thu<input name="paidAmount" type="number" min="0" defaultValue={money(enrollment?.paidAmount)} className={inputClass} /></label>
        <label className={labelClass}>Tiến độ (%)<input name="progress" type="number" min="0" max="100" defaultValue={enrollment?.progress || 0} className={inputClass} /></label>
        <label className={labelClass}>Trạng thái thanh toán
          <select name="paymentStatus" defaultValue={enrollment?.paymentStatus || "unpaid"} className={inputClass}>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="partial">Thanh toán một phần</option>
            <option value="paid">Đã thanh toán</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </label>
        <label className={labelClass}>Ngày bắt đầu<input name="startedAt" type="date" defaultValue={dateInput(enrollment?.startedAt)} className={inputClass} /></label>
        <label className={labelClass}>Ngày hoàn thành<input name="completedAt" type="date" defaultValue={dateInput(enrollment?.completedAt)} className={inputClass} /></label>
        <label className={labelClass}>Ngày cấp chứng chỉ<input name="certificateAt" type="date" defaultValue={dateInput(enrollment?.certificateAt)} className={inputClass} /></label>
        <label className={`${labelClass} md:col-span-2`}>Ghi chú thanh toán<textarea name="paymentNote" defaultValue={enrollment?.paymentNote || ""} rows={4} className={inputClass} /></label>
      </div>
    </form>
  );
}

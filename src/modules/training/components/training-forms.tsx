import { type ReactNode } from "react";
import Link from "next/link";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import type { Class, Course, Enrollment, PotentialStudent, User } from "@prisma/client";

import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { TuitionFormClient } from "./tuition-form-client";

type Action = (formData: FormData) => Promise<void>;

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50";
const labelClass = "space-y-1.5 text-sm font-medium text-slate-600";
const placeholderEmailDomain = "@no-email.ovc.local";

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

function editableEmail(email?: string | null) {
  return email?.endsWith(placeholderEmailDomain) ? "" : email || "";
}

export function FormShell({
  title,
  description,
  backHref,
  children,
  action,
}: {
  title: string;
  description: string;
  backHref: string;
  children: React.ReactNode;
  action: Action;
}) {
  return (
    <form action={action} className="quote-panel space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-[15px] font-medium text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={backHref} className="quote-action-button">Quay lại</Link>
          <button type="submit" className="quote-action-button quote-action-primary">Lưu thay đổi</button>
        </div>
      </div>
      {children}
    </form>
  );
}

export function CourseForm({ action, course, options }: { action: Action; course?: Course | null; options: TrainingTypes.TrainingFormOptions }) {
  return (
    <FormShell title={course ? "Chỉnh sửa khóa học" : "Tạo khóa học"} description="Cấu hình chương trình đào tạo, học phí và giảng viên phụ trách." backHref="/workspace/courses" action={action}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>Tên khóa học<input name="title" required defaultValue={course?.title || ""} className={inputClass} /></label>
        <label className={labelClass}>Giảng viên
          <select name="instructorId" defaultValue={course?.instructorId || options.instructors[0]?.id || ""} className={inputClass}>
            {options.instructors.map((item) => <option key={item.id} value={item.id}>{item.name} - {item.email}</option>)}
          </select>
        </label>
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-slate-700 mb-1">Mô tả</label>
          <TiptapEditor name="description" defaultValue={course?.description || ""} />
        </div>
        <label className={labelClass}>Trạng thái
          <select name="status" defaultValue={course?.status || "DRAFT"} className={inputClass}>
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="ARCHIVED">Lưu trữ</option>
          </select>
        </label>
        <label className={labelClass}>Cấp độ
          <select name="level" defaultValue={course?.level || "beginner"} className={inputClass}>
            <option value="beginner">Cơ bản</option>
            <option value="intermediate">Trung cấp</option>
            <option value="advanced">Nâng cao</option>
          </select>
        </label>
        <label className={labelClass}>Học phí<input name="price" type="number" min="0" defaultValue={money(course?.price)} className={inputClass} /></label>
        <label className={labelClass}>Thời lượng (phút)<input name="duration" type="number" min="0" defaultValue={course?.duration || ""} className={inputClass} /></label>
        <label className={labelClass}>Ngôn ngữ<input name="language" defaultValue={course?.language || "vi"} className={inputClass} /></label>
        <label className={labelClass}>Tiền tệ<input name="currency" defaultValue={course?.currency || "VND"} className={inputClass} /></label>
      </div>
      <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
        <label className="flex items-center gap-2"><input name="isPublic" type="checkbox" defaultChecked={course?.isPublic || false} /> Công khai</label>
        <label className="flex items-center gap-2"><input name="isFeatured" type="checkbox" defaultChecked={course?.isFeatured || false} /> Nổi bật</label>
      </div>
    </FormShell>
  );
}

export function ClassForm({ action, item, options }: { action: Action; item?: (Class & { courseId: string }) | null; options: TrainingTypes.TrainingFormOptions }) {
  return (
    <FormShell title={item ? "Chỉnh sửa lớp học" : "Tạo lớp học"} description="Gắn lớp với khóa học, lịch học, địa điểm và sĩ số." backHref="/workspace/training/classes" action={action}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>Tên lớp<input name="name" required defaultValue={item?.name || ""} className={inputClass} /></label>
        <label className={labelClass}>Mã lớp<input name="code" defaultValue={item?.code || ""} className={inputClass} /></label>
        <label className={labelClass}>Khóa học
          <select name="courseId" required defaultValue={item?.courseId || options.courses[0]?.id || ""} className={inputClass}>
            {options.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </label>
        <label className={labelClass}>Sĩ số tối đa<input name="maxStudents" type="number" min="1" defaultValue={item?.maxStudents || 30} className={inputClass} /></label>
        <label className={labelClass}>Ngày bắt đầu<input name="startDate" type="date" defaultValue={dateInput(item?.startDate)} className={inputClass} /></label>
        <label className={labelClass}>Ngày kết thúc<input name="endDate" type="date" defaultValue={dateInput(item?.endDate)} className={inputClass} /></label>
        <label className={labelClass}>Địa điểm<input name="location" defaultValue={item?.location || ""} className={inputClass} /></label>
        <label className={labelClass}>Lịch học<input name="schedule" defaultValue={typeof item?.schedule === "object" && item?.schedule && "note" in item.schedule ? String(item.schedule.note || "") : ""} className={inputClass} /></label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-600"><input name="isActive" type="checkbox" defaultChecked={item?.isActive ?? true} /> Lớp đang hoạt động</label>
    </FormShell>
  );
}

export function StudentForm({
  action,
  student,
  defaults,
}: {
  action: Action;
  student?: User | null;
  defaults?: { name?: string; email?: string; phone?: string; note?: string };
}) {
  return (
    <FormShell title={student ? "Chỉnh sửa học viên" : "Thêm học viên"} description="Thông tin học viên độc lập theo từng công ty." backHref="/workspace/training/students" action={action}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>Họ tên<input name="name" required defaultValue={student?.name || defaults?.name || ""} className={inputClass} /></label>
        <label className={labelClass}>Email <span className="font-normal text-slate-400">(có thể bổ sung sau)</span><input name="email" type="email" defaultValue={editableEmail(student?.email) || defaults?.email || ""} className={inputClass} /></label>
        <label className={labelClass}>Điện thoại<input name="phone" defaultValue={student?.phone || defaults?.phone || ""} className={inputClass} /></label>
        <label className={labelClass}>Trạng thái
          <select name="isActive" defaultValue={student?.isActive === false ? "off" : "on"} className={inputClass}>
            <option value="on">Đang hoạt động</option>
            <option value="off">Tạm khóa</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-slate-700 mb-1">Ghi chú</label>
          <TiptapEditor name="bio" defaultValue={student?.bio || defaults?.note || ""} />
        </div>
      </div>
    </FormShell>
  );
}

export function InstructorForm({ action, instructor }: { action: Action; instructor?: User | null }) {
  return (
    <FormShell title={instructor ? "Chỉnh sửa giảng viên" : "Thêm giảng viên"} description="Thông tin giảng viên giảng dạy trong công ty hiện tại." backHref="/workspace/training/instructors" action={action}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>Họ tên<input name="name" required defaultValue={instructor?.name || ""} className={inputClass} /></label>
        <label className={labelClass}>Email <span className="font-normal text-slate-400">(có thể bổ sung sau)</span><input name="email" type="email" defaultValue={editableEmail(instructor?.email)} className={inputClass} /></label>
        <label className={labelClass}>Điện thoại<input name="phone" defaultValue={instructor?.phone || ""} className={inputClass} /></label>
        <label className={labelClass}>Trạng thái
          <select name="isActive" defaultValue={instructor?.isActive === false ? "off" : "on"} className={inputClass}>
            <option value="on">Đang hoạt động</option>
            <option value="off">Tạm khóa</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-slate-700 mb-1">Hồ sơ giảng viên</label>
          <TiptapEditor name="bio" defaultValue={instructor?.bio || ""} />
        </div>
      </div>
    </FormShell>
  );
}

export function PotentialStudentForm({ action, student }: { action: Action; student?: PotentialStudent | null }) {
  return (
    <FormShell title={student ? "Chỉnh sửa học viên tiềm năng" : "Thêm học viên tiềm năng"} description="Quản lý nguồn lead, nhu cầu học và lịch chăm sóc." backHref="/workspace/training/potential-students" action={action}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>Họ tên<input name="name" required defaultValue={student?.name || ""} className={inputClass} /></label>
        <label className={labelClass}>Điện thoại<input name="phone" defaultValue={student?.phone || ""} className={inputClass} /></label>
        <label className={labelClass}>Email<input name="email" type="email" defaultValue={student?.email || ""} className={inputClass} /></label>
        <label className={labelClass}>Nguồn<input name="source" defaultValue={student?.source || ""} className={inputClass} /></label>
        <label className={labelClass}>Quan tâm khóa<input name="interestedIn" defaultValue={student?.interestedIn || ""} className={inputClass} /></label>
        <label className={labelClass}>Trạng thái
          <select name="status" defaultValue={student?.status || "new"} className={inputClass}>
            <option value="new">Mới</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="qualified">Tiềm năng</option>
            <option value="converted">Đã chuyển đổi</option>
            <option value="lost">Không phù hợp</option>
          </select>
        </label>
        <label className={labelClass}>Lịch hẹn lại<input name="nextFollowUpAt" type="date" defaultValue={dateInput(student?.nextFollowUpAt)} className={inputClass} /></label>
        <div className="md:col-span-2">
          <label className="block text-[13px] font-medium text-slate-700 mb-1">Ghi chú</label>
          <TiptapEditor name="note" defaultValue={student?.note || ""} />
        </div>
      </div>
    </FormShell>
  );
}

export function TuitionForm({ action, enrollment, options }: { action: Action; enrollment?: (Enrollment & { course?: { id: string; title: string; price: unknown }; student?: { id: string; name: string; email: string }; class?: { id: string; name: string } | null }) | null; options: TrainingTypes.TrainingFormOptions }) {
  return <TuitionFormClient action={action} enrollment={enrollment} options={options} />;
}

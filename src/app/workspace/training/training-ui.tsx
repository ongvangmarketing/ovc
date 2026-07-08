import Link from "next/link";
import { Award, BookOpen, Eye, GraduationCap, Pencil, School, Sparkles, UserCheck, Users, WalletCards } from "lucide-react";

import type { TrainingCertificateRow, TrainingClassRow, TrainingCourseRow, TrainingInstructorRow, TrainingPotentialStudentRow, TrainingScheduleRow, TrainingStudentRow, TrainingTuitionRow } from "@/lib/training";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const courseStatusLabel: Record<string, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
};

const enrollmentStatusLabel: Record<string, string> = {
  PENDING: "Chờ học",
  ACTIVE: "Đang học",
  COMPLETED: "Hoàn thành",
  DROPPED: "Đã nghỉ",
  SUSPENDED: "Tạm dừng",
};

function formatDate(value: string | null) {
  if (!value) return "Chưa cập nhật";
  return dateFormat.format(new Date(value));
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">{label}</div>;
}

function IconLink({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="quote-action-button quote-action-secondary flex h-8 w-8 items-center justify-center p-0" title={title} aria-label={title}>
      {children}
    </Link>
  );
}

export function TrainingHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
          <GraduationCap className="h-4 w-4 text-orange-500" />
          Đào tạo / {title}
        </div>
        <h1 className="text-[15px] font-medium text-slate-950">{title}</h1>
        <p className="mt-1 text-[14px] font-light text-slate-500">{description}</p>
      </div>
      {action ? <div className="flex items-center gap-3">{action}</div> : null}
    </header>
  );
}

export function TrainingTabs({ active }: { active: string }) {
  const items = [
    { id: "overview", label: "Tổng quan", href: "/workspace/training" },
    { id: "students", label: "Học viên", href: "/workspace/training/students" },
    { id: "potential", label: "Học viên tiềm năng", href: "/workspace/training/potential-students" },
    { id: "courses", label: "Khóa học", href: "/workspace/courses" },
    { id: "classes", label: "Lớp học", href: "/workspace/training/classes" },
    { id: "instructors", label: "Giảng viên", href: "/workspace/training/instructors" },
    { id: "calendar", label: "Lịch học", href: "/workspace/training/calendar" },
    { id: "tuition", label: "Học phí", href: "/workspace/training/tuition" },
    { id: "certificates", label: "Chứng chỉ", href: "/workspace/training/certificates" },
  ] as const;

  return (
    <nav className="quote-panel flex gap-2 overflow-x-auto p-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition ${active === item.id ? "bg-orange-500 text-white shadow-sm" : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function TrainingStatCards({ stats }: { stats: { revenue: number; students: number; courses: number; activeClasses: number; instructors: number; certificates: number; tuitionDebt?: number; potentialStudents?: number } }) {
  const items = [
    { label: "Đã thu học phí", value: currency.format(stats.revenue), note: "Theo ghi danh lớp học", icon: WalletCards, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Công nợ học phí", value: currency.format(stats.tuitionDebt || 0), note: "Còn phải thu", icon: WalletCards, tone: "text-red-600 bg-red-50" },
    { label: "Học viên", value: stats.students, note: "Đang quản lý", icon: Users, tone: "text-blue-600 bg-blue-50" },
    { label: "Tiềm năng", value: stats.potentialStudents || 0, note: "Cần chăm sóc", icon: Sparkles, tone: "text-amber-600 bg-amber-50" },
    { label: "Khóa học", value: stats.courses, note: "Chương trình đào tạo", icon: BookOpen, tone: "text-orange-600 bg-orange-50" },
    { label: "Lớp đang mở", value: stats.activeClasses, note: "Đang diễn ra", icon: School, tone: "text-violet-600 bg-violet-50" },
    { label: "Giảng viên", value: stats.instructors, note: "Đội ngũ giảng dạy", icon: UserCheck, tone: "text-rose-600 bg-rose-50" },
    { label: "Chứng chỉ", value: stats.certificates, note: "Đã đủ điều kiện", icon: Award, tone: "text-cyan-600 bg-cyan-50" },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-8">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article key={item.label} className="quote-panel p-4">
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <strong className="mt-2 block text-[15px] font-medium text-slate-950">{item.value}</strong>
            <small className="mt-2 block text-xs font-medium text-emerald-600">{item.note}</small>
          </article>
        );
      })}
    </section>
  );
}

export function TrainingListKpis({ items }: { items: { label: string; value: React.ReactNode; note?: string }[] }) {
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <article key={item.label} className="quote-panel p-4">
          <p className="text-sm font-medium text-slate-500">{item.label}</p>
          <strong className="mt-2 block text-[15px] font-medium text-slate-950">{item.value}</strong>
          {item.note ? <small className="mt-2 block text-xs font-medium text-emerald-600">{item.note}</small> : null}
        </article>
      ))}
    </section>
  );
}

export function CourseTable({ courses }: { courses: TrainingCourseRow[] }) {
  if (!courses.length) return <EmptyState label="Chưa có khóa học nào trong công ty này." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-400">
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3">Khóa học</th>
            <th className="px-4 py-3">Giảng viên</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Lớp/Học viên</th>
            <th className="px-4 py-3 text-right">Học phí</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {courses.map((course) => (
            <tr key={course.id} className="text-slate-700 transition hover:bg-orange-50/40">
              <td className="px-4 py-4">
                <strong className="block text-slate-950">{course.title}</strong>
                <span className="line-clamp-1 text-xs text-slate-500">{course.description}</span>
              </td>
              <td className="px-4 py-4">{course.instructor}</td>
              <td className="px-4 py-4"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">{courseStatusLabel[course.status] || course.status}</span></td>
              <td className="px-4 py-4">{course.classes} lớp · {course.enrollments} học viên</td>
              <td className="px-4 py-4 text-right font-medium text-slate-950">{currency.format(course.price)}</td>
              <td className="px-4 py-4 text-right">
                <div className="inline-flex gap-2">
                  <IconLink href={`/workspace/courses/${course.id}`} title="Vận hành"><Eye className="h-4 w-4" /></IconLink>
                  <IconLink href={`/workspace/courses/${course.id}/edit`} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></IconLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StudentTable({ students }: { students: TrainingStudentRow[] }) {
  if (!students.length) return <EmptyState label="Chưa có học viên nào trong công ty này." />;

  return (
    <div className="grid gap-3">
      {students.map((student) => (
        <article key={student.id} className="grid gap-3 rounded-xl border border-slate-100 bg-white p-4 transition hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-sm sm:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div>
            <strong className="block text-slate-950">{student.name}</strong>
            <span className="text-sm text-slate-500">{student.email} · {student.phone}</span>
          </div>
          <div className="text-sm text-slate-600">{student.enrollments} khóa · {student.active} đang học · {student.completed} hoàn thành</div>
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-500"><span>Tiến độ</span><span>{student.progress}%</span></div>
            <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${student.progress}%` }} /></div>
          </div>
          <div className="flex items-center gap-2">
            <IconLink href={`/workspace/training/students/${student.id}`} title="Xem chi tiết"><Eye className="h-4 w-4" /></IconLink>
            <IconLink href={`/workspace/training/students/${student.id}/edit`} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></IconLink>
          </div>
        </article>
      ))}
    </div>
  );
}

export function PotentialStudentTable({ students }: { students: TrainingPotentialStudentRow[] }) {
  if (!students.length) return <EmptyState label="Chưa có học viên tiềm năng nào trong công ty này." />;

  return (
    <div className="grid gap-3">
      {students.map((student) => (
        <article key={student.id} className="grid gap-3 rounded-xl border border-slate-100 bg-white p-4 transition hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-sm lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
          <div>
            <strong className="block text-slate-950">{student.name}</strong>
            <span className="text-sm text-slate-500">{student.email} · {student.phone}</span>
          </div>
          <div className="text-sm text-slate-600">Nguồn: <b>{student.source}</b><br />Quan tâm: <b>{student.interestedIn}</b></div>
          <div className="text-sm text-slate-600">Trạng thái: <b>{student.status}</b><br />Hẹn lại: <b>{formatDate(student.nextFollowUpAt)}</b></div>
          <div className="text-sm text-slate-500">{student.note}</div>
          <div className="flex items-center gap-2">
            <IconLink href={`/workspace/training/potential-students/${student.id}`} title="Xem chi tiết"><Eye className="h-4 w-4" /></IconLink>
            <IconLink href={`/workspace/training/potential-students/${student.id}/edit`} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></IconLink>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ClassTable({ classes }: { classes: TrainingClassRow[] }) {
  if (!classes.length) return <EmptyState label="Chưa có lớp học nào trong công ty này." />;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {classes.map((item) => (
        <article key={item.id} className="rounded-xl border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <strong className="text-slate-950">{item.name}</strong>
              <p className="mt-1 text-sm text-slate-500">{item.course} · GV: {item.instructor}</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{item.isActive ? "Đang mở" : "Đã đóng"}</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <span>Mã: <b>{item.code}</b></span>
            <span>Thời gian: <b>{formatDate(item.startDate)} - {formatDate(item.endDate)}</b></span>
            <span>Sĩ số: <b>{item.students}/{item.maxStudents}</b></span>
            <span>Địa điểm: <b>{item.location}</b></span>
          </div>
          <div className="mt-4 flex gap-2">
            <IconLink href={`/workspace/training/classes/${item.id}`} title="Xem chi tiết"><Eye className="h-4 w-4" /></IconLink>
            <IconLink href={`/workspace/training/classes/${item.id}/edit`} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></IconLink>
          </div>
        </article>
      ))}
    </div>
  );
}

export function TuitionTable({ tuition }: { tuition: TrainingTuitionRow[] }) {
  if (!tuition.length) return <EmptyState label="Chưa có dữ liệu học phí trong công ty này." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-400">
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3">Học viên</th>
            <th className="px-4 py-3">Khóa/Lớp</th>
            <th className="px-4 py-3">Ngày ghi danh</th>
            <th className="px-4 py-3 text-right">Học phí</th>
            <th className="px-4 py-3 text-right">Đã thu</th>
            <th className="px-4 py-3 text-right">Còn lại</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tuition.map((item) => (
            <tr key={item.id} className="text-slate-700 transition hover:bg-orange-50/40">
              <td className="px-4 py-4"><strong className="block text-slate-950">{item.student}</strong><span className="text-xs text-slate-500">{item.email}</span></td>
              <td className="px-4 py-4"><strong className="block text-slate-800">{item.course}</strong><span className="text-xs text-slate-500">{item.className}</span></td>
              <td className="px-4 py-4">{formatDate(item.enrolledAt)}</td>
              <td className="px-4 py-4 text-right font-medium text-slate-950">{currency.format(item.tuitionFee)}</td>
              <td className="px-4 py-4 text-right font-medium text-emerald-600">{currency.format(item.paidAmount)}</td>
              <td className="px-4 py-4 text-right font-medium text-red-600">{currency.format(item.remainingAmount)}</td>
              <td className="px-4 py-4"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">{item.paymentStatus}</span></td>
              <td className="px-4 py-4 text-right">
                <div className="inline-flex gap-2">
                  <IconLink href={`/workspace/training/tuition/${item.id}`} title="Xem chi tiết"><Eye className="h-4 w-4" /></IconLink>
                  <IconLink href={`/workspace/training/tuition/${item.id}/edit`} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></IconLink>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InstructorTable({ instructors }: { instructors: TrainingInstructorRow[] }) {
  if (!instructors.length) return <EmptyState label="Chưa có giảng viên nào trong công ty này." />;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {instructors.map((item) => (
        <article key={item.id} className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-sm font-medium text-orange-600">{item.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <strong className="block text-slate-950">{item.name}</strong>
              <span className="text-sm text-slate-500">{item.email}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-sm">
            <span><b className="block text-slate-950">{item.courses}</b>Khóa</span>
            <span><b className="block text-slate-950">{item.classes}</b>Lớp</span>
            <span><b className="block text-slate-950">{item.phone}</b>Liên hệ</span>
          </div>
          <div className="mt-4 flex gap-2">
            <IconLink href={`/workspace/training/instructors/${item.id}`} title="Xem chi tiết"><Eye className="h-4 w-4" /></IconLink>
            <IconLink href={`/workspace/training/instructors/${item.id}/edit`} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></IconLink>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ScheduleTable({ schedules }: { schedules: TrainingScheduleRow[] }) {
  if (!schedules.length) return <EmptyState label="Chưa có lịch học nào trong công ty này." />;

  return (
    <div className="grid gap-3">
      {schedules.map((item) => (
        <Link href={`/workspace/training/classes/${item.id}`} key={item.id} className="grid gap-3 rounded-xl border border-slate-100 bg-white p-4 transition hover:border-orange-200 hover:shadow-sm md:grid-cols-[1fr_1fr_1fr]">
          <div>
            <strong className="block text-slate-950">{item.title}</strong>
            <span className="text-sm text-slate-500">{item.course}</span>
          </div>
          <div className="text-sm text-slate-600">GV: <b>{item.instructor}</b><br />{item.schedule}</div>
          <div className="text-sm text-slate-600">{formatDate(item.startDate)} - {formatDate(item.endDate)}<br />{item.location}</div>
        </Link>
      ))}
    </div>
  );
}

export function CertificateTable({ certificates }: { certificates: TrainingCertificateRow[] }) {
  if (!certificates.length) return <EmptyState label="Chưa có học viên đủ điều kiện cấp chứng chỉ." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-400">
          <tr className="border-b border-slate-100">
            <th className="px-4 py-3">Học viên</th>
            <th className="px-4 py-3">Khóa học</th>
            <th className="px-4 py-3">Lớp</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ngày cấp</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {certificates.map((item) => (
            <tr key={item.id} className="text-slate-700">
              <td className="px-4 py-4"><strong className="block text-slate-950">{item.student}</strong><span className="text-xs text-slate-500">{item.email}</span></td>
              <td className="px-4 py-4">{item.course}</td>
              <td className="px-4 py-4">{item.className}</td>
              <td className="px-4 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">{enrollmentStatusLabel[item.status] || item.status} · {item.progress}%</span></td>
              <td className="px-4 py-4">{formatDate(item.issuedAt)}</td>
              <td className="px-4 py-4 text-right">
                <IconLink href={`/workspace/training/tuition/${item.id}`} title="Xem chi tiết"><Eye className="h-4 w-4" /></IconLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TrainingPanel({ title, description, children, href }: { title: string; description?: string; children: React.ReactNode; href?: string }) {
  return (
    <section className="quote-panel">
      <div className="quote-panel-header">
        <div>
          <h2>{title}</h2>
          {description ? <span>{description}</span> : null}
        </div>
        {href ? <Link href={href} className="quote-action-button quote-action-secondary">Xem tất cả</Link> : null}
      </div>
      {children}
    </section>
  );
}

export const trainingIcon = <GraduationCap className="h-5 w-5" />;

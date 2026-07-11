"use client";

import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Mail, Phone, TrendingUp, Users, X } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";
import type { OverviewClass, OverviewCourse, OverviewStudent } from "@/modules/training/types/training-overview.types";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

function formatDate(value: string | null) {
  if (!value) return "Chưa đặt";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

const courseStatusLabel: Record<string, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
};

const courseStatusTone: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PUBLISHED: "bg-orange-100 text-orange-700",
  ARCHIVED: "bg-zinc-100 text-zinc-600",
};

const classStatusLabel: Record<string, string> = {
  upcoming: "Sắp mở",
  opening: "Đang mở",
  full: "Đầy lớp",
  closed: "Đã đóng",
};

const classStatusTone: Record<string, string> = {
  upcoming: "bg-blue-50 text-blue-700",
  opening: "bg-emerald-50 text-emerald-700",
  full: "bg-amber-50 text-amber-700",
  closed: "bg-slate-100 text-slate-600",
};

const studentStatusLabel: Record<string, string> = {
  new: "Mới",
  learning: "Đang học",
  risk: "Cần chăm sóc",
  completed: "Hoàn thành",
};

const studentStatusTone: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  learning: "bg-emerald-50 text-emerald-700",
  risk: "bg-rose-50 text-rose-700",
  completed: "bg-violet-50 text-violet-700",
};

type DrawerItem =
  | { type: "course"; data: OverviewCourse }
  | { type: "class"; data: OverviewClass }
  | { type: "student"; data: OverviewStudent };

interface OverviewItemDrawerProps {
  item: DrawerItem | null;
  onClose: () => void;
  onUpdateCourse?: (id: string, patch: Partial<OverviewCourse>) => void;
  onUpdateClass?: (id: string, patch: Partial<OverviewClass>) => void;
  onUpdateStudent?: (id: string, patch: Partial<OverviewStudent>) => void;
}

export function OverviewItemDrawer({ item, onClose, onUpdateCourse, onUpdateClass, onUpdateStudent }: OverviewItemDrawerProps) {
  if (!item) {
    return <aside className="hidden xl:flex xl:flex-col" aria-hidden />;
  }

  return (
    <aside className="card-base sticky top-4 h-fit overflow-hidden xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
      <DrawerContent item={item} onClose={onClose} onUpdateCourse={onUpdateCourse} onUpdateClass={onUpdateClass} onUpdateStudent={onUpdateStudent} />
    </aside>
  );
}

export function MobileItemDrawer({ item, onClose, onUpdateCourse, onUpdateClass, onUpdateStudent }: OverviewItemDrawerProps) {
  if (!item) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-950/30 p-3 backdrop-blur-sm xl:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="ml-auto flex h-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <DrawerContent item={item} onClose={onClose} onUpdateCourse={onUpdateCourse} onUpdateClass={onUpdateClass} onUpdateStudent={onUpdateStudent} />
      </motion.div>
    </motion.div>
  );
}

function DrawerContent({ item, onClose, onUpdateCourse, onUpdateClass, onUpdateStudent }: OverviewItemDrawerProps & { item: DrawerItem }) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-orange-500">
            {item.type === "course" ? "Khóa học" : item.type === "class" ? "Lớp học" : "Học viên"}
          </p>
          <h2 className="mt-1 truncate text-[15px] font-medium text-slate-950">
            {item.type === "course" ? item.data.title : item.type === "class" ? item.data.name : item.data.name}
          </h2>
        </div>
        <button
          id="close-drawer-btn"
          onClick={onClose}
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {item.type === "course" && (
          <CourseDrawerContent
            course={item.data}
            onUpdate={onUpdateCourse}
          />
        )}
        {item.type === "class" && (
          <ClassDrawerContent
            cls={item.data}
            onUpdate={onUpdateClass}
          />
        )}
        {item.type === "student" && (
          <StudentDrawerContent
            student={item.data}
            onUpdate={onUpdateStudent}
          />
        )}
      </div>
    </div>
  );
}

function CourseDrawerContent({ course, onUpdate }: { course: OverviewCourse; onUpdate?: (id: string, patch: Partial<OverviewCourse>) => void }) {
  const levelLabel: Record<string, string> = { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };
  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-white p-4">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", courseStatusTone[course.status])}>
          {courseStatusLabel[course.status]}
        </span>
        <p className="mt-3 text-sm text-slate-600">{course.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoCard icon={Users} label="Học viên" value={`${course.enrollments} đã đăng ký`} />
        <InfoCard icon={BookOpen} label="Lớp học" value={`${course.classes} lớp`} />
        <InfoCard icon={TrendingUp} label="Học phí" value={currency.format(course.price)} />
        <InfoCard icon={CalendarDays} label="Cấp độ" value={levelLabel[course.level] ?? course.level} />
      </div>

      {onUpdate && (
        <div className="space-y-2">
          <InlineEditField
            label="Giảng viên"
            value={course.instructor}
            onChange={(v) => onUpdate(course.id, { instructor: v })}
          />
        </div>
      )}

      <ActivityFeed items={course.activity} />

      <Link
        href={`/workspace/courses/${course.id}`}
        className="block w-full rounded-xl border border-orange-200 py-2.5 text-center text-sm font-medium text-orange-600 transition hover:bg-orange-50"
      >
        Xem chi tiết →
      </Link>
    </>
  );
}

function ClassDrawerContent({ cls, onUpdate }: { cls: OverviewClass; onUpdate?: (id: string, patch: Partial<OverviewClass>) => void }) {
  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-4">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", classStatusTone[cls.status])}>
          {classStatusLabel[cls.status]}
        </span>
        <p className="mt-3 text-sm text-slate-600">GV: <strong>{cls.instructor}</strong></p>
        <p className="text-sm text-slate-600">Khóa: <strong>{cls.course}</strong></p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoCard icon={Users} label="Sĩ số" value={`${cls.students} / ${cls.maxStudents}`} />
        <InfoCard icon={CalendarDays} label="Khai giảng" value={formatDate(cls.startDate)} />
        <InfoCard icon={CalendarDays} label="Kết thúc" value={formatDate(cls.endDate)} />
        <InfoCard icon={TrendingUp} label="Tỷ lệ" value={`${cls.capacityRate}%`} />
      </div>

      {/* Capacity bar */}
      <div className="rounded-xl bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Sĩ số</span>
          <span className="text-slate-800">{cls.students}/{cls.maxStudents}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              cls.capacityRate >= 100 ? "bg-amber-500" : cls.capacityRate >= 80 ? "bg-orange-500" : "bg-emerald-500"
            )}
            style={{ width: `${Math.min(cls.capacityRate, 100)}%` }}
          />
        </div>
      </div>

      {onUpdate && (
        <InlineEditField
          label="Địa điểm"
          value={cls.location}
          onChange={(v) => onUpdate(cls.id, { location: v })}
        />
      )}

      <ActivityFeed items={cls.activity} />

      <Link
        href={`/workspace/training/classes/${cls.id}`}
        className="block w-full rounded-xl border border-emerald-200 py-2.5 text-center text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
      >
        Xem chi tiết →
      </Link>
    </>
  );
}

function StudentDrawerContent({ student, onUpdate }: { student: OverviewStudent; onUpdate?: (id: string, patch: Partial<OverviewStudent>) => void }) {
  return (
    <>
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-4">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", studentStatusTone[student.status])}>
          {studentStatusLabel[student.status]}
        </span>
        <p className="mt-3 text-sm text-slate-600">{student.note}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InfoCard icon={BookOpen} label="Khóa đăng ký" value={`${student.enrollments} khóa`} />
        <InfoCard icon={Users} label="Đang học" value={`${student.active} khóa`} />
      </div>

      {/* Progress */}
      <div className="rounded-xl bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Tiến độ tổng thể</span>
          <span className="text-[15px] font-medium text-slate-950">{student.progress}%</span>
        </div>
        {onUpdate ? (
          <input
            type="range"
            min={0}
            max={100}
            value={student.progress}
            onChange={(e) => onUpdate(student.id, { progress: Number(e.target.value) })}
            className="w-full accent-orange-500"
          />
        ) : (
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className={cn(
                "h-full rounded-full",
                student.status === "risk" ? "bg-rose-500" : "bg-orange-500"
              )}
              style={{ width: `${Math.min(student.progress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {onUpdate && (
        <div className="grid grid-cols-1 gap-2">
          <InlineEditField label="Email" icon={Mail} value={student.email} onChange={(v) => onUpdate(student.id, { email: v })} />
          <InlineEditField label="Điện thoại" icon={Phone} value={student.phone} onChange={(v) => onUpdate(student.id, { phone: v })} />
          <InlineEditField label="Hành động tiếp theo" icon={TrendingUp} value={student.nextAction} onChange={(v) => onUpdate(student.id, { nextAction: v })} />
        </div>
      )}

      <ActivityFeed items={student.activity} />

      <Link
        href={`/workspace/training/students/${student.id}`}
        className="block w-full rounded-xl border border-blue-200 py-2.5 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-50"
      >
        Xem hồ sơ đầy đủ →
      </Link>
    </>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function InlineEditField({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: typeof Mail;
}) {
  return (
    <label className="block rounded-xl bg-slate-50 p-3">
      <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full bg-transparent text-sm font-medium text-slate-900 outline-none transition hover:text-orange-700 focus:text-slate-900"
      />
    </label>
  );
}

function ActivityFeed({ items }: { items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Activity</h3>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={`${item}-${i}`} className="flex items-start gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm text-slate-600">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

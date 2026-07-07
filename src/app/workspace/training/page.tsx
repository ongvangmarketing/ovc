import type { Metadata } from "next";

import { getTrainingOverview } from "@/lib/training";
import { TrainingOverviewWorkspace } from "./training-overview-workspace";
import type { OverviewAlert, OverviewClass, OverviewCourse, OverviewStat, OverviewStudent, TrainingOverviewData } from "./training-overview.types";

export const metadata: Metadata = { title: "Đào tạo" };
export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  let initialData: Partial<TrainingOverviewData> = {};

  try {
    const data = await getTrainingOverview();
    const now = Date.now();

    // ─── Map server courses → workspace type ───────────────────────────────
    const courses: OverviewCourse[] = data.courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      instructor: c.instructor,
      instructorId: "",
      status: c.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      level: (c.level ?? "beginner") as "beginner" | "intermediate" | "advanced",
      classes: c.classes,
      enrollments: c.enrollments,
      price: c.price,
      language: "vi",
      isPublic: true,
      isFeatured: false,
      activity: [`${c.enrollments} học viên`, `${c.classes} lớp`],
    }));

    // ─── Map server classes → workspace type ───────────────────────────────
    const classes: OverviewClass[] = data.classes.map((cl) => {
      const start = cl.startDate ? new Date(cl.startDate).getTime() : null;
      const end = cl.endDate ? new Date(cl.endDate).getTime() : null;
      let status: OverviewClass["status"] = "opening";
      if (!cl.isActive || (end && end < now)) status = "closed";
      else if (cl.maxStudents > 0 && cl.students >= cl.maxStudents) status = "full";
      else if (start && start > now) status = "upcoming";
      const capacityRate = cl.maxStudents > 0 ? Math.round((cl.students / cl.maxStudents) * 100) : 0;
      return {
        id: cl.id,
        name: cl.name,
        code: cl.code,
        course: cl.course,
        courseId: "",
        instructor: cl.instructor,
        startDate: cl.startDate,
        endDate: cl.endDate,
        location: cl.location,
        maxStudents: cl.maxStudents,
        students: cl.students,
        isActive: cl.isActive,
        status,
        capacityRate,
        nextAction: status === "upcoming" ? "Mở đăng ký học viên" : status === "full" ? "Đóng đăng ký" : status === "closed" ? "Cấp chứng chỉ" : "Theo dõi tiến độ",
        activity: [`${cl.students}/${cl.maxStudents} học viên`, cl.isActive ? "Đang vận hành" : "Đã đóng"],
      };
    });

    // ─── Map server students → workspace type ─────────────────────────────
    const students: OverviewStudent[] = data.students.map((s) => {
      let status: OverviewStudent["status"] = "new";
      if (s.enrollments > 0 && s.progress < 25) status = "risk";
      else if (s.active > 0) status = "learning";
      else if (s.completed > 0) status = "completed";
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        enrollments: s.enrollments,
        active: s.active,
        completed: s.completed,
        progress: s.progress,
        status,
        owner: status === "risk" ? "CSKH Đào tạo" : "Training OVC",
        nextAction: status === "risk" ? "Gọi nhắc lịch học" : status === "new" ? "Gán khóa học phù hợp" : status === "completed" ? "Chuẩn bị chứng chỉ" : "Theo dõi tiến độ",
        note: `${s.enrollments} lượt ghi danh · ${s.active} đang học · Tiến độ ${s.progress}%`,
        activity: [`Tiến độ ${s.progress}%`, `${s.enrollments} ghi danh`, s.active > 0 ? "Đang học" : "Không đang học"],
      };
    });

    // ─── Build alerts from real data ──────────────────────────────────────
    const unpaidCount = data.tuition.filter((t) => t.remainingAmount > 0).length;
    const newLeads = data.potentialStudents.filter((p) => ["new", "NEW"].includes(p.status)).length;
    const noClassCourses = data.courses.filter((c) => c.classes === 0).length;
    const alerts: OverviewAlert[] = [
      unpaidCount ? { id: "alert-tuition", label: `${unpaidCount} học phí còn công nợ chưa thu`, href: "/workspace/training/tuition", tone: "red" as const, icon: "CircleDollarSign" } : null,
      newLeads ? { id: "alert-leads", label: `${newLeads} học viên tiềm năng cần chăm sóc`, href: "/workspace/training/potential-students", tone: "amber" as const, icon: "AlertCircle" } : null,
      noClassCourses ? { id: "alert-noclass", label: `${noClassCourses} khóa học chưa có lớp vận hành`, href: "/workspace/courses", tone: "orange" as const, icon: "BookOpen" } : null,
      !data.schedules.length ? { id: "alert-schedule", label: "Chưa có lịch học hoặc buổi học nào", href: "/workspace/training/calendar", tone: "blue" as const, icon: "CalendarClock" } : null,
    ].filter(Boolean) as OverviewAlert[];

    // ─── Build stat cards ────────────────────────────────────────────────
    const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
    const stats: OverviewStat[] = [
      { id: "revenue", label: "Đã thu học phí", value: currency.format(data.stats.revenue), note: "Theo ghi danh lớp học", tone: "text-emerald-600 bg-emerald-50", icon: "WalletCards" },
      { id: "debt", label: "Công nợ học phí", value: currency.format(data.stats.tuitionDebt ?? 0), note: "Còn phải thu", tone: "text-red-600 bg-red-50", icon: "WalletCards" },
      { id: "students", label: "Học viên", value: data.stats.students, note: "Đang quản lý", tone: "text-blue-600 bg-blue-50", icon: "Users" },
      { id: "leads", label: "Tiềm năng", value: data.stats.potentialStudents ?? 0, note: "Cần chăm sóc", tone: "text-amber-600 bg-amber-50", icon: "Sparkles" },
      { id: "courses", label: "Khóa học", value: data.stats.courses, note: "Chương trình đào tạo", tone: "text-orange-600 bg-orange-50", icon: "BookOpen" },
      { id: "classes", label: "Lớp đang mở", value: data.stats.activeClasses, note: "Đang diễn ra", tone: "text-violet-600 bg-violet-50", icon: "School" },
      { id: "instructors", label: "Giảng viên", value: data.stats.instructors, note: "Đội ngũ giảng dạy", tone: "text-rose-600 bg-rose-50", icon: "UserCheck" },
      { id: "certs", label: "Chứng chỉ", value: data.stats.certificates, note: "Đã đủ điều kiện", tone: "text-cyan-600 bg-cyan-50", icon: "Award" },
    ];

    initialData = { courses, classes, students, alerts, stats };
  } catch {
    // Fall back to mock data in client workspace
  }

  return <TrainingOverviewWorkspace initialData={initialData} />;
}


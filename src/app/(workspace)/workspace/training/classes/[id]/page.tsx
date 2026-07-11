import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3, Download, Eye, GraduationCap, Mail, MapPin, MoreHorizontal, Pencil, Phone, Plus, ReceiptText, Search, UserRound, UserRoundCheck, Users } from "lucide-react";

import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { classMockData } from "../classes.mock";
import { EnrollStudentModal } from "./enroll-student-modal";

export const metadata: Metadata = { title: "Chi tiết lớp học" };
export const dynamic = "force-dynamic";

const moneyFormat = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const monthFormat = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" });
const weekdayFormat = new Intl.DateTimeFormat("vi-VN", { weekday: "short" });

function formatDate(value?: Date | string | null) {
  if (!value) return "--";
  return dateFormat.format(new Date(value));
}

function formatDateTime(value?: Date | string | null) {
  if (!value) return "Chưa đặt lịch";
  return dateTimeFormat.format(new Date(value));
}

function formatMonth(value?: Date | string | null) {
  return monthFormat.format(value ? new Date(value) : new Date());
}

function formatWeekday(value?: Date | string | null) {
  if (!value) return "--";
  return weekdayFormat.format(new Date(value)).replace(".", "").toUpperCase();
}

function formatDay(value?: Date | string | null) {
  if (!value) return "--";
  return String(new Date(value).getDate());
}

function formatMoney(value: unknown) {
  return moneyFormat.format(Number(value || 0));
}

function classStatusLabel(isActive: boolean) {
  return isActive ? "Đang mở" : "Đã đóng";
}

type TrainingClassDetail = NonNullable<Awaited<ReturnType<typeof TrainingService.getTrainingClassDetail>>>;

function getMockClassDetail(id: string): TrainingClassDetail | null {
  const mockClass = classMockData.find((item) => item.id === id);
  if (!mockClass) return null;

  const now = new Date();
  return {
    id: mockClass.id,
    name: mockClass.name,
    code: mockClass.code,
    courseId: `course-${mockClass.id}`,
    startDate: mockClass.startDate ? new Date(mockClass.startDate) : null,
    endDate: mockClass.endDate ? new Date(mockClass.endDate) : null,
    location: mockClass.location,
    schedule: null,
    maxStudents: mockClass.maxStudents,
    isActive: mockClass.isActive,
    createdAt: now,
    updatedAt: now,
    course: {
      id: `course-${mockClass.id}`,
      organizationId: "mock",
      instructorId: `instructor-${mockClass.id}`,
      title: mockClass.course,
      description: "",
      status: "PUBLISHED",
      level: "beginner",
      price: 0,
      currency: "VND",
      duration: null,
      thumbnail: null,
      content: null,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
      instructor: {
        id: `instructor-${mockClass.id}`,
        name: mockClass.instructor,
        email: "training@ongvang.com.vn",
        phone: null,
      },
    },
    enrollments: [],
    lessonSchedules: [],
    _count: {
      enrollments: mockClass.students,
      attendances: 0,
    },
  } as unknown as TrainingClassDetail;
}

export default async function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = (await TrainingService.getTrainingClassDetail(id).catch(() => null)) ?? getMockClassDetail(id);
  if (!item) notFound();
  const detail = item as any;
  const isMockClass = id.startsWith("mock-");

  const enrollments = detail.enrollments as any[];
  const lessonSchedules = detail.lessonSchedules as any[];
  const studentCount = detail._count?.enrollments ?? enrollments.length;
  const capacityRate = detail.maxStudents ? Math.min(100, Math.round((studentCount / detail.maxStudents) * 100)) : 0;
  const coursePrice = Number(detail.course.price || 0);
  const expectedRevenue = coursePrice * studentCount;
  const activeEnrollments = enrollments.filter((enrollment) => enrollment.status === "ACTIVE").length;
  const completedEnrollments = enrollments.filter((enrollment) => enrollment.status === "COMPLETED").length;
  const scheduleMonth = formatMonth(lessonSchedules[0]?.startsAt || item.startDate);

  return (
    <div className="page-container mx-auto max-w-[1500px] space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/workspace/training/classes" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50" title="Quay lại">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-[15px] font-medium text-slate-950">{item.name}</h1>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{classStatusLabel(item.isActive)}</span>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-500">{item.code || "Chưa có mã lớp"} · {detail.course.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isMockClass ? (
              <Link href={`/workspace/training/classes/${item.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                <Pencil className="h-4 w-4" /> Chỉnh sửa
              </Link>
            ) : null}
            {!isMockClass && (
              <EnrollStudentModal
                classId={item.id}
                className={item.name}
                courseName={detail.course.title}
              />
            )}
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50" title="Thêm thao tác">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <section className="grid rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <InfoBlock label="Khóa học" value={detail.course.title} detail={`Học phí: ${formatMoney(detail.course.price)}`} icon={<BookOpen className="h-5 w-5" />} />
        <InfoBlock label="Giảng viên" value={detail.course.instructor.name} detail={detail.course.instructor.email || "Chưa có email"} icon={<UserRoundCheck className="h-5 w-5" />} />
        <InfoBlock label="Sĩ số" value={`${studentCount}/${item.maxStudents}`} detail={`Tỷ lệ lấp đầy ${capacityRate}%`} icon={<Users className="h-5 w-5" />} />
        <InfoBlock label="Khai giảng" value={formatDate(item.startDate)} detail={item.location || "Chưa có địa điểm"} icon={<CalendarDays className="h-5 w-5" />} isLast />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-medium text-slate-900">Tiến trình lớp học</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              <ProgressStep active label="Tạo lớp" />
              <ProgressStep active={studentCount > 0} label="Ghi danh" />
              <ProgressStep active={Boolean(item.startDate && new Date(item.startDate) <= new Date())} label="Khai giảng" />
              <ProgressStep active={completedEnrollments > 0 && completedEnrollments === studentCount} label="Hoàn thành" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-medium text-slate-900">Học viên trong lớp</h2>
                <p className="mt-1 text-sm text-slate-500">{enrollments.length} học viên đang được quản lý trong lớp này.</p>
              </div>
              <Link href="/workspace/training/tuition/create" className="inline-flex h-9 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 text-sm font-medium text-orange-600 transition hover:bg-orange-100">
                <Plus className="h-4 w-4" /> Ghi danh
              </Link>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium text-slate-500">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Học viên</th>
                    <th className="px-4 py-3">Liên hệ</th>
                    <th className="px-4 py-3">Tiến độ</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Học phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.length ? enrollments.map((enrollment, index) => (
                    <tr key={enrollment.id} className="transition hover:bg-orange-50/40">
                      <td className="px-4 py-4 text-slate-500">{index + 1}</td>
                      <td className="px-4 py-4">
                        <Link href={`/workspace/training/tuition/${enrollment.id}`} className="font-medium text-slate-950 hover:text-orange-600">{enrollment.student.name}</Link>
                        <p className="mt-1 text-xs text-slate-500">Ghi danh: {formatDate(enrollment.createdAt)}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" />{enrollment.student.email}</div>
                        <div className="mt-1 flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" />{enrollment.student.phone || "Chưa có số"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500"><span>{enrollment.progress}%</span></div>
                        <div className="mt-2 h-2 w-28 rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${enrollment.progress}%` }} /></div>
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={enrollment.status} /></td>
                      <td className="px-4 py-4 text-right font-medium text-slate-950">{formatMoney(enrollment.tuitionFee)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Chưa có học viên trong lớp.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-medium text-slate-900">Lịch học chi tiết</h2>
                  <p className="mt-1 text-sm text-slate-500">Theo dõi lịch học riêng của lớp {item.name}.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-medium text-white">Tất cả lịch</span>
                  <span className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600">Lịch theo Lớp</span>
                  <span className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600">Lịch theo Buổi</span>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-[15px] font-medium capitalize text-slate-950">{scheduleMonth}</h3>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100" title="Tháng trước">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100" title="Tháng sau">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="Tìm lớp, giảng viên..." readOnly />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4">
              <div className="mx-auto grid max-w-5xl gap-4">
                {lessonSchedules.length ? lessonSchedules.map((schedule) => (
                  <article key={schedule.id} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm md:grid-cols-[92px_minmax(0,1fr)_260px] md:items-center">
                    <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-slate-50 text-center">
                      <span className="text-xs font-medium uppercase text-slate-500">{formatWeekday(schedule.startsAt)}</span>
                      <span className="text-[15px] font-medium text-slate-950">{formatDay(schedule.startsAt)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-extrabold uppercase text-emerald-700">Lịch theo lớp</span>
                        {schedule.mode === "ONLINE" ? <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-extrabold uppercase text-blue-700">Online</span> : null}
                      </div>
                      <h3 className="truncate text-base font-medium text-slate-950">{schedule.title || item.name}</h3>
                      <p className="mt-1 truncate text-sm text-slate-500">{schedule.lesson.title || detail.course.title}</p>
                    </div>
                    <div className="grid gap-2 text-sm text-slate-600 md:justify-items-end">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-slate-400" />
                        <span>{schedule.startsAt ? formatDateTime(schedule.startsAt) : "Đã cấu hình"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-slate-400" />
                        <span>{schedule.instructor?.name || detail.course.instructor.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{schedule.location || schedule.onlineUrl || schedule.fieldAddress || item.location || "Chưa cập nhật"}</span>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                    <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-500">Chưa có lịch học cho lớp này.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <SideCard title="Thông tin lớp học">
            <SideRow label="Mã lớp" value={item.code || "--"} />
            <SideRow label="Ngày bắt đầu" value={formatDate(item.startDate)} />
            <SideRow label="Ngày kết thúc" value={formatDate(item.endDate)} />
            <SideRow label="Trạng thái" value={classStatusLabel(item.isActive)} />
            <SideRow label="Đang học" value={`${activeEnrollments} học viên`} />
            <SideRow label="Điểm danh" value={`${detail._count?.attendances ?? 0} lượt`} />
          </SideCard>

          <SideCard title="Giá trị & học phí">
            <SideRow label="Học phí / HV" value={formatMoney(detail.course.price)} />
            <SideRow label="Số học viên" value={`${studentCount}`} />
            <SideRow label="Dự kiến" value={formatMoney(expectedRevenue)} strong />
            <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${capacityRate}%` }} /></div>
            <p className="mt-3 text-sm text-slate-500">{capacityRate}% sĩ số đã sử dụng</p>
          </SideCard>

          <SideCard title="Tài liệu lớp học">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
              <ReceiptText className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="mt-3 font-medium text-slate-950">{item.code || item.name}</p>
              <p className="mt-1 text-sm text-slate-500">{detail.course.title}</p>
            </div>
            <button type="button" className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
              <Download className="h-4 w-4" /> Tải xuống
            </button>
          </SideCard>

          <SideCard title="Thao tác">
            {!isMockClass ? <ActionLink href={`/workspace/training/classes/${item.id}/edit`} icon={<Pencil className="h-4 w-4" />} label="Chỉnh sửa lớp" /> : null}
            <ActionLink href="/workspace/training/tuition/create" icon={<Plus className="h-4 w-4" />} label="Ghi danh học viên" />
            <ActionLink href={`/workspace/courses/${detail.course.id}`} icon={<Eye className="h-4 w-4" />} label="Xem khóa học" />
          </SideCard>
        </aside>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, detail, icon, isLast = false }: { label: string; value: string; detail: string; icon: React.ReactNode; isLast?: boolean }) {
  return (
    <div className={`flex gap-4 p-4 ${isLast ? "" : "border-b border-slate-200 md:border-r xl:border-b-0"}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 truncate font-medium text-slate-950">{value}</p>
        <p className="mt-1 truncate text-sm text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function ProgressStep({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-7 w-7 items-center justify-center rounded-full ${active ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"}`}>
        <Check className="h-4 w-4" />
      </span>
      <span className={`text-sm font-medium ${active ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = { PENDING: "Chờ học", ACTIVE: "Đang học", COMPLETED: "Hoàn thành", DROPPED: "Đã nghỉ", SUSPENDED: "Tạm dừng" };
  const tone = status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : status === "COMPLETED" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{label[status] || status}</span>;
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-medium text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SideRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right ${strong ? "font-medium text-slate-950" : "font-medium text-slate-700"}`}>{value}</span>
    </div>
  );
}

function ActionLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
      {icon} {label}
    </Link>
  );
}

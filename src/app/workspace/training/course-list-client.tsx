"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MoreHorizontal, Pencil } from "lucide-react";

import type { TrainingCourseRow } from "@/lib/training";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

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

export function CourseListClient({ courses }: { courses: TrainingCourseRow[] }) {
  const router = useRouter();

  if (!courses.length) {
    return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">Chưa có khóa học nào trong công ty này.</div>;
  }

  return (
    <div className="overflow-x-auto scrollable-x">
      <table className="w-full min-w-[760px] text-sm [&_td]:!px-3 [&_td]:!py-2.5 [&_th]:!px-3 [&_th]:!py-2.5">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Khóa học</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Giảng viên</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Trạng thái</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Lớp/Học viên</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Học phí</th>
            <th className="py-3 px-4 w-28"></th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const href = `/workspace/courses/${course.id}`;
            return (
              <tr key={course.id} onClick={() => router.push(href)} className="cursor-pointer border-b border-border last:border-0 table-row-hover">
                <td className="whitespace-nowrap py-3 px-4">
                  <Link href={href} className="text-sm font-semibold text-blue-600 hover:underline" onClick={(event) => event.stopPropagation()}>
                    {course.title}
                  </Link>
                  <p className="mt-1 max-w-[280px] truncate text-xs text-muted-foreground">{course.description}</p>
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-muted-foreground">{course.instructor}</td>
                <td className="py-3 px-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${courseStatusTone[course.status] || courseStatusTone.DRAFT}`}>
                    {courseStatusLabel[course.status] || course.status}
                  </span>
                </td>
                <td className="whitespace-nowrap py-3 px-4 text-sm text-muted-foreground">{course.classes} lớp · {course.enrollments} học viên</td>
                <td className="whitespace-nowrap py-3 px-4 text-sm font-semibold text-foreground">{currency.format(course.price)}</td>
                <td className="py-3 px-4" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={href} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-blue-50 hover:text-blue-600" title="Vận hành">
                      <Eye className="h-3.5 w-3.5" />
                    </Link>
                    <Link href={`/workspace/courses/${course.id}/edit`} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-orange-50 hover:text-orange-600" title="Chỉnh sửa">
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground" title="Thao tác">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

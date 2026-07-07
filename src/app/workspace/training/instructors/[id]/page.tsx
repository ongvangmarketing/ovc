import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { resendTrainingInstructorPortal } from "@/app/actions/training";
import { getTrainingInstructorDetail } from "@/lib/training";
import { TrainingHeader, TrainingPanel } from "../../training-ui";

export const metadata: Metadata = { title: "Chi tiết giảng viên" };
export const dynamic = "force-dynamic";

export default async function InstructorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instructor = await getTrainingInstructorDetail(id);
  if (!instructor) notFound();
  const hasEmail = !instructor.email.endsWith("@no-email.ovc.local");
  const email = hasEmail ? instructor.email : "Chưa có email";
  const portalAction = resendTrainingInstructorPortal.bind(null, instructor.id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader
        title={instructor.name}
        description={`${email} · ${instructor.phone || "Chưa cập nhật điện thoại"}`}
        action={(
          <div className="flex flex-wrap gap-2">
            {hasEmail ? (
              <form action={portalAction}>
                <button type="submit" className="quote-action-button quote-action-primary">Cấp lại Portal</button>
              </form>
            ) : (
              <Link href={`/workspace/training/instructors/${instructor.id}/edit`} className="quote-action-button quote-action-secondary">Bổ sung email để cấp Portal</Link>
            )}
            <Link href={`/workspace/training/instructors/${instructor.id}/edit`} className="quote-action-button">Chỉnh sửa</Link>
          </div>
        )}
      />
      <section className="grid gap-4 md:grid-cols-3">
        <div className="quote-panel"><p className="text-sm text-slate-500">Khóa phụ trách</p><strong className="mt-2 block text-xl">{instructor.instructorCourses.length}</strong></div>
        <div className="quote-panel"><p className="text-sm text-slate-500">Trạng thái</p><strong className="mt-2 block text-xl">{instructor.isActive ? "Đang hoạt động" : "Tạm khóa"}</strong></div>
        <div className="quote-panel"><p className="text-sm text-slate-500">Hồ sơ</p><strong className="mt-2 block text-xl">{instructor.bio || "Chưa có"}</strong></div>
      </section>
      <TrainingPanel title="Khóa đang phụ trách" description={`${instructor.instructorCourses.length} khóa`}>
        <div className="divide-y divide-slate-100">
          {instructor.instructorCourses.map((course) => (
            <Link key={course.id} href={`/workspace/courses/${course.id}`} className="flex items-center justify-between py-3 text-sm hover:text-orange-600">
              <span><b>{course.title}</b> · {course.status}</span>
              <span>{course._count.classes} lớp · {course._count.enrollments} học viên</span>
            </Link>
          ))}
        </div>
      </TrainingPanel>
    </div>
  );
}

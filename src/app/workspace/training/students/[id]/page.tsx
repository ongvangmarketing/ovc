import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { resendTrainingStudentPortal } from "@/app/actions/training";
import { getTrainingStudentDetail } from "@/lib/training";
import { TrainingHeader, TrainingPanel } from "../../training-ui";

export const metadata: Metadata = { title: "Chi tiết học viên" };
export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getTrainingStudentDetail(id);
  if (!student) notFound();
  const hasEmail = !student.email.endsWith("@no-email.ovc.local");
  const email = hasEmail ? student.email : "Chưa có email";
  const portalAction = resendTrainingStudentPortal.bind(null, student.id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader
        title={student.name}
        description={`${email} · ${student.phone || "Chưa cập nhật điện thoại"}`}
        action={(
          <div className="flex flex-wrap gap-2">
            <Link href={`/workspace/training/tuition/create?studentId=${student.id}`} className="quote-action-button quote-action-primary">Gán lớp & học phí</Link>
            {hasEmail ? (
              <form action={portalAction}>
                <button type="submit" className="quote-action-button quote-action-secondary">Cấp lại Portal</button>
              </form>
            ) : (
              <Link href={`/workspace/training/students/${student.id}/edit`} className="quote-action-button quote-action-secondary">Bổ sung email để cấp Portal</Link>
            )}
            <Link href={`/workspace/training/students/${student.id}/edit`} className="quote-action-button">Chỉnh sửa</Link>
          </div>
        )}
      />
      <section className="grid gap-4 md:grid-cols-3">
        <div className="quote-panel"><p className="text-sm text-slate-500">Số khóa</p><strong className="mt-2 block text-xl">{student.enrollments.length}</strong></div>
        <div className="quote-panel"><p className="text-sm text-slate-500">Trạng thái</p><strong className="mt-2 block text-xl">{student.isActive ? "Đang hoạt động" : "Tạm khóa"}</strong></div>
        <div className="quote-panel"><p className="text-sm text-slate-500">Ghi chú</p><strong className="mt-2 block text-xl">{student.bio || "Chưa có"}</strong></div>
      </section>
      <TrainingPanel title="Khóa đang học" description={`${student.enrollments.length} lượt ghi danh`}>
        <div className="divide-y divide-slate-100">
          {student.enrollments.map((enrollment) => (
            <Link key={enrollment.id} href={`/workspace/training/tuition/${enrollment.id}`} className="flex items-center justify-between py-3 text-sm hover:text-orange-600">
              <span><b>{enrollment.course.title}</b> · {enrollment.class?.name || "Chưa xếp lớp"}</span>
              <span>{enrollment.status} · {enrollment.progress}%</span>
            </Link>
          ))}
        </div>
      </TrainingPanel>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTrainingPotentialStudentDetail } from "@/lib/training";
import { TrainingHeader, TrainingPanel } from "../../training-ui";

export const metadata: Metadata = { title: "Chi tiết học viên tiềm năng" };
export const dynamic = "force-dynamic";

export default async function PotentialStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getTrainingPotentialStudentDetail(id);
  if (!student) notFound();
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title={student.name} description={`${student.email || "Chưa có email"} · ${student.phone || "Chưa có số điện thoại"}`} action={<Link href={`/workspace/training/potential-students/${student.id}/edit`} className="quote-action-button quote-action-primary">Chỉnh sửa</Link>} />
      <TrainingPanel title="Thông tin chăm sóc" description="Nguồn, nhu cầu và lịch hẹn lại.">
        <div className="grid gap-4 md:grid-cols-4">
          <div><p className="text-sm text-slate-500">Nguồn</p><strong>{student.source || "Chưa cập nhật"}</strong></div>
          <div><p className="text-sm text-slate-500">Quan tâm</p><strong>{student.interestedIn || "Chưa cập nhật"}</strong></div>
          <div><p className="text-sm text-slate-500">Trạng thái</p><strong>{student.status}</strong></div>
          <div><p className="text-sm text-slate-500">Hẹn lại</p><strong>{student.nextFollowUpAt ? student.nextFollowUpAt.toLocaleDateString("vi-VN") : "Chưa đặt"}</strong></div>
        </div>
        <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">{student.note || "Chưa có ghi chú."}</p>
      </TrainingPanel>
    </div>
  );
}

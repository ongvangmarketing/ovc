import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updatePotentialStudent } from "@/app/actions/training";
import { getTrainingPotentialStudentDetail } from "@/lib/training";
import { PotentialStudentForm } from "../../../training-forms";
import { TrainingHeader } from "../../../training-ui";

export const metadata: Metadata = { title: "Sửa học viên tiềm năng" };
export const dynamic = "force-dynamic";

export default async function EditPotentialStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getTrainingPotentialStudentDetail(id);
  if (!student) notFound();
  const action = updatePotentialStudent.bind(null, id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa học viên tiềm năng" description={student.name} />
      <PotentialStudentForm action={action} student={student} />
    </div>
  );
}

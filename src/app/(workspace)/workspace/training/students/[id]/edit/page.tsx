import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrainingStudent } from "@/modules/training/actions/training.actions";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { StudentForm } from "@/modules/training/components/training-forms";
import { TrainingHeader } from "@/modules/training/components/training-ui";

export const metadata: Metadata = { title: "Sửa học viên" };
export const dynamic = "force-dynamic";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await TrainingService.getTrainingStudentDetail(id);
  if (!student) notFound();
  const action = updateTrainingStudent.bind(null, id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa học viên" description={student.name} />
      <StudentForm action={action} student={student} />
    </div>
  );
}

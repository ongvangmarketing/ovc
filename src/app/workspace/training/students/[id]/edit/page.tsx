import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrainingStudent } from "@/app/actions/training";
import { getTrainingStudentDetail } from "@/lib/training";
import { StudentForm } from "../../../training-forms";
import { TrainingHeader } from "../../../training-ui";

export const metadata: Metadata = { title: "Sửa học viên" };
export const dynamic = "force-dynamic";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getTrainingStudentDetail(id);
  if (!student) notFound();
  const action = updateTrainingStudent.bind(null, id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa học viên" description={student.name} />
      <StudentForm action={action} student={student} />
    </div>
  );
}

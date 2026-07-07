import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrainingInstructor } from "@/app/actions/training";
import { getTrainingInstructorDetail } from "@/lib/training";
import { InstructorForm } from "../../../training-forms";
import { TrainingHeader } from "../../../training-ui";

export const metadata: Metadata = { title: "Sửa giảng viên" };
export const dynamic = "force-dynamic";

export default async function EditInstructorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instructor = await getTrainingInstructorDetail(id);
  if (!instructor) notFound();
  const action = updateTrainingInstructor.bind(null, id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa giảng viên" description={instructor.name} />
      <InstructorForm action={action} instructor={instructor} />
    </div>
  );
}

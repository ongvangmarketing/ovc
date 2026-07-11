import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrainingInstructor } from "@/modules/training/actions/training.actions";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { InstructorForm } from "@/modules/training/components/training-forms";
import { TrainingHeader } from "@/modules/training/components/training-ui";

export const metadata: Metadata = { title: "Sửa giảng viên" };
export const dynamic = "force-dynamic";

export default async function EditInstructorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const instructor = await TrainingService.getTrainingInstructorDetail(id);
  if (!instructor) notFound();
  const action = updateTrainingInstructor.bind(null, id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa giảng viên" description={instructor.name} />
      <InstructorForm action={action} instructor={instructor} />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrainingTuition } from "@/modules/training/actions/training.actions";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { TuitionForm } from "@/modules/training/components/training-forms";
import { TrainingHeader } from "@/modules/training/components/training-ui";

export const metadata: Metadata = { title: "Sửa học phí" };
export const dynamic = "force-dynamic";

export default async function EditTuitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, options] = await Promise.all([TrainingService.getTrainingTuitionDetail(id), TrainingService.getTrainingFormOptions()]);
  if (!item) notFound();
  const action = updateTrainingTuition.bind(null, id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa học phí" description={`${item.student.name} · ${item.course.title}`} />
      <TuitionForm action={action} enrollment={item} options={options} />
    </div>
  );
}

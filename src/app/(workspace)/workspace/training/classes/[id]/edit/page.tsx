import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrainingClass } from "@/modules/training/actions/training.actions";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { ClassForm } from "@/modules/training/components/training-forms";
import { TrainingHeader } from "@/modules/training/components/training-ui";

export const metadata: Metadata = { title: "Sửa lớp học" };
export const dynamic = "force-dynamic";

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, options] = await Promise.all([TrainingService.getTrainingClassDetail(id), TrainingService.getTrainingFormOptions()]);
  if (!item) notFound();
  const action = updateTrainingClass.bind(null, id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa lớp học" description={item.name} />
      <ClassForm action={action} item={item} options={options} />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrainingTuition } from "@/app/actions/training";
import { getTrainingFormOptions, getTrainingTuitionDetail } from "@/lib/training";
import { TuitionForm } from "../../../training-forms";
import { TrainingHeader } from "../../../training-ui";

export const metadata: Metadata = { title: "Sửa học phí" };
export const dynamic = "force-dynamic";

export default async function EditTuitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, options] = await Promise.all([getTrainingTuitionDetail(id), getTrainingFormOptions()]);
  if (!item) notFound();
  const action = updateTrainingTuition.bind(null, id);
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa học phí" description={`${item.student.name} · ${item.course.title}`} />
      <TuitionForm action={action} enrollment={item} options={options} />
    </div>
  );
}

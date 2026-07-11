import type { Metadata } from "next";

import { createTrainingClass } from "@/modules/training/actions/training.actions";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { ClassForm } from "@/modules/training/components/training-forms";
import { TrainingHeader } from "@/modules/training/components/training-ui";

export const metadata: Metadata = { title: "Tạo lớp học" };
export const dynamic = "force-dynamic";

export default async function CreateClassPage() {
  const options = await TrainingService.getTrainingFormOptions();
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Tạo lớp học" description="Mở lớp học mới từ khóa học đã cấu hình." />
      <ClassForm action={createTrainingClass} options={options} />
    </div>
  );
}

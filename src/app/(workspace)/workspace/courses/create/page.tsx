import type { Metadata } from "next";

import { createTrainingCourse } from "@/modules/training/actions/training.actions";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { CourseForm } from "@/modules/training/components/training-forms";
import { TrainingHeader } from "@/modules/training/components/training-ui";

export const metadata: Metadata = { title: "Tạo khóa học" };
export const dynamic = "force-dynamic";

export default async function CreateCoursePage() {
  const options = await TrainingService.getTrainingFormOptions();
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Tạo khóa học" description="Thêm chương trình đào tạo mới cho công ty hiện tại." />
      <CourseForm action={createTrainingCourse} options={options} />
    </div>
  );
}

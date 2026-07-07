import type { Metadata } from "next";

import { createTrainingCourse } from "@/app/actions/training";
import { getTrainingFormOptions } from "@/lib/training";
import { CourseForm } from "../../training/training-forms";
import { TrainingHeader } from "../../training/training-ui";

export const metadata: Metadata = { title: "Tạo khóa học" };
export const dynamic = "force-dynamic";

export default async function CreateCoursePage() {
  const options = await getTrainingFormOptions();
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Tạo khóa học" description="Thêm chương trình đào tạo mới cho công ty hiện tại." />
      <CourseForm action={createTrainingCourse} options={options} />
    </div>
  );
}

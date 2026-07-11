import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrainingCourse } from "@/modules/training/actions/training.actions";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { CourseForm } from "@/modules/training/components/training-forms";
import { TrainingHeader } from "@/modules/training/components/training-ui";

export const metadata: Metadata = { title: "Sửa khóa học" };
export const dynamic = "force-dynamic";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, options] = await Promise.all([TrainingService.getTrainingCourseDetail(id), TrainingService.getTrainingFormOptions()]);
  if (!course) notFound();
  const action = updateTrainingCourse.bind(null, id);

  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa khóa học" description={course.title} />
      <CourseForm action={action} course={course} options={options} />
    </div>
  );
}

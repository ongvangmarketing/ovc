import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrainingCourse } from "@/app/actions/training";
import { getTrainingCourseDetail, getTrainingFormOptions } from "@/lib/training";
import { CourseForm } from "../../../training/training-forms";
import { TrainingHeader } from "../../../training/training-ui";

export const metadata: Metadata = { title: "Sửa khóa học" };
export const dynamic = "force-dynamic";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, options] = await Promise.all([getTrainingCourseDetail(id), getTrainingFormOptions()]);
  if (!course) notFound();
  const action = updateTrainingCourse.bind(null, id);

  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Sửa khóa học" description={course.title} />
      <CourseForm action={action} course={course} options={options} />
    </div>
  );
}

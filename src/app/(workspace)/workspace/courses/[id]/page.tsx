import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { TrainingHeader, TrainingPanel } from "@/modules/training/components/training-ui";
import { CourseElearning } from "./course-elearning";

export const metadata: Metadata = { title: "Chi tiết khóa học" };
export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, options] = await Promise.all([TrainingService.getTrainingCourseDetail(id), TrainingService.getTrainingFormOptions()]);
  if (!course) notFound();

  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader
        title={course.title}
        description={course.description || "Chưa có mô tả khóa học."}
        action={<Link href={`/workspace/courses/${course.id}/edit`} className="quote-action-button quote-action-primary">Chỉnh sửa</Link>}
      />
      <section className="grid gap-4 md:grid-cols-4">
        <div className="quote-panel"><p className="text-sm text-slate-500">Trạng thái</p><strong className="mt-2 block text-xl">{course.status}</strong></div>
        <div className="quote-panel"><p className="text-sm text-slate-500">Học phí</p><strong className="mt-2 block text-xl">{Number(course.price).toLocaleString("vi-VN")} đ</strong></div>
        <div className="quote-panel"><p className="text-sm text-slate-500">Lớp học</p><strong className="mt-2 block text-xl">{course._count.classes}</strong></div>
        <div className="quote-panel"><p className="text-sm text-slate-500">Học viên</p><strong className="mt-2 block text-xl">{course._count.enrollments}</strong></div>
      </section>
      <TrainingPanel title="Giảng viên" description={course.instructor.email}>
        <p className="font-bold text-slate-950">{course.instructor.name}</p>
        <p className="text-sm text-slate-500">{course.instructor.phone || "Chưa cập nhật số điện thoại"}</p>
      </TrainingPanel>
      <TrainingPanel title="Lớp thuộc khóa học" description={`${course.classes.length} lớp`}>
        <div className="divide-y divide-slate-100">
          {course.classes.map((item) => (
            <Link key={item.id} href={`/workspace/training/classes/${item.id}`} className="flex items-center justify-between py-3 text-sm hover:text-orange-600">
              <span><b>{item.name}</b> · {item.code || "Chưa có mã"}</span>
              <span>{item._count.enrollments}/{item.maxStudents}</span>
            </Link>
          ))}
        </div>
      </TrainingPanel>
      <CourseElearning course={course} options={options} />
    </div>
  );
}

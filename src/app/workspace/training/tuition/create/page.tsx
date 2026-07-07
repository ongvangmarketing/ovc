import type { Metadata } from "next";

import { createTrainingTuition } from "@/app/actions/training";
import { getTrainingFormOptions } from "@/lib/training";
import { TuitionForm } from "../../training-forms";
import { TrainingHeader } from "../../training-ui";

export const metadata: Metadata = { title: "Thêm học phí" };
export const dynamic = "force-dynamic";

export default async function CreateTuitionPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const [{ studentId }, options] = await Promise.all([searchParams, getTrainingFormOptions()]);
  const orderedOptions = studentId
    ? {
        ...options,
        students: [
          ...options.students.filter((student) => student.id === studentId),
          ...options.students.filter((student) => student.id !== studentId),
        ],
      }
    : options;
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Gán lớp & học phí" description="Ghi danh học viên vào lớp đang/sắp khai giảng và sinh hóa đơn HP bên Tài chính." />
      <TuitionForm action={createTrainingTuition} options={orderedOptions} />
    </div>
  );
}

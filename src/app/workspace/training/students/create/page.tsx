import type { Metadata } from "next";

import { createTrainingStudent } from "@/app/actions/training";
import { StudentForm } from "../../training-forms";
import { TrainingHeader } from "../../training-ui";

export const metadata: Metadata = { title: "Thêm học viên" };
export const dynamic = "force-dynamic";

export default async function CreateStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; email?: string; phone?: string; note?: string }>;
}) {
  const defaults = await searchParams;
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Thêm học viên" description="Tạo hồ sơ học viên trong công ty hiện tại." />
      <StudentForm action={createTrainingStudent} defaults={defaults} />
    </div>
  );
}

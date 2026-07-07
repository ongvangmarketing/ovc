import type { Metadata } from "next";

import { createTrainingClass } from "@/app/actions/training";
import { getTrainingFormOptions } from "@/lib/training";
import { ClassForm } from "../../training-forms";
import { TrainingHeader } from "../../training-ui";

export const metadata: Metadata = { title: "Tạo lớp học" };
export const dynamic = "force-dynamic";

export default async function CreateClassPage() {
  const options = await getTrainingFormOptions();
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Tạo lớp học" description="Mở lớp học mới từ khóa học đã cấu hình." />
      <ClassForm action={createTrainingClass} options={options} />
    </div>
  );
}

import type { Metadata } from "next";

import { createTrainingInstructor } from "@/app/actions/training";
import { InstructorForm } from "../../training-forms";
import { TrainingHeader } from "../../training-ui";

export const metadata: Metadata = { title: "Thêm giảng viên" };
export const dynamic = "force-dynamic";

export default function CreateInstructorPage() {
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Thêm giảng viên" description="Tạo hồ sơ giảng viên cho module đào tạo." />
      <InstructorForm action={createTrainingInstructor} />
    </div>
  );
}

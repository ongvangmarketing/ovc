import type { Metadata } from "next";

import { createPotentialStudent } from "@/modules/training/actions/training.actions";
import { PotentialStudentForm } from "@/modules/training/components/training-forms";
import { TrainingHeader } from "@/modules/training/components/training-ui";

export const metadata: Metadata = { title: "Thêm học viên tiềm năng" };
export const dynamic = "force-dynamic";

export default function CreatePotentialStudentPage() {
  return (
    <div className="page-container mx-auto max-w-7xl space-y-5">
      <TrainingHeader title="Thêm học viên tiềm năng" description="Tạo lead đào tạo và lịch chăm sóc." />
      <PotentialStudentForm action={createPotentialStudent} />
    </div>
  );
}

import type { Metadata } from "next";

import { getTrainingPotentialStudents } from "@/lib/training";
import { potentialStudentMockData } from "./potential-students.mock";
import { PotentialStudentsWorkspace } from "./potential-students-workspace";

export const metadata: Metadata = { title: "Học viên tiềm năng" };
export const dynamic = "force-dynamic";

export default async function TrainingPotentialStudentsPage() {
  const students = await getTrainingPotentialStudents().catch(() =>
    potentialStudentMockData.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      source: item.source,
      interestedIn: item.interestedIn,
      status: item.status,
      note: item.note,
      nextFollowUpAt: item.nextFollowUpAt,
    }))
  );
  return <PotentialStudentsWorkspace initialStudents={students} />;
}

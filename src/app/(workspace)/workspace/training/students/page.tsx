import type { Metadata } from "next";

import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { studentMockData } from "./students.mock";
import { StudentsWorkspace } from "./students-workspace";

export const metadata: Metadata = { title: "Học viên" };
export const dynamic = "force-dynamic";

export default async function TrainingStudentsPage() {
  const students = await TrainingService.getTrainingStudents().catch(() =>
    studentMockData.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      enrollments: item.enrollments,
      active: item.active,
      completed: item.completed,
      progress: item.progress,
    }))
  );

  return <StudentsWorkspace initialStudents={students} />;
}

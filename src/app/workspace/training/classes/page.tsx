import type { Metadata } from "next";

import { getTrainingClasses } from "@/lib/training";
import { classMockData } from "./classes.mock";
import { ClassesWorkspace } from "./classes-workspace";

export const metadata: Metadata = { title: "Lớp học" };
export const dynamic = "force-dynamic";

export default async function TrainingClassesPage() {
  const classes = await getTrainingClasses().catch(() =>
    classMockData.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      course: item.course,
      instructor: item.instructor,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      maxStudents: item.maxStudents,
      students: item.students,
      isActive: item.isActive,
    }))
  );

  return <ClassesWorkspace initialClasses={classes} />;
}

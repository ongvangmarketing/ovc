import type { Metadata } from "next";

import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { classMockData } from "./classes.mock";
import { ClassesWorkspace } from "./classes-workspace";

export const metadata: Metadata = { title: "Lớp học" };
export const dynamic = "force-dynamic";

export default async function TrainingClassesPage() {
  const classes = await TrainingService.getTrainingClasses().catch(() =>
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

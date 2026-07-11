import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { resendTrainingStudentPortal } from "@/modules/training/actions/training.actions";
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { StudentDetailWorkspace } from "./student-detail-workspace";

export const metadata: Metadata = { title: "Chi tiết học viên" };
export const dynamic = "force-dynamic";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await TrainingService.getTrainingStudentDetail(id);
  if (!student) notFound();
  
  const portalAction = resendTrainingStudentPortal.bind(null, student.id);
  
  return (
    <StudentDetailWorkspace 
      student={student as any} 
      portalAction={portalAction} 
    />
  );
}

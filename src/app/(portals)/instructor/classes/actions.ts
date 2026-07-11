"use server";

import { revalidatePath } from "next/cache";

import { requireInstructorPortal } from "@/lib/auth/rbac";
import { InstructorService } from "@/modules/training/services/instructor.service";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function addInstructorStudentToCourse(formData: FormData) {
  const session = await requireInstructorPortal();
  const courseId = text(formData, "courseId");
  const classId = text(formData, "classId") || null;
  const studentId = text(formData, "studentId");

  await InstructorService.addStudentToCourse(session.organizationId!, session.user.id, courseId, studentId, classId);

  revalidatePath("/instructor/classes");
  revalidatePath("/instructor");
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function removeInstructorEnrollment(formData: FormData) {
  const session = await requireInstructorPortal();
  const enrollmentId = text(formData, "enrollmentId");

  const courseId = await InstructorService.removeEnrollment(session.organizationId!, session.user.id, enrollmentId);

  revalidatePath("/instructor/classes");
  revalidatePath("/instructor");
  revalidatePath(`/instructor/courses/${courseId}`);
}

"use server";

import { revalidatePath } from "next/cache";

import { requireStudentPortal } from "@/lib/auth/rbac";
import { StudentService } from "@/modules/training/services/student.service";

function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

export async function completeStudentLesson(formData: FormData) {
  const courseId = text(formData, "courseId");
  const lessonId = text(formData, "lessonId");
  const session = await requireStudentPortal();

  await StudentService.completeLesson(session.organizationId!, session.user.id, courseId, lessonId);

  revalidatePath("/student");
  revalidatePath("/student/courses");
  revalidatePath(`/student/courses/${courseId}`);
}

export async function submitStudentAssignment(formData: FormData) {
  const courseId = text(formData, "courseId");
  const assignmentId = text(formData, "assignmentId");
  const session = await requireStudentPortal();

  await StudentService.submitAssignment(
    session.organizationId!,
    session.user.id,
    session.user.name || "",
    session.user.email || "",
    courseId,
    assignmentId,
    optionalText(formData, "content"),
    optionalText(formData, "fileUrl")
  );

  revalidatePath("/student");
  revalidatePath("/student/assignments");
  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath("/instructor/grading");
}

export async function askStudentQuestion(formData: FormData) {
  const courseId = text(formData, "courseId");
  const lessonId = optionalText(formData, "lessonId");
  const question = text(formData, "question");
  const session = await requireStudentPortal();

  await StudentService.askQuestion(
    session.organizationId!,
    session.user.id,
    session.user.name || "",
    session.user.email || "",
    courseId,
    lessonId,
    question
  );

  revalidatePath("/student/messages");
  revalidatePath(`/student/courses/${courseId}`);
}

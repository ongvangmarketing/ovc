"use server";

import { revalidatePath } from "next/cache";

import { requireInstructorPortal } from "@/lib/auth/rbac";
import { InstructorService } from "@/modules/training/services/instructor.service";

function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = text(formData, key);
  return value ? Number(value) || fallback : fallback;
}

function dateTimeValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(value) : null;
}

function dateValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(value) : null;
}

function revalidateInstructor(courseId?: string) {
  revalidatePath("/instructor");
  revalidatePath("/instructor/courses");
  revalidatePath("/instructor/schedule");
  if (courseId) revalidatePath(`/instructor/courses/${courseId}`);
}

export async function updateInstructorCourse(courseId: string, formData: FormData) {
  const session = await requireInstructorPortal();
  const status = text(formData, "status", "PUBLISHED");

  await InstructorService.updateCourse(session.organizationId!, session.user.id, courseId, {
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    status,
    level: text(formData, "level", "beginner"),
    duration: numberValue(formData, "duration") || null,
    isPublic: formData.get("isPublic") === "on",
    publishedAt: status === "PUBLISHED" ? new Date() : null,
  });

  revalidateInstructor(courseId);
}

export async function createInstructorSection(courseId: string, formData: FormData) {
  const session = await requireInstructorPortal();

  await InstructorService.createSection(session.organizationId!, session.user.id, courseId, {
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    order: numberValue(formData, "order", 0) || undefined,
  });

  revalidateInstructor(courseId);
}

export async function createInstructorLesson(courseId: string, formData: FormData) {
  const session = await requireInstructorPortal();
  const sectionId = text(formData, "sectionId");

  await InstructorService.createLesson(session.organizationId!, session.user.id, courseId, sectionId, {
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    type: text(formData, "type", "VIDEO") || "VIDEO",
    content: optionalText(formData, "content"),
    videoUrl: optionalText(formData, "videoUrl"),
    duration: numberValue(formData, "duration") || null,
    order: numberValue(formData, "order", 0) || undefined,
    isFree: formData.get("isFree") === "on",
    isPublished: formData.get("isPublished") === "on",
  });

  revalidateInstructor(courseId);
}

export async function updateInstructorLesson(courseId: string, lessonId: string, formData: FormData) {
  const session = await requireInstructorPortal();

  await InstructorService.updateLesson(session.organizationId!, session.user.id, courseId, lessonId, {
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    type: text(formData, "type", "VIDEO") || "VIDEO",
    content: optionalText(formData, "content"),
    videoUrl: optionalText(formData, "videoUrl"),
    duration: numberValue(formData, "duration") || null,
    isFree: formData.get("isFree") === "on",
    isPublished: formData.get("isPublished") === "on",
  });

  revalidateInstructor(courseId);
}

export async function createInstructorAssignment(courseId: string, formData: FormData) {
  const session = await requireInstructorPortal();
  const lessonId = text(formData, "lessonId");

  await InstructorService.createAssignment(session.organizationId!, session.user.id, courseId, lessonId, {
    title: text(formData, "title"),
    description: optionalText(formData, "description"),
    dueDate: dateValue(formData, "dueDate"),
    maxScore: numberValue(formData, "maxScore", 100),
  });

  revalidatePath("/instructor/grading");
  revalidateInstructor(courseId);
}

export async function createInstructorSchedule(formData: FormData) {
  const courseId = text(formData, "courseId");
  const session = await requireInstructorPortal();
  const lessonId = text(formData, "lessonId");
  const classId = text(formData, "classId") || null;

  await InstructorService.createSchedule(session.organizationId!, session.user.id, courseId, lessonId, classId, {
    title: optionalText(formData, "title"),
    mode: text(formData, "mode", "ONLINE") || "ONLINE",
    startsAt: dateTimeValue(formData, "startsAt"),
    endsAt: dateTimeValue(formData, "endsAt"),
    location: optionalText(formData, "location"),
    onlineUrl: optionalText(formData, "onlineUrl"),
    fieldAddress: optionalText(formData, "fieldAddress"),
    capacity: numberValue(formData, "capacity") || null,
    note: optionalText(formData, "note"),
  });

  revalidateInstructor(courseId);
}

export async function gradeInstructorSubmission(formData: FormData) {
  const session = await requireInstructorPortal();
  const submissionId = text(formData, "submissionId");
  const score = numberValue(formData, "score");
  const feedback = optionalText(formData, "feedback");

  const courseId = await InstructorService.gradeSubmission(session.organizationId!, session.user.id, submissionId, score, feedback);

  revalidatePath("/instructor/grading");
  revalidateInstructor(courseId);
}

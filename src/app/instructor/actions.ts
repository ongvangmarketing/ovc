"use server";

import { revalidatePath } from "next/cache";
import { CourseStatus, LessonScheduleMode, LessonType } from "@prisma/client";

import { requireInstructorPortal } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

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

async function requireInstructorCourse(courseId: string) {
  const session = await requireInstructorPortal();
  const course = await db.course.findFirst({
    where: { id: courseId, organizationId: session.organizationId, instructorId: session.user.id },
    select: { id: true, title: true },
  });
  if (!course) throw new Error("Không tìm thấy khóa học của giảng viên.");
  return { session, course };
}

export async function updateInstructorCourse(courseId: string, formData: FormData) {
  await requireInstructorCourse(courseId);
  const status = text(formData, "status", "PUBLISHED") as CourseStatus;

  await db.course.update({
    where: { id: courseId },
    data: {
      title: text(formData, "title"),
      description: optionalText(formData, "description"),
      status,
      level: text(formData, "level", "beginner"),
      duration: numberValue(formData, "duration") || null,
      isPublic: formData.get("isPublic") === "on",
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidateInstructor(courseId);
}

export async function createInstructorSection(courseId: string, formData: FormData) {
  await requireInstructorCourse(courseId);
  const count = await db.courseSection.count({ where: { courseId } });

  await db.courseSection.create({
    data: {
      courseId,
      title: text(formData, "title"),
      description: optionalText(formData, "description"),
      order: numberValue(formData, "order", count + 1),
    },
  });

  revalidateInstructor(courseId);
}

export async function createInstructorLesson(courseId: string, formData: FormData) {
  await requireInstructorCourse(courseId);
  const sectionId = text(formData, "sectionId");
  const section = await db.courseSection.findFirst({
    where: { id: sectionId, courseId },
    include: { _count: { select: { lessons: true } } },
  });
  if (!section) throw new Error("Không tìm thấy học phần.");

  await db.lesson.create({
    data: {
      sectionId,
      title: text(formData, "title"),
      description: optionalText(formData, "description"),
      type: (text(formData, "type", "VIDEO") as LessonType) || LessonType.VIDEO,
      content: optionalText(formData, "content"),
      videoUrl: optionalText(formData, "videoUrl"),
      duration: numberValue(formData, "duration") || null,
      order: numberValue(formData, "order", section._count.lessons + 1),
      isFree: formData.get("isFree") === "on",
      isPublished: formData.get("isPublished") === "on",
    },
  });

  revalidateInstructor(courseId);
}

export async function updateInstructorLesson(courseId: string, lessonId: string, formData: FormData) {
  await requireInstructorCourse(courseId);
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, section: { courseId } }, select: { id: true } });
  if (!lesson) throw new Error("Không tìm thấy bài học.");

  await db.lesson.update({
    where: { id: lessonId },
    data: {
      title: text(formData, "title"),
      description: optionalText(formData, "description"),
      type: (text(formData, "type", "VIDEO") as LessonType) || LessonType.VIDEO,
      content: optionalText(formData, "content"),
      videoUrl: optionalText(formData, "videoUrl"),
      duration: numberValue(formData, "duration") || null,
      isFree: formData.get("isFree") === "on",
      isPublished: formData.get("isPublished") === "on",
    },
  });

  revalidateInstructor(courseId);
}

export async function createInstructorAssignment(courseId: string, formData: FormData) {
  await requireInstructorCourse(courseId);
  const lessonId = text(formData, "lessonId");
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, section: { courseId } }, select: { id: true } });
  if (!lesson) throw new Error("Bài học không thuộc khóa của giảng viên.");

  await db.assignment.create({
    data: {
      lessonId,
      title: text(formData, "title"),
      description: optionalText(formData, "description"),
      dueDate: dateValue(formData, "dueDate"),
      maxScore: numberValue(formData, "maxScore", 100),
    },
  });

  revalidatePath("/instructor/grading");
  revalidateInstructor(courseId);
}

export async function createInstructorSchedule(formData: FormData) {
  const courseId = text(formData, "courseId");
  const { session } = await requireInstructorCourse(courseId);
  const lessonId = text(formData, "lessonId");
  const lesson = await db.lesson.findFirst({ where: { id: lessonId, section: { courseId } }, select: { id: true } });
  if (!lesson) throw new Error("Bài học không thuộc khóa của giảng viên.");

  const classId = text(formData, "classId") || null;
  if (classId) {
    const classItem = await db.class.findFirst({ where: { id: classId, courseId }, select: { id: true } });
    if (!classItem) throw new Error("Lớp không thuộc khóa học.");
  }

  await db.lessonSchedule.create({
    data: {
      lessonId,
      classId,
      title: optionalText(formData, "title"),
      mode: (text(formData, "mode", "ONLINE") as LessonScheduleMode) || LessonScheduleMode.ONLINE,
      startsAt: dateTimeValue(formData, "startsAt"),
      endsAt: dateTimeValue(formData, "endsAt"),
      location: optionalText(formData, "location"),
      onlineUrl: optionalText(formData, "onlineUrl"),
      fieldAddress: optionalText(formData, "fieldAddress"),
      instructorId: session.user.id,
      capacity: numberValue(formData, "capacity") || null,
      note: optionalText(formData, "note"),
    },
  });

  revalidateInstructor(courseId);
}

export async function gradeInstructorSubmission(formData: FormData) {
  const session = await requireInstructorPortal();
  const submissionId = text(formData, "submissionId");
  const score = numberValue(formData, "score");
  const feedback = optionalText(formData, "feedback");

  const submission = await db.assignmentSubmission.findFirst({
    where: {
      id: submissionId,
      assignment: {
        lessonId: {
          not: null,
        },
      },
    },
    include: { assignment: true },
  });
  if (!submission?.assignment.lessonId) throw new Error("Không tìm thấy bài nộp.");

  const lesson = await db.lesson.findFirst({
    where: {
      id: submission.assignment.lessonId,
      section: { course: { organizationId: session.organizationId, instructorId: session.user.id } },
    },
    select: { section: { select: { courseId: true } } },
  });
  if (!lesson) throw new Error("Bạn không có quyền chấm bài này.");
  if (score < 0 || score > submission.assignment.maxScore) throw new Error("Điểm không hợp lệ.");

  await db.assignmentSubmission.update({
    where: { id: submission.id },
    data: {
      score,
      feedback,
      graderId: session.user.id,
      gradedAt: new Date(),
    },
  });

  revalidatePath("/instructor/grading");
  revalidateInstructor(lesson.section.courseId);
}

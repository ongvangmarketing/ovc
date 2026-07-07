"use server";

import { revalidatePath } from "next/cache";
import { NotificationType } from "@prisma/client";

import { requireStudentPortal } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalText(formData: FormData, key: string) {
  return text(formData, key) || null;
}

async function requireStudentEnrollment(courseId: string) {
  const session = await requireStudentPortal();
  const enrollment = await db.enrollment.findFirst({
    where: {
      courseId,
      studentId: session.user.id,
      course: { organizationId: session.organizationId },
    },
    include: {
      course: { select: { id: true, title: true, instructorId: true } },
    },
  });
  if (!enrollment) throw new Error("Bạn chưa được ghi danh vào khóa học này.");
  return { session, enrollment };
}

async function refreshProgress(enrollmentId: string, courseId: string) {
  const [totalLessons, completedLessons] = await Promise.all([
    db.lesson.count({ where: { isPublished: true, section: { courseId } } }),
    db.lessonCompletion.count({ where: { enrollmentId, lesson: { isPublished: true, section: { courseId } } } }),
  ]);
  const progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progress,
      completedAt: progress >= 100 ? new Date() : null,
    },
  });
}

export async function completeStudentLesson(formData: FormData) {
  const courseId = text(formData, "courseId");
  const lessonId = text(formData, "lessonId");
  const { enrollment } = await requireStudentEnrollment(courseId);

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, isPublished: true, section: { courseId } },
    select: { id: true },
  });
  if (!lesson) throw new Error("Không tìm thấy bài học trong khóa.");

  await db.lessonCompletion.upsert({
    where: { lessonId_enrollmentId: { lessonId, enrollmentId: enrollment.id } },
    update: { completedAt: new Date() },
    create: { lessonId, enrollmentId: enrollment.id },
  });

  await refreshProgress(enrollment.id, courseId);
  revalidatePath("/student");
  revalidatePath("/student/courses");
  revalidatePath(`/student/courses/${courseId}`);
}

export async function submitStudentAssignment(formData: FormData) {
  const courseId = text(formData, "courseId");
  const assignmentId = text(formData, "assignmentId");
  const { session, enrollment } = await requireStudentEnrollment(courseId);

  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, lessonId: { not: null } },
    include: { submissions: { where: { studentId: session.user.id }, select: { id: true } } },
  });
  if (!assignment?.lessonId) throw new Error("Không tìm thấy bài tập.");

  const lesson = await db.lesson.findFirst({ where: { id: assignment.lessonId, section: { courseId } }, select: { id: true } });
  if (!lesson) throw new Error("Bài tập không thuộc khóa học này.");

  await db.assignmentSubmission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId: session.user.id } },
    update: {
      content: optionalText(formData, "content"),
      fileUrl: optionalText(formData, "fileUrl"),
      submittedAt: new Date(),
      score: null,
      feedback: null,
      graderId: null,
      gradedAt: null,
    },
    create: {
      assignmentId,
      studentId: session.user.id,
      content: optionalText(formData, "content"),
      fileUrl: optionalText(formData, "fileUrl"),
    },
  });

  await db.notification.create({
    data: {
      userId: enrollment.course.instructorId,
      type: NotificationType.MESSAGE,
      title: "Học viên vừa nộp bài",
      body: `${session.user.name || session.user.email} đã nộp: ${assignment.title}`,
      link: "/instructor/grading",
      data: { courseId, assignmentId },
    },
  });

  revalidatePath("/student");
  revalidatePath("/student/assignments");
  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath("/instructor/grading");
}

export async function askStudentQuestion(formData: FormData) {
  const courseId = text(formData, "courseId");
  const lessonId = optionalText(formData, "lessonId");
  const question = text(formData, "question");
  const { session, enrollment } = await requireStudentEnrollment(courseId);
  if (!question) throw new Error("Vui lòng nhập câu hỏi.");

  if (lessonId) {
    const lesson = await db.lesson.findFirst({ where: { id: lessonId, section: { courseId } }, select: { id: true } });
    if (!lesson) throw new Error("Bài học không thuộc khóa này.");
  }

  await db.activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.user.id,
      action: "asked",
      entity: "LearningQuestion",
      entityId: courseId,
      description: question,
      metadata: {
        courseId,
        courseTitle: enrollment.course.title,
        lessonId,
        studentName: session.user.name,
        studentEmail: session.user.email,
      },
    },
  });

  await db.notification.create({
    data: {
      userId: enrollment.course.instructorId,
      type: NotificationType.MESSAGE,
      title: "Câu hỏi mới từ học viên",
      body: `${session.user.name || session.user.email}: ${question}`,
      link: `/instructor/courses/${courseId}`,
      data: { courseId, lessonId },
    },
  });

  revalidatePath("/student/messages");
  revalidatePath(`/student/courses/${courseId}`);
}

"use server";

import { revalidatePath } from "next/cache";

import { requireInstructorPortal } from "@/lib/auth/rbac";
import { db } from "@/lib/db";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export async function addInstructorStudentToCourse(formData: FormData) {
  const session = await requireInstructorPortal();
  const courseId = text(formData, "courseId");
  const classId = text(formData, "classId") || null;
  const studentId = text(formData, "studentId");

  const course = await db.course.findFirst({
    where: { id: courseId, organizationId: session.organizationId, instructorId: session.user.id },
    select: { id: true, price: true },
  });
  if (!course) throw new Error("Không tìm thấy khóa học của giảng viên.");

  if (classId) {
    const classItem = await db.class.findFirst({ where: { id: classId, courseId } });
    if (!classItem) throw new Error("Lớp không thuộc khóa học này.");
  }

  const member = await db.organizationMember.findFirst({
    where: { organizationId: session.organizationId, userId: studentId, user: { role: "STUDENT" } },
    select: { userId: true },
  });
  if (!member) throw new Error("Học viên không thuộc organization hiện tại.");

  await db.enrollment.upsert({
    where: { courseId_studentId: { courseId, studentId } },
    create: {
      courseId,
      classId,
      studentId,
      status: "ACTIVE",
      progress: 0,
      tuitionFee: course.price,
      paidAmount: 0,
      paymentStatus: "unpaid",
      paymentNote: "Giảng viên thêm học viên từ Instructor Portal.",
      startedAt: new Date(),
    },
    update: {
      classId,
      status: "ACTIVE",
    },
  });

  revalidatePath("/instructor/classes");
  revalidatePath("/instructor");
  revalidatePath(`/instructor/courses/${courseId}`);
}

export async function removeInstructorEnrollment(formData: FormData) {
  const session = await requireInstructorPortal();
  const enrollmentId = text(formData, "enrollmentId");

  const enrollment = await db.enrollment.findFirst({
    where: { id: enrollmentId, course: { organizationId: session.organizationId, instructorId: session.user.id } },
    include: { course: { include: { sections: { include: { lessons: { select: { id: true } } } } } } },
  });
  if (!enrollment) throw new Error("Không tìm thấy học viên trong khóa của giảng viên.");

  const lessonIds = enrollment.course.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id));
  const assignments = lessonIds.length
    ? await db.assignment.findMany({ where: { lessonId: { in: lessonIds } }, select: { id: true } })
    : [];

  await db.$transaction([
    db.attendance.deleteMany({ where: { studentId: enrollment.studentId, classId: enrollment.classId || undefined } }),
    db.assignmentSubmission.deleteMany({
      where: { studentId: enrollment.studentId, assignmentId: { in: assignments.map((item) => item.id) } },
    }),
    db.enrollment.delete({ where: { id: enrollment.id } }),
  ]);

  revalidatePath("/instructor/classes");
  revalidatePath("/instructor");
  revalidatePath(`/instructor/courses/${enrollment.courseId}`);
}

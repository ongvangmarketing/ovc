"use server";

import { CourseStatus, EnrollmentStatus, LessonType, MemberRole, UserRole } from "@prisma/client";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { syncTuitionInvoiceForSession } from "@/lib/training/tuition-finance";
import { sendPortalAccessEmailForUser } from "@/app/actions/settings";

const TRAINING_PLACEHOLDER_EMAIL_DOMAIN = "no-email.ovc.local";

function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = text(formData, key);
  if (!value) return fallback;
  return Number(value.replace(/\./g, "").replace(",", ".")) || fallback;
}

function dateValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(value) : null;
}

function dateTimeValue(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? new Date(value) : null;
}

function isPlaceholderTrainingEmail(email?: string | null) {
  return !!email && email.endsWith(`@${TRAINING_PLACEHOLDER_EMAIL_DOMAIN}`);
}

function placeholderTrainingEmail(prefix: "student" | "instructor") {
  return `${prefix}-${randomUUID()}@${TRAINING_PLACEHOLDER_EMAIL_DOMAIN}`;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueCourseSlug(organizationId: string, title: string, currentId?: string) {
  const base = slugify(title) || `khoa-hoc-${Date.now()}`;
  let slug = base;
  let index = 2;

  while (
    await db.course.findFirst({
      where: { organizationId, slug, ...(currentId ? { NOT: { id: currentId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${index++}`;
  }

  return slug;
}

async function fallbackInstructorId(organizationId: string, userId: string) {
  const instructor = await db.organizationMember.findFirst({
    where: { organizationId, user: { role: UserRole.INSTRUCTOR } },
    select: { userId: true },
    orderBy: { joinedAt: "asc" },
  });

  if (instructor) return instructor.userId;
  return userId;
}

function revalidateTraining() {
  revalidatePath("/workspace/training");
  revalidatePath("/workspace/courses");
  revalidatePath("/workspace/training/classes");
  revalidatePath("/workspace/training/students");
  revalidatePath("/workspace/training/potential-students");
  revalidatePath("/workspace/training/tuition");
  revalidatePath("/workspace/training/calendar");
  revalidatePath("/workspace/training/certificates");
}

export async function createTrainingCourse(formData: FormData) {
  const session = await requireAuth();
  const title = text(formData, "title");
  if (!title) throw new Error("Tên khóa học là bắt buộc");
  const instructorId = text(formData, "instructorId") || (await fallbackInstructorId(session.organizationId, session.userId));

  const course = await db.course.create({
    data: {
      organizationId: session.organizationId,
      instructorId,
      title,
      slug: await uniqueCourseSlug(session.organizationId, title),
      description: optionalText(formData, "description"),
      status: (text(formData, "status", "DRAFT") as CourseStatus) || CourseStatus.DRAFT,
      price: numberValue(formData, "price"),
      currency: text(formData, "currency", "VND"),
      level: text(formData, "level", "beginner"),
      language: text(formData, "language", "vi"),
      duration: numberValue(formData, "duration") || null,
      isPublic: formData.get("isPublic") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      publishedAt: text(formData, "status") === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidateTraining();
  redirect(`/workspace/courses/${course.id}`);
}

export async function updateTrainingCourse(id: string, formData: FormData) {
  const session = await requireAuth();
  const current = await db.course.findFirst({ where: { id, organizationId: session.organizationId } });
  if (!current) throw new Error("Không tìm thấy khóa học");
  const title = text(formData, "title", current.title);
  const status = (text(formData, "status", current.status) as CourseStatus) || current.status;

  await db.course.update({
    where: { id },
    data: {
      instructorId: text(formData, "instructorId", current.instructorId),
      title,
      slug: title === current.title ? current.slug : await uniqueCourseSlug(session.organizationId, title, id),
      description: optionalText(formData, "description"),
      status,
      price: numberValue(formData, "price"),
      currency: text(formData, "currency", "VND"),
      level: text(formData, "level", "beginner"),
      language: text(formData, "language", "vi"),
      duration: numberValue(formData, "duration") || null,
      isPublic: formData.get("isPublic") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      publishedAt: status === "PUBLISHED" ? current.publishedAt || new Date() : null,
    },
  });

  revalidateTraining();
  revalidatePath(`/workspace/courses/${id}`);
  redirect(`/workspace/courses/${id}`);
}

export async function createCourseSection(courseId: string, formData: FormData) {
  const session = await requireAuth();
  const course = await db.course.findFirst({
    where: { id: courseId, organizationId: session.organizationId },
    include: { _count: { select: { sections: true } } },
  });
  if (!course) throw new Error("Không tìm thấy khóa học");

  await db.courseSection.create({
    data: {
      courseId,
      title: text(formData, "title"),
      description: optionalText(formData, "description"),
      order: numberValue(formData, "order", course._count.sections + 1),
    },
  });

  revalidateTraining();
  revalidatePath(`/workspace/courses/${courseId}`);
  redirect(`/workspace/courses/${courseId}`);
}

export async function createCourseLesson(courseId: string, formData: FormData) {
  const session = await requireAuth();
  const sectionId = text(formData, "sectionId");
  const section = await db.courseSection.findFirst({
    where: { id: sectionId, course: { id: courseId, organizationId: session.organizationId } },
    include: { _count: { select: { lessons: true } } },
  });
  if (!section) throw new Error("Không tìm thấy học phần");

  await db.lesson.create({
    data: {
      sectionId,
      title: text(formData, "title"),
      description: optionalText(formData, "description"),
      type: (text(formData, "type", "LIVE") as LessonType) || LessonType.LIVE,
      content: optionalText(formData, "content"),
      videoUrl: optionalText(formData, "videoUrl"),
      duration: numberValue(formData, "duration") || null,
      order: numberValue(formData, "order", section._count.lessons + 1),
      isFree: formData.get("isFree") === "on",
      isPublished: formData.get("isPublished") === "on",
    },
  });

  revalidateTraining();
  revalidatePath(`/workspace/courses/${courseId}`);
  redirect(`/workspace/courses/${courseId}`);
}

export async function createLessonSchedule(courseId: string, lessonId: string, formData: FormData) {
  const session = await requireAuth();
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, section: { course: { id: courseId, organizationId: session.organizationId } } },
    select: { id: true },
  });
  if (!lesson) throw new Error("Không tìm thấy bài giảng");

  const classId = text(formData, "classId") || null;
  if (classId) {
    const classRecord = await db.class.findFirst({ where: { id: classId, courseId } });
    if (!classRecord) throw new Error("Lớp học không hợp lệ");
  }

  const instructorId = text(formData, "instructorId") || null;
  if (instructorId) {
    const instructor = await db.organizationMember.findFirst({ where: { organizationId: session.organizationId, userId: instructorId, user: { role: UserRole.INSTRUCTOR } } });
    if (!instructor) throw new Error("Giảng viên không hợp lệ");
  }

  await db.$executeRaw`
    INSERT INTO lesson_schedules (
      id,
      "lessonId",
      "classId",
      title,
      mode,
      "startsAt",
      "endsAt",
      location,
      "onlineUrl",
      "fieldAddress",
      "instructorId",
      capacity,
      note,
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${randomUUID()},
      ${lessonId},
      ${classId},
      ${text(formData, "title")},
      ${text(formData, "mode", "OFFLINE")}::"LessonScheduleMode",
      ${dateTimeValue(formData, "startsAt")},
      ${dateTimeValue(formData, "endsAt")},
      ${optionalText(formData, "location")},
      ${optionalText(formData, "onlineUrl")},
      ${optionalText(formData, "fieldAddress")},
      ${instructorId},
      ${numberValue(formData, "capacity") || null},
      ${optionalText(formData, "note")},
      NOW(),
      NOW()
    )
  `;

  revalidateTraining();
  revalidatePath(`/workspace/courses/${courseId}`);
  redirect(`/workspace/courses/${courseId}`);
}

export async function createTrainingClass(formData: FormData) {
  const session = await requireAuth();
  const courseId = text(formData, "courseId");
  const course = await db.course.findFirst({ where: { id: courseId, organizationId: session.organizationId }, select: { id: true } });
  if (!course) throw new Error("Khóa học không hợp lệ");

  const item = await db.class.create({
    data: {
      courseId,
      name: text(formData, "name"),
      code: optionalText(formData, "code"),
      startDate: dateValue(formData, "startDate"),
      endDate: dateValue(formData, "endDate"),
      location: optionalText(formData, "location"),
      maxStudents: numberValue(formData, "maxStudents", 30),
      isActive: formData.get("isActive") !== "off",
      schedule: optionalText(formData, "schedule") ? { note: text(formData, "schedule") } : undefined,
    },
  });

  revalidateTraining();
  redirect(`/workspace/training/classes/${item.id}`);
}

export async function updateTrainingClass(id: string, formData: FormData) {
  const session = await requireAuth();
  const current = await db.class.findFirst({ where: { id, course: { organizationId: session.organizationId } }, include: { course: true } });
  if (!current) throw new Error("Không tìm thấy lớp học");
  const courseId = text(formData, "courseId", current.courseId);
  const course = await db.course.findFirst({ where: { id: courseId, organizationId: session.organizationId }, select: { id: true } });
  if (!course) throw new Error("Khóa học không hợp lệ");

  await db.class.update({
    where: { id },
    data: {
      courseId,
      name: text(formData, "name", current.name),
      code: optionalText(formData, "code"),
      startDate: dateValue(formData, "startDate"),
      endDate: dateValue(formData, "endDate"),
      location: optionalText(formData, "location"),
      maxStudents: numberValue(formData, "maxStudents", current.maxStudents),
      isActive: formData.get("isActive") === "on",
      schedule: optionalText(formData, "schedule") ? { note: text(formData, "schedule") } : undefined,
    },
  });

  revalidateTraining();
  revalidatePath(`/workspace/training/classes/${id}`);
  redirect(`/workspace/training/classes/${id}`);
}

export async function createTrainingStudent(formData: FormData) {
  const session = await requireAuth();
  const email = text(formData, "email");
  const loginEmail = email || placeholderTrainingEmail("student");

  const user = await db.user.upsert({
    where: { email: loginEmail },
    create: {
      name: text(formData, "name"),
      email: loginEmail,
      phone: optionalText(formData, "phone"),
      bio: optionalText(formData, "bio"),
      role: UserRole.STUDENT,
      isActive: true,
    },
    update: {
      name: text(formData, "name"),
      phone: optionalText(formData, "phone"),
      bio: optionalText(formData, "bio"),
      role: UserRole.STUDENT,
    },
  });

  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: session.organizationId, userId: user.id } },
    create: { organizationId: session.organizationId, userId: user.id, role: MemberRole.VIEWER },
    update: {},
  });

  if (email) {
    await sendPortalAccessEmailForUser(user.id, undefined, "/student");
  }

  revalidateTraining();
  redirect(`/workspace/training/students/${user.id}`);
}

export async function updateTrainingStudent(id: string, formData: FormData) {
  const session = await requireAuth();
  const member = await db.organizationMember.findFirst({
    where: { organizationId: session.organizationId, userId: id, user: { role: UserRole.STUDENT } },
    include: { user: true },
  });
  if (!member) throw new Error("Không tìm thấy học viên");
  const email = text(formData, "email");
  const shouldUpdateEmail = !!email && email !== member.user.email;
  const shouldSendPortal = shouldUpdateEmail && isPlaceholderTrainingEmail(member.user.email);

  await db.user.update({
    where: { id },
    data: {
      name: text(formData, "name"),
      ...(shouldUpdateEmail ? { email } : {}),
      phone: optionalText(formData, "phone"),
      bio: optionalText(formData, "bio"),
      isActive: formData.get("isActive") !== "off",
    },
  });

  if (shouldSendPortal) {
    await sendPortalAccessEmailForUser(id, undefined, "/student");
  }

  revalidateTraining();
  revalidatePath(`/workspace/training/students/${id}`);
  redirect(`/workspace/training/students/${id}`);
}

export async function resendTrainingStudentPortal(id: string) {
  const session = await requireAuth();
  const member = await db.organizationMember.findFirst({
    where: { organizationId: session.organizationId, userId: id, user: { role: UserRole.STUDENT } },
    include: { user: true },
  });
  if (!member) throw new Error("Không tìm thấy học viên");
  if (isPlaceholderTrainingEmail(member.user.email)) throw new Error("Học viên chưa có email để cấp Portal");

  await sendPortalAccessEmailForUser(id, undefined, "/student");
  revalidatePath(`/workspace/training/students/${id}`);
  redirect(`/workspace/training/students/${id}?portal=resent`);
}

export async function createTrainingInstructor(formData: FormData) {
  const session = await requireAuth();
  const email = text(formData, "email");
  const loginEmail = email || placeholderTrainingEmail("instructor");

  const user = await db.user.upsert({
    where: { email: loginEmail },
    create: {
      name: text(formData, "name"),
      email: loginEmail,
      phone: optionalText(formData, "phone"),
      bio: optionalText(formData, "bio"),
      role: UserRole.INSTRUCTOR,
      isActive: true,
    },
    update: {
      name: text(formData, "name"),
      phone: optionalText(formData, "phone"),
      bio: optionalText(formData, "bio"),
      role: UserRole.INSTRUCTOR,
    },
  });

  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: session.organizationId, userId: user.id } },
    create: { organizationId: session.organizationId, userId: user.id, role: MemberRole.MEMBER },
    update: {},
  });

  if (email) {
    await sendPortalAccessEmailForUser(user.id, undefined, "/instructor");
  }

  revalidateTraining();
  redirect(`/workspace/training/instructors/${user.id}`);
}

export async function updateTrainingInstructor(id: string, formData: FormData) {
  const session = await requireAuth();
  const member = await db.organizationMember.findFirst({
    where: { organizationId: session.organizationId, userId: id, user: { role: UserRole.INSTRUCTOR } },
    include: { user: true },
  });
  if (!member) throw new Error("Không tìm thấy giảng viên");
  const email = text(formData, "email");
  const shouldUpdateEmail = !!email && email !== member.user.email;
  const shouldSendPortal = shouldUpdateEmail && isPlaceholderTrainingEmail(member.user.email);

  await db.user.update({
    where: { id },
    data: {
      name: text(formData, "name"),
      ...(shouldUpdateEmail ? { email } : {}),
      phone: optionalText(formData, "phone"),
      bio: optionalText(formData, "bio"),
      isActive: formData.get("isActive") !== "off",
    },
  });

  if (shouldSendPortal) {
    await sendPortalAccessEmailForUser(id, undefined, "/instructor");
  }

  revalidateTraining();
  revalidatePath(`/workspace/training/instructors/${id}`);
  redirect(`/workspace/training/instructors/${id}`);
}

export async function resendTrainingInstructorPortal(id: string) {
  const session = await requireAuth();
  const member = await db.organizationMember.findFirst({
    where: { organizationId: session.organizationId, userId: id, user: { role: UserRole.INSTRUCTOR } },
    include: { user: true },
  });
  if (!member) throw new Error("Không tìm thấy giảng viên");
  if (isPlaceholderTrainingEmail(member.user.email)) throw new Error("Giảng viên chưa có email để cấp Portal");

  await sendPortalAccessEmailForUser(id, undefined, "/instructor");
  revalidatePath(`/workspace/training/instructors/${id}`);
  redirect(`/workspace/training/instructors/${id}?portal=resent`);
}

export async function createPotentialStudent(formData: FormData) {
  const session = await requireAuth();
  const item = await db.potentialStudent.create({
    data: {
      organizationId: session.organizationId,
      name: text(formData, "name"),
      email: optionalText(formData, "email"),
      phone: optionalText(formData, "phone"),
      source: optionalText(formData, "source"),
      interestedIn: optionalText(formData, "interestedIn"),
      status: text(formData, "status", "new"),
      note: optionalText(formData, "note"),
      nextFollowUpAt: dateValue(formData, "nextFollowUpAt"),
    },
  });

  revalidateTraining();
  redirect(`/workspace/training/potential-students/${item.id}`);
}

export async function updatePotentialStudent(id: string, formData: FormData) {
  const session = await requireAuth();
  const current = await db.potentialStudent.findFirst({ where: { id, organizationId: session.organizationId } });
  if (!current) throw new Error("Không tìm thấy học viên tiềm năng");

  await db.potentialStudent.update({
    where: { id },
    data: {
      name: text(formData, "name", current.name),
      email: optionalText(formData, "email"),
      phone: optionalText(formData, "phone"),
      source: optionalText(formData, "source"),
      interestedIn: optionalText(formData, "interestedIn"),
      status: text(formData, "status", current.status),
      note: optionalText(formData, "note"),
      nextFollowUpAt: dateValue(formData, "nextFollowUpAt"),
    },
  });

  revalidateTraining();
  revalidatePath(`/workspace/training/potential-students/${id}`);
  redirect(`/workspace/training/potential-students/${id}`);
}

export async function createTrainingTuition(formData: FormData) {
  const session = await requireAuth();
  const courseId = text(formData, "courseId");
  const studentId = text(formData, "studentId");
  const course = await db.course.findFirst({ where: { id: courseId, organizationId: session.organizationId } });
  const member = await db.organizationMember.findFirst({ where: { organizationId: session.organizationId, userId: studentId, user: { role: UserRole.STUDENT } } });
  if (!course || !member) throw new Error("Khóa học hoặc học viên không hợp lệ");

  const item = await db.enrollment.upsert({
    where: { courseId_studentId: { courseId, studentId } },
    create: {
      courseId,
      studentId,
      classId: text(formData, "classId") || null,
      status: (text(formData, "status", "ACTIVE") as EnrollmentStatus) || EnrollmentStatus.ACTIVE,
      progress: numberValue(formData, "progress"),
      tuitionFee: numberValue(formData, "tuitionFee", Number(course.price)),
      paidAmount: numberValue(formData, "paidAmount"),
      paymentStatus: text(formData, "paymentStatus", "unpaid"),
      paymentNote: optionalText(formData, "paymentNote"),
      startedAt: dateValue(formData, "startedAt"),
    },
    update: {
      classId: text(formData, "classId") || null,
      status: (text(formData, "status", "ACTIVE") as EnrollmentStatus) || EnrollmentStatus.ACTIVE,
      progress: numberValue(formData, "progress"),
      tuitionFee: numberValue(formData, "tuitionFee", Number(course.price)),
      paidAmount: numberValue(formData, "paidAmount"),
      paymentStatus: text(formData, "paymentStatus", "unpaid"),
      paymentNote: optionalText(formData, "paymentNote"),
      startedAt: dateValue(formData, "startedAt"),
    },
  });

  await syncTuitionInvoiceForSession(item.id, session);

  revalidateTraining();
  revalidatePath("/workspace/finance/invoices");
  revalidatePath(`/workspace/training/tuition/${item.id}`);
  redirect(`/workspace/training/tuition/${item.id}`);
}

export async function updateTrainingTuition(id: string, formData: FormData) {
  const session = await requireAuth();
  const current = await db.enrollment.findFirst({ where: { id, course: { organizationId: session.organizationId } } });
  if (!current) throw new Error("Không tìm thấy học phí");

  await db.enrollment.update({
    where: { id },
    data: {
      classId: text(formData, "classId") || null,
      status: (text(formData, "status", current.status) as EnrollmentStatus) || current.status,
      progress: numberValue(formData, "progress", current.progress),
      tuitionFee: numberValue(formData, "tuitionFee"),
      paidAmount: numberValue(formData, "paidAmount"),
      paymentStatus: text(formData, "paymentStatus", current.paymentStatus),
      paymentNote: optionalText(formData, "paymentNote"),
      startedAt: dateValue(formData, "startedAt"),
      completedAt: dateValue(formData, "completedAt"),
      certificateAt: dateValue(formData, "certificateAt"),
    },
  });

  await syncTuitionInvoiceForSession(id, session);

  revalidateTraining();
  revalidatePath(`/workspace/training/tuition/${id}`);
  revalidatePath("/workspace/finance/invoices");
  redirect(`/workspace/training/tuition/${id}`);
}

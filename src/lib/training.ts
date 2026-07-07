import { Prisma, UserRole, type CourseStatus, type EnrollmentStatus } from "@prisma/client";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { legacyTuitionInvoiceNumber } from "@/lib/training/tuition-finance";

export type TrainingCourseRow = {
  id: string;
  title: string;
  description: string;
  status: CourseStatus;
  level: string;
  price: number;
  currency: string;
  duration: number | null;
  instructor: string;
  classes: number;
  enrollments: number;
  publishedAt: string | null;
};

export type TrainingStudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrollments: number;
  active: number;
  completed: number;
  progress: number;
};

export type TrainingInstructorRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  courses: number;
  classes: number;
};

export type TrainingClassRow = {
  id: string;
  name: string;
  code: string;
  course: string;
  instructor: string;
  startDate: string | null;
  endDate: string | null;
  location: string;
  maxStudents: number;
  students: number;
  isActive: boolean;
};

export type TrainingCertificateRow = {
  id: string;
  student: string;
  email: string;
  course: string;
  className: string;
  status: EnrollmentStatus;
  progress: number;
  issuedAt: string | null;
};

export type TrainingTuitionRow = {
  id: string;
  student: string;
  email: string;
  course: string;
  className: string;
  invoiceId: string | null;
  invoiceNumber: string;
  invoiceStatus: string | null;
  invoiceAmountDue: number;
  tuitionFee: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  enrolledAt: string | null;
};

export type TrainingPotentialStudentRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  interestedIn: string;
  status: string;
  note: string;
  nextFollowUpAt: string | null;
};

export type TrainingScheduleRow = {
  id: string;
  title: string;
  course: string;
  instructor: string;
  startDate: string | null;
  endDate: string | null;
  location: string;
  schedule: string;
  source: "CLASS" | "LESSON";
  href: string;
  mode?: string;
};

export type TrainingFormOptions = {
  courses: { id: string; title: string; price: number }[];
  classes: { id: string; name: string; courseId: string; courseTitle: string; price: number; startDate: string | null; endDate: string | null }[];
  instructors: { id: string; name: string; email: string }[];
  students: { id: string; name: string; email: string }[];
};

function dateString(value?: Date | string | null) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function moneyNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber();
  }
  return Number(value || 0);
}

function stringifySchedule(value: unknown) {
  if (!value) return "Chưa cấu hình";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const days = Array.isArray(record.days) ? record.days.join(", ") : "";
    const time = [record.startTime, record.endTime].filter(Boolean).join(" - ");
    return [days, time].filter(Boolean).join(" · ") || "Đã cấu hình";
  }
  return "Đã cấu hình";
}

function plainText(value?: string | null, fallback = "Chưa có mô tả khóa học.") {
  const text = (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text || fallback;
}

function displayText(value?: string | null, fallback = "Chưa cập nhật") {
  const text = (value || "").trim();
  return text || fallback;
}

function displayEmail(value?: string | null) {
  const email = (value || "").trim();
  if (!email || email.endsWith("@no-email.ovc.local")) return "Chưa có email";
  return email;
}

async function getTrainingOrganizationId() {
  const session = await requireAuth();
  return session.organizationId;
}

export async function getTrainingFormOptions(): Promise<TrainingFormOptions> {
  const organizationId = await getTrainingOrganizationId();
  const [courses, classes, instructors, students] = await Promise.all([
    db.course.findMany({
      where: { organizationId },
      select: { id: true, title: true, price: true },
      orderBy: { title: "asc" },
    }),
    db.class.findMany({
      where: {
        course: { organizationId },
        isActive: true,
        OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
      },
      select: {
        id: true,
        name: true,
        courseId: true,
        startDate: true,
        endDate: true,
        course: { select: { title: true, price: true } },
      },
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    }),
    db.organizationMember.findMany({
      where: { organizationId, user: { role: UserRole.INSTRUCTOR } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
    db.organizationMember.findMany({
      where: { organizationId, user: { role: UserRole.STUDENT } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return {
    courses: courses.map((course) => ({ id: course.id, title: course.title, price: moneyNumber(course.price) })),
    classes: classes.map((item) => ({
      id: item.id,
      name: item.name,
      courseId: item.courseId,
      courseTitle: item.course.title,
      price: moneyNumber(item.course.price),
      startDate: dateString(item.startDate),
      endDate: dateString(item.endDate),
    })),
    instructors: instructors.map((item) => ({ id: item.user.id, name: item.user.name, email: displayEmail(item.user.email) })),
    students: students.map((item) => ({ id: item.user.id, name: item.user.name, email: displayEmail(item.user.email) })),
  };
}

export async function getTrainingCourseDetail(id: string) {
  const organizationId = await getTrainingOrganizationId();
  const course = await db.course.findFirst({
    where: { id, organizationId },
    include: {
      instructor: { select: { id: true, name: true, email: true, phone: true } },
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
      classes: { orderBy: [{ startDate: "desc" }, { createdAt: "desc" }], include: { _count: { select: { enrollments: true } } } },
      enrollments: { include: { student: { select: { id: true, name: true, email: true, phone: true } }, class: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      _count: { select: { classes: true, enrollments: true } },
    },
  });

  if (!course) return null;

  const lessonIds = course.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id));
  const schedules = lessonIds.length
    ? await db.$queryRaw<
        {
          id: string;
          lessonId: string;
          classId: string | null;
          title: string;
          mode: string;
          startsAt: Date | null;
          endsAt: Date | null;
          location: string | null;
          onlineUrl: string | null;
          fieldAddress: string | null;
          instructorId: string | null;
          capacity: number | null;
          note: string | null;
          createdAt: Date;
          updatedAt: Date;
          className: string | null;
          instructorName: string | null;
          instructorEmail: string | null;
        }[]
      >(Prisma.sql`
        SELECT
          ls.*,
          c.name AS "className",
          u.name AS "instructorName",
          u.email AS "instructorEmail"
        FROM lesson_schedules ls
        LEFT JOIN classes c ON c.id = ls."classId"
        LEFT JOIN users u ON u.id = ls."instructorId"
        WHERE ls."lessonId" IN (${Prisma.join(lessonIds)})
        ORDER BY ls."startsAt" ASC NULLS LAST, ls."createdAt" DESC
      `)
    : [];

  const schedulesByLesson = new Map<string, unknown[]>();
  for (const schedule of schedules) {
    const list = schedulesByLesson.get(schedule.lessonId) || [];
    list.push({
      id: schedule.id,
      lessonId: schedule.lessonId,
      classId: schedule.classId,
      title: schedule.title,
      mode: schedule.mode,
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
      location: schedule.location,
      onlineUrl: schedule.onlineUrl,
      fieldAddress: schedule.fieldAddress,
      instructorId: schedule.instructorId,
      capacity: schedule.capacity,
      note: schedule.note,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
      class: schedule.classId ? { id: schedule.classId, name: schedule.className || "Lớp học" } : null,
      instructor: schedule.instructorId ? { id: schedule.instructorId, name: schedule.instructorName || "Giảng viên", email: schedule.instructorEmail || "" } : null,
    });
    schedulesByLesson.set(schedule.lessonId, list);
  }

  return {
    ...course,
    sections: course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => ({
        ...lesson,
        schedules: schedulesByLesson.get(lesson.id) || [],
      })),
    })),
  };
}

export async function getTrainingClassDetail(id: string) {
  const organizationId = await getTrainingOrganizationId();
  return db.class.findFirst({
    where: { id, course: { organizationId } },
    include: {
      course: { include: { instructor: { select: { id: true, name: true, email: true, phone: true } } } },
      enrollments: { include: { student: { select: { id: true, name: true, email: true, phone: true } } }, orderBy: { createdAt: "desc" } },
      lessonSchedules: {
        include: {
          lesson: { select: { id: true, title: true } },
          instructor: { select: { id: true, name: true, email: true, phone: true } },
        },
        orderBy: [{ startsAt: "asc" }, { createdAt: "asc" }],
      },
      _count: { select: { enrollments: true, attendances: true } },
    },
  });
}

export async function getTrainingStudentDetail(id: string) {
  const organizationId = await getTrainingOrganizationId();
  const member = await db.organizationMember.findFirst({
    where: { organizationId, userId: id, user: { role: UserRole.STUDENT } },
    include: {
      user: {
        include: {
          enrollments: {
            where: { course: { organizationId } },
            include: { course: { select: { id: true, title: true } }, class: { select: { id: true, name: true } } },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  return member?.user || null;
}

export async function getTrainingInstructorDetail(id: string) {
  const organizationId = await getTrainingOrganizationId();
  const member = await db.organizationMember.findFirst({
    where: { organizationId, userId: id, user: { role: UserRole.INSTRUCTOR } },
    include: {
      user: {
        include: {
          instructorCourses: {
            where: { organizationId },
            include: { _count: { select: { classes: true, enrollments: true } } },
            orderBy: { updatedAt: "desc" },
          },
        },
      },
    },
  });

  return member?.user || null;
}

export async function getTrainingPotentialStudentDetail(id: string) {
  const organizationId = await getTrainingOrganizationId();
  return db.potentialStudent.findFirst({ where: { id, organizationId } });
}

export async function getTrainingTuitionDetail(id: string) {
  const organizationId = await getTrainingOrganizationId();
  return db.enrollment.findFirst({
    where: { id, course: { organizationId } },
    include: {
      student: { select: { id: true, name: true, email: true, phone: true } },
      course: { select: { id: true, organizationId: true, title: true, price: true } },
      class: { select: { id: true, name: true } },
    },
  });
}

export async function getTrainingCourses(): Promise<TrainingCourseRow[]> {
  const organizationId = await getTrainingOrganizationId();
  const courses = await db.course.findMany({
    where: { organizationId },
    include: {
      instructor: { select: { name: true } },
      _count: { select: { classes: true, enrollments: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: plainText(course.description),
    status: course.status,
    level: course.level,
    price: moneyNumber(course.price),
    currency: course.currency,
    duration: course.duration,
    instructor: course.instructor?.name || "Chưa phân công",
    classes: course._count.classes,
    enrollments: course._count.enrollments,
    publishedAt: dateString(course.publishedAt),
  }));
}

export async function getTrainingClasses(): Promise<TrainingClassRow[]> {
  const organizationId = await getTrainingOrganizationId();
  const classes = await db.class.findMany({
    where: { course: { organizationId } },
    include: {
      course: { include: { instructor: { select: { name: true } } } },
      _count: { select: { enrollments: true } },
    },
    orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
  });

  return classes.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code || "Chưa có mã",
    course: item.course.title,
    instructor: item.course.instructor?.name || "Chưa phân công",
    startDate: dateString(item.startDate),
    endDate: dateString(item.endDate),
    location: item.location || "Chưa cập nhật",
    maxStudents: item.maxStudents,
    students: item._count.enrollments,
    isActive: item.isActive,
  }));
}

export async function getTrainingStudents(): Promise<TrainingStudentRow[]> {
  const organizationId = await getTrainingOrganizationId();
  const [members, enrollments] = await Promise.all([
    db.organizationMember.findMany({
      where: { organizationId, user: { role: UserRole.STUDENT } },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.enrollment.findMany({
      where: { course: { organizationId } },
      include: { student: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rows = new Map<string, TrainingStudentRow>();

  for (const member of members) {
    rows.set(member.user.id, {
      id: member.user.id,
      name: displayText(member.user.name, "Học viên chưa đặt tên"),
      email: displayEmail(member.user.email),
      phone: displayText(member.user.phone),
      enrollments: 0,
      active: 0,
      completed: 0,
      progress: 0,
    });
  }

  for (const enrollment of enrollments) {
    const current =
      rows.get(enrollment.student.id) ||
      {
        id: enrollment.student.id,
        name: displayText(enrollment.student.name, "Học viên chưa đặt tên"),
        email: displayEmail(enrollment.student.email),
        phone: displayText(enrollment.student.phone),
        enrollments: 0,
        active: 0,
        completed: 0,
        progress: 0,
      };
    current.enrollments += 1;
    current.active += enrollment.status === "ACTIVE" ? 1 : 0;
    current.completed += enrollment.status === "COMPLETED" ? 1 : 0;
    current.progress = Math.round(((current.progress * (current.enrollments - 1)) + enrollment.progress) / current.enrollments);
    rows.set(enrollment.student.id, current);
  }

  return Array.from(rows.values()).sort((a, b) => b.enrollments - a.enrollments || displayText(a.name).localeCompare(displayText(b.name)));
}

export async function getTrainingInstructors(): Promise<TrainingInstructorRow[]> {
  const organizationId = await getTrainingOrganizationId();
  const [members, courses] = await Promise.all([
    db.organizationMember.findMany({
      where: { organizationId, user: { role: UserRole.INSTRUCTOR } },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.course.findMany({
      where: { organizationId },
      include: { instructor: { select: { id: true, name: true, email: true, phone: true } }, _count: { select: { classes: true } } },
    }),
  ]);

  const rows = new Map<string, TrainingInstructorRow>();

  for (const member of members) {
    rows.set(member.user.id, {
      id: member.user.id,
      name: member.user.name,
      email: displayEmail(member.user.email),
      phone: member.user.phone || "Chưa cập nhật",
      courses: 0,
      classes: 0,
    });
  }

  for (const course of courses) {
    const current =
      rows.get(course.instructor.id) ||
      {
        id: course.instructor.id,
        name: course.instructor.name,
        email: displayEmail(course.instructor.email),
        phone: course.instructor.phone || "Chưa cập nhật",
        courses: 0,
        classes: 0,
      };
    current.courses += 1;
    current.classes += course._count.classes;
    rows.set(course.instructor.id, current);
  }

  return Array.from(rows.values()).sort((a, b) => b.courses - a.courses || a.name.localeCompare(b.name));
}

export async function getTrainingSchedules(): Promise<TrainingScheduleRow[]> {
  const classes = await getTrainingClasses();
  const organizationId = await getTrainingOrganizationId();
  const [fullClasses, lessonSchedules] = await Promise.all([
    db.class.findMany({
      where: { course: { organizationId } },
      include: { course: { include: { instructor: { select: { name: true } } } } },
      orderBy: [{ startDate: "asc" }, { createdAt: "desc" }],
    }),
    db.$queryRaw<
      {
        id: string;
        lessonId: string;
        courseId: string;
        title: string;
        mode: string;
        startsAt: Date | null;
        endsAt: Date | null;
        location: string | null;
        onlineUrl: string | null;
        fieldAddress: string | null;
        className: string | null;
        courseTitle: string;
        lessonTitle: string;
        instructorName: string | null;
      }[]
    >(Prisma.sql`
      SELECT
        ls.id,
        ls."lessonId",
        cs."courseId",
        ls.title,
        ls.mode::text AS mode,
        ls."startsAt",
        ls."endsAt",
        ls.location,
        ls."onlineUrl",
        ls."fieldAddress",
        c.name AS "className",
        co.title AS "courseTitle",
        l.title AS "lessonTitle",
        u.name AS "instructorName"
      FROM lesson_schedules ls
      INNER JOIN lessons l ON l.id = ls."lessonId"
      INNER JOIN course_sections cs ON cs.id = l."sectionId"
      INNER JOIN courses co ON co.id = cs."courseId"
      LEFT JOIN classes c ON c.id = ls."classId"
      LEFT JOIN users u ON u.id = ls."instructorId"
      WHERE co."organizationId" = ${organizationId}
      ORDER BY ls."startsAt" ASC NULLS LAST, ls."createdAt" DESC
    `),
  ]);

  const scheduleById = new Map(fullClasses.map((item) => [item.id, stringifySchedule(item.schedule)]));

  const classRows: TrainingScheduleRow[] = classes.map((item) => ({
    id: item.id,
    title: item.name,
    course: item.course,
    instructor: item.instructor,
    startDate: item.startDate,
    endDate: item.endDate,
    location: item.location,
    schedule: scheduleById.get(item.id) || "Chưa cấu hình",
    source: "CLASS",
    href: `/workspace/training/classes/${item.id}`,
  }));

  const lessonRows: TrainingScheduleRow[] = lessonSchedules.map((item) => ({
    id: item.id,
    title: item.title || item.lessonTitle,
    course: `${item.courseTitle}${item.className ? ` · ${item.className}` : ""}`,
    instructor: item.instructorName || "Chưa phân công",
    startDate: dateString(item.startsAt),
    endDate: dateString(item.endsAt),
    location: item.fieldAddress || item.location || item.onlineUrl || "Chưa cập nhật",
    schedule: item.mode,
    source: "LESSON",
    href: `/workspace/courses/${item.courseId}#lesson-${item.lessonId}`,
    mode: item.mode,
  }));

  return [...lessonRows, ...classRows].sort((a, b) => {
    const aTime = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
    return aTime - bTime || a.title.localeCompare(b.title);
  });
}

export async function getTrainingCertificates(): Promise<TrainingCertificateRow[]> {
  const organizationId = await getTrainingOrganizationId();
  const certificates = await db.enrollment.findMany({
    where: {
      course: { organizationId },
      OR: [{ certificateAt: { not: null } }, { status: "COMPLETED" }],
    },
    include: {
      student: { select: { name: true, email: true } },
      course: { select: { title: true } },
      class: { select: { name: true } },
    },
    orderBy: [{ certificateAt: "desc" }, { completedAt: "desc" }, { updatedAt: "desc" }],
  });

  return certificates.map((item) => ({
    id: item.id,
    student: item.student.name,
    email: item.student.email,
    course: item.course.title,
    className: item.class?.name || "Chưa xếp lớp",
    status: item.status,
    progress: item.progress,
    issuedAt: dateString(item.certificateAt || item.completedAt),
  }));
}

export async function getTrainingTuition(): Promise<TrainingTuitionRow[]> {
  const organizationId = await getTrainingOrganizationId();
  const enrollments = await db.enrollment.findMany({
    where: { course: { organizationId } },
    include: {
      student: { select: { name: true, email: true } },
      course: { select: { title: true } },
      class: { select: { name: true } },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
  const invoices = await db.invoice.findMany({
    where: {
      organizationId,
      number: { startsWith: "HP-" },
    },
    select: {
      id: true,
      number: true,
      status: true,
      amountDue: true,
      title: true,
      contact: { select: { email: true } },
    },
  });
  const invoiceByNumber = new Map(invoices.map((invoice) => [invoice.number, invoice]));
  const invoiceByStudentCourse = new Map(
    invoices
      .filter((invoice) => invoice.contact?.email && invoice.title)
      .map((invoice) => [`${invoice.contact?.email}|${invoice.title}`, invoice])
  );

  return enrollments.map((item) => {
    const legacyInvoiceNumber = legacyTuitionInvoiceNumber(item.id);
    const invoice = invoiceByNumber.get(legacyInvoiceNumber) || invoiceByStudentCourse.get(`${item.student.email}|Học phí: ${item.course.title}`);
    const tuitionFee = moneyNumber(item.tuitionFee);
    const paidAmount = moneyNumber(item.paidAmount);
    return {
      id: item.id,
      student: item.student.name,
      email: item.student.email,
      course: item.course.title,
      className: item.class?.name || "Chưa xếp lớp",
      invoiceId: invoice?.id || null,
      invoiceNumber: invoice?.number || "HP-MMYYYY00",
      invoiceStatus: invoice?.status || null,
      invoiceAmountDue: invoice ? moneyNumber(invoice.amountDue) : Math.max(0, tuitionFee - paidAmount),
      tuitionFee,
      paidAmount,
      remainingAmount: Math.max(0, tuitionFee - paidAmount),
      paymentStatus: item.paymentStatus,
      enrolledAt: dateString(item.startedAt || item.createdAt),
    };
  });
}

export async function getTrainingPotentialStudents(): Promise<TrainingPotentialStudentRow[]> {
  const organizationId = await getTrainingOrganizationId();
  const students = await db.potentialStudent.findMany({
    where: { organizationId },
    orderBy: [{ nextFollowUpAt: "asc" }, { createdAt: "desc" }],
  });

  return students.map((item) => ({
    id: item.id,
    name: displayText(item.name, "Lead chưa đặt tên"),
    email: displayText(item.email),
    phone: displayText(item.phone),
    source: displayText(item.source),
    interestedIn: displayText(item.interestedIn, "Chưa chọn khóa"),
    status: displayText(item.status, "new"),
    note: displayText(item.note, "Chưa có ghi chú"),
    nextFollowUpAt: dateString(item.nextFollowUpAt),
  }));
}

export async function getTrainingOverview() {
  const [courses, classes, students, instructors, certificates, schedules, tuition, potentialStudents] = await Promise.all([
    getTrainingCourses(),
    getTrainingClasses(),
    getTrainingStudents(),
    getTrainingInstructors(),
    getTrainingCertificates(),
    getTrainingSchedules(),
    getTrainingTuition(),
    getTrainingPotentialStudents(),
  ]);

  const revenue = tuition.reduce((sum, item) => sum + item.paidAmount, 0);
  const tuitionDebt = tuition.reduce((sum, item) => sum + item.remainingAmount, 0);
  const activeClasses = classes.filter((item) => item.isActive).length;
  const activeStudents = students.filter((item) => item.active > 0).length;

  return {
    stats: {
      revenue,
      students: students.length,
      courses: courses.length,
      activeClasses,
      instructors: instructors.length,
      certificates: certificates.length,
      activeStudents,
      schedules: schedules.length,
      tuitionDebt,
      potentialStudents: potentialStudents.length,
    },
    courses,
    classes,
    students,
    instructors,
    certificates,
    schedules,
    tuition,
    potentialStudents,
  };
}

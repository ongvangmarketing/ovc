import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { requireInstructorPortal, requireStudentPortal } from "@/lib/auth/rbac";

const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

function dateString(value?: Date | string | null) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function plainText(value?: string | null) {
  return value?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || null;
}

function moneyNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") return value.toNumber();
  return Number(value || 0);
}

export async function getStudentLearningPortalData() {
  const session = await requireStudentPortal();
  const organizationId = session.organizationId;
  const userId = session.user.id;

  const [enrollments, schedules, submissions] = await Promise.all([
    db.enrollment.findMany({
      where: { studentId: userId, course: { organizationId } },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true, email: true } },
            sections: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
          },
        },
        class: { select: { id: true, name: true, startDate: true, endDate: true, location: true } },
        completions: { select: { lessonId: true, completedAt: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    }),
    db.$queryRaw<
      {
        id: string;
        courseId: string;
        title: string | null;
        mode: string;
        startsAt: Date | null;
        endsAt: Date | null;
        location: string | null;
        onlineUrl: string | null;
        fieldAddress: string | null;
        lessonTitle: string;
        courseTitle: string;
        className: string | null;
      }[]
    >(Prisma.sql`
      SELECT ls.id, co.id AS "courseId", ls.title, ls.mode::text AS mode, ls."startsAt", ls."endsAt", ls.location, ls."onlineUrl", ls."fieldAddress",
             l.title AS "lessonTitle", co.title AS "courseTitle", c.name AS "className"
      FROM lesson_schedules ls
      INNER JOIN lessons l ON l.id = ls."lessonId"
      INNER JOIN course_sections cs ON cs.id = l."sectionId"
      INNER JOIN courses co ON co.id = cs."courseId"
      INNER JOIN enrollments e ON e."courseId" = co.id AND e."studentId" = ${userId}
      LEFT JOIN classes c ON c.id = ls."classId"
      WHERE co."organizationId" = ${organizationId}
        AND (ls."classId" IS NULL OR ls."classId" = e."classId")
      ORDER BY ls."startsAt" ASC NULLS LAST, ls."createdAt" DESC
      LIMIT 8
    `),
    db.assignmentSubmission.findMany({
      where: { studentId: userId },
      include: { assignment: true, grader: { select: { name: true } } },
      orderBy: { submittedAt: "desc" },
      take: 8,
    }),
  ]);

  const courses = enrollments.map((enrollment) => {
    const lessons = enrollment.course.sections.flatMap((section) => section.lessons);
    const completedIds = new Set(enrollment.completions.map((item) => item.lessonId));
    const completedLessons = lessons.filter((lesson) => completedIds.has(lesson.id)).length;
    const progress = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : enrollment.progress;
    const remainingAmount = Math.max(0, moneyNumber(enrollment.tuitionFee) - moneyNumber(enrollment.paidAmount));

    return {
      id: enrollment.id,
      courseId: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description || "Khóa học online đang được giảng viên cập nhật nội dung.",
      instructor: enrollment.course.instructor?.name || "Giảng viên OVC",
      className: enrollment.class?.name || "Chưa xếp lớp",
      status: enrollment.status,
      progress,
      completedLessons,
      totalLessons: lessons.length,
      nextLesson: lessons.find((lesson) => !completedIds.has(lesson.id))?.title || "Đã hoàn tất nội dung",
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        type: lesson.type,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        isFree: lesson.isFree,
        isCompleted: completedIds.has(lesson.id),
      })),
      tuitionFee: currency.format(moneyNumber(enrollment.tuitionFee)),
      remainingAmount: currency.format(remainingAmount),
      startedAt: dateString(enrollment.startedAt || enrollment.createdAt),
    };
  });

  const totalLessons = courses.reduce((sum, item) => sum + item.totalLessons, 0);
  const completedLessons = courses.reduce((sum, item) => sum + item.completedLessons, 0);
  const averageProgress = courses.length ? Math.round(courses.reduce((sum, item) => sum + item.progress, 0) / courses.length) : 0;

  return {
    user: session.user,
    stats: {
      courses: courses.length,
      averageProgress,
      completedLessons,
      totalLessons,
      upcomingSchedules: schedules.length,
    },
    courses,
    schedules: schedules.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      title: item.title || item.lessonTitle,
      course: item.courseTitle,
      className: item.className || "Lớp chung",
      mode: item.mode,
      startsAt: dateString(item.startsAt),
      endsAt: dateString(item.endsAt),
      location: item.fieldAddress || item.location || item.onlineUrl || "Chưa cập nhật",
      onlineUrl: item.onlineUrl,
    })),
    submissions: submissions.map((item) => ({
      id: item.id,
      title: item.assignment.title,
      submittedAt: dateString(item.submittedAt),
      score: item.score,
      maxScore: item.assignment.maxScore,
      feedback: item.feedback,
      grader: item.grader?.name || "Giảng viên",
    })),
  };
}

export async function getInstructorLearningPortalData() {
  const session = await requireInstructorPortal();
  const organizationId = session.organizationId;
  const userId = session.user.id;

  const [courses, schedules] = await Promise.all([
    db.course.findMany({
      where: { organizationId, instructorId: userId },
      include: {
        classes: { include: { _count: { select: { enrollments: true } } }, orderBy: [{ startDate: "asc" }, { createdAt: "desc" }] },
        enrollments: { include: { student: { select: { id: true, name: true, email: true, phone: true } }, class: { select: { name: true } } }, orderBy: { updatedAt: "desc" } },
        sections: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
        _count: { select: { classes: true, enrollments: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    }),
    db.$queryRaw<
      {
        id: string;
        courseId: string;
        title: string | null;
        mode: string;
        startsAt: Date | null;
        endsAt: Date | null;
        location: string | null;
        onlineUrl: string | null;
        fieldAddress: string | null;
        lessonTitle: string;
        courseTitle: string;
        className: string | null;
      }[]
    >(Prisma.sql`
      SELECT ls.id, co.id AS "courseId", ls.title, ls.mode::text AS mode, ls."startsAt", ls."endsAt", ls.location, ls."onlineUrl", ls."fieldAddress",
             l.title AS "lessonTitle", co.title AS "courseTitle", c.name AS "className"
      FROM lesson_schedules ls
      INNER JOIN lessons l ON l.id = ls."lessonId"
      INNER JOIN course_sections cs ON cs.id = l."sectionId"
      INNER JOIN courses co ON co.id = cs."courseId"
      LEFT JOIN classes c ON c.id = ls."classId"
      WHERE co."organizationId" = ${organizationId}
        AND (ls."instructorId" = ${userId} OR co."instructorId" = ${userId})
      ORDER BY ls."startsAt" ASC NULLS LAST, ls."createdAt" DESC
      LIMIT 10
    `),
  ]);

  const instructorLessonIds = courses.flatMap((course) => course.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id)));
  const submissions = instructorLessonIds.length
    ? await db.assignmentSubmission.findMany({
        where: {
          assignment: { lessonId: { in: instructorLessonIds } },
          OR: [{ graderId: userId }, { graderId: null }],
        },
        include: { assignment: true, student: { select: { name: true, email: true } } },
        orderBy: [{ gradedAt: "asc" }, { submittedAt: "desc" }],
        take: 12,
      })
    : [];

  const assignments = instructorLessonIds.length
    ? await db.assignment.findMany({
        where: { lessonId: { in: instructorLessonIds } },
        select: { id: true, lessonId: true, title: true, dueDate: true, maxScore: true },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      })
    : [];
  const assignmentsByLessonId = assignments.reduce<Record<string, (typeof assignments)[number][]>>((acc, assignment) => {
    if (!assignment.lessonId) return acc;
    const lessonAssignments = acc[assignment.lessonId] || [];
    lessonAssignments.push(assignment);
    acc[assignment.lessonId] = lessonAssignments;
    return acc;
  }, {});

  const classCount = courses.reduce((sum, item) => sum + item._count.classes, 0);
  const studentCount = courses.reduce((sum, item) => sum + item._count.enrollments, 0);
  const lessonCount = courses.reduce((sum, item) => sum + item.sections.reduce((total, section) => total + section.lessons.length, 0), 0);
  const publishedLessons = courses.reduce((sum, item) => sum + item.sections.reduce((total, section) => total + section.lessons.filter((lesson) => lesson.isPublished).length, 0), 0);
  const pendingSubmissions = submissions.filter((item) => item.score === null).length;

  return {
    user: session.user,
    stats: {
      courses: courses.length,
      classes: classCount,
      students: studentCount,
      lessons: lessonCount,
      publishedLessons,
      assignments: assignments.length,
      pendingSubmissions,
    },
    courses: courses.map((course) => {
      const lessons = course.sections.flatMap((section) => section.lessons);
      const courseAssignments = lessons.flatMap((lesson) => assignmentsByLessonId[lesson.id] || []);
      const averageProgress = course.enrollments.length
        ? Math.round(course.enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / course.enrollments.length)
        : 0;

      return {
        id: course.id,
        title: course.title,
        description: plainText(course.description) || "Khóa học online cần cập nhật bài giảng, tài nguyên và bài tập.",
        status: course.status,
        level: course.level,
        duration: course.duration,
        thumbnail: course.thumbnail,
        tags: course.tags,
        outcomes: course.outcomes,
        classes: course._count.classes,
        students: course._count.enrollments,
        lessons: lessons.length,
        publishedLessons: lessons.filter((lesson) => lesson.isPublished).length,
        assignments: courseAssignments.length,
        averageProgress,
        classList: course.classes.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
          startDate: dateString(item.startDate),
          endDate: dateString(item.endDate),
          location: item.location,
          students: item._count.enrollments,
          maxStudents: item.maxStudents,
          isActive: item.isActive,
        })),
        sections: course.sections.map((section) => ({
          id: section.id,
          title: section.title,
          description: section.description,
          lessons: section.lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            isFree: lesson.isFree,
            isPublished: lesson.isPublished,
            resources: lesson.resources.length,
            assignments: (assignmentsByLessonId[lesson.id] || []).map((assignment) => ({
              id: assignment.id,
              title: assignment.title,
              dueDate: dateString(assignment.dueDate),
              maxScore: assignment.maxScore,
            })),
          })),
        })),
        videoLessons: lessons
          .filter((lesson) => lesson.videoUrl)
          .slice(0, 6)
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            isPublished: lesson.isPublished,
          })),
        enrolledStudentIds: course.enrollments.map((enrollment) => enrollment.student.id),
        latestStudents: course.enrollments.slice(0, 20).map((enrollment) => ({
          id: enrollment.student.id,
          enrollmentId: enrollment.id,
          name: enrollment.student.name,
          email: enrollment.student.email,
          phone: enrollment.student.phone,
          className: enrollment.class?.name || "Chưa xếp lớp",
          progress: enrollment.progress,
        })),
      };
    }),
    schedules: schedules.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      title: item.title || item.lessonTitle,
      course: item.courseTitle,
      className: item.className || "Lớp chung",
      mode: item.mode,
      startsAt: dateString(item.startsAt),
      endsAt: dateString(item.endsAt),
      location: item.fieldAddress || item.location || item.onlineUrl || "Chưa cập nhật",
      onlineUrl: item.onlineUrl,
    })),
    submissions: submissions.map((item) => ({
      id: item.id,
      title: item.assignment.title,
      student: item.student.name,
      content: item.content,
      fileUrl: item.fileUrl,
      submittedAt: dateString(item.submittedAt),
      score: item.score,
      maxScore: item.assignment.maxScore,
      feedback: item.feedback,
    })),
  };
}

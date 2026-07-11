import { getTenantDb } from "@/lib/db";
import { NotificationType } from "@prisma/client";

export class StudentService {
  static async requireStudentEnrollment(organizationId: string, studentId: string, courseId: string) {
    const enrollment = await getTenantDb().enrollment.findFirst({
      where: {
        courseId,
        studentId,
        course: { organizationId },
      },
      include: {
        course: { select: { id: true, title: true, instructorId: true } },
      },
    });
    if (!enrollment) throw new Error("Bạn chưa được ghi danh vào khóa học này.");
    return enrollment;
  }

  static async refreshProgress(enrollmentId: string, courseId: string) {
    const [totalLessons, completedLessons] = await Promise.all([
      getTenantDb().lesson.count({ where: { isPublished: true, section: { courseId } } }),
      getTenantDb().lessonCompletion.count({ where: { enrollmentId, lesson: { isPublished: true, section: { courseId } } } }),
    ]);
    const progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

    await getTenantDb().enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        completedAt: progress >= 100 ? new Date() : null,
      },
    });
  }

  static async completeLesson(organizationId: string, studentId: string, courseId: string, lessonId: string) {
    const enrollment = await this.requireStudentEnrollment(organizationId, studentId, courseId);

    const lesson = await getTenantDb().lesson.findFirst({
      where: { id: lessonId, isPublished: true, section: { courseId } },
      select: { id: true },
    });
    if (!lesson) throw new Error("Không tìm thấy bài học trong khóa.");

    await getTenantDb().lessonCompletion.upsert({
      where: { lessonId_enrollmentId: { lessonId, enrollmentId: enrollment.id } },
      update: { completedAt: new Date() },
      create: { lessonId, enrollmentId: enrollment.id },
    });

    await this.refreshProgress(enrollment.id, courseId);
  }

  static async submitAssignment(
    organizationId: string,
    studentId: string,
    studentName: string,
    studentEmail: string,
    courseId: string,
    assignmentId: string,
    content: string | null,
    fileUrl: string | null
  ) {
    const enrollment = await this.requireStudentEnrollment(organizationId, studentId, courseId);

    const assignment = await getTenantDb().assignment.findFirst({
      where: { id: assignmentId, lessonId: { not: null } },
      include: { submissions: { where: { studentId }, select: { id: true } } },
    });
    if (!assignment?.lessonId) throw new Error("Không tìm thấy bài tập.");

    const lesson = await getTenantDb().lesson.findFirst({ where: { id: assignment.lessonId, section: { courseId } }, select: { id: true } });
    if (!lesson) throw new Error("Bài tập không thuộc khóa học này.");

    await getTenantDb().assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      update: {
        content,
        fileUrl,
        submittedAt: new Date(),
        score: null,
        feedback: null,
        graderId: null,
        gradedAt: null,
      },
      create: {
        assignmentId,
        studentId,
        content,
        fileUrl,
      },
    });

    await getTenantDb().notification.create({
      data: {
        userId: enrollment.course.instructorId,
        type: NotificationType.MESSAGE,
        title: "Học viên vừa nộp bài",
        body: `${studentName || studentEmail} đã nộp: ${assignment.title}`,
        link: "/instructor/grading",
        data: { courseId, assignmentId },
      },
    });
  }

  static async askQuestion(
    organizationId: string,
    studentId: string,
    studentName: string,
    studentEmail: string,
    courseId: string,
    lessonId: string | null,
    question: string
  ) {
    const enrollment = await this.requireStudentEnrollment(organizationId, studentId, courseId);
    if (!question) throw new Error("Vui lòng nhập câu hỏi.");

    if (lessonId) {
      const lesson = await getTenantDb().lesson.findFirst({ where: { id: lessonId, section: { courseId } }, select: { id: true } });
      if (!lesson) throw new Error("Bài học không thuộc khóa này.");
    }

    await getTenantDb().activityLog.create({
      data: {
        organizationId,
        userId: studentId,
        action: "asked",
        entity: "LearningQuestion",
        entityId: courseId,
        description: question,
        metadata: {
          courseId,
          courseTitle: enrollment.course.title,
          lessonId,
          studentName,
          studentEmail,
        },
      },
    });

    await getTenantDb().notification.create({
      data: {
        userId: enrollment.course.instructorId,
        type: NotificationType.MESSAGE,
        title: "Câu hỏi mới từ học viên",
        body: `${studentName || studentEmail}: ${question}`,
        link: `/instructor/courses/${courseId}`,
        data: { courseId, lessonId },
      },
    });
  }

  static async getEnrollmentsWithLessons(organizationId: string, studentId: string) {
    return getTenantDb().enrollment.findMany({
      where: { studentId, course: { organizationId } },
      include: { course: { include: { sections: { include: { lessons: true } } } } },
    });
  }

  static async getAssignmentsForLessons(lessonIds: string[], studentId: string) {
    return getTenantDb().assignment.findMany({
      where: { lessonId: { in: lessonIds } },
      orderBy: { dueDate: "asc" },
      include: { submissions: { where: { studentId }, orderBy: { submittedAt: "desc" } } },
    });
  }

  static async getEnrollmentDetail(organizationId: string, studentId: string, courseId: string) {
    return getTenantDb().enrollment.findFirst({
      where: { courseId, studentId, course: { organizationId } },
      include: {
        class: true,
        completions: true,
        course: {
          include: {
            instructor: { select: { name: true, email: true } },
            sections: {
              orderBy: { order: "asc" },
              include: { lessons: { where: { isPublished: true }, orderBy: { order: "asc" }, include: { schedules: { orderBy: { startsAt: "asc" } } } } },
            },
          },
        },
      },
    });
  }

  static async getLearningQuestions(organizationId: string, studentId: string, take = 20, courseId?: string) {
    return getTenantDb().activityLog.findMany({
      where: { 
        organizationId, 
        userId: studentId, 
        entity: "LearningQuestion",
        ...(courseId ? { entityId: courseId } : {})
      },
      orderBy: { createdAt: "desc" },
      take,
    });
  }
}

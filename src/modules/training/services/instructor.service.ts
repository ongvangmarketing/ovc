import { getTenantDb } from "@/lib/db";
import { CourseStatus, LessonScheduleMode, LessonType } from "@prisma/client";

export class InstructorService {
  static async getInstructorCourse(organizationId: string, instructorId: string, courseId: string) {
    const db = getTenantDb(organizationId);
    const course = await db.course.findFirst({
      where: { id: courseId, instructorId },
      select: { id: true, title: true, price: true },
    });
    if (!course) throw new Error("Không tìm thấy khóa học của giảng viên.");
    return { course, db };
  }

  static async updateCourse(organizationId: string, instructorId: string, courseId: string, data: any) {
    const { db } = await this.getInstructorCourse(organizationId, instructorId, courseId);
    return db.course.update({
      where: { id: courseId },
      data,
    });
  }

  static async createSection(organizationId: string, instructorId: string, courseId: string, data: any) {
    const { db } = await this.getInstructorCourse(organizationId, instructorId, courseId);
    const count = await db.courseSection.count({ where: { courseId } });

    return db.courseSection.create({
      data: {
        ...data,
        courseId,
        order: data.order || count + 1,
      },
    });
  }

  static async createLesson(organizationId: string, instructorId: string, courseId: string, sectionId: string, data: any) {
    const { db } = await this.getInstructorCourse(organizationId, instructorId, courseId);
    const section = await db.courseSection.findFirst({
      where: { id: sectionId, courseId },
      include: { _count: { select: { lessons: true } } },
    });
    if (!section) throw new Error("Không tìm thấy học phần.");

    return db.lesson.create({
      data: {
        ...data,
        sectionId,
        order: data.order || section._count.lessons + 1,
      },
    });
  }

  static async updateLesson(organizationId: string, instructorId: string, courseId: string, lessonId: string, data: any) {
    const { db } = await this.getInstructorCourse(organizationId, instructorId, courseId);
    const lesson = await db.lesson.findFirst({ where: { id: lessonId, section: { courseId } }, select: { id: true } });
    if (!lesson) throw new Error("Không tìm thấy bài học.");

    return db.lesson.update({
      where: { id: lessonId },
      data,
    });
  }

  static async createAssignment(organizationId: string, instructorId: string, courseId: string, lessonId: string, data: any) {
    const { db } = await this.getInstructorCourse(organizationId, instructorId, courseId);
    const lesson = await db.lesson.findFirst({ where: { id: lessonId, section: { courseId } }, select: { id: true } });
    if (!lesson) throw new Error("Bài học không thuộc khóa của giảng viên.");

    return db.assignment.create({
      data: {
        ...data,
        lessonId,
      },
    });
  }

  static async createSchedule(organizationId: string, instructorId: string, courseId: string, lessonId: string, classId: string | null, data: any) {
    const { db } = await this.getInstructorCourse(organizationId, instructorId, courseId);
    const lesson = await db.lesson.findFirst({ where: { id: lessonId, section: { courseId } }, select: { id: true } });
    if (!lesson) throw new Error("Bài học không thuộc khóa của giảng viên.");

    if (classId) {
      const classItem = await db.class.findFirst({ where: { id: classId, courseId }, select: { id: true } });
      if (!classItem) throw new Error("Lớp không thuộc khóa học.");
    }

    return db.lessonSchedule.create({
      data: {
        ...data,
        lessonId,
        classId,
        instructorId,
      },
    });
  }

  static async gradeSubmission(organizationId: string, instructorId: string, submissionId: string, score: number, feedback: string | null) {
    const db = getTenantDb(organizationId);
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
        section: { course: { organizationId, instructorId } },
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
        graderId: instructorId,
        gradedAt: new Date(),
      },
    });

    return lesson.section.courseId;
  }

  static async getAnalytics(organizationId: string, instructorId: string) {
    const db = getTenantDb(organizationId);
    return db.enrollment.findMany({
      where: { 
        course: { 
          organizationId,
          instructorId
        }
      },
      include: {
        student: { select: { id: true, name: true, email: true, phone: true } },
        course: { select: { id: true, title: true } },
        class: { select: { id: true, name: true } },
        completions: { select: { lessonId: true } }
      },
      orderBy: { progress: "asc" }
    });
  }

  static async addStudentToCourse(organizationId: string, instructorId: string, courseId: string, studentId: string, classId: string | null) {
    const { course, db } = await this.getInstructorCourse(organizationId, instructorId, courseId);

    if (classId) {
      const classItem = await db.class.findFirst({ where: { id: classId, courseId } });
      if (!classItem) throw new Error("Lớp không thuộc khóa học này.");
    }

    const member = await db.organizationMember.findFirst({
      where: { organizationId, userId: studentId, user: { role: "STUDENT" } },
      select: { userId: true },
    });
    if (!member) throw new Error("Học viên không thuộc organization hiện tại.");

    return db.enrollment.upsert({
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
  }

  static async removeEnrollment(organizationId: string, instructorId: string, enrollmentId: string) {
    const db = getTenantDb(organizationId);
    const enrollment = await db.enrollment.findFirst({
      where: { id: enrollmentId, course: { organizationId, instructorId } },
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

    return enrollment.courseId;
  }

  static async getStudentsForInstructor(organizationId: string) {
    const db = getTenantDb(organizationId);
    const orgStudents = await db.organizationMember.findMany({
      where: { organizationId, user: { role: "STUDENT", isActive: true } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { user: { name: "asc" } },
    });
    return orgStudents.map(item => item.user);
  }

  static async getCourseDetail(organizationId: string, instructorId: string, courseId: string) {
    const db = getTenantDb(organizationId);
    return db.course.findFirst({
      where: { id: courseId, organizationId, instructorId },
      include: {
        classes: { include: { _count: { select: { enrollments: true } } }, orderBy: [{ startDate: "asc" }, { createdAt: "desc" }] },
        enrollments: { include: { student: { select: { id: true, name: true, email: true } }, class: { select: { name: true } } }, orderBy: { updatedAt: "desc" } },
        sections: { include: { lessons: { include: { schedules: { include: { class: { select: { name: true } } }, orderBy: { startsAt: "asc" } } }, orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
        _count: { select: { classes: true, enrollments: true } },
      },
    });
  }

  static async getAssignmentsForLessons(lessonIds: string[], organizationId?: string) {
    if (!lessonIds.length) return [];
    const db = getTenantDb(organizationId);
    return db.assignment.findMany({
      where: { lessonId: { in: lessonIds } },
      include: { submissions: { include: { student: { select: { name: true } } }, orderBy: { submittedAt: "desc" } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });
  }
}

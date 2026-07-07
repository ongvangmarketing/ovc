import { notFound } from "next/navigation";
import { requireStudentPortal } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { CoursePlayerApp } from "./components/course-player";

export default async function NewStudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const session = await requireStudentPortal();
  
  const enrollment = await db.enrollment.findFirst({
    where: { courseId, studentId: session.user.id, course: { organizationId: session.organizationId } },
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
  if (!enrollment) notFound();

  const lessons = enrollment.course.sections.flatMap((section) => section.lessons.map((lesson) => ({ ...lesson, sectionTitle: section.title })));
  const lessonIds = lessons.map((lesson) => lesson.id);
  
  const [assignments, questions] = await Promise.all([
    db.assignment.findMany({
      where: { lessonId: { in: lessonIds } },
      orderBy: { dueDate: "asc" },
      include: { submissions: { where: { studentId: session.user.id }, orderBy: { submittedAt: "desc" } } },
    }),
    db.activityLog.findMany({
      where: { organizationId: session.organizationId, userId: session.user.id, entity: "LearningQuestion", entityId: courseId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <CoursePlayerApp 
      enrollment={enrollment} 
      lessons={lessons} 
      assignments={assignments} 
      questions={questions} 
      courseId={courseId} 
    />
  );
}

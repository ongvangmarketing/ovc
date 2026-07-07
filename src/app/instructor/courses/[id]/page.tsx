import { notFound } from "next/navigation";
import { requireInstructorPortal } from "@/lib/auth/rbac";
import { db } from "@/lib/db";
import { CourseManagerApp } from "./components/course-manager";

export default async function InstructorCourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireInstructorPortal();

  const course = await db.course.findFirst({
    where: { id, organizationId: session.organizationId, instructorId: session.user.id },
    include: {
      classes: { include: { _count: { select: { enrollments: true } } }, orderBy: [{ startDate: "asc" }, { createdAt: "desc" }] },
      enrollments: { include: { student: { select: { id: true, name: true, email: true } }, class: { select: { name: true } } }, orderBy: { updatedAt: "desc" } },
      sections: { include: { lessons: { include: { schedules: { include: { class: { select: { name: true } } }, orderBy: { startsAt: "asc" } } }, orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
      _count: { select: { classes: true, enrollments: true } },
    },
  });

  if (!course) notFound();

  const lessons = course.sections.flatMap((section) => section.lessons.map((lesson) => ({ ...lesson, sectionTitle: section.title })));
  const lessonIds = lessons.map((lesson) => lesson.id);
  const assignments = lessonIds.length
    ? await db.assignment.findMany({
        where: { lessonId: { in: lessonIds } },
        include: { submissions: { include: { student: { select: { name: true } } }, orderBy: { submittedAt: "desc" } } },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      })
    : [];
  const averageProgress = course.enrollments.length
    ? Math.round(course.enrollments.reduce((sum, item) => sum + item.progress, 0) / course.enrollments.length)
    : 0;

  return (
    <CourseManagerApp 
      course={course} 
      lessons={lessons} 
      assignments={assignments} 
      averageProgress={averageProgress} 
    />
  );
}

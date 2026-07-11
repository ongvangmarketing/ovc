import { notFound } from "next/navigation";
import { requireInstructorPortal } from "@/lib/auth/rbac";
import { InstructorService } from "@/modules/training/services/instructor.service";
import { CourseManagerApp } from "./components/course-manager";

export default async function InstructorCourseLearningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireInstructorPortal();

  const course = await InstructorService.getCourseDetail(session.organizationId!, session.user.id, id);

  if (!course) notFound();

  const lessons = course.sections.flatMap((section) => section.lessons.map((lesson) => ({ ...lesson, sectionTitle: section.title })));
  const lessonIds = lessons.map((lesson) => lesson.id);
  const assignments = await InstructorService.getAssignmentsForLessons(lessonIds, session.organizationId!);
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

import { notFound } from "next/navigation";
import { requireStudentPortal } from "@/lib/auth/rbac";
import { StudentService } from "@/modules/training/services/student.service";
import { CoursePlayerApp } from "./components/course-player";

export default async function NewStudentCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const session = await requireStudentPortal();
  
  const enrollment = await StudentService.getEnrollmentDetail(session.organizationId!, session.user.id, courseId);
  if (!enrollment) notFound();

  const lessons = enrollment.course.sections.flatMap((section) => section.lessons.map((lesson) => ({ ...lesson, sectionTitle: section.title })));
  const lessonIds = lessons.map((lesson) => lesson.id);
  
  const [assignments, questions] = await Promise.all([
    StudentService.getAssignmentsForLessons(lessonIds, session.user.id),
    StudentService.getLearningQuestions(session.organizationId!, session.user.id, 8, courseId),
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

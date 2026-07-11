import { FileText } from "lucide-react";
import { requireStudentPortal } from "@/lib/auth/rbac";
import { StudentService } from "@/modules/training/services/student.service";
import { AssignmentList } from "./components/assignment-list";

export default async function NewStudentAssignmentsPage() {
  const session = await requireStudentPortal();
  
  const enrollments = await StudentService.getEnrollmentsWithLessons(session.organizationId!, session.user.id);
  
  const lessonToCourse = {} as Record<string, { courseId: string; courseTitle: string }>;
  enrollments.forEach((enrollment) => {
    enrollment.course.sections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        lessonToCourse[lesson.id] = { courseId: enrollment.courseId, courseTitle: enrollment.course.title };
      });
    });
  });
  
  const lessonIds = Object.keys(lessonToCourse);
  const assignments = await StudentService.getAssignmentsForLessons(lessonIds, session.user.id);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8 animate-in fade-in duration-500">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bài tập & Điểm số</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi bài tập cần làm và nhận xét từ giảng viên.</p>
          </div>
        </div>
      </header>

      <AssignmentList assignments={assignments} lessonToCourse={lessonToCourse} />
    </div>
  );
}

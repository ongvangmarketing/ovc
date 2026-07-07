import type { Metadata } from 'next';
import { getTrainingCourses, type TrainingCourseRow } from '@/lib/training';
import { CoursesWorkspace } from './courses-workspace';

export const metadata: Metadata = { title: 'Khóa học' };
export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  let initialCourses: TrainingCourseRow[] = [];
  try { initialCourses = await getTrainingCourses(); } catch {}
  return <CoursesWorkspace initialCourses={initialCourses} />;
}

import type { Metadata } from 'next';
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { CoursesWorkspace } from './courses-workspace';

export const metadata: Metadata = { title: 'Khóa học' };
export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  let initialCourses: TrainingTypes.TrainingCourseRow[] = [];
  try { initialCourses = await TrainingService.getTrainingCourses(); } catch {}
  return <CoursesWorkspace initialCourses={initialCourses} />;
}

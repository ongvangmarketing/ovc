import type { Metadata } from 'next';
import { getTrainingInstructors, type TrainingInstructorRow } from '@/lib/training';
import { InstructorsWorkspace } from './instructors-workspace';

export const metadata: Metadata = { title: 'Giảng viên' };
export const dynamic = 'force-dynamic';

export default async function InstructorsPage() {
  let initialInstructors: TrainingInstructorRow[] = [];
  try { initialInstructors = await getTrainingInstructors(); } catch {}
  return <InstructorsWorkspace initialInstructors={initialInstructors} />;
}

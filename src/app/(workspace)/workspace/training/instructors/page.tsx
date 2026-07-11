import type { Metadata } from 'next';
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { InstructorsWorkspace } from './instructors-workspace';

export const metadata: Metadata = { title: 'Giảng viên' };
export const dynamic = 'force-dynamic';

export default async function InstructorsPage() {
  let initialInstructors: TrainingTypes.TrainingInstructorRow[] = [];
  try { initialInstructors = await TrainingService.getTrainingInstructors(); } catch {}
  return <InstructorsWorkspace initialInstructors={initialInstructors} />;
}

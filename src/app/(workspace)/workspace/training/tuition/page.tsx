import type { Metadata } from 'next';
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { TuitionWorkspace } from './tuition-workspace';

export const metadata: Metadata = { title: 'Học phí' };
export const dynamic = 'force-dynamic';

export default async function TrainingTuitionPage() {
  let initialTuition: TrainingTypes.TrainingTuitionRow[] = [];
  try { initialTuition = await TrainingService.getTrainingTuition(); } catch {}
  return <TuitionWorkspace initialTuition={initialTuition} />;
}

import type { Metadata } from 'next';
import { getTrainingTuition, type TrainingTuitionRow } from '@/lib/training';
import { TuitionWorkspace } from './tuition-workspace';

export const metadata: Metadata = { title: 'Học phí' };
export const dynamic = 'force-dynamic';

export default async function TrainingTuitionPage() {
  let initialTuition: TrainingTuitionRow[] = [];
  try { initialTuition = await getTrainingTuition(); } catch {}
  return <TuitionWorkspace initialTuition={initialTuition} />;
}

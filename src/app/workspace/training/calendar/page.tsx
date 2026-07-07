import type { Metadata } from 'next';
import { getTrainingSchedules, type TrainingScheduleRow } from '@/lib/training';
import { CalendarWorkspace } from './calendar-workspace';

export const metadata: Metadata = { title: 'Lịch học' };
export const dynamic = 'force-dynamic';

export default async function TrainingCalendarPage() {
  let initialSchedules: TrainingScheduleRow[] = [];
  try { initialSchedules = await getTrainingSchedules(); } catch {}
  return <CalendarWorkspace initialSchedules={initialSchedules} />;
}

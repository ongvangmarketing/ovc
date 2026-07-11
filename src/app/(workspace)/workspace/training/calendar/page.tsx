import type { Metadata } from 'next';
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { CalendarWorkspace } from './calendar-workspace';

export const metadata: Metadata = { title: 'Lịch học' };
export const dynamic = 'force-dynamic';

export default async function TrainingCalendarPage() {
  let initialSchedules: TrainingTypes.TrainingScheduleRow[] = [];
  try { initialSchedules = await TrainingService.getTrainingSchedules(); } catch {}
  return <CalendarWorkspace initialSchedules={initialSchedules} />;
}

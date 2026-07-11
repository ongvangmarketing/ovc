import type { Metadata } from 'next';
import { TrainingService } from "@/modules/training/services/training.service";
import * as TrainingTypes from "@/modules/training/types/training.types";
import { CertificatesWorkspace } from './certificates-workspace';

export const metadata: Metadata = { title: 'Chứng chỉ' };
export const dynamic = 'force-dynamic';

export default async function TrainingCertificatesPage() {
  let initialCerts: TrainingTypes.TrainingCertificateRow[] = [];
  try { initialCerts = await TrainingService.getTrainingCertificates(); } catch {}
  return <CertificatesWorkspace initialCerts={initialCerts} />;
}

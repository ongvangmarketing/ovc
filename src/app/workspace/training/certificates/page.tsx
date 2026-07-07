import type { Metadata } from 'next';
import { getTrainingCertificates, type TrainingCertificateRow } from '@/lib/training';
import { CertificatesWorkspace } from './certificates-workspace';

export const metadata: Metadata = { title: 'Chứng chỉ' };
export const dynamic = 'force-dynamic';

export default async function TrainingCertificatesPage() {
  let initialCerts: TrainingCertificateRow[] = [];
  try { initialCerts = await getTrainingCertificates(); } catch {}
  return <CertificatesWorkspace initialCerts={initialCerts} />;
}

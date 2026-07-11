import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { ContractDetailView } from "@/modules/finance/components/contract-detail";
import { getContractDetailData } from "@/modules/finance/services/contract.service";

export default async function ContractDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();

  const data = await getContractDetailData(session.organizationId, params.id);
  
  if (!data) {
    return notFound();
  }

  const { contract, activityLogs, previousDocument, nextDocument } = data;

  return (
    <ContractDetailView
      data={JSON.parse(JSON.stringify({ ...contract, activityLogs, previousDocument, nextDocument }))}
    />
  );
}

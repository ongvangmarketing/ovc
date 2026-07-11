import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { ContractFormClient } from "@/modules/finance/components/contract-form-client";
import { getContractForEdit } from "@/modules/finance/services/contract.service";

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  
  const contract = await getContractForEdit(session.organizationId, id);

  if (!contract) return notFound();

  return <ContractFormClient mode="edit" initialData={JSON.parse(JSON.stringify(contract))} />;
}

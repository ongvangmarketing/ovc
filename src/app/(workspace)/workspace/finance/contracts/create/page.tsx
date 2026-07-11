import { ContractFormClient } from "@/modules/finance/components/contract-form-client";
import { getNextContractNumber } from "@/modules/finance/actions/finance.actions";
import { getSettings } from "@/actions/settings";
import { requireAuth } from "@/lib/auth/require-auth";
import { getContractFormData } from "@/modules/finance/services/contract.service";

export default async function CreateContractPage(props: { searchParams: Promise<{ quotationId?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await requireAuth();
  const nextNumber = await getNextContractNumber();
  
  const serviceData = await getContractFormData(session.organizationId, searchParams);
  const initialData = serviceData ? { ...serviceData, number: nextNumber } : { number: nextNumber };

  return <ContractFormClient mode="create" initialData={initialData} />;
}

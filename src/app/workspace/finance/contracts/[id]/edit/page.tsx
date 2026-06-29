import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { ContractFormClient } from "@/modules/finance/components/contract-form-client";

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  
  const contract = await db.contract.findFirst({
    where: { id, organizationId: session.organizationId },
    include: {
      items: { orderBy: { order: "asc" } },
      paymentInstallments: { 
        orderBy: { dueDate: "asc" },
        include: { invoice: true }
      },
      contact: { include: { company: true } },
      deal: true,
    }
  });

  if (!contract) return notFound();

  return <ContractFormClient mode="edit" initialData={JSON.parse(JSON.stringify(contract))} />;
}

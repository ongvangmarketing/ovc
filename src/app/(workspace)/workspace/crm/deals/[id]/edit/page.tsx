import { requireAuth } from "@/lib/auth/require-auth";
import { DealFormClient } from "@/modules/crm/components/deal-form-client";
import { notFound } from "next/navigation";
import { getDealById, getDealFormData } from "@/modules/crm/services/deal.service";

function serializeDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

function serializeServiceOption(option: any) {
  return {
    ...option,
    price: Number(option.price ?? 0),
    createdAt: serializeDate(option.createdAt),
    updatedAt: serializeDate(option.updatedAt),
  };
}

function serializeService(service: any) {
  return {
    ...service,
    createdAt: serializeDate(service.createdAt),
    updatedAt: serializeDate(service.updatedAt),
    options: service.options?.map(serializeServiceOption) ?? [],
  };
}

function serializeDealServiceOption(option: any) {
  return {
    ...option,
    quantity: Number(option.quantity ?? 1),
    unitPrice: Number(option.unitPrice ?? 0),
    discount: Number(option.discount ?? 0),
    taxRate: Number(option.taxRate ?? 0),
    selectedAt: serializeDate(option.selectedAt),
    createdAt: serializeDate(option.createdAt),
    updatedAt: serializeDate(option.updatedAt),
    serviceOption: option.serviceOption ? serializeServiceOption({
      ...option.serviceOption,
      service: option.serviceOption.service
        ? {
            ...option.serviceOption.service,
            createdAt: serializeDate(option.serviceOption.service.createdAt),
            updatedAt: serializeDate(option.serviceOption.service.updatedAt),
          }
        : option.serviceOption.service,
    }) : option.serviceOption,
  };
}

function serializeDeal(deal: any) {
  return {
    ...deal,
    value: Number(deal.value ?? 0),
    expectedClose: serializeDate(deal.expectedClose),
    closedAt: serializeDate(deal.closedAt),
    createdAt: serializeDate(deal.createdAt),
    updatedAt: serializeDate(deal.updatedAt),
    serviceOptions: deal.serviceOptions?.map(serializeDealServiceOption) ?? [],
  };
}

function serializeStage(stage: any) {
  return {
    ...stage,
    createdAt: serializeDate(stage.createdAt),
    updatedAt: serializeDate(stage.updatedAt),
  };
}

export default async function EditDealPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await requireAuth();

  const deal = await getDealById(session.organizationId, params.id);
  
  if (!deal) return notFound();

  const { companies, contacts, availableServices, stages, users } = await getDealFormData(session.organizationId);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <DealFormClient 
        mode="edit" 
        deal={serializeDeal(deal)}
        companies={companies}
        contacts={contacts}
        availableServices={availableServices.map(serializeService)}
        stages={stages.map(serializeStage)}
        users={users}
      />
    </div>
  );
}

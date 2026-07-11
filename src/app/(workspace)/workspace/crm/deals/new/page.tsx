import { requireAuth } from "@/lib/auth/require-auth";
import { DealFormClient } from "@/modules/crm/components/deal-form-client";
import { getDealFormData } from "@/modules/crm/services/deal.service";

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

function serializeStage(stage: any) {
  return {
    ...stage,
    createdAt: serializeDate(stage.createdAt),
    updatedAt: serializeDate(stage.updatedAt),
  };
}

export default async function NewDealPage(props: { searchParams: Promise<{ stageId?: string }> }) {
  const searchParams = await props.searchParams;
  const session = await requireAuth();

  const { companies, contacts, availableServices, stages, users } = await getDealFormData(session.organizationId);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <DealFormClient 
        mode="create" 
        companies={companies}
        contacts={contacts}
        availableServices={availableServices.map(serializeService)}
        stages={stages.map(serializeStage)}
        users={users}
        defaultStageId={searchParams.stageId}
      />
    </div>
  );
}

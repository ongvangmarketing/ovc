import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { DealFormClient } from "@/modules/crm/components/deal-form-client";

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

  const [companies, contacts, availableServices, stages, users] = await Promise.all([
    db.company.findMany({ 
      where: { organizationId: session.organizationId },
      select: { id: true, name: true }
    }),
    db.contact.findMany({ 
      where: { organizationId: session.organizationId },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true }
    }),
    db.service.findMany({
      where: { organizationId: session.organizationId, status: "ACTIVE" },
      include: {
        options: {
          where: { status: "ACTIVE" }
        }
      }
    }),
    db.dealStage.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { order: "asc" }
    }),
    db.user.findMany({
      where: { organizationMembers: { some: { organizationId: session.organizationId } } },
      select: { id: true, name: true, email: true }
    })
  ]);

  return (
    <DealFormClient 
      mode="create" 
      companies={companies}
      contacts={contacts}
      availableServices={availableServices.map(serializeService)}
      stages={stages.map(serializeStage)}
      users={users}
      defaultStageId={searchParams.stageId}
    />
  );
}

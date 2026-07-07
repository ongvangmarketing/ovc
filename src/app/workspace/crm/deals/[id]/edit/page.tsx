import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { DealFormClient } from "@/modules/crm/components/deal-form-client";
import { notFound } from "next/navigation";

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

  const [deal, companies, contacts, availableServices, stages, users] = await Promise.all([
    db.deal.findUnique({
      where: { id: params.id, organizationId: session.organizationId },
      include: {
        serviceOptions: {
          include: {
            serviceOption: {
              include: { service: true }
            }
          }
        }
      }
    }),
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

  if (!deal) return notFound();

  return (
    <DealFormClient 
      mode="edit" 
      deal={serializeDeal(deal)}
      companies={companies}
      contacts={contacts}
      availableServices={availableServices.map(serializeService)}
      stages={stages.map(serializeStage)}
      users={users}
    />
  );
}

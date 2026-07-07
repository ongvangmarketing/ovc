import { db } from "@/lib/db";

type FinanceDocumentType = "quotation" | "contract" | "invoice";
type FinanceNotificationEvent = "viewed" | "signed" | "email_opened";

function documentLabel(type: FinanceDocumentType) {
  if (type === "quotation") return "báo giá";
  if (type === "contract") return "hợp đồng";
  return "hóa đơn";
}

function documentLink(type: FinanceDocumentType, id: string) {
  if (type === "quotation") return `/workspace/finance/quotations/${id}`;
  if (type === "contract") return `/workspace/finance/contracts/${id}`;
  return `/workspace/finance/invoices/${id}`;
}

function eventCopy(event: FinanceNotificationEvent, label: string, number: string, customerName?: string | null) {
  const customer = customerName || "Khách hàng";
  if (event === "viewed") {
    return {
      title: `Khách đã xem ${label}`,
      body: `${customer} vừa mở ${label} ${number}.`,
    };
  }
  if (event === "signed") {
    return {
      title: `Khách đã ký ${label}`,
      body: `${customer} vừa ký xác nhận ${label} ${number}.`,
    };
  }
  return {
    title: `Khách đã mở email ${label}`,
    body: `${customer} vừa mở email liên quan đến ${label} ${number}.`,
  };
}

export async function notifyFinanceDocumentEvent(input: {
  organizationId: string;
  type: FinanceDocumentType;
  id: string;
  number: string;
  customerName?: string | null;
  event: FinanceNotificationEvent;
  metadata?: Record<string, unknown>;
  dedupeMinutes?: number;
}) {
  const label = documentLabel(input.type);
  const action = `finance_document_${input.event}`;
  const dedupeSince = new Date(Date.now() - (input.dedupeMinutes ?? 10) * 60 * 1000);

  const recentActivity = await db.activityLog.findFirst({
    where: {
      organizationId: input.organizationId,
      entity: input.type,
      entityId: input.id,
      action,
      createdAt: { gte: dedupeSince },
    },
    select: { id: true },
  });

  if (recentActivity) return { created: false, skipped: "deduped" };

  const copy = eventCopy(input.event, label, input.number, input.customerName);
  const link = documentLink(input.type, input.id);
  const members = await db.organizationMember.findMany({
    where: { organizationId: input.organizationId },
    select: { userId: true },
  });

  await db.activityLog.create({
    data: {
      organizationId: input.organizationId,
      action,
      entity: input.type,
      entityId: input.id,
      description: copy.body,
      metadata: {
        ...input.metadata,
        documentType: input.type,
        documentNumber: input.number,
        event: input.event,
      },
    },
  });

  if (members.length) {
    await db.notification.createMany({
      data: members.map((member) => ({
        userId: member.userId,
        type: "MESSAGE",
        title: copy.title,
        body: copy.body,
        link,
        data: {
          ...input.metadata,
          documentType: input.type,
          documentId: input.id,
          documentNumber: input.number,
          event: input.event,
        },
      })),
    });
  }

  return { created: true };
}

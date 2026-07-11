import { getTenantDb } from "@/lib/db";
import { notifyFinanceDocumentEvent } from "@/lib/notifications/finance";

const PIXEL = Buffer.from(
  "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
  "base64",
);

function cleanLogId(value: string) {
  return value.replace(/\.png$/i, "").trim();
}

function jsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function financeType(value?: string | null) {
  return value === "quotation" || value === "contract" || value === "invoice" ? value : null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ logId: string }> }) {
  const { logId } = await params;
  const id = cleanLogId(logId);
  const log = await getTenantDb().emailLog.findUnique({
    where: { id },
    select: {
      id: true,
      organizationId: true,
      relatedType: true,
      relatedId: true,
      subject: true,
      metadata: true,
    },
  }).catch(() => null);

  if (log) {
    const metadata = jsonObject(log.metadata);
    const openCount = Number(metadata.openCount || 0) + 1;
    const firstOpen = metadata.openedAt || new Date().toISOString();

    await getTenantDb().emailLog.update({
      where: { id: log.id },
      data: {
        metadata: {
          ...metadata,
          openedAt: firstOpen,
          lastOpenedAt: new Date().toISOString(),
          openCount,
        },
      },
    }).catch(() => {});

    const type = financeType(log.relatedType);
    if (type && log.relatedId) {
      const doc =
        type === "quotation"
          ? await getTenantDb().quotation.findFirst({ where: { id: log.relatedId, organizationId: log.organizationId }, include: { contact: { include: { company: true } } } })
          : type === "contract"
            ? await getTenantDb().contract.findFirst({ where: { id: log.relatedId, organizationId: log.organizationId }, include: { contact: { include: { company: true } } } })
            : await getTenantDb().invoice.findFirst({ where: { id: log.relatedId, organizationId: log.organizationId }, include: { contact: { include: { company: true } } } });

      if (doc) {
        const customerName = doc.contact?.company?.name || [doc.contact?.firstName, doc.contact?.lastName].filter(Boolean).join(" ").trim() || doc.contact?.email || "Khách hàng";
        await notifyFinanceDocumentEvent({
          organizationId: log.organizationId,
          type,
          id: doc.id,
          number: doc.number,
          customerName,
          event: "email_opened",
          metadata: { emailLogId: log.id, subject: log.subject, openCount },
          dedupeMinutes: 15,
        }).catch(() => {});
      }
    }
  }

  return new Response(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, max-age=0",
    },
  });
}

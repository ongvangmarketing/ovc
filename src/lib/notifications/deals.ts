import { db } from "@/lib/db";
import { formatVnd, renderEmailTemplate, sendEmail } from "@/lib/email/service";
import { getOrganizationPublicBaseUrl } from "@/lib/workspace-domain";

type DealNotifyEvent = "viewed" | "approved";

function customerNameFromDeal(deal: any, fallback?: string | null) {
  return (
    fallback ||
    deal.company?.name ||
    [deal.contact?.firstName, deal.contact?.lastName].filter(Boolean).join(" ").trim() ||
    deal.contact?.email ||
    "Khách hàng"
  );
}

async function dealRecipients(organizationId: string, assigneeId?: string | null) {
  const members = await db.organizationMember.findMany({
    where: {
      organizationId,
      OR: [
        { role: { in: ["OWNER", "ADMIN"] } },
        ...(assigneeId ? [{ userId: assigneeId }] : []),
      ],
    },
    include: { user: true },
  });

  const unique = new Map<string, { userId: string; email?: string | null; name?: string | null }>();
  members.forEach((member) => {
    unique.set(member.userId, {
      userId: member.userId,
      email: member.user.email,
      name: member.user.name,
    });
  });

  return Array.from(unique.values());
}

export async function notifyDealCustomerEvent(input: {
  organizationId: string;
  dealId: string;
  title: string;
  assigneeId?: string | null;
  event: DealNotifyEvent;
  customerName?: string | null;
  selectedOptionIds?: string[];
  selectedOptionNames?: string[];
  contactId?: string | null;
  companyId?: string | null;
  total?: number;
  dedupeMinutes?: number;
  sendEmail?: boolean;
}) {
  const dedupeSince = new Date(Date.now() - (input.dedupeMinutes ?? 15) * 60 * 1000);
  const existing = await db.activityLog.findFirst({
    where: {
      organizationId: input.organizationId,
      entity: "Deal",
      entityId: input.dealId,
      action: `customer_${input.event}`,
      createdAt: { gte: dedupeSince },
    },
    select: { id: true },
  });

  if (existing) return { skipped: true };

  const title = input.event === "viewed" ? "Khách hàng đã mở deal" : "Khách hàng đã duyệt deal";
  const body =
    input.event === "viewed"
      ? `${input.customerName || "Khách hàng"} đã mở trang đề xuất cho ${input.title}.`
      : `${input.customerName || "Khách hàng"} đã xác nhận lựa chọn cho ${input.title}.`;

  await db.activityLog.create({
    data: {
      organizationId: input.organizationId,
      entity: "Deal",
      entityId: input.dealId,
      action: `customer_${input.event}`,
      description: body,
      metadata: {
        selectedOptionIds: input.selectedOptionIds || [],
        selectedOptionNames: input.selectedOptionNames || [],
        contactId: input.contactId,
        companyId: input.companyId,
      },
    },
  });

  const recipients = await dealRecipients(input.organizationId, input.assigneeId);
  if (recipients.length) {
    await db.notification.createMany({
      data: recipients.map((recipient) => ({
        userId: recipient.userId,
        type: "MESSAGE",
        title,
        body,
        link: `/workspace/crm/deals/${input.dealId}`,
        data: {
          dealId: input.dealId,
          event: input.event,
          selectedOptionIds: input.selectedOptionIds || [],
          contactId: input.contactId,
          companyId: input.companyId,
        },
      })),
      skipDuplicates: false,
    });
  }

  if (input.event === "approved" && input.sendEmail !== false) {
    const emails = Array.from(new Set(recipients.map((recipient) => recipient.email).filter(Boolean) as string[]));
    if (emails.length) {
      const baseUrl = await getOrganizationPublicBaseUrl(input.organizationId, "app").catch(() => "https://app.ongvang.com.vn");
      const dealLink = `${baseUrl}/workspace/crm/deals/${input.dealId}`;
      const variables = {
        deal_title: input.title,
        deal_link: dealLink,
        customer_name: input.customerName || "Khách hàng",
        deal_total: formatVnd(input.total || 0),
        selected_options: (input.selectedOptionNames || []).join("<br>") || "Khách hàng đã xác nhận deal.",
        action_url: dealLink,
        action_label: "Xem deal",
      };
      const rendered = await renderEmailTemplate({
        organizationId: input.organizationId,
        code: "DEAL_APPROVED_INTERNAL",
        variables,
        fallbackSubject: `[Deal] Khách hàng đã duyệt ${input.title}`,
        fallbackBody: `
          <div style="font-family:Inter,Arial,sans-serif;color:#111827;line-height:1.65">
            <h2 style="margin:0 0 10px;color:#ea580c">Khách hàng đã duyệt deal</h2>
            <p><strong>${variables.customer_name}</strong> đã xác nhận lựa chọn cho deal <strong>${variables.deal_title}</strong>.</p>
            <p><strong>Giá trị đã chọn:</strong> ${variables.deal_total}</p>
            <div style="margin:14px 0;padding:12px;border:1px solid #fed7aa;border-radius:10px;background:#fff7ed">${variables.selected_options}</div>
            <p><a href="${dealLink}" style="display:inline-block;background:#f59e0b;color:#fff;text-decoration:none;border-radius:8px;padding:10px 16px;font-weight:800">Xem deal</a></p>
          </div>
        `,
      });

      await sendEmail({
        organizationId: input.organizationId,
        to: emails,
        subject: rendered.subject,
        html: rendered.html,
        templateCode: rendered.code,
        relatedType: "deal",
        relatedId: input.dealId,
        metadata: {
          flow: "deal_customer_approved_internal",
          selectedOptionIds: input.selectedOptionIds || [],
        },
      });
    }
  }

  return { skipped: false };
}

export { customerNameFromDeal };

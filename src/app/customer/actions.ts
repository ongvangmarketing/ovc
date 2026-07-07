"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { sendFinanceDocumentEmail } from "@/lib/email/flows";

function contactIdsForEmail(email?: string | null) {
  return email ? { email, status: "ACTIVE" as const } : null;
}

export async function resendPortalFinanceEmail(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") throw new Error("Không có quyền gửi lại email từ portal.");

  const contactWhere = contactIdsForEmail(session.user.email);
  if (!contactWhere) throw new Error("Tài khoản chưa có email.");

  const contacts = await db.contact.findMany({
    where: { organizationId: session.organizationId, ...contactWhere },
    select: { id: true, email: true },
  });
  const contactIds = contacts.map((contact) => contact.id);
  if (!contactIds.length) throw new Error("Tài khoản chưa liên kết khách hàng.");

  const doc =
    type === "quotation"
      ? await db.quotation.findFirst({ where: { id, organizationId: session.organizationId, contactId: { in: contactIds } }, select: { id: true, token: true } })
      : type === "contract"
        ? await db.contract.findFirst({ where: { id, organizationId: session.organizationId, contactId: { in: contactIds } }, select: { id: true, token: true } })
        : await db.invoice.findFirst({ where: { id, organizationId: session.organizationId, contactId: { in: contactIds } }, select: { id: true, token: true } });

  if (!doc) throw new Error("Không tìm thấy tài liệu trong portal của bạn.");
  if (!doc.token) throw new Error("Tài liệu chưa có link công khai.");

  const result = await sendFinanceDocumentEmail({
    organizationId: session.organizationId,
    type,
    id,
    to: session.user.email,
  });

  if (!result.sent) throw new Error("Tài khoản đang tắt nhận email cho loại tài liệu này.");
  return { success: true };
}

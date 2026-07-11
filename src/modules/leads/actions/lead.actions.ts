"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { getTenantDb } from "@/lib/db";
import { LeadService } from "@/modules/leads/services/lead.service";
import { revalidatePath } from "next/cache";

export async function createLeadAction(formData: FormData) {
  const session = await requireAuth();
  
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const companyName = formData.get("companyName") as string;
  const note = formData.get("note") as string;

  if (!fullName) throw new Error("Họ và tên là bắt buộc");

  const lead = await LeadService.createLead({
    organizationId: session.organizationId,
    fullName,
    email: email || undefined,
    phone: phone || undefined,
    companyName: companyName || undefined,
    note: note || undefined,
    utmSource: "Manual",
    createdBy: session.user.id,
  });

  revalidatePath("/workspace/leads");
  return lead.id;
}

export async function updateLeadAction(leadId: string, formData: FormData) {
  const session = await requireAuth();
  
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const companyName = formData.get("companyName") as string;
  const note = formData.get("note") as string;

  if (!fullName) throw new Error("Họ và tên là bắt buộc");

  const existingLead = await getTenantDb().lead.findUnique({
    where: { id: leadId, organizationId: session.organizationId }
  });

  if (!existingLead) throw new Error("Lead không tồn tại");

  await getTenantDb().lead.update({
    where: { id: leadId },
    data: {
      fullName,
      email: email || null,
      phone: phone || null,
      companyName: companyName || null,
      note: note || null,
      updatedBy: session.user.id,
    }
  });

  revalidatePath("/workspace/leads");
  revalidatePath(`/workspace/leads/${leadId}`);
}

import { redirect } from "next/navigation";
import { sendPortalAccessEmailForContact } from "@/modules/crm/actions/crm.actions";

export async function convertLeadToCustomerAction(formData: FormData) {
  const session = await requireAuth();
  const leadId = String(formData.get("leadId") || "");
  if (!leadId) return;
  
  const result = await LeadService.convertToCRM(leadId, session.user.id);
  
  if (result.contact.email) {
    await sendPortalAccessEmailForContact(result.contact.id);
  }
  
  redirect(`/workspace/crm/contacts/${result.contact.id}`);
}

"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { QuotationService } from "@/lib/services/quotation.service";
import { revalidatePath } from "next/cache";

export async function createQuotationAction(formData: FormData) {
  const session = await requireAuth();
  const title = formData.get("title") as string;
  const contactId = formData.get("contactId") as string;
  
  if (!title) throw new Error("Title is required");

  const quotation = await QuotationService.createQuotation({
    organizationId: session.organizationId,
    title,
    contactId: contactId || undefined,
    creatorId: session.user.id,
  });

  revalidatePath("/workspace/quotations");
  return quotation.id;
}

export async function addQuotationItemAction(quotationId: string, formData: FormData) {
  await requireAuth();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const quantity = parseFloat(formData.get("quantity") as string) || 1;
  const unitPrice = parseFloat(formData.get("unitPrice") as string) || 0;

  if (!name) throw new Error("Item name is required");

  await QuotationService.addItem(quotationId, {
    name,
    description,
    quantity,
    unitPrice
  });

  revalidatePath(`/workspace/quotations/${quotationId}`);
}

export async function removeQuotationItemAction(quotationId: string, itemId: string) {
  await requireAuth();
  await QuotationService.removeItem(itemId);
  revalidatePath(`/workspace/quotations/${quotationId}`);
}

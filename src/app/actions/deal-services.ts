"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";

function parseDealOptionNote(note?: string | null) {
  if (!note) return { note: "" };
  try {
    const parsed = JSON.parse(note);
    if (parsed && parsed.__dealOptionOverrides === true) {
      return {
        name: String(parsed.name || ""),
        description: String(parsed.description || ""),
        unit: String(parsed.unit || ""),
        durationText: String(parsed.durationText || ""),
        featuresText: String(parsed.featuresText || ""),
        note: String(parsed.note || ""),
      };
    }
  } catch {
    // Existing notes are plain text.
  }
  return { note };
}

// Add an option to a deal
export async function addOptionToDeal(dealId: string, serviceOptionId: string, quantity: number = 1) {
  const session = await requireAuth();
  
  try {
    const option = await db.serviceOption.findUnique({
      where: { id: serviceOptionId, organizationId: session.organizationId },
    });
    
    if (!option) return { error: "Option not found" };

    const dealOption = await db.dealServiceOption.create({
      data: {
        organizationId: session.organizationId,
        dealId,
        serviceOptionId,
        quantity,
        unitPrice: option.price,
        status: "PROPOSED", // initial status
      }
    });

    revalidatePath(`/workspace/crm/deals/${dealId}`);
    return { success: true, dealOption };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Update a deal option (quantity, discount, status)
export async function updateDealOption(id: string, data: any) {
  const session = await requireAuth();
  
  try {
    const dealOption = await db.dealServiceOption.update({
      where: { id, organizationId: session.organizationId },
      data
    });
    
    revalidatePath(`/workspace/crm/deals/${dealOption.dealId}`);
    return { success: true, dealOption };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Remove an option from a deal
export async function removeDealOption(id: string) {
  const session = await requireAuth();
  
  try {
    const dealOption = await db.dealServiceOption.findUnique({ where: { id } });
    if (!dealOption) return { error: "Not found" };

    await db.dealServiceOption.delete({
      where: { id, organizationId: session.organizationId }
    });
    
    revalidatePath(`/workspace/crm/deals/${dealOption.dealId}`);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// Convert selected deal options to Quotation
export async function convertDealOptionsToQuotation(dealId: string, selectedOptionIds: string[]) {
  const session = await requireAuth();
  
  try {
    const deal = await db.deal.findUnique({
      where: { id: dealId, organizationId: session.organizationId },
      include: { contact: true, company: true }
    });
    if (!deal) return { error: "Deal not found" };

    const options = await db.dealServiceOption.findMany({
      where: { 
        id: { in: selectedOptionIds },
        dealId,
        organizationId: session.organizationId
      },
      include: {
        serviceOption: {
          include: { service: true }
        }
      }
    });

    if (options.length === 0) return { error: "No options selected" };

    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    const itemsData = options.map(opt => {
      const unitPrice = Number(opt.unitPrice) || 0;
      const quantity = opt.quantity || 1;
      const discount = Number(opt.discount) || 0;
      const lineTotal = (unitPrice * quantity) - discount;
      const taxRate = Number(opt.taxRate) || 0;
      const lineTax = Math.max(0, lineTotal) * (taxRate / 100);
      subtotal += lineTotal;
      totalTax += lineTax;

      const overrides = parseDealOptionNote(opt.note);
      const optionName = overrides.name || opt.serviceOption.name;
      const optionDescription = [
        `[${opt.serviceOption.service.name}] ${optionName}`,
        overrides.description || opt.serviceOption.description || "",
        overrides.featuresText ? `Quyền lợi:\n${overrides.featuresText}` : "",
        overrides.note ? `Ghi chú: ${overrides.note}` : "",
      ].filter(Boolean).join("\n\n");
      const itemContent = optionDescription || `[${opt.serviceOption.service.name}] ${optionName}`;

      return {
        name: itemContent,
        description: itemContent,
        quantity,
        unitPrice,
        discount,
        tax: taxRate,
        total: lineTotal + lineTax
      };
    });

    // Generate quotation number (simple fallback, actual logic might be in finance module)
    const quoteNumber = `QT-${Date.now().toString().slice(-6)}`;

    // Create Quotation
    const quotation = await db.quotation.create({
      data: {
        organizationId: session.organizationId,
        creatorId: session.userId,
        number: quoteNumber,
        title: `Báo giá cho ${deal.title}`,
        status: "DRAFT",
        currency: "VND",
        subtotal,
        discount: 0, // global discount
        tax: totalTax,
        total: subtotal + totalTax,
        dealId: deal.id,
        contactId: deal.contactId,
        companyId: deal.companyId,
        assigneeId: deal.assigneeId,
        projectId: null,
        items: {
          create: itemsData
        }
      }
    });

    // Mark options as converted
    await db.dealServiceOption.updateMany({
      where: { id: { in: selectedOptionIds } },
      data: { status: "CONVERTED_TO_QUOTE" }
    });

    revalidatePath(`/workspace/crm/deals/${dealId}`);
    return { success: true, quotationId: quotation.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

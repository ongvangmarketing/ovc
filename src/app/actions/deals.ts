"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { customerNameFromDeal, notifyDealCustomerEvent } from "@/lib/notifications/deals";
import { revalidatePath } from "next/cache";

export async function createDealAction(formData: FormData) {
  const session = await requireAuth();
  
  const title = formData.get("title") as string;
  const value = formData.get("value") as string;
  const companyId = formData.get("companyId") as string;
  const contactId = formData.get("contactId") as string;
  const notes = formData.get("notes") as string;
  const expectedCloseStr = formData.get("expectedClose") as string;

  if (!title) throw new Error("Tên Cơ hội là bắt buộc");

  const deal = await db.deal.create({
    data: {
      organizationId: session.organizationId,
      title,
      value: value ? Number(value) : 0,
      companyId: companyId || null,
      contactId: contactId || null,
      notes: notes || null,
      expectedClose: expectedCloseStr ? new Date(expectedCloseStr) : null,
      status: "OPEN",
    }
  });

  await db.activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      entity: "Deal",
      entityId: deal.id,
      action: "created",
      description: `Tạo cơ hội bán hàng: ${deal.title}`,
    }
  });

  revalidatePath("/workspace/crm/deals");
  return deal.id;
}

export async function updateDealAction(id: string, formData: FormData) {
  const session = await requireAuth();
  
  const title = formData.get("title") as string;
  const value = formData.get("value") as string;
  const companyId = formData.get("companyId") as string;
  const contactId = formData.get("contactId") as string;
  const notes = formData.get("notes") as string;
  const status = formData.get("status") as any;
  const expectedCloseStr = formData.get("expectedClose") as string;

  if (!title) throw new Error("Tên Cơ hội là bắt buộc");

  await db.deal.update({
    where: { id, organizationId: session.organizationId },
    data: {
      title,
      value: value ? Number(value) : 0,
      companyId: companyId || null,
      contactId: contactId || null,
      notes: notes || null,
      status: status || undefined,
      expectedClose: expectedCloseStr ? new Date(expectedCloseStr) : null,
    }
  });

  await db.activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      entity: "Deal",
      entityId: id,
      action: "updated",
      description: `Cập nhật cơ hội bán hàng`,
    }
  });

  revalidatePath("/workspace/crm/deals");
  revalidatePath(`/workspace/crm/deals/${id}`);
}

export async function saveDealAction(payload: any) {
  const session = await requireAuth();
  const { id, title, value, expectedClose, stageId, companyId, contactId, assigneeId, notes, serviceOptions } = payload;
  
  if (!title) throw new Error("Tên Cơ hội là bắt buộc");

  const data = {
    title,
    value: value ? Number(value) : 0,
    companyId: companyId || null,
    contactId: contactId || null,
    assigneeId: assigneeId || null,
    notes: notes || null,
    stageId: stageId || null,
    expectedClose: expectedClose ? new Date(expectedClose) : null,
  };

  let dealId = id;

  if (id) {
    // Update existing deal
    await db.deal.update({
      where: { id, organizationId: session.organizationId },
      data
    });
    
    // Clear old options
    await db.dealServiceOption.deleteMany({
      where: { dealId: id, organizationId: session.organizationId }
    });
  } else {
    // Create new deal
    const newDeal = await db.deal.create({
      data: {
        ...data,
        organizationId: session.organizationId,
      }
    });
    dealId = newDeal.id;
  }

  // Insert new service options if any
  if (serviceOptions && serviceOptions.length > 0) {
    await db.dealServiceOption.createMany({
      data: serviceOptions.map((opt: any) => ({
        organizationId: session.organizationId,
        dealId,
        serviceOptionId: opt.serviceOptionId,
        quantity: opt.quantity,
        unitPrice: opt.unitPrice,
        discount: opt.discount,
        taxRate: opt.taxRate,
        note: opt.note,
        status: "PROPOSED"
      }))
    });
  }

  await db.activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      entity: "Deal",
      entityId: dealId,
      action: id ? "updated" : "created",
      description: id ? `Cập nhật cơ hội bán hàng: ${title}` : `Tạo cơ hội bán hàng: ${title}`,
    }
  });

  revalidatePath("/workspace/crm/deals");
  if (id) revalidatePath(`/workspace/crm/deals/${id}`);
  
  return { success: true, dealId };
}

export async function updateDealStageAction(dealId: string, stageId: string) {
  const session = await requireAuth();

  await db.deal.update({
    where: { id: dealId, organizationId: session.organizationId },
    data: { stageId }
  });

  const stage = await db.dealStage.findUnique({
    where: { id: stageId, organizationId: session.organizationId }
  });

  await db.activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.userId,
      entity: "Deal",
      entityId: dealId,
      action: "updated",
      description: `Chuyển cơ hội sang giai đoạn: ${stage?.name || 'Không xác định'}`,
    }
  });

  revalidatePath("/workspace/crm/deals");
}

export async function createDealStageAction(name: string, color: string = "#94A3B8") {
  const session = await requireAuth();

  const maxOrderStage = await db.dealStage.findFirst({
    where: { organizationId: session.organizationId },
    orderBy: { order: "desc" },
  });
  
  const order = (maxOrderStage?.order || 0) + 1;

  await db.dealStage.create({
    data: {
      organizationId: session.organizationId,
      name,
      color,
      order,
    },
  });

  revalidatePath("/workspace/crm/deals");
  return { success: true };
}

export async function updateDealStageNameAction(id: string, name: string) {
  const session = await requireAuth();

  await db.dealStage.update({
    where: { id, organizationId: session.organizationId },
    data: { name },
  });

  revalidatePath("/workspace/crm/deals");
  return { success: true };
}

export async function deleteDealStageAction(id: string) {
  const session = await requireAuth();

  const dealCount = await db.deal.count({
    where: { stageId: id, organizationId: session.organizationId },
  });

  if (dealCount > 0) {
    return { success: false, error: "Không thể xoá cột đã có deal." };
  }

  await db.dealStage.delete({
    where: { id, organizationId: session.organizationId },
  });

  revalidatePath("/workspace/crm/deals");
  return { success: true };
}

function splitCustomerName(name?: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] || "Khách hàng", lastName: "" };
  const lastName = parts.pop() || "";
  return { firstName: parts.join(" "), lastName };
}

export async function submitDealSelectionAction(dealId: string, selectedIds: string[], contactInfo?: { name?: string; phone?: string; email?: string; address?: string; taxCode?: string }, customerNote?: string) {
  // Public action, no requireAuth

  // Find the deal to get organizationId
  const deal = await db.deal.findUnique({
    where: { id: dealId },
    include: {
      contact: { include: { company: true } },
      company: true,
      serviceOptions: { include: { serviceOption: { include: { service: true } } } },
    },
  });

  if (!deal) return { success: false, error: "Không tìm thấy cơ hội" };

  // Update selected
  if (selectedIds.length > 0) {
    await db.dealServiceOption.updateMany({
      where: { dealId, id: { in: selectedIds } },
      data: { 
        status: "CUSTOMER_SELECTED",
        selectedAt: new Date()
      }
    });
  }

  // Update rejected (the rest)
  await db.dealServiceOption.updateMany({
    where: { dealId, id: { notIn: selectedIds } },
    data: { 
      status: "CUSTOMER_REJECTED",
      selectedAt: new Date()
    }
  });

  let linkedContactId = deal.contactId;
  let linkedCompanyId = deal.companyId;

  // Update or create CRM customer info if provided.
  if (contactInfo) {
    const normalizedEmail = contactInfo.email?.trim().toLowerCase() || null;
    const normalizedPhone = contactInfo.phone?.trim() || null;
    const normalizedAddress = contactInfo.address?.trim() || null;
    const normalizedTaxCode = contactInfo.taxCode?.trim() || null;
    const { firstName, lastName } = splitCustomerName(contactInfo.name);

    if (!linkedCompanyId && contactInfo.name && normalizedTaxCode) {
      const existingCompany = normalizedEmail
        ? await db.company.findFirst({ where: { organizationId: deal.organizationId, email: normalizedEmail } })
        : null;

      const companyData = {
        name: contactInfo.name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        address: normalizedAddress,
        customFields: normalizedTaxCode ? { taxCode: normalizedTaxCode, source: "deal_public_approval" } : { source: "deal_public_approval" },
      };

      const company = existingCompany
        ? await db.company.update({ where: { id: existingCompany.id }, data: companyData })
        : await db.company.create({ data: { ...companyData, organizationId: deal.organizationId } });
      linkedCompanyId = company.id;
    }

    if (linkedContactId) {
      const dataToUpdate: any = {};
      if (contactInfo.phone) dataToUpdate.phone = contactInfo.phone;
      if (normalizedEmail) dataToUpdate.email = normalizedEmail;
      if (normalizedAddress && !linkedCompanyId) dataToUpdate.address = normalizedAddress;
      if (linkedCompanyId) dataToUpdate.companyId = linkedCompanyId;
      
      if (contactInfo.name) {
        dataToUpdate.firstName = firstName;
        dataToUpdate.lastName = lastName;
      }
      
      if (Object.keys(dataToUpdate).length > 0) {
        await db.contact.update({
          where: { id: linkedContactId },
          data: dataToUpdate
        });
      }
    } else {
      const existingContact = normalizedEmail
        ? await db.contact.findFirst({ where: { organizationId: deal.organizationId, email: normalizedEmail } })
        : normalizedPhone
          ? await db.contact.findFirst({ where: { organizationId: deal.organizationId, phone: normalizedPhone } })
          : null;

      const contactData = {
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        address: normalizedAddress,
        companyId: linkedCompanyId,
        source: "Deal public approval",
        notes: customerNote || null,
        lastContactAt: new Date(),
        customFields: { sourceDealId: dealId, source: "deal_public_approval" },
      };

      const contact = existingContact
        ? await db.contact.update({ where: { id: existingContact.id }, data: contactData })
        : await db.contact.create({ data: { ...contactData, organizationId: deal.organizationId } });
      linkedContactId = contact.id;
    }

    if (linkedCompanyId && (normalizedTaxCode || normalizedAddress)) {
      const company = await db.company.findUnique({ where: { id: linkedCompanyId } });
      if (company) {
        const currentCustomFields = (company.customFields as any) || {};
        const dataToUpdateCompany: any = {};
        
        if (normalizedTaxCode) {
          dataToUpdateCompany.customFields = { ...currentCustomFields, taxCode: normalizedTaxCode, sourceDealId: dealId };
        }
        if (normalizedAddress) {
          dataToUpdateCompany.address = normalizedAddress;
        }

        await db.company.update({
          where: { id: linkedCompanyId },
          data: dataToUpdateCompany
        });
      }
    }

    await db.deal.update({
      where: { id: dealId },
      data: {
        contactId: linkedContactId,
        companyId: linkedCompanyId,
      },
    });
  }

  // Update deal notes if customerNote is provided
  if (customerNote) {
    const newNotes = deal.notes 
      ? `${deal.notes}\n\n--- Ghi chú từ khách hàng ---\n${customerNote}` 
      : `--- Ghi chú từ khách hàng ---\n${customerNote}`;
      
    await db.deal.update({
      where: { id: dealId },
      data: { notes: newNotes }
    });
  }

  // Auto move deal to "Chốt (Won)" stage (the last stage in the pipeline)
  if (selectedIds.length > 0) {
    const lastStage = await db.dealStage.findFirst({
      where: { organizationId: deal.organizationId },
      orderBy: { order: 'desc' }
    });

    if (lastStage && deal.stageId !== lastStage.id) {
      await db.deal.update({
        where: { id: dealId },
        data: { stageId: lastStage.id }
      });
    }
  }

  // Log activity
  await db.activityLog.create({
    data: {
      organizationId: deal.organizationId,
      entity: "Deal",
      entityId: dealId,
      action: "updated",
      description: `Khách hàng đã chốt chọn dịch vụ${contactInfo ? ' và cập nhật thông tin' : ''}. Deal được tự động chuyển sang giai đoạn Chốt.`,
    }
  });

  const selectedOptions = deal.serviceOptions.filter((option) => selectedIds.includes(option.id));
  const selectedOptionNames = selectedOptions.map((option) => {
    const serviceName = option.serviceOption?.service?.name;
    const optionName = option.serviceOption?.name || "Dịch vụ";
    return serviceName ? `${serviceName} - ${optionName}` : optionName;
  });
  const selectedTotal = selectedOptions.reduce((sum, option) => {
    const line = Number(option.quantity || 1) * Number(option.unitPrice || 0) - Number(option.discount || 0);
    return sum + Math.max(0, line) * (1 + Number(option.taxRate || 0) / 100);
  }, 0);

  await notifyDealCustomerEvent({
    organizationId: deal.organizationId,
    dealId,
    title: deal.title,
    assigneeId: deal.assigneeId,
    event: "approved",
    customerName: customerNameFromDeal(deal, contactInfo?.name),
    selectedOptionIds: selectedIds,
    selectedOptionNames,
    contactId: linkedContactId,
    companyId: linkedCompanyId,
    total: selectedTotal || Number(deal.value || 0),
    dedupeMinutes: 1,
  }).catch((error) => console.error("Không thể gửi thông báo/email khách duyệt deal", error));

  revalidatePath(`/deal/${dealId}`);
  revalidatePath(`/shared/deals/${dealId}/options`);
  revalidatePath("/workspace/crm/deals");
  return { success: true };
}
export async function reorderDealOptionsAction(dealId: string, orderedIds: string[]) {
  const session = await requireAuth();
  
  const now = new Date().getTime();
  for (let i = 0; i < orderedIds.length; i++) {
    await db.dealServiceOption.updateMany({
      where: { id: orderedIds[i], dealId, organizationId: session.organizationId },
      data: { createdAt: new Date(now + i * 1000) }
    });
  }
  revalidatePath('/workspace/crm/deals/[id]', 'page');
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { getSystemDb } from "@/lib/db";
const db = getSystemDb();

export async function getRemindersAction() {
  try {
    const firstOrg = await db.organization.findFirst();
    const MOCK_ORG_ID = firstOrg?.id || "org-demo";

    const reminders = await db.automationReminder.findMany({
      where: { organizationId: MOCK_ORG_ID },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: reminders };
  } catch (error: any) {
    console.error("Failed to fetch reminders:", error);
    return { success: false, error: error.message };
  }
}

export async function createReminderAction(data: any) {
  try {
    const firstOrg = await db.organization.findFirst();
    const MOCK_ORG_ID = firstOrg?.id || "org-demo";

    const newReminder = await db.automationReminder.create({
      data: {
        organizationId: MOCK_ORG_ID,
        name: data.name,
        category: "GENERAL",
        status: data.active ? "ACTIVE" : "PAUSED",
        triggerSource: data.entity,
        timingType: data.timingType,
        timingValue: data.timingValue,
        referenceField: data.dateField,
        channels: [data.channel], // Lưu mảng các kênh
        recipients: {}, // Sẽ mở rộng trong tương lai
        templateConfig: { templateCode: data.message },
      },
    });
    
    revalidatePath("/workspace/automations/reminders");
    return { success: true, data: newReminder };
  } catch (error: any) {
    console.error("Failed to create reminder:", error);
    return { success: false, error: error.message };
  }
}

export async function updateReminderAction(id: string, data: any) {
  try {
    const updated = await db.automationReminder.update({
      where: { id },
      data: {
        name: data.name,
        status: data.active !== undefined ? (data.active ? "ACTIVE" : "PAUSED") : undefined,
        triggerSource: data.entity,
        timingType: data.timingType,
        timingValue: data.timingValue,
        referenceField: data.dateField,
        channels: data.channel ? [data.channel] : undefined,
        templateConfig: data.message ? { templateCode: data.message } : undefined,
      },
    });
    
    revalidatePath("/workspace/automations/reminders");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update reminder:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteReminderAction(id: string) {
  try {
    await db.automationReminder.delete({
      where: { id },
    });
    
    revalidatePath("/workspace/automations/reminders");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete reminder:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleReminderStatusAction(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    const updated = await db.automationReminder.update({
      where: { id },
      data: { status: newStatus },
    });
    
    revalidatePath("/workspace/automations/reminders");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to toggle reminder status:", error);
    return { success: false, error: error.message };
  }
}

export async function seedDefaultRemindersAction() {
  try {
    const firstOrg = await db.organization.findFirst();
    const MOCK_ORG_ID = firstOrg?.id || "org-demo";

    const defaults = [
      {
        organizationId: MOCK_ORG_ID,
        name: "Nhắc thanh toán Hóa đơn",
        description: "Tự động gửi nhắc nhở trước khi hóa đơn đến hạn thanh toán 1 ngày.",
        category: "PAYMENT",
        status: "ACTIVE",
        triggerSource: "invoice",
        timingType: "before",
        timingValue: 1,
        timingUnit: "DAYS",
        referenceField: "dueDate",
        channels: ["email"],
        recipients: { target: "customer" },
        templateConfig: { templateCode: "REMINDER_INVOICE" }
      },
      {
        organizationId: MOCK_ORG_ID,
        name: "Nhắc ký Hợp đồng",
        description: "Tự động gửi nhắc nhở trước khi hợp đồng hết hạn ký 1 ngày.",
        category: "CONTRACT",
        status: "ACTIVE",
        triggerSource: "contract",
        timingType: "before",
        timingValue: 1,
        timingUnit: "DAYS",
        referenceField: "validUntil",
        channels: ["email"],
        recipients: { target: "customer" },
        templateConfig: { templateCode: "REMINDER_CONTRACT" }
      },
      {
        organizationId: MOCK_ORG_ID,
        name: "Nhắc chốt Báo giá",
        description: "Tự động gửi nhắc nhở trước khi báo giá hết hiệu lực 1 ngày.",
        category: "SALES",
        status: "ACTIVE",
        triggerSource: "quotation",
        timingType: "before",
        timingValue: 1,
        timingUnit: "DAYS",
        referenceField: "validUntil",
        channels: ["email"],
        recipients: { target: "customer" },
        templateConfig: { templateCode: "REMINDER_QUOTATION" }
      }
    ];

    await db.automationReminder.createMany({
      data: defaults,
    });
    
    revalidatePath("/workspace/automations/reminders");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to seed reminders:", error);
    return { success: false, error: error.message };
  }
}

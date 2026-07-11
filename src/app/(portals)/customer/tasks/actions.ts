"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { TaskStatus } from "@prisma/client";
import { CustomerPortalService } from "@/modules/crm/services/customer-portal.service";

export async function addCustomerTaskComment(taskId: string, content: string) {
  const session = await requireAuth();

  if (session.user.role !== "CUSTOMER") {
    throw new Error("Unauthorized");
  }

  await CustomerPortalService.addTaskComment(taskId, session.user.id, content);

  revalidatePath("/customer/tasks");
  return { success: true };
}

export async function updateCustomerTaskStatus(taskId: string, status: TaskStatus, comment?: string) {
  const session = await requireAuth();

  if (session.user.role !== "CUSTOMER") {
    throw new Error("Unauthorized");
  }

  await CustomerPortalService.updateTaskStatus(taskId, session.user.id, status, comment);

  revalidatePath("/customer/tasks");
  return { success: true };
}

export async function updateCustomerTaskDueDate(taskId: string, dueDate: Date | null) {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") throw new Error("Unauthorized");

  await CustomerPortalService.updateTaskDueDate(taskId, session.user.id, dueDate);

  revalidatePath("/customer/tasks");
  return { success: true };
}

export async function uploadCustomerTaskAttachment(taskId: string, file: FormDataEntryValue | null) {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") throw new Error("Unauthorized");

  const url = await CustomerPortalService.uploadTaskAttachment(taskId, session.user.id, file);

  revalidatePath("/customer/tasks");
  return { success: true, url };
}

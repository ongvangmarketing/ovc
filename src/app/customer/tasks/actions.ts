"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { TaskStatus } from "@prisma/client";

export async function addCustomerTaskComment(taskId: string, content: string) {
  const session = await requireAuth();

  if (session.user.role !== "CUSTOMER") {
    throw new Error("Unauthorized");
  }

  // Verify task belongs to a project the user can access
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Allow if user is owner or member
  const canAccess = task.project.ownerId === session.user.id || 
                    task.project.members.some(m => m.userId === session.user.id);

  if (!canAccess) {
    throw new Error("Unauthorized");
  }

  await db.taskComment.create({
    data: {
      taskId,
      userId: session.user.id,
      content,
    },
  });

  revalidatePath("/customer/tasks");
  return { success: true };
}

export async function updateCustomerTaskStatus(taskId: string, status: TaskStatus, comment?: string) {
  const session = await requireAuth();

  if (session.user.role !== "CUSTOMER") {
    throw new Error("Unauthorized");
  }

  // Verify task belongs to a project the user can access
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  const canAccess = task.project.ownerId === session.user.id || 
                    task.project.members.some(m => m.userId === session.user.id);

  if (!canAccess) {
    throw new Error("Unauthorized");
  }

  await db.task.update({
    where: { id: taskId },
    data: { status },
  });

  if (comment) {
    await db.taskComment.create({
      data: {
        taskId,
        userId: session.user.id,
        content: comment,
      },
    });
  }

  revalidatePath("/customer/tasks");
  return { success: true };
}

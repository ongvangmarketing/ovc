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

export async function updateCustomerTaskDueDate(taskId: string, dueDate: Date | null) {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") throw new Error("Unauthorized");

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });

  if (!task) throw new Error("Task not found");

  const canAccess = task.project.ownerId === session.user.id || 
                    task.project.members.some(m => m.userId === session.user.id);
  if (!canAccess) throw new Error("Unauthorized");

  await db.task.update({
    where: { id: taskId },
    data: { dueDate },
  });

  revalidatePath("/customer/tasks");
  return { success: true };
}

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadCustomerTaskAttachment(taskId: string, file: FormDataEntryValue | null) {
  const session = await requireAuth();
  if (session.user.role !== "CUSTOMER") throw new Error("Unauthorized");

  if (!file || !(file instanceof File)) {
    throw new Error("No file provided");
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });

  if (!task) throw new Error("Task not found");
  const canAccess = task.project.ownerId === session.user.id || 
                    task.project.members.some(m => m.userId === session.user.id);
  if (!canAccess) throw new Error("Unauthorized");

  const timestamp = Date.now();
  const ext = path.extname(file.name);
  const filename = `${taskId}-${timestamp}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "tasks");
  
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
  
  const fileUrl = `/uploads/tasks/${filename}`;

  // Tạo bản ghi File trong database
  await db.file.create({
    data: {
      name: file.name,
      filename: filename,
      url: fileUrl,
      size: file.size,
      mimeType: file.type,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      uploaderId: session.user.id,
      taskId: taskId,
      projectId: task.projectId,
      organizationId: task.project.organizationId,
    }
  });

  revalidatePath("/customer/tasks");
  return { success: true, url: fileUrl };
}

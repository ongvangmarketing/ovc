import { Priority, TaskStatus } from "@prisma/client";
import { z } from "zod";

const optionalDate = z.string().trim().optional().nullable();

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "Tiêu đề công việc là bắt buộc").max(220),
  description: z.string().trim().max(5000).optional().nullable(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  assigneeId: z.string().cuid().optional().nullable(),
  taskListId: z.string().cuid().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  startDate: optionalDate,
  dueDate: optionalDate,
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
  order: z.number().optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const taskCommentSchema = z.object({
  taskId: z.string().cuid(),
  content: z.string().trim().min(1).max(3000),
});

export const reorderTasksSchema = z.object({
  projectId: z.string().cuid(),
  tasks: z.array(z.object({
    id: z.string().cuid(),
    taskListId: z.string().cuid().nullable().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    order: z.number(),
  })),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

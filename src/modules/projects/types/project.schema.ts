import { Priority, ProjectStatus } from "@prisma/client";
import { z } from "zod";

const optionalDate = z.string().trim().optional().nullable();

export const projectCreateSchema = z.object({
  name: z.string().trim().min(1, "Tên dự án là bắt buộc").max(180),
  description: z.string().trim().max(5000).optional().nullable(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.PLANNING),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  ownerId: z.string().cuid().optional().nullable(),
  contactId: z.string().cuid().optional().nullable(),
  startDate: optionalDate,
  dueDate: optionalDate,
  budget: z.union([z.string(), z.number()]).optional().nullable(),
  color: z.string().trim().max(40).optional().nullable(),
  icon: z.string().trim().max(80).optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const projectStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(ProjectStatus),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;

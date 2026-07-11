import { ProjectFieldType, ProjectSharePermission, ProjectViewType } from "@prisma/client";
import { z } from "zod";

export const projectDatabaseCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  icon: z.string().trim().max(80).optional().nullable(),
  color: z.string().trim().max(40).optional().nullable(),
});

export const projectDatabaseFieldCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  key: z.string().trim().min(1).max(80).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  type: z.nativeEnum(ProjectFieldType),
  order: z.number().int().default(0),
  required: z.boolean().default(false),
  hidden: z.boolean().default(false),
  internal: z.boolean().default(false),
  options: z.unknown().optional().nullable(),
  config: z.unknown().optional().nullable(),
  automationKey: z.string().trim().max(120).optional().nullable(),
  isAutomationDate: z.boolean().default(false),
});

export const projectDatabaseViewCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.nativeEnum(ProjectViewType),
  order: z.number().int().default(0),
  filters: z.unknown().optional().nullable(),
  sorts: z.unknown().optional().nullable(),
  groups: z.unknown().optional().nullable(),
  visibleFields: z.unknown().optional().nullable(),
  settings: z.unknown().optional().nullable(),
  isDefault: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export const projectDatabaseRecordCreateSchema = z.object({
  values: z.record(z.string(), z.unknown()).default({}),
  order: z.number().int().default(0),
});

export const projectDatabaseShareCreateSchema = z.object({
  viewId: z.string().cuid().optional().nullable(),
  name: z.string().trim().min(1).max(120),
  permission: z.nativeEnum(ProjectSharePermission).default(ProjectSharePermission.VIEW),
  expiresAt: z.string().trim().optional().nullable(),
  allowEdit: z.boolean().default(false),
  allowComment: z.boolean().default(false),
  allowUpload: z.boolean().default(false),
  requireGuestInfo: z.boolean().default(false),
  hiddenFields: z.unknown().optional().nullable(),
  filters: z.unknown().optional().nullable(),
  settings: z.unknown().optional().nullable(),
});

export const publicRecordUpdateSchema = z.object({
  recordId: z.string().cuid(),
  values: z.record(z.string(), z.unknown()),
  guestInfo: z.object({
    name: z.string().trim().max(120).optional(),
    email: z.string().trim().email().optional(),
  }).optional(),
});

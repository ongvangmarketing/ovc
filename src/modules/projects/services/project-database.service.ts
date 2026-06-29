import { Prisma, ProjectActivityType, ProjectDatabaseActorType, ProjectDatabaseChangeAction, ProjectSharePermission, ProjectViewType } from "@prisma/client";
import { randomBytes } from "crypto";

import { db } from "@/lib/db";
import { createProjectActivity } from "@/modules/projects/services/project-activity.service";
import type {
  projectDatabaseCreateSchema,
  projectDatabaseFieldCreateSchema,
  projectDatabaseRecordCreateSchema,
  projectDatabaseShareCreateSchema,
  projectDatabaseViewCreateSchema,
} from "@/modules/projects/schemas/project-database.schema";
import type { z } from "zod";

type DatabaseInput = z.infer<typeof projectDatabaseCreateSchema>;
type FieldInput = z.infer<typeof projectDatabaseFieldCreateSchema>;
type ViewInput = z.infer<typeof projectDatabaseViewCreateSchema>;
type RecordInput = z.infer<typeof projectDatabaseRecordCreateSchema>;
type ShareInput = z.infer<typeof projectDatabaseShareCreateSchema>;

function createShareToken() {
  return randomBytes(32).toString("base64url");
}

function jsonInput(value: unknown) {
  return value === null ? Prisma.JsonNull : value === undefined ? undefined : value as Prisma.InputJsonValue;
}

async function assertProject(organizationId: string, projectId: string) {
  const project = await db.project.findFirst({ where: { id: projectId, organizationId }, select: { id: true, name: true } });
  if (!project) throw new Error("Không tìm thấy dự án");
  return project;
}

async function assertDatabase(organizationId: string, databaseId: string) {
  const database = await db.projectDatabase.findFirst({
    where: { id: databaseId, organizationId, deletedAt: null },
    include: { project: { select: { id: true, name: true } } },
  });
  if (!database) throw new Error("Không tìm thấy database dự án");
  return database;
}

export async function getProjectDatabasesService(organizationId: string, projectId: string) {
  await assertProject(organizationId, projectId);
  return db.projectDatabase.findMany({
    where: { organizationId, projectId, deletedAt: null },
    include: { _count: { select: { fields: true, views: true, records: true, shareLinks: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProjectDatabaseByIdService(organizationId: string, databaseId: string) {
  return db.projectDatabase.findFirst({
    where: { id: databaseId, organizationId, deletedAt: null },
    include: {
      fields: { orderBy: { order: "asc" } },
      views: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      records: { where: { deletedAt: null }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      shareLinks: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createProjectDatabaseService(organizationId: string, userId: string, projectId: string, input: DatabaseInput) {
  await assertProject(organizationId, projectId);
  const database = await db.projectDatabase.create({
    data: {
      organizationId,
      projectId,
      name: input.name,
      description: input.description || null,
      icon: input.icon || null,
      color: input.color || null,
      createdById: userId,
      views: { create: { organizationId, name: "Table", type: ProjectViewType.TABLE, isDefault: true } },
    },
  });

  await createProjectActivity({
    organizationId,
    projectId,
    type: ProjectActivityType.DATABASE_CREATED,
    title: "Tạo Project Database",
    description: `Đã tạo database ${database.name}`,
    actorId: userId,
    metadata: { databaseId: database.id },
  });

  return database;
}

export async function createDatabaseFieldService(organizationId: string, userId: string, databaseId: string, input: FieldInput) {
  const database = await assertDatabase(organizationId, databaseId);
  const field = await db.projectDatabaseField.create({
    data: {
      organizationId,
      databaseId,
      name: input.name,
      key: input.key,
      type: input.type,
      order: input.order,
      required: input.required,
      hidden: input.hidden,
      internal: input.internal,
      options: jsonInput(input.options),
      config: jsonInput(input.config),
      automationKey: input.automationKey || null,
      isAutomationDate: input.isAutomationDate,
    },
  });

  await createProjectActivity({
    organizationId,
    projectId: database.projectId,
    type: ProjectActivityType.DATABASE_UPDATED,
    title: "Thêm field database",
    description: `Đã thêm field ${field.name}`,
    actorId: userId,
    metadata: { databaseId, fieldId: field.id },
  });

  return field;
}

export async function createDatabaseViewService(organizationId: string, databaseId: string, input: ViewInput) {
  await assertDatabase(organizationId, databaseId);
  return db.projectDatabaseView.create({
    data: {
      organizationId,
      databaseId,
      name: input.name,
      type: input.type,
      order: input.order,
      filters: jsonInput(input.filters),
      sorts: jsonInput(input.sorts),
      groups: jsonInput(input.groups),
      visibleFields: jsonInput(input.visibleFields),
      settings: jsonInput(input.settings),
      isDefault: input.isDefault,
      isPublic: input.isPublic,
    },
  });
}

export async function createDatabaseRecordService(organizationId: string, userId: string, databaseId: string, input: RecordInput) {
  const database = await assertDatabase(organizationId, databaseId);
  const record = await db.projectDatabaseRecord.create({
    data: { organizationId, databaseId, values: jsonInput(input.values) || {}, order: input.order, createdById: userId, updatedById: userId },
  });

  await db.projectDatabaseChangeLog.create({
    data: {
      organizationId,
      databaseId,
      recordId: record.id,
      actorType: ProjectDatabaseActorType.USER,
      actorUserId: userId,
      action: ProjectDatabaseChangeAction.RECORD_CREATED,
      newValue: jsonInput(input.values),
    },
  });

  await createProjectActivity({
    organizationId,
    projectId: database.projectId,
    type: ProjectActivityType.DATABASE_RECORD_CREATED,
    title: "Tạo record database",
    description: `Đã tạo record trong ${database.name}`,
    actorId: userId,
    metadata: { databaseId, recordId: record.id },
  });

  return record;
}

export async function updateDatabaseRecordService(organizationId: string, userId: string, recordId: string, values: Record<string, unknown>) {
  const existing = await db.projectDatabaseRecord.findFirst({
    where: { id: recordId, organizationId, deletedAt: null },
    include: { database: true },
  });
  if (!existing) throw new Error("Không tìm thấy record");

  const nextValues = { ...(existing.values as Record<string, unknown>), ...values };
  const record = await db.projectDatabaseRecord.update({
    where: { id: existing.id },
    data: { values: jsonInput(nextValues) || {}, updatedById: userId },
  });

  await db.projectDatabaseChangeLog.create({
    data: {
      organizationId,
      databaseId: existing.databaseId,
      recordId,
      actorType: ProjectDatabaseActorType.USER,
      actorUserId: userId,
      action: ProjectDatabaseChangeAction.RECORD_UPDATED,
      oldValue: jsonInput(existing.values),
      newValue: jsonInput(nextValues),
    },
  });

  await createProjectActivity({
    organizationId,
    projectId: existing.database.projectId,
    type: ProjectActivityType.DATABASE_RECORD_UPDATED,
    title: "Cập nhật record database",
    description: `Đã cập nhật record trong ${existing.database.name}`,
    actorId: userId,
    metadata: { databaseId: existing.databaseId, recordId },
  });

  return record;
}

export async function createProjectDatabaseShareLinkService(organizationId: string, userId: string, databaseId: string, input: ShareInput) {
  const database = await assertDatabase(organizationId, databaseId);
  const share = await db.projectDatabaseShareLink.create({
    data: {
      organizationId,
      databaseId,
      viewId: input.viewId || null,
      token: createShareToken(),
      name: input.name,
      permission: input.permission,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      allowEdit: input.allowEdit,
      allowComment: input.allowComment,
      allowUpload: input.allowUpload,
      requireGuestInfo: input.requireGuestInfo,
      hiddenFields: jsonInput(input.hiddenFields),
      filters: jsonInput(input.filters),
      settings: jsonInput(input.settings),
      createdById: userId,
    },
  });

  await createProjectActivity({
    organizationId,
    projectId: database.projectId,
    type: ProjectActivityType.SHARE_LINK_CREATED,
    title: "Tạo public share link",
    description: `Đã tạo link chia sẻ ${share.name}`,
    actorId: userId,
    metadata: { databaseId, shareId: share.id },
  });

  return share;
}

export async function getPublicDatabaseByTokenService(token: string) {
  const share = await db.projectDatabaseShareLink.findUnique({
    where: { token },
    include: {
      database: {
        include: {
          fields: { orderBy: { order: "asc" } },
          views: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
          records: { where: { deletedAt: null }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
        },
      },
      view: true,
    },
  });

  if (!share || share.revokedAt || (share.expiresAt && share.expiresAt < new Date())) {
    throw new Error("Link chia sẻ không hợp lệ hoặc đã hết hạn");
  }

  const hidden = new Set(Array.isArray(share.hiddenFields) ? share.hiddenFields.filter((item): item is string => typeof item === "string") : []);
  return {
    share: {
      id: share.id,
      token: share.token,
      name: share.name,
      permission: share.permission,
      allowEdit: share.allowEdit,
      allowComment: share.allowComment,
      allowUpload: share.allowUpload,
      requireGuestInfo: share.requireGuestInfo,
    },
    database: {
      ...share.database,
      organizationId: undefined,
      fields: share.database.fields.filter((field) => !field.internal && !field.hidden && !hidden.has(field.key)),
    },
    view: share.view,
  };
}

export async function updatePublicRecordByTokenService(token: string, recordId: string, values: Record<string, unknown>, guestInfo?: { name?: string; email?: string }, requestMeta?: { ipAddress?: string; userAgent?: string }) {
  const publicData = await getPublicDatabaseByTokenService(token);
  if (!publicData.share.allowEdit || (publicData.share.permission !== ProjectSharePermission.EDIT && publicData.share.permission !== ProjectSharePermission.SUBMIT)) {
    throw new Error("Link không cho phép chỉnh sửa");
  }
  if (publicData.share.requireGuestInfo && (!guestInfo?.name || !guestInfo?.email)) {
    throw new Error("Vui lòng nhập tên và email trước khi chỉnh sửa");
  }

  const databaseId = publicData.database.id;
  const existing = await db.projectDatabaseRecord.findFirst({ where: { id: recordId, databaseId, deletedAt: null } });
  if (!existing) throw new Error("Không tìm thấy record");

  const allowedKeys = new Set(publicData.database.fields.map((field) => field.key));
  const sanitized = Object.fromEntries(Object.entries(values).filter(([key]) => allowedKeys.has(key)));
  const nextValues = { ...(existing.values as Record<string, unknown>), ...sanitized };
  const record = await db.projectDatabaseRecord.update({ where: { id: existing.id }, data: { values: jsonInput(nextValues) || {} } });

  await db.projectDatabaseChangeLog.create({
    data: {
      organizationId: existing.organizationId,
      databaseId,
      recordId,
      actorType: ProjectDatabaseActorType.GUEST,
      guestName: guestInfo?.name || null,
      guestEmail: guestInfo?.email || null,
      shareToken: token,
      action: ProjectDatabaseChangeAction.RECORD_UPDATED,
      oldValue: jsonInput(existing.values),
      newValue: jsonInput(nextValues),
      ipAddress: requestMeta?.ipAddress || null,
      userAgent: requestMeta?.userAgent || null,
    },
  });

  return record;
}

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { PROJECT_PERMISSIONS } from "@/modules/projects/constants/project-permissions";
import { requireProjectModule } from "@/modules/projects/guards/project-module.guard";
import {
  projectDatabaseCreateSchema,
  projectDatabaseFieldCreateSchema,
  projectDatabaseRecordCreateSchema,
  projectDatabaseShareCreateSchema,
  projectDatabaseViewCreateSchema,
  publicRecordUpdateSchema,
} from "@/modules/projects/schemas/project-database.schema";
import {
  createDatabaseFieldService,
  createDatabaseRecordService,
  createDatabaseViewService,
  createProjectDatabaseService,
  createProjectDatabaseShareLinkService,
  getProjectDatabaseByIdService,
  getProjectDatabasesService,
  getPublicDatabaseByTokenService,
  updateDatabaseRecordService,
  updatePublicRecordByTokenService,
} from "@/modules/projects/services/project-database.service";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra";
}

export async function getProjectDatabases(projectId: string) {
  const { organizationId } = await requireProjectModule(PROJECT_PERMISSIONS.READ);
  return getProjectDatabasesService(organizationId, projectId);
}

export async function getProjectDatabaseById(databaseId: string) {
  const { organizationId } = await requireProjectModule(PROJECT_PERMISSIONS.READ);
  return getProjectDatabaseByIdService(organizationId, databaseId);
}

export async function createProjectDatabase(projectId: string, data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_DATABASE);
  try {
    const database = await createProjectDatabaseService(organizationId, userId, projectId, projectDatabaseCreateSchema.parse(data));
    revalidatePath(`/workspace/projects/${projectId}`);
    return { success: true, id: database.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createDatabaseField(databaseId: string, data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_DATABASE);
  try {
    const field = await createDatabaseFieldService(organizationId, userId, databaseId, projectDatabaseFieldCreateSchema.parse(data));
    return { success: true, id: field.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createDatabaseView(databaseId: string, data: unknown) {
  const { organizationId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_DATABASE);
  try {
    const view = await createDatabaseViewService(organizationId, databaseId, projectDatabaseViewCreateSchema.parse(data));
    return { success: true, id: view.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createDatabaseRecord(databaseId: string, data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_DATABASE);
  try {
    const record = await createDatabaseRecordService(organizationId, userId, databaseId, projectDatabaseRecordCreateSchema.parse(data));
    return { success: true, id: record.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateDatabaseRecord(recordId: string, values: Record<string, unknown>) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_DATABASE);
  try {
    const record = await updateDatabaseRecordService(organizationId, userId, recordId, values);
    return { success: true, id: record.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function createProjectDatabaseShareLink(databaseId: string, data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.SHARE_PUBLIC);
  try {
    const share = await createProjectDatabaseShareLinkService(organizationId, userId, databaseId, projectDatabaseShareCreateSchema.parse(data));
    return { success: true, id: share.id, token: share.token };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function getPublicDatabaseByToken(token: string) {
  z.string().min(20).parse(token);
  return getPublicDatabaseByTokenService(token);
}

export async function updatePublicRecordByToken(token: string, data: unknown) {
  try {
    const input = publicRecordUpdateSchema.parse(data);
    const hdrs = await headers();
    const record = await updatePublicRecordByTokenService(token, input.recordId, input.values, input.guestInfo, {
      ipAddress: hdrs.get("x-forwarded-for") || undefined,
      userAgent: hdrs.get("user-agent") || undefined,
    });
    return { success: true, id: record.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

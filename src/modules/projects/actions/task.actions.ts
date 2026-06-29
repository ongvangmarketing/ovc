"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { PROJECT_PERMISSIONS } from "@/modules/projects/constants/project-permissions";
import { requireProjectModule } from "@/modules/projects/guards/project-module.guard";
import { reorderTasksSchema, taskCommentSchema, taskCreateSchema, taskUpdateSchema } from "@/modules/projects/schemas/task.schema";
import {
  addTaskCommentService,
  completeTaskService,
  createProjectTaskService,
  getProjectTasksService,
  reorderTasksService,
  updateProjectTaskService,
} from "@/modules/projects/services/task.service";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra";
}

export async function getProjectTasks(projectId: string) {
  const { organizationId } = await requireProjectModule(PROJECT_PERMISSIONS.READ);
  return getProjectTasksService(organizationId, projectId);
}

export async function createProjectTask(projectId: string, data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_TASKS);
  try {
    const task = await createProjectTaskService(organizationId, userId, projectId, taskCreateSchema.parse(data));
    revalidatePath(`/workspace/projects/${projectId}`);
    return { success: true, id: task.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateProjectTask(id: string, data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_TASKS);
  try {
    const task = await updateProjectTaskService(organizationId, userId, taskUpdateSchema.parse({ ...data as Record<string, unknown>, id }));
    revalidatePath(`/workspace/projects/${task.projectId}`);
    return { success: true, id: task.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function completeTask(id: string) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_TASKS);
  try {
    const task = await completeTaskService(organizationId, userId, id);
    revalidatePath(`/workspace/projects/${task.projectId}`);
    return { success: true, id: task.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function reorderTasks(data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_TASKS);
  try {
    const input = reorderTasksSchema.parse(data);
    await reorderTasksService(organizationId, userId, input.projectId, input.tasks);
    revalidatePath(`/workspace/projects/${input.projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function addTaskComment(data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_TASKS);
  try {
    const input = taskCommentSchema.parse(data);
    const comment = await addTaskCommentService(organizationId, userId, input.taskId, input.content);
    return { success: true, id: comment.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function assignTask(id: string, userId: string | null) {
  return updateProjectTask(id, { assigneeId: userId || null });
}

export async function deleteProjectTask(id: string) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.MANAGE_TASKS);
  try {
    const input = z.object({ id: z.string().cuid() }).parse({ id });
    const task = await updateProjectTaskService(organizationId, userId, { id: input.id, status: "CANCELLED" });
    revalidatePath(`/workspace/projects/${task.projectId}`);
    return { success: true, id: task.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

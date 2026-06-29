"use server";

import { revalidatePath } from "next/cache";

import { PROJECT_PERMISSIONS } from "@/modules/projects/constants/project-permissions";
import { requireProjectModule } from "@/modules/projects/guards/project-module.guard";
import { projectCreateSchema, projectStatusSchema, projectUpdateSchema } from "@/modules/projects/schemas/project.schema";
import {
  changeProjectStatusService,
  createProjectService,
  deleteProjectService,
  getProjectByIdService,
  getProjectsService,
  updateProjectService,
} from "@/modules/projects/services/project.service";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Có lỗi xảy ra";
}

export async function getProjects() {
  const { organizationId } = await requireProjectModule(PROJECT_PERMISSIONS.READ);
  return getProjectsService(organizationId);
}

export async function getProjectById(id: string) {
  const { organizationId } = await requireProjectModule(PROJECT_PERMISSIONS.READ);
  return getProjectByIdService(organizationId, id);
}

export async function createProject(data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.CREATE);
  try {
    const project = await createProjectService(organizationId, userId, projectCreateSchema.parse(data));
    revalidatePath("/workspace/projects");
    return { success: true, id: project.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function updateProject(id: string, data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.UPDATE);
  try {
    const project = await updateProjectService(organizationId, userId, projectUpdateSchema.parse({ ...data as Record<string, unknown>, id }));
    revalidatePath("/workspace/projects");
    revalidatePath(`/workspace/projects/${project.id}`);
    return { success: true, id: project.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function changeProjectStatus(data: unknown) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.UPDATE);
  try {
    const input = projectStatusSchema.parse(data);
    const project = await changeProjectStatusService(organizationId, userId, input.id, input.status);
    revalidatePath("/workspace/projects");
    revalidatePath(`/workspace/projects/${project.id}`);
    return { success: true, id: project.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

export async function deleteProject(id: string) {
  const { organizationId, userId } = await requireProjectModule(PROJECT_PERMISSIONS.DELETE);
  try {
    const project = await deleteProjectService(organizationId, userId, id);
    revalidatePath("/workspace/projects");
    return { success: true, id: project.id };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}

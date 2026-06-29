import { ProjectActivityType, ProjectStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { createProjectActivity } from "@/modules/projects/services/project-activity.service";
import type { ProjectCreateInput, ProjectUpdateInput } from "@/modules/projects/schemas/project.schema";

function asDate(value?: string | null) {
  return value ? new Date(value) : null;
}

function asBudget(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function progressFromTasks(tasks: Array<{ status: string }>) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((task) => task.status === "DONE").length / tasks.length) * 100);
}

export async function getProjectsService(organizationId: string) {
  const projects = await db.project.findMany({
    where: { organizationId, isArchived: false },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      tasks: { select: { id: true, status: true } },
      _count: { select: { tasks: true, files: true, databases: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return projects.map((project) => ({
    ...project,
    progress: progressFromTasks(project.tasks),
  }));
}

export async function getProjectByIdService(organizationId: string, id: string) {
  return db.project.findFirst({
    where: { id, organizationId },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      members: { include: { user: { select: { id: true, name: true, email: true, image: true } } }, orderBy: { joinedAt: "asc" } },
      taskLists: { orderBy: { order: "asc" } },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true, image: true } },
          subtasks: { orderBy: { order: "asc" } },
          comments: { orderBy: { createdAt: "desc" }, take: 5, include: { user: { select: { id: true, name: true, email: true, image: true } } } },
          attachments: true,
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      },
      files: { orderBy: { createdAt: "desc" } },
      databases: {
        where: { deletedAt: null },
        include: { _count: { select: { fields: true, records: true, views: true, shareLinks: true } } },
        orderBy: { updatedAt: "desc" },
      },
      activities: {
        include: { actor: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 80,
      },
    },
  });
}

export async function createProjectService(organizationId: string, userId: string, input: ProjectCreateInput) {
  const project = await db.project.create({
    data: {
      organizationId,
      ownerId: input.ownerId || userId,
      contactId: input.contactId || null,
      name: input.name,
      description: input.description || null,
      status: input.status,
      priority: input.priority,
      startDate: asDate(input.startDate),
      dueDate: asDate(input.dueDate),
      budget: asBudget(input.budget),
      color: input.color || "#F59E0B",
      icon: input.icon || null,
      members: {
        create: { userId, role: "OWNER" },
      },
      taskLists: {
        create: [
          { name: "Chưa bắt đầu", order: 0, color: "#9ca3af", isDefault: true },
          { name: "Cần làm", order: 1, color: "#64748b" },
          { name: "Đang làm", order: 2, color: "#3b82f6" },
          { name: "Đang duyệt", order: 3, color: "#f59e0b" },
          { name: "Hoàn thành", order: 4, color: "#10b981" },
        ],
      },
    },
  });

  await createProjectActivity({
    organizationId,
    projectId: project.id,
    type: ProjectActivityType.PROJECT_CREATED,
    title: "Tạo dự án",
    description: `Đã tạo dự án ${project.name}`,
    actorId: userId,
  });

  return project;
}

export async function updateProjectService(organizationId: string, userId: string, input: ProjectUpdateInput) {
  const existing = await db.project.findFirst({ where: { id: input.id, organizationId } });
  if (!existing) throw new Error("Không tìm thấy dự án");

  const project = await db.project.update({
    where: { id: existing.id },
    data: {
      name: input.name ?? undefined,
      description: input.description === undefined ? undefined : input.description || null,
      contactId: input.contactId === undefined ? undefined : input.contactId || null,
      status: input.status ?? undefined,
      priority: input.priority ?? undefined,
      startDate: input.startDate === undefined ? undefined : asDate(input.startDate),
      dueDate: input.dueDate === undefined ? undefined : asDate(input.dueDate),
      budget: input.budget === undefined ? undefined : asBudget(input.budget),
      color: input.color === undefined ? undefined : input.color || "#F59E0B",
      icon: input.icon === undefined ? undefined : input.icon || null,
    },
  });

  await createProjectActivity({
    organizationId,
    projectId: project.id,
    type: ProjectActivityType.PROJECT_UPDATED,
    title: "Cập nhật dự án",
    description: `Đã cập nhật dự án ${project.name}`,
    actorId: userId,
  });

  return project;
}

export async function changeProjectStatusService(organizationId: string, userId: string, id: string, status: ProjectStatus) {
  const project = await db.project.update({
    where: { id, organizationId },
    data: { status, completedAt: status === "COMPLETED" ? new Date() : null },
  });

  await createProjectActivity({
    organizationId,
    projectId: id,
    type: ProjectActivityType.PROJECT_UPDATED,
    title: "Đổi trạng thái dự án",
    description: `Dự án chuyển sang ${status}`,
    actorId: userId,
    metadata: { status },
  });

  return project;
}

export async function deleteProjectService(organizationId: string, userId: string, id: string) {
  const project = await db.project.update({
    where: { id, organizationId },
    data: { isArchived: true, status: "ARCHIVED" },
  });

  await createProjectActivity({
    organizationId,
    projectId: id,
    type: ProjectActivityType.PROJECT_DELETED,
    title: "Lưu trữ dự án",
    description: `Đã lưu trữ dự án ${project.name}`,
    actorId: userId,
  });

  return project;
}

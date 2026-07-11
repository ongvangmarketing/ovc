import { ProjectActivityType, TaskStatus } from "@prisma/client";

import { getTenantDb } from "@/lib/db";
import { createProjectActivity } from "@/modules/projects/services/project-activity.service";
import type { TaskCreateInput, TaskUpdateInput } from "@/modules/projects/types/task.schema";
import { TaskRepository } from "@/modules/projects/repositories/task.repository";
import { AuthorizationService } from "@/modules/core/services/authorization.service";

function asDate(value?: string | null) {
  return value ? new Date(value) : null;
}

async function assertProject(organizationId: string, projectId: string) {
  const project = await getTenantDb().project.findFirst({ where: { id: projectId, organizationId }, select: { id: true } });
  if (!project) throw new Error("Không tìm thấy dự án");
  return project;
}

export async function getProjectTasksService(organizationId: string, projectId: string) {
  await assertProject(organizationId, projectId);
  return TaskRepository.findTasksByProjectId(projectId);
}

export async function createProjectTaskService(organizationId: string, userId: string, projectId: string, input: TaskCreateInput) {
  await assertProject(organizationId, projectId);
  const task = await TaskRepository.createTask({
      projectId,
      taskListId: input.taskListId || null,
      parentId: input.parentId || null,
      title: input.title,
      description: input.description || null,
      status: input.status,
      priority: input.priority,
      assigneeId: input.assigneeId || null,
      creatorId: userId,
      startDate: asDate(input.startDate),
      dueDate: asDate(input.dueDate),
      tags: input.tags,
      order: input.order ?? 0,
  });

  await createProjectActivity({
    organizationId,
    projectId,
    taskId: task.id,
    type: ProjectActivityType.TASK_CREATED,
    title: "Tạo công việc",
    description: `Đã tạo công việc ${task.title}`,
    actorId: userId,
  });

  // Tự động cấp quyền Data-Level (Phase 2)
  const db = getTenantDb(organizationId);
  await db.resourceAccess.create({
    data: {
      organizationId,
      resourceType: "TASK",
      resourceId: task.id,
      userId: userId,
      permissionLevel: "FULL",
    }
  });

  if (input.assigneeId && input.assigneeId !== userId) {
    await db.resourceAccess.create({
      data: {
        organizationId,
        resourceType: "TASK",
        resourceId: task.id,
        userId: input.assigneeId,
        permissionLevel: "EDIT",
      }
    });
  }

  return task;
}

export async function updateProjectTaskService(organizationId: string, userId: string, input: TaskUpdateInput) {
  // Check data-level permission
  await AuthorizationService.checkResourceAccess(userId, organizationId, "TASK", input.id, "EDIT");

  const existing = await TaskRepository.findTaskByIdAndOrg(input.id, organizationId);
  if (!existing) throw new Error("Không tìm thấy công việc");

  const task = await TaskRepository.updateTask(existing.id, {
      taskListId: input.taskListId === undefined ? undefined : input.taskListId || null,
      parentId: input.parentId === undefined ? undefined : input.parentId || null,
      title: input.title ?? undefined,
      description: input.description === undefined ? undefined : input.description || null,
      status: input.status ?? undefined,
      priority: input.priority ?? undefined,
      assigneeId: input.assigneeId === undefined ? undefined : input.assigneeId || null,
      startDate: input.startDate === undefined ? undefined : asDate(input.startDate),
      dueDate: input.dueDate === undefined ? undefined : asDate(input.dueDate),
      tags: input.tags ?? undefined,
      order: input.order ?? undefined,
      completedAt: input.status === TaskStatus.DONE ? new Date() : input.status ? null : undefined,
  });

  await createProjectActivity({
    organizationId,
    projectId: existing.projectId,
    taskId: task.id,
    type: existing.status !== task.status ? ProjectActivityType.TASK_STATUS_CHANGED : ProjectActivityType.TASK_UPDATED,
    title: existing.status !== task.status ? "Đổi trạng thái công việc" : "Cập nhật công việc",
    description: `Đã cập nhật công việc ${task.title}`,
    actorId: userId,
    metadata: { previousStatus: existing.status, status: task.status },
  });

  return task;
}

export async function completeTaskService(organizationId: string, userId: string, taskId: string) {
  // Check data-level permission
  await AuthorizationService.checkResourceAccess(userId, organizationId, "TASK", taskId, "EDIT");

  const existing = await TaskRepository.findTaskByIdAndOrg(taskId, organizationId);
  if (!existing) throw new Error("Không tìm thấy công việc");
  const task = await TaskRepository.updateTask(existing.id, { status: TaskStatus.DONE, completedAt: new Date() });

  await createProjectActivity({
    organizationId,
    projectId: existing.projectId,
    taskId,
    type: ProjectActivityType.TASK_COMPLETED,
    title: "Hoàn thành công việc",
    description: `Đã hoàn thành công việc ${existing.title}`,
    actorId: userId,
  });

  return task;
}

export async function reorderTasksService(organizationId: string, userId: string, projectId: string, tasks: Array<{ id: string; taskListId?: string | null; status?: TaskStatus; order: number }>) {
  await assertProject(organizationId, projectId);
  await getTenantDb().$transaction((tx) => TaskRepository.updateTasksOrder(projectId, tasks, tx));

  await createProjectActivity({
    organizationId,
    projectId,
    type: ProjectActivityType.TASK_STATUS_CHANGED,
    title: "Sắp xếp công việc",
    description: "Đã cập nhật thứ tự hoặc cột Kanban",
    actorId: userId,
    metadata: { taskIds: tasks.map((task) => task.id) },
  });

  return { success: true };
}

export async function addTaskCommentService(organizationId: string, userId: string, taskId: string, content: string) {
  const task = await TaskRepository.findTaskByIdAndOrg(taskId, organizationId);
  if (!task) throw new Error("Không tìm thấy công việc");
  const comment = await TaskRepository.createTaskComment(taskId, userId, content);

  await createProjectActivity({
    organizationId,
    projectId: task.projectId,
    taskId,
    type: ProjectActivityType.COMMENT_ADDED,
    title: "Thêm bình luận",
    description: `Đã bình luận trong ${task.title}`,
    actorId: userId,
  });

  return comment;
}

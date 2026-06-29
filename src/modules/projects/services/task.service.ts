import { ProjectActivityType, TaskStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { createProjectActivity } from "@/modules/projects/services/project-activity.service";
import type { TaskCreateInput, TaskUpdateInput } from "@/modules/projects/schemas/task.schema";

function asDate(value?: string | null) {
  return value ? new Date(value) : null;
}

async function assertProject(organizationId: string, projectId: string) {
  const project = await db.project.findFirst({ where: { id: projectId, organizationId }, select: { id: true } });
  if (!project) throw new Error("Không tìm thấy dự án");
  return project;
}

export async function getProjectTasksService(organizationId: string, projectId: string) {
  await assertProject(organizationId, projectId);
  return db.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, email: true, image: true } },
      creator: { select: { id: true, name: true, email: true, image: true } },
      subtasks: { orderBy: { order: "asc" } },
      comments: { orderBy: { createdAt: "desc" }, take: 5 },
      attachments: true,
    },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
}

export async function createProjectTaskService(organizationId: string, userId: string, projectId: string, input: TaskCreateInput) {
  await assertProject(organizationId, projectId);
  const task = await db.task.create({
    data: {
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
    },
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

  return task;
}

export async function updateProjectTaskService(organizationId: string, userId: string, input: TaskUpdateInput) {
  const existing = await db.task.findFirst({
    where: { id: input.id, project: { organizationId } },
    select: { id: true, projectId: true, status: true, title: true },
  });
  if (!existing) throw new Error("Không tìm thấy công việc");

  const task = await db.task.update({
    where: { id: existing.id },
    data: {
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
    },
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
  const existing = await db.task.findFirst({ where: { id: taskId, project: { organizationId } }, select: { id: true, projectId: true, title: true } });
  if (!existing) throw new Error("Không tìm thấy công việc");
  const task = await db.task.update({ where: { id: existing.id }, data: { status: TaskStatus.DONE, completedAt: new Date() } });

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
  await db.$transaction(tasks.map((task) =>
    db.task.updateMany({
      where: { id: task.id, projectId },
      data: { order: task.order, taskListId: task.taskListId ?? undefined, status: task.status ?? undefined },
    }),
  ));

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
  const task = await db.task.findFirst({ where: { id: taskId, project: { organizationId } }, select: { id: true, projectId: true, title: true } });
  if (!task) throw new Error("Không tìm thấy công việc");
  const comment = await db.taskComment.create({ data: { taskId, userId, content } });

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

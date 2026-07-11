import { getTenantDb } from "@/lib/db";
import { Prisma, TaskStatus } from "@prisma/client";

export class TaskRepository {
  static async findTasksByProjectId(projectId: string) {
    return getTenantDb().task.findMany({
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

  static async createTask(data: Prisma.TaskUncheckedCreateInput) {
    return getTenantDb().task.create({ data });
  }

  static async updateTask(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return getTenantDb().task.update({ where: { id }, data });
  }

  static async findTaskByIdAndOrg(id: string, organizationId: string) {
    return getTenantDb().task.findFirst({
      where: { id, project: { organizationId } },
      select: { id: true, projectId: true, status: true, title: true },
    });
  }

  static async updateTasksOrder(projectId: string, tasks: Array<{ id: string; taskListId?: string | null; status?: TaskStatus; order: number }>, tx: any = getTenantDb()) {
    return Promise.all(
      tasks.map((task) =>
        tx.task.updateMany({
          where: { id: task.id, projectId },
          data: { order: task.order, taskListId: task.taskListId ?? undefined, status: task.status ?? undefined },
        })
      )
    );
  }

  static async createTaskComment(taskId: string, userId: string, content: string) {
    return getTenantDb().taskComment.create({ data: { taskId, userId, content } });
  }
}

import { Prisma, type ProjectActivityType } from "@prisma/client";

import { db } from "@/lib/db";

type ActivityInput = {
  organizationId: string;
  projectId?: string | null;
  taskId?: string | null;
  type: ProjectActivityType;
  title: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  actorId?: string | null;
};

function jsonValue(value?: Record<string, unknown> | null) {
  return value === null ? Prisma.JsonNull : value === undefined ? undefined : value as Prisma.InputJsonValue;
}

export async function createProjectActivity(input: ActivityInput) {
  const activity = await db.projectActivity.create({
    data: {
      organizationId: input.organizationId,
      projectId: input.projectId || null,
      taskId: input.taskId || null,
      type: input.type,
      title: input.title,
      description: input.description || null,
      metadata: jsonValue(input.metadata),
      actorId: input.actorId || null,
    },
  });

  await db.activityLog.create({
    data: {
      organizationId: input.organizationId,
      userId: input.actorId || null,
      action: input.type,
      entity: input.taskId ? "Task" : "Project",
      entityId: input.taskId || input.projectId || null,
      description: input.description || input.title,
      metadata: jsonValue(input.metadata),
    },
  });

  return activity;
}

export async function getProjectActivities(organizationId: string, projectId: string) {
  return db.projectActivity.findMany({
    where: { organizationId, projectId },
    include: { actor: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

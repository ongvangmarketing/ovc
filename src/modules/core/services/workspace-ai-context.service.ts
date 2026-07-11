import { getTenantDb } from "@/lib/db";

export class WorkspaceAIContextService {
  static async getAIContext(organizationId: string) {
    const db = getTenantDb(organizationId);
    const now = new Date();
    const [projects, customers, unpaidInvoices, recentPayments] = await Promise.all([
      db.project.findMany({
        where: { organizationId, isArchived: false },
        orderBy: { updatedAt: "desc" },
        take: 20,
        select: {
          id: true,
          name: true,
          status: true,
          startDate: true,
          dueDate: true,
          tasks: {
            where: { parentId: null },
            orderBy: { dueDate: "asc" },
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
              dueDate: true,
              assignee: { select: { id: true, name: true } },
            },
          },
        },
      }),
      db.contact.count({ where: { organizationId, status: "ACTIVE" } }),
      db.invoice.findMany({
        where: { organizationId, status: { notIn: ["PAID", "CANCELLED"] } },
        orderBy: { dueDate: "asc" },
        take: 20,
        select: { id: true, number: true, status: true, total: true, dueDate: true },
      }),
      db.payment.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, number: true, amount: true, paidAt: true, status: true },
      }),
    ]);
    const tasks = projects.flatMap((project) =>
      project.tasks.map((task) => ({
        ...task,
        project: { id: project.id, name: project.name },
      })),
    );
    const taskCounts = tasks.reduce<Record<string, number>>((counts, task) => {
      counts[task.status] = (counts[task.status] ?? 0) + 1;
      return counts;
    }, {});
    const unfinished = tasks.filter((task) => !["DONE", "CANCELLED"].includes(task.status));
    const overdueTasks = unfinished.filter((task) => task.dueDate && task.dueDate < now).slice(0, 20);
    const unfinishedTasks = unfinished.length;
    return {
      generatedAt: now.toISOString(),
      summary: {
        unfinishedTasks,
        overdueTasks: overdueTasks.length,
        activeProjects: projects.filter((project) => project.status === "ACTIVE").length,
        activeCustomers: customers,
        unpaidInvoices: unpaidInvoices.length,
      },
      taskCounts,
      overdueTasks,
      projects: projects.map(({ tasks: projectTasks, ...project }) => ({
        ...project,
        taskCount: projectTasks.length,
      })),
      unpaidInvoices,
      recentPayments,
    };
  }
}

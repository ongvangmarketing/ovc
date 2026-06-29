import type { Metadata } from "next";
import { getProjectTasksDashboard } from "@/app/actions/projects";
import { TasksDashboardClient } from "../../tasks/tasks-dashboard-client";

export const metadata: Metadata = {
  title: "Nhiệm vụ Dự án",
};

export default async function ProjectTasksPage() {
  const tasks = await getProjectTasksDashboard();
  return <TasksDashboardClient tasks={tasks} mode="project" />;
}

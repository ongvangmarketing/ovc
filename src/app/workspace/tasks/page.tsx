import type { Metadata } from "next";
import { getProjectTasksDashboard } from "@/app/actions/projects";
import { TasksDashboardClient } from "./tasks-dashboard-client";

export const metadata: Metadata = {
  title: "Công việc",
};

export default async function TasksPage() {
  const tasks = await getProjectTasksDashboard();
  return <TasksDashboardClient tasks={tasks} mode="tasks" />;
}

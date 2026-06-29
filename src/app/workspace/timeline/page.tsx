import type { Metadata } from "next";
import { getProjectTasksDashboard } from "@/app/actions/projects";
import { TasksDashboardClient } from "../tasks/tasks-dashboard-client";

export const metadata: Metadata = {
  title: "Timeline",
};

export default async function TimelinePage() {
  const tasks = await getProjectTasksDashboard();
  return <TasksDashboardClient tasks={tasks} mode="timeline" />;
}

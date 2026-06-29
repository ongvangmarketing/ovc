import type { Metadata } from "next";
import { getProjectTasksDashboard } from "@/app/actions/projects";
import { TasksDashboardClient } from "../tasks/tasks-dashboard-client";

export const metadata: Metadata = {
  title: "Calendar",
};

export default async function CalendarPage() {
  const tasks = await getProjectTasksDashboard();
  return <TasksDashboardClient tasks={tasks} mode="calendar" />;
}

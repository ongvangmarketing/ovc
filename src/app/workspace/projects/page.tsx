import { getProjects } from "@/app/actions/projects";
import { ProjectsClient } from "./projects-client";

export const metadata = {
  title: "Quản lý Dự án | Ong Vàng",
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient initialProjects={projects} />;
}

import { getProjectById } from "@/modules/projects/actions/project.actions";
import { notFound } from "next/navigation";
import { ProjectEditClient } from "./project-edit-client";

export const metadata = {
  title: "Sửa Dự án | Ong Vàng",
};

export const dynamic = "force-dynamic";

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectEditClient project={project} />;
}

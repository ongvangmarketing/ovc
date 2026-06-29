import { getProjectById } from "@/app/actions/projects";
import { notFound } from "next/navigation";
import { ProjectEditClient } from "./project-edit-client";

export const metadata = {
  title: "Sửa Dự án | Ong Vàng",
};

export const dynamic = "force-dynamic";

export default async function ProjectEditPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return <ProjectEditClient project={project} />;
}

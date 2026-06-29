import { getProjectById } from "@/app/actions/projects";
import { ProjectDetailClient } from "./project-detail-client";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Chi tiết Dự án | Ong Vàng",
};

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);
  
  if (!project) {
    notFound();
  }

  return <ProjectDetailClient key={project.id} project={project} />;
}

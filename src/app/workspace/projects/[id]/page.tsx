import { getProjectById } from "@/app/actions/projects";
import { ProjectDetailWorkspace } from "./project-detail-workspace";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Chi tiết Dự án | Ong Vàng",
};

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  
  if (!project) {
    notFound();
  }

  return <ProjectDetailWorkspace key={project.id} project={JSON.parse(JSON.stringify(project)) as any} />;
}

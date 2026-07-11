import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProjectByShareToken } from "@/modules/projects/actions/project.actions";
import { ProjectDetailWorkspace } from "@/app/(workspace)/workspace/projects/[id]/project-detail-workspace";

export const metadata: Metadata = {
  title: "Project View | Ong Vàng",
};

export default async function PublicProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  
  const project = await getPublicProjectByShareToken(token);

  if (!project) notFound();

  return (
    <main className="min-h-screen bg-[#f2f2f7] flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md px-6 py-4 shadow-[0_1px_12px_rgba(0,0,0,0.03)] sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800">{project.name}</span>
        </div>
        <div className="text-[13px] font-medium text-slate-500">Bản xem trước dự án (Chỉ xem)</div>
      </header>
      
      <div className="flex-1 overflow-auto bg-[#f8fafc]">
        {/* We reuse the exact same Workspace component but pass readOnly=true */}
        <ProjectDetailWorkspace project={JSON.parse(JSON.stringify(project))} guestMode={true} guestShareToken={token} baseHref="#" />
      </div>
    </main>
  );
}
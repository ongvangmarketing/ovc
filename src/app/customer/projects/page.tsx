import type { Metadata } from "next";
import { getCustomerPortalData, progressFromTasks, statusLabel, formatCurrency, formatDate } from "../portal-data";
import { ProjectsView } from "./projects-view";

export const metadata: Metadata = {
  title: "Dự án | Customer Portal",
};

export default async function CustomerProjectsPage() {
  const data = await getCustomerPortalData();

  if (!data.contact) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen text-black selection:bg-black selection:text-white pb-24 font-sans">
      {/* Vercel Header Section */}
      <div className="pt-16 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto border-b border-[#eaeaea]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <div className="max-w-3xl">
            <h1 className="text-[40px] md:text-[56px] font-medium tracking-tighter leading-[1.05] text-black">
              Quản lý Dự án
            </h1>
            <p className="text-[18px] text-gray-500 max-w-2xl mt-4 tracking-tight leading-snug">
              Theo dõi tiến độ, nhiệm vụ và ngân sách các dự án của bạn.
            </p>
          </div>
          
          <div className="flex gap-8 min-w-max">
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-2">Tổng dự án</p>
              <p className="text-[28px] font-medium tracking-tighter text-black leading-none">{data.projects.length}</p>
            </div>
            <div className="w-[1px] bg-[#eaeaea]"></div>
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-2">Đang triển khai</p>
              <p className="text-[28px] font-medium tracking-tighter text-black leading-none">{data.totals.activeProjects}</p>
            </div>
          </div>
        </div>
      </div>

      <ProjectsView projects={data.projects.map((project) => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        statusLabel: statusLabel(project.status),
        statusClass: project.status === "COMPLETED" ? "is-success" : "is-info",
        progress: progressFromTasks(project.tasks),
        startDate: formatDate(project.startDate),
        dueDate: formatDate(project.dueDate),
        budget: formatCurrency(project.budget),
        taskCount: project.tasks.length,
        owner: project.owner ? { name: project.owner.name || project.owner.email || "Người phụ trách", email: project.owner.email, image: project.owner.image } : null,
        followers: project.members.map((member) => ({
          id: member.userId,
          name: member.user.name || member.user.email || "Follower",
          email: member.user.email,
          image: member.user.image,
          role: member.role,
        })),
      }))} />
    </div>
  );
}

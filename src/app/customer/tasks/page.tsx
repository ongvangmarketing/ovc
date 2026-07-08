import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { getCustomerPortalData } from "../portal-data";
import { TasksList } from "./TasksList";

export const metadata: Metadata = {
  title: "Nhiệm vụ | Customer Portal",
};

export default async function CustomerTasksPage() {
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
              Bảng Nhiệm Vụ
            </h1>
            <p className="text-[18px] text-gray-500 max-w-2xl mt-4 tracking-tight leading-snug">
              Theo dõi tiến độ chi tiết từng hạng mục công việc của {data.customerName}
            </p>
          </div>
          
          <div className="flex gap-8 min-w-max">
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-2">Tổng Task</p>
              <p className="text-[28px] font-medium tracking-tighter text-black leading-none">{data.tasks.length}</p>
            </div>
            <div className="w-[1px] bg-[#eaeaea]"></div>
            <div>
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-widest mb-2">Đang chờ</p>
              <p className="text-[28px] font-medium tracking-tighter text-orange-500 leading-none">{data.totals.openTasks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-[1440px] mx-auto pt-10">
        <TasksList tasks={data.tasks} currentUser={data.session.user} />
      </div>
    </div>
  );
}

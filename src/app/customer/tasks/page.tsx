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
    <div className="mx-auto max-w-[1440px] px-6 py-8 animate-in fade-in duration-500 min-h-full">
      <header className="mb-8 flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 shadow-sm shrink-0">
            <ClipboardList className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bảng Nhiệm Vụ</h1>
            <p className="mt-1 text-sm text-slate-500">Theo dõi tiến độ chi tiết từng hạng mục công việc của {data.customerName}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Task</div>
            <div className="text-lg font-bold text-slate-900">{data.tasks.length}</div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đang chờ</div>
            <div className="text-lg font-bold text-orange-600">{data.totals.openTasks}</div>
          </div>
        </div>
      </header>

      <TasksList tasks={data.tasks} currentUser={data.session.user} />
    </div>
  );
}

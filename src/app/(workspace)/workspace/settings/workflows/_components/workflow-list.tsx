import Link from "next/link";
import { Activity, Clock3, GitBranch, Plus } from "lucide-react";
import type { WorkflowSummary } from "@/lib/automation/types/workflow.types";
import { createWorkflowAction } from "../_actions/workflow.actions";

const statusLabel: Record<string, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã xuất bản",
  DISABLED: "Đã tắt",
  ARCHIVED: "Lưu trữ",
};

export function WorkflowList({ workflows }: { workflows: WorkflowSummary[] }) {
  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
                Tự động hóa
              </span>
            </div>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Quy trình,</span>{" "}
            <span className="text-gray-400">tự động hóa bằng điều kiện.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Thiết lập các kịch bản tự động bằng sự kiện, điều kiện và hành động. Module đang ở trạng thái Development.
          </p>
        </div>

        <div className="space-y-8">
          <section className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
            <div className="p-8">
              <h3 className="text-[20px] font-medium tracking-tight text-black mb-6">Tạo workflow</h3>
              
              <form action={createWorkflowAction} className="grid gap-4 lg:grid-cols-[1fr_1.5fr_auto] lg:items-end">
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-black">Tên workflow</span>
                  <input name="name" className="w-full rounded-md border border-[#eaeaea] px-3 py-3 text-[14px] focus:border-black focus:outline-none transition-colors" required minLength={2} placeholder="Chăm sóc lead mới" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[13px] font-medium text-black">Mô tả</span>
                  <input name="description" className="w-full rounded-md border border-[#eaeaea] px-3 py-3 text-[14px] focus:border-black focus:outline-none transition-colors" placeholder="Mục tiêu và phạm vi workflow" />
                </label>
                <button className="flex h-[46px] w-full items-center justify-center gap-2 rounded-md bg-black px-6 text-[14px] font-medium text-white transition hover:bg-gray-800 disabled:opacity-50" type="submit">
                  <Plus className="h-4 w-4" /> Tạo workflow
                </button>
              </form>
            </div>
          </section>

          <section className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-medium tracking-tight text-black">Workflow của tổ chức</h3>
                <span className="text-[13px] font-medium text-gray-400">{workflows.length} quy trình</span>
              </div>
              
              {workflows.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#eaeaea] bg-gray-50 p-8 text-center text-[14px] text-gray-500">
                  Chưa có workflow. Tạo workflow đầu tiên ở phía trên.
                </div>
              ) : (
                <div className="grid gap-3">
                  {workflows.map((workflow) => (
                    <Link
                      href={`/workspace/settings/workflows/${workflow.id}`}
                      key={workflow.id}
                      className="group grid gap-3 rounded-xl border border-[#eaeaea] bg-white p-4 transition-colors hover:border-black lg:grid-cols-[1fr_auto_auto] lg:items-center"
                    >
                      <div>
                        <div className="font-medium text-[15px] text-black">{workflow.name}</div>
                        <div className="mt-1 text-[13px] text-gray-500">{workflow.description || "Không có mô tả"}</div>
                      </div>
                      <div className="flex items-center gap-5 text-[13px] text-gray-500">
                        <span className="inline-flex items-center gap-1.5"><Activity className="h-4 w-4" /> {workflow.executionCount} lần chạy</span>
                        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" /> {workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleDateString("vi-VN") : "N/A"}</span>
                      </div>
                      <span className="rounded-full border border-[#eaeaea] bg-gray-50 px-3 py-1.5 text-[12px] font-medium text-gray-600">
                        {statusLabel[workflow.status] || workflow.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ContentPlanModal } from "./content-plan-modal";

interface ProjectContentTableProps {
  projectId: string;
  contentPlans: any[];
  readOnly?: boolean;
  guestMode?: boolean;
  guestShareToken?: string;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Bản nháp",
  SCHEDULED: "Đã lên lịch",
  PUBLISHED: "Đã đăng",
  ARCHIVED: "Lưu trữ",
};

const statusStyles: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SCHEDULED: "bg-blue-50 text-blue-700",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

export function ProjectContentTable({ projectId, contentPlans, readOnly, guestMode, guestShareToken }: ProjectContentTableProps) {
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden m-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Tên bài đăng</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Trạng thái</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Kênh</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Lịch đăng</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Chiến dịch / Thương hiệu</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Người phụ trách</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contentPlans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Chưa có bài đăng nào.
                </td>
              </tr>
            ) : (
              contentPlans.map((plan) => (
                <tr 
                  key={plan.id} 
                  onClick={() => handleRowClick(plan)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 line-clamp-1">{plan.title}</div>
                    {plan.description && (
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{plan.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[plan.status] || statusStyles.DRAFT}`}>
                      {statusLabels[plan.status] || plan.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {plan.channels?.map((channel: string) => (
                        <span key={channel} className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {plan.scheduledAt ? format(new Date(plan.scheduledAt), "dd/MM/yyyy HH:mm", { locale: vi }) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-slate-600">
                      {plan.campaign?.name ? (
                        <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span> <span className="truncate max-w-[120px]">{plan.campaign.name}</span></div>
                      ) : null}
                      {plan.brand?.name ? (
                        <div className="flex items-center gap-1 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span> <span className="truncate max-w-[120px]">{plan.brand.name}</span></div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {plan.author?.name ? (
                      <div className="flex items-center gap-2">
                        {plan.author.image ? (
                          <img src={plan.author.image} alt={plan.author.name} className="w-6 h-6 rounded-full border border-slate-200" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                            {plan.author.name.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">{plan.author.name}</span>
                      </div>
                    ) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ContentPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        initialData={selectedPlan}
        readOnly={readOnly}
        guestMode={guestMode}
        guestShareToken={guestShareToken}
      />
    </div>
  );
}

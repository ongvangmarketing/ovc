"use client";

import React, { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "sonner";
import { Settings, CheckCircle2, LayoutTemplate, FileText } from "lucide-react";

export function CrmSettingsClient({ initialSettings }: { initialSettings: any }) {
  const [settings, setSettings] = useState(initialSettings);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateSettings(settings);
        toast.success("Cập nhật cấu hình CRM thành công!");
      } catch (error: any) {
        toast.error(error.message || "Lỗi khi lưu cấu hình");
      }
    });
  };

  const templates = [
    {
      id: "A4",
      name: "Mẫu A4 Truyền thống",
      description: "Giao diện báo giá và hợp đồng định dạng A4 chuẩn, phù hợp để in ấn và xuất PDF truyền thống.",
      icon: <FileText className="h-6 w-6 text-slate-500" />
    },
    {
      id: "MODERN",
      name: "Mẫu Hiện đại (Interactive)",
      description: "Giao diện web hiện đại, đẹp mắt với màu sắc và bố cục tối ưu trải nghiệm trên thiết bị điện tử.",
      icon: <LayoutTemplate className="h-6 w-6 text-indigo-500" />
    }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto">
      <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
        
        {/* Page Header */}
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
              <Settings className="h-4 w-4 text-orange-500" />
              CRM / Cấu hình
            </div>
            <h1 className="text-[14px] font-light text-slate-950">Quản lý cài đặt giao diện hiển thị cho các link chia sẻ Cơ hội (Deal).</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={isPending}
              className="quote-action-button quote-action-primary"
            >
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* Panel Cấu hình Mẫu */}
        <div className="space-y-5">
          <section className="quote-panel">
            <div className="quote-panel-header">
              <h2>Mẫu Link Chia sẻ Cơ hội (Deal) mặc định</h2>
              <span>Chọn giao diện khi khách hàng click vào link xem chi tiết Cơ hội.</span>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => {
                const isSelected = (settings.CRM_DOCUMENT_TEMPLATE || "A4") === template.id;
                
                return (
                  <div 
                    key={template.id}
                    onClick={() => setSettings({ ...settings, CRM_DOCUMENT_TEMPLATE: template.id })}
                    className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                      isSelected 
                        ? "border-orange-500 bg-orange-50/50 shadow-md ring-1 ring-orange-500" 
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                          {template.icon}
                        </div>
                        <div>
                          <h3 className={`font-medium ${isSelected ? 'text-orange-900' : 'text-slate-900'}`}>
                            {template.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

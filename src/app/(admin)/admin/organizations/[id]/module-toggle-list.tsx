"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleOrganizationModule } from "@/actions/organizations";

export function ModuleToggleList({
  orgId,
  modules,
  activeCodes,
}: {
  orgId: string;
  modules: any[];
  activeCodes: string[];
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (code: string) => {
    startTransition(async () => {
      try {
        await toggleOrganizationModule(orgId, code);
        toast.success(`Đã cập nhật trạng thái module`);
      } catch (error: any) {
        toast.error(error.message || "Lỗi cập nhật module");
      }
    });
  };

  return (
    <div className="divide-y divide-slate-100">
      {modules.map((module) => {
        const isEnabled = activeCodes.includes(module.code);
        
        return (
          <div key={module.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
            <div>
              <div className="text-[14px] font-medium text-slate-900">{module.name}</div>
              <div className="text-[13px] text-slate-500 mt-0.5">{module.description || "Module hệ thống"}</div>
            </div>
            
            <button
              onClick={() => handleToggle(module.code)}
              disabled={isPending}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50 ${
                isEnabled ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <span className="sr-only">Toggle module</span>
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}

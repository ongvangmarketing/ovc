"use client";

import { useState, useTransition } from "react";
import { X, Save, CheckCircle2, Circle, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { updateOrganization, toggleOrganizationModule } from "@/app/actions/organizations";

export function OrganizationPanel({
  organization,
  modules,
  plans,
  onClose,
}: {
  organization: any;
  modules: any[];
  plans: any[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateOrganization(organization.id, formData);
        toast.success("Đã cập nhật tổ chức thành công");
      } catch (error: any) {
        toast.error(error.message || "Đã có lỗi xảy ra");
      }
    });
  };

  const handleToggleModule = (moduleCode: string) => {
    startTransition(async () => {
      try {
        await toggleOrganizationModule(organization.id, moduleCode);
        toast.success(`Đã thay đổi trạng thái module ${moduleCode}`);
      } catch (error: any) {
        toast.error(error.message || "Không thể thay đổi module");
      }
    });
  };

  const legacyActiveCodes = new Set(organization.activeModules || []);
  const activeCodes = new Set(
    organization.moduleLicenses && organization.moduleLicenses.length > 0
      ? organization.moduleLicenses
          .filter((l: any) => l.enabled && ["ACTIVE", "TRIALING"].includes(l.status))
          .map((l: any) => l.module.code)
      : legacyActiveCodes
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-200 bg-white shadow-2xl transition-transform sm:max-w-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                {organization.name}
                <span className="text-xs font-mono font-medium rounded-md bg-orange-100 text-orange-700 px-2 py-0.5">
                  OV{organization.id.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase()}
                </span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">Cấu hình tổ chức và quyền truy cập</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <form id={`org-form-${organization.id}`} onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tên tổ chức</label>
                  <input
                    name="name"
                    defaultValue={organization.name}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Slug</label>
                  <input
                    name="slug"
                    defaultValue={organization.slug}
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Gói dịch vụ</label>
                <select
                  name="plan"
                  defaultValue={organization.plan || "workspace-standard"}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  {plans.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  defaultChecked={organization.isActive} 
                  id="isActive"
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-600"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Tổ chức đang hoạt động
                </label>
              </div>

              {/* Bật nhanh Module */}
              <div className="mt-8">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <KeyRound className="h-4 w-4 text-orange-600" />
                  Quyền truy cập Module
                </div>
                <div className="space-y-2">
                  {modules.map((module) => {
                    const enabled = activeCodes.has(module.code);

                    return (
                      <div
                        key={module.id}
                        className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 transition ${
                          enabled
                            ? "border-emerald-200 bg-emerald-50/50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div>
                          <div className={`font-medium ${enabled ? "text-emerald-800" : "text-slate-700"}`}>
                            {module.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{module.description || "Module hệ thống"}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleModule(module.code)}
                          disabled={isPending}
                          className={`rounded-full p-1.5 transition ${
                            enabled ? "text-emerald-600 hover:bg-emerald-100" : "text-slate-400 hover:bg-slate-100"
                          } disabled:opacity-50`}
                        >
                          {enabled ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              form={`org-form-${organization.id}`}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

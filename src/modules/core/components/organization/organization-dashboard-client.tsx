"use client";

import { useState } from "react";
import { Building2, Palette, Globe, Layers, MapPin, Package, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { OrganizationProfileForm } from "./organization-profile-form";

interface Props {
  initialProfile: any;
  initialBrand: any;
  initialLocale: any;
  initialModules: string[];
}

export function OrganizationDashboardClient({ initialProfile, initialBrand, initialLocale, initialModules }: Props) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-8 h-full bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Hồ sơ doanh nghiệp
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý thông tin cốt lõi của tổ chức.
          </p>
        </div>

        {activeTab === "profile" && (
          <OrganizationProfileForm 
            initialProfile={initialProfile} 
            initialBrand={initialBrand} 
          />
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Nhận diện thương hiệu (Brand)</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: initialBrand?.primaryColor }}></div>
              <span className="text-sm">Màu chủ đạo (Primary): {initialBrand?.primaryColor}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Bản quyền (Licenses)</h3>
          <div className="space-y-4">
            <h3 className="font-medium text-slate-800 mb-2">Các module đang kích hoạt:</h3>
            <div className="flex flex-wrap gap-2">
              {initialModules.map(m => (
                <span key={m} className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                  {m}
                </span>
              ))}
            </div>
            {initialModules.length === 0 && (
              <p className="text-sm text-slate-500 italic">Chưa có module nào được kích hoạt.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

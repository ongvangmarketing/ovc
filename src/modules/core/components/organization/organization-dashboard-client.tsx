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
    <div className="p-8 md:p-12 h-full bg-white font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
              Hồ sơ doanh nghiệp
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Quản lý hồ sơ,</span>{" "}
            <span className="text-gray-400">thiết lập nhận diện cốt lõi.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Trung tâm lưu trữ giúp bạn dễ dàng theo dõi, cập nhật thông tin pháp lý, logo và màu sắc chủ đạo của toàn bộ hệ thống OVC.
          </p>
        </div>

        {activeTab === "profile" && (
          <OrganizationProfileForm 
            initialProfile={initialProfile} 
            initialBrand={initialBrand} 
          />
        )}

      </div>
    </div>
  );
}

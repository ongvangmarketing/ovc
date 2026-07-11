import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { LeadSettingsClient } from "./settings-client";

export const metadata: Metadata = { title: "Cấu hình Trung tâm Lead | Vercel UI" };

export default async function LeadSettingsPage() {
  await requireAuth();

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              Cấu hình Leads
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Cấu hình Lead Center,</span>{" "}
            <span className="text-gray-400">tự động hóa.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Tùy chỉnh quy tắc chấm điểm AI, chống trùng lặp, phân công tự động và thông báo.
          </p>
        </div>

        <LeadSettingsClient />
      </div>
    </div>
  );
}

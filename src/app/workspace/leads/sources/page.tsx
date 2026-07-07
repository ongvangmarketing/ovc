import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { Link2, Plus, Target, BarChart, Settings, Users } from "lucide-react";

export const metadata: Metadata = { title: "Nguồn Lead" };

export default async function LeadSourcesPage() {
  const session = await requireAuth();
  const orgId = session.organizationId;

  // Temporary mock data or real data if sources exist
  const sources = await db.leadSource.findMany({
    where: { organizationId: orgId },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-950 flex items-center gap-2">
          <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
            <Target className="h-5 w-5 text-indigo-700" />
          </div>
          Quản lý Nguồn (Lead Sources)
        </h1>
        <button className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Thêm Nguồn Mới
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
        <Target className="mx-auto h-12 w-12 text-indigo-200 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa cấu hình Nguồn dữ liệu</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
          Trung tâm Lead có thể tự động hứng dữ liệu từ các Form đăng ký, Landing Page hoặc từ Webhook (Facebook Ads, Zalo, Tiktok).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition cursor-pointer text-left">
             <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
             </div>
             <h4 className="font-semibold text-gray-900">Facebook Lead Ads</h4>
             <p className="text-xs text-gray-500 mt-1">Đồng bộ tự động Form đăng ký từ Facebook Ads về Trung tâm Lead.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition cursor-pointer text-left">
             <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
               <Link2 className="w-5 h-5" />
             </div>
             <h4 className="font-semibold text-gray-900">API Webhook</h4>
             <p className="text-xs text-gray-500 mt-1">Hứng data từ mọi nền tảng (Landing Page, Tiktok, Form...) qua Webhook mở.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition cursor-pointer text-left">
             <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
               <Users className="w-5 h-5" />
             </div>
             <h4 className="font-semibold text-gray-900">Nhập từ Excel</h4>
             <p className="text-xs text-gray-500 mt-1">Import dữ liệu hàng loạt từ file Excel. (Đã dùng script import tự động).</p>
          </div>
        </div>
      </div>
      
      {sources.length > 0 && (
         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
           <div className="p-4 border-b border-gray-100">
             <h3 className="font-semibold text-gray-900">Nguồn đang hoạt động</h3>
           </div>
           {/* Render sources table here */}
         </div>
      )}
    </div>
  );
}

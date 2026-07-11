import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { Link2, Plus, Target, Users } from "lucide-react";
import { LeadSourceService } from "@/modules/leads/services/lead-source.service";

export const metadata: Metadata = { title: "Nguồn Lead | Vercel UI" };

export default async function LeadSourcesPage() {
  const session = await requireAuth();
  const orgId = session.organizationId;

  // Temporary mock data or real data if sources exist
  const sources = await LeadSourceService.getLeadSources(orgId);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              Nguồn dữ liệu
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
                <span className="text-black">Quản lý các nguồn,</span>{" "}
                <span className="text-gray-400">tự động thu thập Lead về hệ thống.</span>
              </h1>
              <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
                Trung tâm Lead có thể hứng dữ liệu từ các Form đăng ký, Landing Page hoặc từ Webhook mở (Facebook Ads, Tiktok).
              </p>
            </div>
            <button className="h-[40px] shrink-0 px-5 inline-flex items-center justify-center rounded-md bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Nguồn Mới
            </button>
          </div>
        </div>

        {/* Integration Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 hover:border-gray-300 transition-all cursor-pointer group flex flex-col">
             <div className="w-12 h-12 rounded-xl bg-gray-50 border border-[#eaeaea] text-black flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
             </div>
             <h4 className="text-[18px] font-medium tracking-tight text-black mb-2">Facebook Lead Ads</h4>
             <p className="text-[14px] text-gray-500 leading-relaxed flex-1">
               Đồng bộ tự động Form đăng ký từ Facebook Ads về Trung tâm Lead qua Graph API.
             </p>
             <div className="mt-6 pt-6 border-t border-[#eaeaea]">
               <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Kết nối ngay &rarr;</span>
             </div>
          </div>
          
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 hover:border-gray-300 transition-all cursor-pointer group flex flex-col">
             <div className="w-12 h-12 rounded-xl bg-gray-50 border border-[#eaeaea] text-black flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
               <Link2 className="w-5 h-5" />
             </div>
             <h4 className="text-[18px] font-medium tracking-tight text-black mb-2">API Webhook</h4>
             <p className="text-[14px] text-gray-500 leading-relaxed flex-1">
               Hứng data từ mọi nền tảng (Landing Page, Tiktok, Custom Form...) thông qua chuẩn Webhook POST.
             </p>
             <div className="mt-6 pt-6 border-t border-[#eaeaea]">
               <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Tạo Endpoint &rarr;</span>
             </div>
          </div>
          
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 hover:border-gray-300 transition-all cursor-pointer group flex flex-col">
             <div className="w-12 h-12 rounded-xl bg-gray-50 border border-[#eaeaea] text-black flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
               <Users className="w-5 h-5" />
             </div>
             <h4 className="text-[18px] font-medium tracking-tight text-black mb-2">Nhập từ Excel (CSV)</h4>
             <p className="text-[14px] text-gray-500 leading-relaxed flex-1">
               Import dữ liệu hàng loạt từ file Excel. Hệ thống sẽ tự động map các trường thông tin.
             </p>
             <div className="mt-6 pt-6 border-t border-[#eaeaea]">
               <span className="text-[11px] font-medium uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Bắt đầu Import &rarr;</span>
             </div>
          </div>
        </div>
        
        {/* Active Sources Table */}
        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[#eaeaea] flex items-center justify-between">
            <div>
              <h3 className="text-[20px] font-medium tracking-tight text-black">Nguồn đang hoạt động</h3>
              <p className="text-[14px] text-gray-500 mt-1">Các cổng kết nối dữ liệu đang được kích hoạt.</p>
            </div>
            <Target className="w-8 h-8 text-gray-200" />
          </div>
          
          {sources.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full border border-[#eaeaea] bg-gray-50 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-[15px] font-medium text-black">Chưa có nguồn nào</p>
              <p className="text-[14px] text-gray-500 mt-1">Vui lòng kết nối một nguồn mới phía trên.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#eaeaea]">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 md:px-8 py-4 text-left text-[11px] font-medium text-gray-400 uppercase tracking-widest">Tên Nguồn</th>
                    <th className="px-6 md:px-8 py-4 text-left text-[11px] font-medium text-gray-400 uppercase tracking-widest">Loại</th>
                    <th className="px-6 md:px-8 py-4 text-left text-[11px] font-medium text-gray-400 uppercase tracking-widest">Trạng thái</th>
                    <th className="px-6 md:px-8 py-4 text-right text-[11px] font-medium text-gray-400 uppercase tracking-widest">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#eaeaea]">
                  {sources.map(source => (
                    <tr key={source.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 md:px-8 py-5">
                        <div className="text-[14px] font-medium text-black">{source.name}</div>
                      </td>
                      <td className="px-6 md:px-8 py-5">
                        <span className="text-[13px] text-gray-500">{source.slug}</span>
                      </td>
                      <td className="px-6 md:px-8 py-5">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest">
                          Hoạt động
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-5 text-right">
                        <button className="text-[13px] font-medium text-gray-500 hover:text-black transition-colors">
                          Cấu hình
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

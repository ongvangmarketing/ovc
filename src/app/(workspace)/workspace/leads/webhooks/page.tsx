import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { Link2, Plus, Copy, Trash2, Globe, Database } from "lucide-react";
import { revalidatePath } from "next/cache";
import { LeadWebhookService } from "@/modules/leads/services/lead-webhook.service";

export const metadata: Metadata = { title: "Lead Webhooks | Vercel UI" };

export default async function WebhooksPage() {
  const session = await requireAuth();
  
  const webhooks = await LeadWebhookService.getLeadWebhooks(session.organizationId);

  async function createWebhook(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const provider = formData.get("provider") as string;
    
    if (!name) return;
    
    const session = await requireAuth();
    await LeadWebhookService.createLeadWebhook(session.organizationId, name, provider);
    
    revalidatePath("/workspace/leads/webhooks");
  }

  const getWebhookUrl = (secret: string) => {
    // In production, this should be the actual domain
    return `https://app.ovc.vn/api/leads/webhook/${secret}`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              Kết nối API
            </span>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Webhook Endpoints,</span>{" "}
            <span className="text-gray-400">đồng bộ dữ liệu.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Tạo và quản lý các endpoint Webhook để nhận dữ liệu Lead từ Facebook Ads, TikTok, Zapier... theo thời gian thực.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Webhook Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-[#eaeaea] bg-white p-6">
              <h3 className="text-[14px] font-medium text-black mb-6">Tạo Webhook Mới</h3>
              <form action={createWebhook} className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Tên gợi nhớ</label>
                  <input type="text" name="name" required placeholder="VD: Chiến dịch FB Ads Tết..." 
                         className="block w-full rounded-md border border-[#eaeaea] py-2 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black text-[14px] transition-colors outline-none" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Nền tảng gửi data</label>
                  <select name="provider" className="block w-full rounded-md border border-[#eaeaea] py-2 px-3 text-black focus:border-black focus:ring-1 focus:ring-black text-[14px] transition-colors outline-none bg-white">
                    <option value="FACEBOOK">Facebook Lead Ads</option>
                    <option value="TIKTOK">TikTok Lead Gen</option>
                    <option value="ZAPIER">Zapier / Make</option>
                    <option value="CUSTOM">Hệ thống tuỳ chỉnh (Custom API)</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button type="submit" className="w-full h-[40px] inline-flex items-center justify-center rounded-md bg-black text-[14px] font-medium text-white hover:bg-gray-800 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />
                    Khởi tạo Endpoint
                  </button>
                </div>
              </form>
            </div>
            
            <div className="rounded-xl border border-[#eaeaea] bg-gray-50 p-5">
              <h4 className="text-[13px] font-medium text-black flex items-center mb-2"><Globe className="w-4 h-4 mr-2 text-gray-400" /> Hướng dẫn tích hợp</h4>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Copy URL Webhook tương ứng dán vào mục cài đặt của Facebook Ads hoặc hệ thống đối tác. Dữ liệu POST đến sẽ tự động được map vào kho Lead.
              </p>
            </div>
          </div>

          {/* Webhooks List */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
              <div className="p-6 md:p-8 border-b border-[#eaeaea] flex items-center justify-between">
                <div>
                  <h3 className="text-[20px] font-medium tracking-tight text-black">Endpoints đang hoạt động</h3>
                </div>
                <Database className="w-6 h-6 text-gray-300" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#eaeaea]">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-medium text-gray-400 uppercase tracking-widest">Tên & Nguồn</th>
                      <th className="px-6 py-4 text-left text-[11px] font-medium text-gray-400 uppercase tracking-widest">Webhook URL</th>
                      <th className="px-6 py-4 text-center text-[11px] font-medium text-gray-400 uppercase tracking-widest">Đã hứng</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#eaeaea]">
                    {webhooks.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center flex flex-col items-center justify-center">
                          <Link2 className="h-10 w-10 text-gray-200 mb-4" />
                          <p className="text-[14px] text-black font-medium">Chưa có Webhook nào được tạo</p>
                          <p className="text-[13px] text-gray-500 mt-1">Sử dụng form bên trái để khởi tạo endpoint đầu tiên.</p>
                        </td>
                      </tr>
                    ) : (
                      webhooks.map((webhook) => (
                        <tr key={webhook.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="text-[14px] font-medium text-black">{webhook.name}</div>
                            <div className="text-[12px] font-medium text-gray-400 uppercase tracking-wider mt-1">{webhook.sourceProvider}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <code className="text-[12px] font-mono bg-gray-100 px-2.5 py-1.5 rounded-md border border-[#eaeaea] text-black truncate max-w-[250px] md:max-w-[300px]">
                                {getWebhookUrl(webhook.secretKey)}
                              </code>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-center whitespace-nowrap">
                            <span className="inline-flex items-center justify-center bg-gray-50 border border-[#eaeaea] rounded-full px-3 py-1 text-[13px] font-medium text-black">
                              {webhook._count.leads}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

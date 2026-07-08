import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { Link2, Plus, Copy, Trash2, CheckCircle2, Globe } from "lucide-react";
import { revalidatePath } from "next/cache";

export const metadata: Metadata = { title: "Lead Webhooks" };

export default async function WebhooksPage() {
  const session = await requireAuth();
  const webhooks = await db.leadWebhook.findMany({
    where: { organizationId: session.organizationId },
    include: { _count: { select: { leads: true } } },
    orderBy: { createdAt: 'desc' }
  });

  async function createWebhook(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const provider = formData.get("provider") as string;
    
    if (!name) return;
    
    const session = await requireAuth();
    await db.leadWebhook.create({
      data: {
        organizationId: session.organizationId,
        name,
        sourceProvider: provider || "CUSTOM",
      }
    });
    revalidatePath("/workspace/leads/webhooks");
  }

  const getWebhookUrl = (secret: string) => {
    // In production, this should be the actual domain
    return `https://your-domain.com/api/leads/webhook/${secret}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[15px] font-medium text-gray-950 flex items-center gap-2">
          <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
            <Link2 className="h-5 w-5 text-indigo-700" />
          </div>
          Kết nối Webhooks (API)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Tạo Webhook Mới</h3>
            <form action={createWebhook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên gợi nhớ</label>
                <input type="text" name="name" required placeholder="VD: Chiến dịch FB Ads Tết..." 
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nền tảng gửi data</label>
                <select name="provider" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white">
                  <option value="FACEBOOK">Facebook Lead Ads</option>
                  <option value="TIKTOK">TikTok Lead Gen</option>
                  <option value="ZAPIER">Zapier / Make</option>
                  <option value="CUSTOM">Hệ thống tuỳ chỉnh (Custom API)</option>
                </select>
              </div>
              <button type="submit" className="w-full h-10 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Khởi tạo Endpoint
              </button>
            </form>
          </div>
          
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
            <h4 className="font-medium text-blue-900 flex items-center mb-2"><Globe className="w-5 h-5 mr-2" /> Hướng dẫn Facebook Ads</h4>
            <p className="text-sm text-blue-800 mb-3">Copy URL Webhook tương ứng dán vào mục <strong>CRM Setup</strong> của Facebook Ads Manager. Hệ thống sẽ tự động map các trường thông tin cơ bản.</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên & Nguồn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Webhook URL</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Đã hứng</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {webhooks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      <Link2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>Chưa có Webhook nào được tạo.</p>
                    </td>
                  </tr>
                ) : (
                  webhooks.map((webhook) => (
                    <tr key={webhook.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{webhook.name}</div>
                        <div className="text-xs text-gray-500">{webhook.sourceProvider}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-pink-600 truncate max-w-[250px]">
                            {getWebhookUrl(webhook.secretKey)}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-500 font-medium">
                        {webhook._count.leads}
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
  );
}

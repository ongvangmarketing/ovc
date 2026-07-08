import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import Link from "next/link";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { createLeadAction } from "@/app/actions/lead";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Thêm Lead Mới" };

export default async function NewLeadPage() {
  await requireAuth();

  async function handleSubmit(formData: FormData) {
    "use server";
    const leadId = await createLeadAction(formData);
    redirect(`/workspace/leads/${leadId}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/workspace/leads" className="text-gray-500 hover:text-gray-900 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-[15px] font-medium text-gray-900">Thêm Lead Mới</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <form action={handleSubmit} className="p-4 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input type="text" name="fullName" required placeholder="Nguyễn Văn A" 
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input type="tel" name="phone" placeholder="0987654321" 
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" placeholder="example@email.com" 
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên Công ty (nếu có)</label>
              <input type="text" name="companyName" placeholder="Công ty CP..." 
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú / Nhu cầu</label>
              <TiptapEditor name="note" placeholder="Khách hàng cần tư vấn về..." />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/workspace/leads" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Hủy bỏ
            </Link>
            <button type="submit" className="px-4 py-2 inline-flex items-center text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              Lưu & Tiếp tục
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

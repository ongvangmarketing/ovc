import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { createLeadAction } from "@/modules/leads/actions/lead.actions";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Thêm Lead Mới | Vercel UI" };

export default async function NewLeadPage() {
  await requireAuth();

  async function handleSubmit(formData: FormData) {
    "use server";
    const leadId = await createLeadAction(formData);
    redirect(`/workspace/leads/${leadId}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <div className="max-w-[800px] mx-auto w-full px-4 py-8 space-y-8 md:px-10 md:py-12 md:space-y-12">
        {/* Vercel Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-6">
          <div className="flex items-start gap-3 md:gap-4">
            <Link href="/workspace/leads" className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-black md:mt-2">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Tạo mới</span>
              </div>
              <h1 className="text-[40px] md:text-[56px] font-medium tracking-tighter leading-[1.05] text-black">
                Thêm Lead
              </h1>
            </div>
          </div>
        </div>

        {/* Settings Card Pattern */}
        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
          <form action={handleSubmit}>
            <div className="p-5 space-y-6 md:p-8 md:space-y-8">
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium text-black mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <input type="text" name="fullName" required placeholder="Nguyễn Văn A" 
                         className="block w-full rounded-md border border-[#eaeaea] py-2.5 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-[14px] transition-colors bg-white shadow-sm" />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Số điện thoại</label>
                  <input type="tel" name="phone" placeholder="0987654321" 
                         className="block w-full rounded-md border border-[#eaeaea] py-2.5 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-[14px] transition-colors bg-white shadow-sm" />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Email</label>
                  <input type="email" name="email" placeholder="example@email.com" 
                         className="block w-full rounded-md border border-[#eaeaea] py-2.5 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-[14px] transition-colors bg-white shadow-sm" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium text-black mb-2">Tên Công ty (nếu có)</label>
                  <input type="text" name="companyName" placeholder="Công ty CP..." 
                         className="block w-full rounded-md border border-[#eaeaea] py-2.5 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-[14px] transition-colors bg-white shadow-sm" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium text-black mb-2">Ghi chú / Nhu cầu</label>
                  <div className="border border-[#eaeaea] rounded-md overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-colors shadow-sm">
                    <TiptapEditor name="note" placeholder="Khách hàng cần tư vấn về..." />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer / Actions */}
            <div className="px-5 py-4 bg-gray-50/50 border-t border-[#eaeaea] flex justify-end gap-3 md:px-8 md:py-5">
              <Link href="/workspace/leads" className="h-[38px] px-4 inline-flex items-center justify-center rounded-md border border-[#eaeaea] bg-white text-[14px] font-medium text-black hover:bg-gray-50 transition-colors">
                Hủy bỏ
              </Link>
              <button type="submit" className="h-[38px] px-4 inline-flex items-center justify-center rounded-md bg-black text-[14px] font-medium text-white hover:bg-gray-800 transition-colors">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

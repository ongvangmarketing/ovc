import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { updateLeadAction } from "@/modules/leads/actions/lead.actions";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { redirect, notFound } from "next/navigation";

import { LeadService } from "@/modules/leads/services/lead.service";

export const metadata: Metadata = { title: "Chỉnh sửa Lead | Vercel UI" };

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;

  const lead = await LeadService.getLeadForEdit(session.organizationId, id);

  if (!lead) return notFound();

  async function handleSubmit(formData: FormData) {
    "use server";
    await updateLeadAction(id, formData);
    redirect(`/workspace/leads/${id}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-black font-sans">
      <div className="max-w-[800px] mx-auto w-full px-6 md:px-10 py-12 space-y-12">
        {/* Vercel Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-4">
            <Link href={`/workspace/leads/${id}`} className="mt-2 p-2 rounded-md hover:bg-gray-50 transition text-gray-500 flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Chỉnh sửa</span>
              </div>
              <h1 className="text-[48px] md:text-[56px] font-medium tracking-tighter leading-[1.05] text-black">
                {lead.fullName}
              </h1>
            </div>
          </div>
        </div>

        {/* Settings Card Pattern */}
        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
          <form action={handleSubmit}>
            <div className="p-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-2">
                  <label className="block text-[13px] font-medium text-black mb-2">Họ và tên <span className="text-red-500">*</span></label>
                  <input type="text" name="fullName" required defaultValue={lead.fullName}
                         className="block w-full rounded-md border border-[#eaeaea] py-2.5 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-[14px] transition-colors bg-white shadow-sm" />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Số điện thoại</label>
                  <input type="tel" name="phone" defaultValue={lead.phone || ""}
                         className="block w-full rounded-md border border-[#eaeaea] py-2.5 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-[14px] transition-colors bg-white shadow-sm" />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Email</label>
                  <input type="email" name="email" defaultValue={lead.email || ""}
                         className="block w-full rounded-md border border-[#eaeaea] py-2.5 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-[14px] transition-colors bg-white shadow-sm" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[13px] font-medium text-black mb-2">Tên Công ty (nếu có)</label>
                  <input type="text" name="companyName" defaultValue={lead.companyName || ""}
                         className="block w-full rounded-md border border-[#eaeaea] py-2.5 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black sm:text-[14px] transition-colors bg-white shadow-sm" />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[13px] font-medium text-black mb-2">Ghi chú / Nhu cầu</label>
                  <div className="border border-[#eaeaea] rounded-md overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-colors shadow-sm">
                    <TiptapEditor name="note" defaultValue={lead.note || ""} />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer / Actions */}
            <div className="px-8 py-5 bg-gray-50/50 border-t border-[#eaeaea] flex justify-end gap-3">
              <Link href={`/workspace/leads/${id}`} className="h-[38px] px-4 inline-flex items-center justify-center rounded-md border border-[#eaeaea] bg-white text-[14px] font-medium text-black hover:bg-gray-50 transition-colors">
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

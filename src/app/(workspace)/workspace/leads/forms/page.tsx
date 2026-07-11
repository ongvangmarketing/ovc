import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import Link from "next/link";
import { Plus, LayoutTemplate, Edit, ExternalLink } from "lucide-react";
import { revalidatePath } from "next/cache";
import { LeadFormService } from "@/modules/leads/services/lead-form.service";

export const metadata: Metadata = { title: "Trình tạo Form | Vercel UI" };

export default async function FormsPage() {
  const session = await requireAuth();
  const forms = await LeadFormService.getLeadForms(session.organizationId);

  async function createForm() {
    "use server";
    const session = await requireAuth();
    const newFormId = await LeadFormService.createLeadForm(session.organizationId);
    
    revalidatePath("/workspace/leads/forms");
    return newFormId;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto p-4 sm:p-8 space-y-8">
        
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase w-fit">
              Forms
            </span>
            <form action={async () => {
              "use server";
              const { redirect } = await import("next/navigation");
              const id = await createForm();
              redirect(`/workspace/leads/forms/${id}/builder`);
            }}>
              <button type="submit" className="rounded-full bg-black text-white px-5 py-2 text-[13px] font-medium hover:bg-gray-800 transition-colors flex items-center w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Tạo Form Mới
              </button>
            </form>
          </div>
          <h1 className="text-[32px] md:text-[44px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Lead Forms,</span>{" "}
            <span className="text-gray-400">thu thập thông tin.</span>
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mt-5 max-w-2xl">
            Quản lý và thiết kế các biểu mẫu chuyên nghiệp để thu thập thông tin khách hàng tiềm năng một cách tự động.
          </p>
        </div>

        {/* Vercel Table */}
        <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#eaeaea]">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-gray-400 uppercase tracking-widest">Tên Form</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-gray-400 uppercase tracking-widest">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-gray-400 uppercase tracking-widest">Số Leads</th>
                  <th className="px-6 py-4 text-left text-[11px] font-medium text-gray-400 uppercase tracking-widest">Ngày tạo</th>
                  <th className="px-6 py-4 text-right text-[11px] font-medium text-gray-400 uppercase tracking-widest">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#eaeaea]">
                {forms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <LayoutTemplate className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                      <p className="text-[14px]">Chưa có form nào được tạo.</p>
                    </td>
                  </tr>
                ) : (
                  forms.map((form) => (
                    <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-[14px] font-medium text-black">{form.name}</div>
                        <div className="text-[13px] text-gray-500 truncate max-w-[250px] mt-0.5">{form.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[11px] font-medium uppercase tracking-widest rounded-full border ${
                          form.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                          {form.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                        {form._count.leads} Leads
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                        {new Date(form.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Link href={`/workspace/leads/forms/${form.id}/builder`} className="inline-flex h-8 items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
                             Thiết kế
                           </Link>
                           <a href={`/f/${form.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
                             <ExternalLink className="h-3 w-3 mr-1.5" />
                             Xem
                           </a>
                        </div>
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

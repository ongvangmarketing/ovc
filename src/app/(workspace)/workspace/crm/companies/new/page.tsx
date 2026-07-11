import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import Link from "next/link";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { createCompanyAction } from "@/modules/crm/actions/company.actions";
import { redirect } from "next/navigation";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

export const metadata: Metadata = { title: "Thêm Công ty Mới" };

export default async function NewCompanyPage() {
  await requireAuth();

  async function handleSubmit(formData: FormData) {
    "use server";
    const companyId = await createCompanyAction(formData);
    redirect(`/workspace/crm/companies/${companyId}`);
  }

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/workspace/crm/companies" className="quote-action-button quote-action-secondary !h-9 !w-9 !p-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
          <div>
            <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
              <Building2 className="h-4 w-4 text-orange-500" />
              CRM / Công ty
            </div>
            <h1 className="text-[14px] font-light text-slate-950">Thêm Công ty mới</h1>
          </div>
        </div>
      </div>

      <section className="quote-panel">
        <div className="quote-panel-header">
          <h2>Thông tin công ty</h2>
          <span>Mã số thuế sẽ được dùng để tự nhận diện và gán vào công ty đã có nếu trùng.</span>
        </div>
        <form action={handleSubmit} className="p-4 space-y-6">
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Tên Công ty / Doanh nghiệp <span className="text-red-500">*</span></span>
              <input type="text" name="name" required placeholder="Công ty TNHH Ong Vàng..." className="quote-input" />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Mã số thuế</span>
              <input type="text" name="taxCode" placeholder="VD: 3401252747" className="quote-input" />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Lĩnh vực hoạt động</span>
              <input type="text" name="industry" placeholder="VD: Công nghệ, Giáo dục..." className="quote-input" />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Website</span>
              <input type="url" name="website" placeholder="https://..." className="quote-input" />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Email Công ty</span>
              <input type="email" name="email" placeholder="contact@company.com" className="quote-input" />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Số điện thoại Công ty</span>
              <input type="tel" name="phone" placeholder="024 1234 5678" className="quote-input" />
            </label>
            
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Địa chỉ trụ sở</span>
              <input type="text" name="address" placeholder="Số nhà, đường, phường, quận..." className="quote-input" />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-[15px] font-light text-slate-700">Mô tả / Ghi chú về doanh nghiệp</span>
              <TiptapEditor name="description" placeholder="Thông tin thêm về quy mô, nhu cầu..." />
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link href="/workspace/crm/companies" className="quote-action-button quote-action-secondary">
              Hủy bỏ
            </Link>
            <button type="submit" className="quote-action-button quote-action-primary">
              <Save className="w-4 h-4 mr-2" />
              Lưu & Tiếp tục
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

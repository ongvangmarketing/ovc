import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { updateCompanyAction } from "@/app/actions/company";
import { redirect, notFound } from "next/navigation";

export const metadata: Metadata = { title: "Sửa thông tin Công ty" };

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id, organizationId: session.organizationId }
  });

  if (!company) return notFound();

  async function handleSubmit(formData: FormData) {
    "use server";
    await updateCompanyAction(id, formData);
    redirect(`/workspace/crm/companies/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/workspace/crm/companies/${id}`} className="text-gray-500 hover:text-gray-900 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
            <Building2 className="h-4 w-4 text-blue-700" />
          </div>
          Chỉnh sửa thông tin Doanh nghiệp
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <form action={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên Công ty / Doanh nghiệp <span className="text-red-500">*</span></label>
              <input type="text" name="name" required defaultValue={company.name}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lĩnh vực hoạt động (Industry)</label>
              <input type="text" name="industry" defaultValue={company.industry || ""}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input type="url" name="website" defaultValue={company.website || ""}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Công ty</label>
              <input type="email" name="email" defaultValue={company.email || ""}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại Công ty</label>
              <input type="tel" name="phone" defaultValue={company.phone || ""}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ trụ sở</label>
              <input type="text" name="address" defaultValue={company.address || ""}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Ghi chú về doanh nghiệp</label>
              <textarea name="description" rows={3} defaultValue={company.description || ""}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Link href={`/workspace/crm/companies/${id}`} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Hủy bỏ
            </Link>
            <button type="submit" className="px-4 py-2 inline-flex items-center text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm">
              <Save className="w-4 h-4 mr-2" />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

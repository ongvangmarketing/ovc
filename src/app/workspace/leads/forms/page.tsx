import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, LayoutTemplate, Copy, Edit, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";

export const metadata: Metadata = { title: "Trình tạo Form" };

export default async function FormsPage() {
  const session = await requireAuth();
  const forms = await db.leadForm.findMany({
    where: { organizationId: session.organizationId },
    include: { _count: { select: { leads: true } } },
    orderBy: { createdAt: 'desc' }
  });

  async function createForm() {
    "use server";
    const session = await requireAuth();
    const newForm = await db.leadForm.create({
      data: {
        organizationId: session.organizationId,
        name: "Form Mới " + new Date().getTime(),
        title: "Đăng ký tư vấn",
      }
    });
    // Add default fields
    await db.leadFormField.createMany({
      data: [
        { formId: newForm.id, name: "fullName", label: "Họ và tên", type: "text", required: true, order: 1 },
        { formId: newForm.id, name: "phone", label: "Số điện thoại", type: "tel", required: true, order: 2 },
        { formId: newForm.id, name: "email", label: "Email", type: "email", required: false, order: 3 },
      ]
    });
    revalidatePath("/workspace/leads/forms");
    return newForm.id;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-[15px] font-medium text-gray-950 flex items-center gap-2">
          <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
            <LayoutTemplate className="h-5 w-5 text-indigo-700" />
          </div>
          Quản lý Form thu thập Lead
        </h1>
        <form action={async () => {
          "use server";
          const { redirect } = await import("next/navigation");
          const id = await createForm();
          redirect(`/workspace/leads/forms/${id}/builder`);
        }}>
          <button type="submit" className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Tạo Form Mới
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Form</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Leads thu được</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {forms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <LayoutTemplate className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>Chưa có form nào được tạo.</p>
                </td>
              </tr>
            ) : (
              forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{form.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{form.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      form.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {form.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form._count.leads} Leads
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(form.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                       <Link href={`/workspace/leads/forms/${form.id}/builder`} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded-md">
                         <Edit className="h-4 w-4" />
                       </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

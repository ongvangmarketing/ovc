import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Save, Layout, Settings2, Plus, GripVertical, Trash2, Eye, Code, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { revalidatePath } from "next/cache";

export const metadata: Metadata = { title: "Chỉnh sửa Form" };

export default async function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  const form = await db.leadForm.findUnique({
    where: { id: id, organizationId: session.organizationId },
    include: { fields: { orderBy: { order: 'asc' } } }
  });

  if (!form) notFound();

  async function updateForm(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const submitButtonText = formData.get("submitButtonText") as string;
    const themeColor = formData.get("themeColor") as string;
    const successMessage = formData.get("successMessage") as string;

    await db.leadForm.update({
      where: { id: id },
      data: { name, title, description, submitButtonText, themeColor, successMessage }
    });
    
    revalidatePath(`/workspace/leads/forms/${id}/builder`);
  }

  const embedCode = `<iframe src="https://your-domain.com/f/${form.id}" width="100%" height="500" frameborder="0" style="border-radius: 8px;"></iframe>`;

  return (
    <div className="h-full flex flex-col -m-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/workspace/leads/forms" className="text-gray-500 hover:text-gray-900 bg-gray-100 p-2 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-medium text-gray-900 text-[15px]">{form.name}</h1>
            <p className="text-xs text-gray-500">ID: {form.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm">
            <Code className="h-4 w-4 mr-1.5" />
            Lấy mã nhúng
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Configuration */}
        <div className="bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto" style={{ height: "calc(100vh - 130px)" }}>
          <form action={updateForm} className="space-y-6 max-w-lg mx-auto">
            
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2"><Settings2 className="w-4 h-4"/> Thông tin chung</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên quản lý nội bộ</label>
                <input type="text" name="name" defaultValue={form.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề hiển thị (H1)</label>
                <input type="text" name="title" defaultValue={form.title || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <TiptapEditor name="description" defaultValue={form.description || ""} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2"><Eye className="w-4 h-4"/> Giao diện & Hiển thị</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Màu chủ đạo</label>
                  <input type="color" name="themeColor" defaultValue={form.themeColor || "#4f46e5"} className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Nút bấm</label>
                  <input type="text" name="submitButtonText" defaultValue={form.submitButtonText || "Gửi"} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none text-sm" />
                </div>
              </div>
              <div>
                <TiptapEditor name="successMessage" defaultValue={form.successMessage || "Đã gửi thành công!"} />
              </div>
            </div>

            <button type="submit" className="w-full h-11 inline-flex items-center justify-center rounded-xl bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
              <Save className="h-4 w-4 mr-1.5" />
              Lưu cấu hình
            </button>
            
            <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm border border-orange-100">
               <strong>Lưu ý:</strong> Việc cấu hình kéo thả các trường (Họ tên, SĐT) sẽ được cập nhật ở phiên bản sau. Hiện form mặc định có 3 trường: Họ tên, Số điện thoại, Email.
            </div>
            
            <div className="bg-gray-100 text-gray-800 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-gray-200">
               {embedCode}
            </div>

          </form>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-gray-200 p-4 flex items-center justify-center" style={{ height: "calc(100vh - 130px)" }}>
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
             <div className="h-2 w-full" style={{ backgroundColor: form.themeColor || "#4f46e5" }}></div>
             <div className="p-8">
               <h2 className="text-[15px] font-medium text-gray-900 mb-2">{form.title}</h2>
               {form.description && <p className="text-gray-500 text-sm mb-6">{form.description}</p>}
               
               <div className="space-y-4">
                 {form.fields.map(field => (
                   <div key={field.id}>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       {field.label} {field.required && <span className="text-red-500">*</span>}
                     </label>
                     <input 
                       type={field.type} 
                       placeholder={field.placeholder || ""} 
                       className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 outline-none" 
                       disabled
                     />
                   </div>
                 ))}
                 <button 
                   className="w-full h-11 rounded-lg text-white font-medium mt-4 shadow-sm"
                   style={{ backgroundColor: form.themeColor || "#4f46e5" }}
                 >
                   {form.submitButtonText}
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

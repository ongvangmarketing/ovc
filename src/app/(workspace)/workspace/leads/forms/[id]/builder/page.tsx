import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth/require-auth";
import { notFound } from "next/navigation";
import { Save, Settings2, Eye, Code, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { revalidatePath } from "next/cache";
import { LeadFormService } from "@/modules/leads/services/lead-form.service";

export const metadata: Metadata = { title: "Chỉnh sửa Form | Vercel UI" };

export default async function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  
  const form = await LeadFormService.getLeadFormBuilderData(session.organizationId, id);

  if (!form) notFound();

  async function updateForm(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const submitButtonText = formData.get("submitButtonText") as string;
    const themeColor = formData.get("themeColor") as string;
    const successMessage = formData.get("successMessage") as string;

    await LeadFormService.updateLeadForm(id, { name, title, description, submitButtonText, themeColor, successMessage });
    
    revalidatePath(`/workspace/leads/forms/${id}/builder`);
  }

  const embedCode = `<iframe src="https://app.ovc.vn/f/${form.id}" width="100%" height="500" frameborder="0" style="border-radius: 8px;"></iframe>`;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-6 bg-white text-black font-sans overflow-hidden">
      {/* Vercel Header */}
      <div className="bg-white border-b border-[#eaeaea] px-6 md:px-10 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/workspace/leads/forms" className="p-2 rounded-md border border-[#eaeaea] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-medium text-black text-[15px]">{form.name}</h1>
            <p className="text-[11px] font-mono text-gray-400 mt-0.5">ID: {form.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-[38px] px-4 inline-flex items-center justify-center rounded-md border border-[#eaeaea] bg-white text-[13px] font-medium text-black hover:bg-gray-50 transition-colors">
            <Code className="h-4 w-4 mr-2" />
            Lấy mã nhúng
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left: Configuration */}
        <div className="bg-white border-r border-[#eaeaea] p-6 md:p-10 overflow-y-auto">
          <form action={updateForm} className="space-y-8 max-w-lg mx-auto pb-12">
            
            <div className="space-y-6">
              <h3 className="text-[11px] font-medium uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5"/> Thông tin chung
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Tên quản lý nội bộ</label>
                  <input type="text" name="name" defaultValue={form.name} className="block w-full rounded-md border border-[#eaeaea] py-2 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black text-[14px] transition-colors bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Tiêu đề hiển thị (H1)</label>
                  <input type="text" name="title" defaultValue={form.title || ""} className="block w-full rounded-md border border-[#eaeaea] py-2 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black text-[14px] transition-colors bg-white shadow-sm" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Mô tả form</label>
                  <div className="border border-[#eaeaea] rounded-md overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-colors shadow-sm">
                    <TiptapEditor name="description" defaultValue={form.description || ""} />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-[#eaeaea]" />

            <div className="space-y-6">
              <h3 className="text-[11px] font-medium uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5"/> Giao diện & Hiển thị
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Màu chủ đạo</label>
                  <input type="color" name="themeColor" defaultValue={form.themeColor || "#000000"} className="w-full h-10 p-0.5 border border-[#eaeaea] rounded-md cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-black mb-2">Text nút bấm</label>
                  <input type="text" name="submitButtonText" defaultValue={form.submitButtonText || "Gửi"} className="block w-full rounded-md border border-[#eaeaea] py-2 px-3 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black text-[14px] transition-colors bg-white shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-black mb-2">Lời cảm ơn (Sau khi gửi thành công)</label>
                <div className="border border-[#eaeaea] rounded-md overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-colors shadow-sm">
                  <TiptapEditor name="successMessage" defaultValue={form.successMessage || "Đã gửi thành công!"} />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full h-[40px] inline-flex items-center justify-center rounded-md bg-black text-[14px] font-medium text-white hover:bg-gray-800 transition-colors shadow-sm">
                <Save className="h-4 w-4 mr-2" />
                Lưu cấu hình
              </button>
            </div>
            
            <div className="bg-gray-50 border border-[#eaeaea] p-4 rounded-md text-[13px] text-gray-500">
               <strong className="text-black font-medium">Lưu ý:</strong> Việc cấu hình kéo thả các trường (Họ tên, SĐT) sẽ được cập nhật ở phiên bản sau. Hiện form mặc định có 3 trường: Họ tên, Số điện thoại, Email.
            </div>
            
            <div>
               <label className="block text-[13px] font-medium text-black mb-2">Mã nhúng (Iframe)</label>
               <div className="bg-gray-50 text-gray-800 p-4 rounded-md text-[12px] font-mono overflow-x-auto border border-[#eaeaea]">
                 {embedCode}
               </div>
            </div>

          </form>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-gray-50 p-6 md:p-10 flex items-center justify-center overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl border border-[#eaeaea] shadow-sm overflow-hidden relative">
             <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: form.themeColor || "#000000" }}></div>
             <div className="p-8 mt-2">
               <h2 className="text-[24px] font-medium tracking-tight text-black mb-3">{form.title}</h2>
               {form.description && <div className="text-gray-500 text-[14px] leading-relaxed mb-8 prose prose-sm" dangerouslySetInnerHTML={{__html: form.description}}></div>}
               
               <div className="space-y-5">
                 {form.fields.map(field => (
                   <div key={field.id}>
                     <label className="block text-[13px] font-medium text-black mb-2">
                       {field.label} {field.required && <span className="text-red-500">*</span>}
                     </label>
                     <input 
                       type={field.type} 
                       placeholder={field.placeholder || ""} 
                       className="w-full px-3 py-2.5 border border-[#eaeaea] rounded-md bg-white outline-none cursor-not-allowed opacity-70" 
                       disabled
                     />
                   </div>
                 ))}
                 <button 
                   className="w-full h-[44px] rounded-md text-white font-medium mt-6 shadow-sm transition-opacity hover:opacity-90 flex items-center justify-center text-[14px]"
                   style={{ backgroundColor: form.themeColor || "#000000" }}
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

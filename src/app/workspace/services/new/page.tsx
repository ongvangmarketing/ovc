"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createService } from "@/app/actions/services-crud";
import { TiptapEditor } from "@/components/ui/tiptap-editor";

type ServiceStatusValue = "ACTIVE" | "INACTIVE";

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE" as ServiceStatusValue
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      + "-" + Math.floor(Math.random() * 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = {
      ...formData,
      slug: generateSlug(formData.name)
    };

    const res = await createService(data);
    
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else if (res.success && res.service) {
      const serviceId = "id" in res.service ? res.service.id : null;
      if (typeof serviceId === "string") {
        router.push(`/workspace/services/${serviceId}/edit`);
      }
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/workspace/services" className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thêm Dịch vụ mới</h1>
          <p className="text-slate-500 mt-1 text-sm">Khởi tạo một dịch vụ chính thức để có thể cung cấp các cấu hình tùy chọn (Options) cho khách hàng.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tên Dịch vụ <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="VD: Thiết kế Website, Tư vấn Marketing..."
              className="w-full border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mô tả ngắn</label>
            <TiptapEditor 
              value={formData.description}
              onChange={content => setFormData({...formData, description: content})}
              placeholder="Mô tả tóm tắt về dịch vụ này..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Trạng thái</label>
            <select 
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as ServiceStatusValue})}
              className="w-full border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ACTIVE">Đang bật (Active)</option>
              <option value="INACTIVE">Tạm ẩn (Inactive)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Đang xử lý..." : "Lưu & Tiếp tục tạo Options"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

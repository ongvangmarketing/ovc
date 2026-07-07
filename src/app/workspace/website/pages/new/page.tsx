"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createPageAction } from "@/app/actions/pages";

export default function NewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await createPageAction(formData);
      if (res?.id) {
        router.push(`/builder/${res.id}`);
      }
    } catch (err: any) {
      alert(err.message || "Đã có lỗi xảy ra");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-3xl mx-auto">
      <Link href="/workspace/website/pages" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 w-fit">
        <ArrowLeft className="w-4 h-4" />
        Quay lại
      </Link>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="border-b px-6 py-4 bg-gray-50">
          <h2 className="text-xl font-bold">Tạo trang mới</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-700">Tên trang</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="VD: Trang chủ, Giới thiệu..."
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2 text-gray-700">Đường dẫn (Slug)</label>
            <div className="flex">
              <span className="inline-flex items-center px-4 border border-r-0 rounded-l-md bg-gray-50 text-gray-500 text-sm">
                /sites/your-domain/
              </span>
              <input
                id="slug"
                name="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                placeholder="trang-chu"
                className="flex-1 border rounded-r-md p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Bỏ trống để dùng làm trang chủ (root `/`).</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700">Mẫu giao diện (Template)</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors bg-white relative">
                <input type="radio" name="template" value="blank" defaultChecked className="absolute top-4 right-4" />
                <div className="font-medium text-gray-900 mb-1">Trang Trắng</div>
                <p className="text-sm text-gray-500">Tự do thiết kế từ đầu với Web Builder.</p>
              </label>
              
              <label className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors bg-blue-50/30 relative">
                <input type="radio" name="template" value="agency" className="absolute top-4 right-4" />
                <div className="font-medium text-blue-900 mb-1">Chuẩn Agency</div>
                <p className="text-sm text-gray-600">Template mẫu gồm: Hero, Services Grid, và Lead Form.</p>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Link 
              href="/workspace/website/pages"
              className="px-4 py-2 border bg-white rounded-md hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Lưu & Mở Builder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

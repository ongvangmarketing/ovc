import React from "react";
import { db as prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, LayoutTemplate } from "lucide-react";

export default async function WebsitePagesList() {
  // Fetch existing pages, we'd normally filter by organizationId
  const pages = await prisma.page.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trang & Landing Page</h1>
          <p className="text-muted-foreground mt-1">Quản lý và tạo các trang web với Web Builder</p>
        </div>
        <Link href="/workspace/website/pages/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Tạo trang mới</span>
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border rounded-lg bg-gray-50/50">
          <LayoutTemplate className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Chưa có trang nào</h3>
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Tạo trang đầu tiên của bạn để thiết kế giao diện với Web Builder.
          </p>
          <Link href="/workspace/website/pages/new" className="flex items-center gap-2 bg-white border px-4 py-2 rounded-md shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Tạo trang mới</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
              <div>
                <h3 className="font-medium text-lg">{page.title}</h3>
                <p className="text-sm text-gray-500">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs rounded-full ${page.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {page.status}
                </span>
                <Link 
                  href={`/builder/${page.id}`}
                  className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50"
                  target="_blank"
                >
                  Mở Web Builder
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

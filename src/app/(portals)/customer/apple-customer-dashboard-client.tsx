"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { 
  FolderKanban, ReceiptText, CircleAlert, FileText, ArrowRight, 
  CreditCard, ChevronRight, Activity, CalendarDays
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { formatCurrency, formatDate, progressFromTasks, statusLabel } from "./utils";

export function AppleCustomerDashboardClient({ data }: { data: any }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const { contact, customerName, projects, tasks, quotations, contracts, invoices, totals } = data;
  const focusProject = projects[0];
  const pendingInvoices = invoices.filter((inv: any) => inv.amountDue && Number(inv.amountDue) > 0);
  const recentDocs = [...contracts, ...quotations]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white pb-24">
      
      {/* Vercel Landing Hero Section (Adjusted for Dashboard) */}
      <div className="pt-16 pb-12 px-6 md:px-12 max-w-[1440px] mx-auto border-b border-[#eaeaea]">
        <div className="flex flex-col gap-4 max-w-4xl">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-black text-white px-3 py-1 text-[12px] font-medium tracking-wide uppercase">
              Cổng khách hàng
            </span>
            <span className="text-[14px] text-gray-500 font-medium">
              {new Date().toLocaleDateString("vi-VN", { dateStyle: "long" })}
            </span>
          </div>
          <h1 className="text-[44px] md:text-[60px] font-medium tracking-tighter leading-[1.05] text-black">
            Chào mừng trở lại, <br className="md:hidden" />
            <span className="text-gray-400">{customerName}</span>.
          </h1>
          <p className="text-[18px] text-gray-500 max-w-2xl mt-2 tracking-tight leading-snug">
            Xây dựng, quản lý và mở rộng dự án trên hạ tầng tốc độ cao dành riêng cho bạn.
          </p>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-[1440px] mx-auto pt-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI (Bản lớn) - Chiếm 8 cột */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Hành động khẩn cấp - Vercel Alert Style */}
            {pendingInvoices.length > 0 && (
              <section className="group rounded-2xl border border-[#eaeaea] bg-white hover:border-orange-300 transition-colors duration-500 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                <div className="p-8">
                  <h2 className="text-[28px] font-medium tracking-tight text-black mb-6">
                    Cần xử lý
                  </h2>
                  <div className="grid gap-6">
                    {pendingInvoices.map((inv: any) => (
                      <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#eaeaea] last:border-0 last:pb-0">
                        <div>
                          <h3 className="text-[20px] font-medium text-black tracking-tight">Hóa đơn {inv.number}</h3>
                          <p className="text-[15px] text-gray-500 mt-1">
                            Hạn thanh toán <span className="text-black font-medium">{inv.dueDate ? formatDate(inv.dueDate) : "Chưa có"}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-[24px] font-medium text-black tracking-tight">{formatCurrency(Number(inv.amountDue))}</span>
                          <Link 
                            href={`/customer/invoices/${inv.id}/pay`}
                            className="rounded-full bg-black text-white px-6 py-2.5 text-[14px] font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                          >
                            Thanh toán
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Tóm tắt dự án ưu tiên - Vercel Feature Card */}
            {focusProject ? (
              <Link href={`/customer/projects/${focusProject.id}`} className="block rounded-2xl border border-[#eaeaea] bg-white transition-all duration-300 hover:border-gray-300 hover:shadow-sm overflow-hidden group">
                <div className="p-8 md:p-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[18px] font-medium tracking-tight text-gray-500 group-hover:text-black transition-colors">
                      Dự án đang chạy
                    </h2>
                    <span className="rounded-full border border-[#eaeaea] px-4 py-1.5 text-[12px] font-medium uppercase tracking-widest text-black">
                      {statusLabel(focusProject.status)}
                    </span>
                  </div>
                  
                  <h3 className="text-[36px] md:text-[40px] font-medium text-black tracking-tighter leading-none mb-4 group-hover:opacity-80 transition-opacity">
                    {focusProject.name}
                  </h3>
                  <p className="text-[16px] text-gray-500 leading-relaxed max-w-2xl mb-10">
                    {focusProject.description || "Dự án đang trong quá trình triển khai và phát triển tính năng."}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-[#eaeaea] mt-auto">
                    <div>
                      <p className="text-[13px] font-medium text-gray-400 mb-2 uppercase tracking-wider">Bắt đầu</p>
                      <p className="text-[16px] font-medium text-black">{focusProject.startDate ? formatDate(focusProject.startDate) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-400 mb-2 uppercase tracking-wider">Hạn chót</p>
                      <p className="text-[16px] font-medium text-black">{focusProject.dueDate ? formatDate(focusProject.dueDate) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-400 mb-2 uppercase tracking-wider">Nhiệm vụ</p>
                      <p className="text-[16px] font-medium text-black">{focusProject.tasks.length}</p>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-400 mb-2 uppercase tracking-wider">Tiến độ</p>
                      <p className="text-[16px] font-medium text-black">{progressFromTasks(focusProject.tasks)}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <span className="inline-flex items-center justify-center rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[14px] font-medium text-black group-hover:bg-gray-50 transition-colors">
                      Xem chi tiết
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
               <section className="rounded-2xl border border-[#eaeaea] bg-white p-16 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FolderKanban className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-[20px] font-medium tracking-tight text-black">Chưa có dự án nào</h3>
                  <p className="mt-2 text-[15px] text-gray-500 max-w-sm">Bạn đã sẵn sàng để bắt đầu xây dựng? Liên hệ với chúng tôi để khởi tạo dự án mới.</p>
               </section>
            )}

            {/* Các dự án khác - Dạng List khổng lồ */}
            {projects.length > 1 && (
              <section className="pt-8 border-t border-[#eaeaea]">
                <h2 className="text-[24px] font-medium tracking-tight text-black mb-6">Dự án khác</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {projects.slice(1).map((project: any) => (
                    <Link 
                      key={project.id} 
                      href={`/customer/projects/${project.id}`}
                      className="group flex flex-col p-6 rounded-2xl border border-[#eaeaea] bg-white hover:border-gray-300 transition-colors"
                    >
                      <span className="inline-block self-start mb-4 rounded-full bg-gray-100 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-gray-600">
                        {statusLabel(project.status)}
                      </span>
                      <h3 className="text-[20px] font-medium tracking-tight text-black mb-2 group-hover:opacity-70 transition-opacity line-clamp-1">{project.name}</h3>
                      <div className="mt-auto pt-4 flex items-center justify-between text-[14px] text-gray-500 border-t border-[#eaeaea]">
                        <span>{project.tasks.length} nhiệm vụ</span>
                        <span>{progressFromTasks(project.tasks)}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* CỘT PHẢI (Metrics & Docs) - Chiếm 4 cột */}
          <div className="xl:col-span-4 space-y-8">
            
            <section className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <Activity className="w-40 h-40" />
              </div>
              <h2 className="text-[18px] font-medium tracking-tight text-gray-500 mb-8 relative z-10">Tình trạng hệ thống</h2>
              <div className="grid gap-6 relative z-10">
                <div>
                  <p className="text-[14px] text-gray-500 mb-2 uppercase tracking-wider">Dự án đang chạy</p>
                  <p className="text-[36px] font-medium tracking-tighter text-black leading-none">{projects.length}</p>
                </div>
                
                <div className="w-full h-[1px] bg-[#eaeaea]"></div>
                
                <div>
                  <p className="text-[14px] text-gray-500 mb-2 uppercase tracking-wider">Nhiệm vụ tồn đọng</p>
                  <p className="text-[36px] font-medium tracking-tighter text-black leading-none">{totals.openTasks}</p>
                </div>

                <div className="w-full h-[1px] bg-[#eaeaea]"></div>
                
                <div>
                  <p className="text-[14px] text-gray-500 mb-2 uppercase tracking-wider">Dư nợ hiện tại</p>
                  <p className="text-[28px] font-medium tracking-tighter text-black leading-none">{formatCurrency(Number(totals.totalDue))}</p>
                </div>
              </div>
            </section>

            {recentDocs.length > 0 && (
              <section className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8">
                <h2 className="text-[18px] font-medium tracking-tight text-gray-500 mb-6">Tài liệu gần đây</h2>
                <div className="grid gap-5">
                  {recentDocs.map((doc: any) => (
                    <Link 
                      key={doc.id} 
                      href={doc.token ? `/document/${doc.token}` : "/customer/finance"} 
                      className="group flex flex-col gap-2 pb-5 border-b border-[#eaeaea] last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-[15px] font-medium text-black group-hover:text-gray-500 transition-colors line-clamp-1 leading-snug">
                          {doc.title || doc.number}
                        </h3>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400 shrink-0 mt-0.5">
                          {statusLabel(doc.status)}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-500">
                        {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true, locale: vi })}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

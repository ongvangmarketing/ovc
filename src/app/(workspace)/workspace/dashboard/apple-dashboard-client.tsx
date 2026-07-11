"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { 
  Briefcase, Check, AlertTriangle, Users, TrendingUp,
  CreditCard, ArrowRight, X, Clock,
  ShieldCheck, AlertCircle, GraduationCap
} from "lucide-react";
import type { WorkspaceDashboardData } from "@/actions/dashboard";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

interface OperationsDashboardProps {
  data: WorkspaceDashboardData;
  userName: string;
  showAIPreview?: boolean;
}

export function AppleDashboardClient({ data, userName, showAIPreview = false }: OperationsDashboardProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Xử lý dữ liệu thật
  const formatMoney = (val: number) => 
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(val);

  // 1. Dữ liệu Cần Duyệt (Lấy từ Invoices mới nhất hoặc Projects đang chạy)
  const pendingApprovals = [
    ...(data.latestInvoices || []).slice(0, 3).map(inv => ({
      id: inv.id,
      type: "invoice" as const,
      title: `Duyệt Hóa đơn ${inv.number}`,
      subtitle: `${inv.customer} • ${formatMoney(inv.amount)}`,
      time: inv.issuedAt,
    })),
    ...(data.activeProjects || []).slice(0, 2).map(proj => ({
      id: proj.id,
      type: "project" as const,
      title: `Tiến độ Dự án: ${proj.name}`,
      subtitle: `Ngân sách: ${formatMoney(proj.budget)}`,
      time: proj.updatedAt,
    }))
  ];

  // 2. Dữ liệu Khẩn Cấp (Receivables trễ hạn & Leads chưa liên hệ)
  const overdueInvoices = data.receivables?.filter(r => r.dueDate && new Date(r.dueDate) < new Date()) || [];
  const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const potentialVIPs = (data.potentialCustomers || []).slice(0, 3);

  // 3. Pulse (KPIs)
  const revenue = data.kpis?.monthlyRevenue;
  const customers = data.kpis?.customers;
  const activeProjectsCount = data.projectStatus?.find(p => p.status === "ACTIVE")?.value || 0;

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20 animate-in fade-in duration-300">
      <div className="max-w-[1200px] mx-auto p-4 sm:px-10 sm:py-8 space-y-6">
        
        <div className="mb-12 border-b border-[#eaeaea] pb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
              Tổng quan
            </span>
            <span className="text-[13px] font-medium text-gray-500">
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="mb-3 text-[32px] md:text-[40px] tracking-tight leading-[1.15] font-medium">
            <span className="text-black">Trung tâm</span>{" "}
            <span className="text-gray-400">điều hành.</span>
          </h1>
          <p className="text-[15px] text-gray-500 mt-4 max-w-2xl">
            Xin chào {userName}. Dưới đây là bảng tổng hợp các công việc cần bạn trực tiếp quyết định và phê duyệt trong ngày.
          </p>
        </div>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <PulseCard 
            title="Doanh thu tháng" 
            value={formatMoney(revenue?.value || 0)} 
            change={revenue?.change} 
            icon={TrendingUp} 
          />
          <PulseCard 
            title="Dự án đang chạy" 
            value={activeProjectsCount.toString()} 
            change={0} 
            icon={Briefcase} 
          />
          <PulseCard 
            title="Khách hàng mới" 
            value={customers?.value?.toString() || "0"} 
            change={customers?.change} 
            icon={Users} 
          />
          <PulseCard
            title="Học viên"
            value={data.kpis.students?.value?.toString() || "0"}
            change={0}
            icon={GraduationCap}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CỘT TRÁI: Main Feed (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CẦN DUYỆT (Pending Approvals) */}
            <div className="rounded-[24px] border border-[#eaeaea] bg-white shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                  <h3 className="text-[20px] font-medium tracking-tight text-black">
                    Cần quyết định
                  </h3>
                  <span className="bg-gray-100 text-gray-600 border border-[#eaeaea] text-[12px] font-medium px-2 py-0.5 rounded-full ml-1">
                    {pendingApprovals.length}
                  </span>
                </div>
                
                <div className="border-t border-[#eaeaea] mt-2">
                  {pendingApprovals.length > 0 ? (
                    <div className="divide-y divide-[#eaeaea]">
                      {pendingApprovals.map((item, idx) => (
                        <ApprovalRow key={item.id + idx} {...item} />
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 border border-[#eaeaea] flex items-center justify-center mb-4">
                        <Check className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-[14px] font-medium text-black">Không có việc cần duyệt</p>
                      <p className="text-[13px] text-gray-500 mt-1">Mọi thứ đều đang hoạt động trơn tru.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Khẩn cấp & Pulse (1/3) */}
          <div className="space-y-6">
            
            {/* CẦN CHÚ Ý (Callout Boxes) */}
            {(overdueInvoices.length > 0 || potentialVIPs.length > 0) && (
              <div className="rounded-[24px] border border-[#eaeaea] bg-white shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8">
                  <h3 className="text-[20px] font-medium tracking-tight text-black mb-6 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                    Cần chú ý
                  </h3>
                  
                  <div className="space-y-4">
                    {overdueInvoices.length > 0 && (
                      <div className="rounded-xl bg-white p-5 border border-[#eaeaea] hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <h4 className="text-[15px] font-medium text-black">Dòng tiền trễ hạn</h4>
                        </div>
                        <p className="text-[13px] text-gray-500 mb-4">
                          {overdueInvoices.length} hóa đơn chưa thanh toán với tổng trị giá <strong className="text-black font-medium">{formatMoney(totalOverdueAmount)}</strong>.
                        </p>
                        <Link 
                          href="/workspace/finance/invoices"
                          className="inline-flex w-full items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
                        >
                          Xử lý ngay
                        </Link>
                      </div>
                    )}

                    {potentialVIPs.length > 0 && (
                      <div className="rounded-xl bg-white p-5 border border-[#eaeaea] hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                            <Users className="w-4 h-4" />
                          </div>
                          <h4 className="text-[15px] font-medium text-black">Lead mới VIP</h4>
                        </div>
                        <p className="text-[13px] text-gray-500 mb-4">
                          {potentialVIPs.length} khách hàng VIP vừa đăng ký cần liên hệ gấp.
                        </p>
                        <Link 
                          href="/workspace/leads"
                          className="inline-flex w-full items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 py-2 text-[13px] font-medium text-black hover:bg-gray-50 transition-colors"
                        >
                          Phân công sale
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------
// UI COMPONENTS
// ----------------------------------------

function ApprovalRow({ id, type, title, subtitle, time }: any) {
  const [approved, setApproved] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const icons = {
    invoice: <CreditCard className="w-4 h-4" />,
    project: <Briefcase className="w-4 h-4" />,
  };

  const timeAgo = formatDistanceToNow(new Date(time), { addSuffix: true, locale: vi });
  const viewHref = type === "invoice" ? `/workspace/finance/invoices/${id}` : `/workspace/projects/${id}`;

  const handleApprove = () => {
    setShowConfirm(false);
    setApproved(true);
  };

  if (approved) {
    return (
      <motion.div 
        initial={{ opacity: 0, backgroundColor: "#fff" }}
        animate={{ opacity: 1, backgroundColor: "#fafafa" }}
        className="p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-medium text-black line-through opacity-50">{title}</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Đã phê duyệt thành công.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 group sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#eaeaea] bg-white text-black transition-colors group-hover:border-black">
            {icons[type as keyof typeof icons]}
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 truncate text-[14px] font-medium leading-tight text-black">
                {title}
              </h3>
              <span className="shrink-0 text-[12px] font-normal text-gray-400">
                • {timeAgo}
              </span>
            </div>
            <p className="truncate text-[13px] text-gray-500">{subtitle}</p>
          </div>
        </div>
        
        <div className="ml-11 flex shrink-0 items-center gap-2 sm:ml-0">
          <Link 
            href={viewHref}
            className="inline-flex h-8 items-center justify-center rounded-md border border-[#eaeaea] bg-white px-3 text-[13px] font-medium text-black transition-colors hover:bg-gray-50"
          >
            Chi tiết
          </Link>
          <button 
            onClick={() => setShowConfirm(true)}
            className="inline-flex h-8 items-center justify-center rounded-md bg-black px-3 text-[13px] font-medium text-white transition-colors hover:bg-gray-800"
          >
            Duyệt ngay
          </button>
        </div>
      </div>

      {/* Vercel Style Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 md:p-8 shadow-2xl border border-[#eaeaea]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-full border border-[#eaeaea] bg-gray-50 flex items-center justify-center text-black">
                  {icons[type as keyof typeof icons]}
                </div>
                <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-black transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-[20px] md:text-[24px] font-medium tracking-tight text-black mb-3">
                Xác nhận phê duyệt
              </h3>
              <div className="text-[14px] text-gray-500 mb-8 leading-relaxed space-y-2">
                <p>Bạn đang tiến hành phê duyệt mục sau:</p>
                <div className="bg-gray-50 border border-[#eaeaea] p-3 rounded-md text-black font-medium">
                  {title}
                </div>
                <p>Hành động này sẽ được ghi nhận vào nhật ký hệ thống và không thể hoàn tác trực tiếp.</p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-white border border-[#eaeaea] text-black rounded-md py-2.5 text-[14px] font-medium hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleApprove}
                  className="flex-1 bg-black text-white rounded-md py-2.5 text-[14px] font-medium hover:bg-gray-800 transition-colors"
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function PulseCard({ title, value, change, icon: Icon }: any) {
  const isGood = (change || 0) >= 0;
  
  return (
    <div className="group flex min-w-0 flex-col justify-between rounded-xl border border-[#eaeaea] bg-white p-4 transition-all hover:border-black sm:p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-50 border border-[#eaeaea] text-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        {change !== undefined && change !== 0 && (
          <span className={cn(
            "flex items-center gap-0.5 rounded-full border px-1.5 py-1 text-[10px] font-medium sm:px-2 sm:text-[12px]",
            isGood ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-red-700 bg-red-50 border-red-100"
          )}>
            {isGood ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div>
        <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-500 sm:text-[12px] sm:tracking-widest">{title}</div>
        <div className="truncate text-[18px] font-medium tracking-tighter text-black sm:text-[24px]">{value}</div>
      </div>
    </div>
  );
}

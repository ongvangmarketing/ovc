"use client";

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Activity,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import {  getInvoices, getPayments  } from "@/modules/finance/actions/finance.actions";
import { formatDate } from "@/lib/utils/format";
import Link from "next/link";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function FinanceOverviewClient() {
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => getInvoices(),
  });

  const { isLoading: loadingPayments } = useQuery({
    queryKey: ["payments"],
    queryFn: () => getPayments(),
  });

  const isLoading = loadingInvoices || loadingPayments;
  type FinanceInvoice = Awaited<ReturnType<typeof getInvoices>>[number];
  type RecentTransaction = {
    href: string;
    id: string;
    type: "Thu";
    customer: string;
    amount: number;
    date: string;
    status: "Đã thanh toán" | "Thanh toán 1 phần" | "Chưa thanh toán";
  };

  // Tính toán dữ liệu thực tế
  const totalRevenue = invoices.reduce((sum, inv: FinanceInvoice) => sum + Number(inv.amountPaid || 0), 0);
  const totalDebt = invoices.reduce((sum, inv: FinanceInvoice) => sum + Number(inv.amountDue || 0), 0);
  const totalExpense = 0; // Chưa có module Chi phí
  const netProfit = totalRevenue - totalExpense;

  const metrics = [
    {
      title: "Tổng doanh thu",
      value: totalRevenue,
      trend: "+0%",
      isPositive: true,
      icon: Wallet,
    },
    {
      title: "Chi phí",
      value: totalExpense,
      trend: "0%",
      isPositive: false,
      icon: CreditCard,
    },
    {
      title: "Công nợ (Chưa thu)",
      value: totalDebt,
      trend: "-0%",
      isPositive: true,
      icon: Activity,
    },
    {
      title: "Lợi nhuận ròng",
      value: netProfit,
      trend: "+0%",
      isPositive: true,
      icon: TrendingUp,
    },
  ];

  // Giao dịch gần đây (Lấy từ hóa đơn mới nhất)
  const recentTransactions: RecentTransaction[] = invoices.slice(0, 10).map((inv: FinanceInvoice) => {
    let customerName = "Khách hàng lẻ";
    if (inv.contact) {
      customerName = `${inv.contact.firstName || ""} ${inv.contact.lastName || ""}`.trim() || inv.contact.email || customerName;
      if (inv.contact.company?.name) {
        customerName = inv.contact.company.name;
      }
    }
    
    return {
      href: `/workspace/finance/invoices/${inv.id}`,
      id: inv.number,
      type: "Thu",
      customer: customerName,
      amount: Number(inv.total),
      date: formatDate(inv.createdAt),
      status: inv.status === "PAID" ? "Đã thanh toán" : (inv.status === "PARTIAL" ? "Thanh toán 1 phần" : "Chưa thanh toán")
    };
  });

  const todayDate = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8 sm:py-12">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#eaeaea] pb-8">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="w-fit rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Tổng quan
              </span>
              <span className="text-[13px] font-medium text-gray-500">{todayDate}</span>
            </div>
            <h1 className="mb-3 text-[32px] font-medium leading-[1.15] tracking-tight text-black md:text-[40px]">
              Tổng quan <span className="text-gray-400">tài chính.</span>
            </h1>
            <p className="max-w-xl text-[15px] text-gray-500 mt-4">
              Theo dõi dòng tiền, doanh thu, và các chỉ số sức khỏe tài chính của doanh nghiệp.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="group rounded-xl border border-[#eaeaea] bg-white p-4 shadow-sm transition-colors duration-200 hover:border-black sm:p-6">
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <p className="text-[13px] font-medium leading-snug text-gray-500 sm:text-[11px] sm:font-semibold sm:uppercase sm:tracking-widest">{metric.title}</p>
                      <Icon className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-black sm:h-5 sm:w-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="mb-2 truncate text-[21px] font-medium tracking-tight text-black sm:text-[28px]">
                        {formatCurrency(metric.value)}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={cn(
                          "flex items-center text-[13px] font-medium",
                          metric.isPositive ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {metric.isPositive ? <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-1" />}
                          {metric.trend}
                        </span>
                        <span className="hidden text-[13px] font-medium text-gray-400 sm:inline">so với tháng trước</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Transactions */}
            <div className="rounded-[24px] border border-[#eaeaea] bg-white shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-[#eaeaea]">
                <h2 className="text-[18px] font-medium tracking-tight text-black">Giao dịch gần đây</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
                    <tr>
                      <th className="whitespace-nowrap px-6 py-5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Mã Hóa đơn</th>
                      <th className="whitespace-nowrap px-6 py-5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Phân loại</th>
                      <th className="whitespace-nowrap px-6 py-5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Đối tác / Khách hàng</th>
                      <th className="whitespace-nowrap px-6 py-5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Số tiền</th>
                      <th className="whitespace-nowrap px-6 py-5 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Trạng thái</th>
                      <th className="whitespace-nowrap px-6 py-5 text-right text-[11px] font-semibold uppercase tracking-widest text-gray-500">Ngày lập</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eaeaea]">
                    {recentTransactions.map((tx, index) => (
                      <tr key={index} className="cursor-pointer transition-colors hover:bg-gray-50/80">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-black">
                          <Link href={tx.href} className="block">{tx.id}</Link>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Link href={tx.href} className="block">
                            <span className={cn(
                              "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest",
                              tx.type === "Thu" ? "bg-white text-black border-[#eaeaea]" : "bg-gray-50 border-[#eaeaea] text-gray-500"
                            )}>
                              {tx.type}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-black">
                          <Link href={tx.href} className="block max-w-[320px] truncate" title={tx.customer}>{tx.customer}</Link>
                        </td>
                        <td className="px-6 py-4 font-medium text-black">
                          <Link href={tx.href} className="block">{formatCurrency(tx.amount)}</Link>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <Link href={tx.href} className="block">
                            <span className={cn(
                              "inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium",
                              tx.status === "Đã thanh toán" ? "text-emerald-600" : (tx.status === "Thanh toán 1 phần" ? "text-blue-600" : "text-amber-600")
                            )}>
                              {tx.status}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500">
                          <Link href={tx.href} className="block">{tx.date}</Link>
                        </td>
                      </tr>
                    ))}
                    {recentTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          Chưa có giao dịch nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

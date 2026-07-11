import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2, QrCode, CreditCard } from "lucide-react";
import { getTenantDb } from "@/lib/db";
import { formatCurrency, formatDate } from "@/app/(portals)/customer/utils";

export const metadata: Metadata = {
  title: "Thanh toán | Customer Portal",
};

export default async function InvoicePaymentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = await params;
  const token = resolvedParams.token;

  // Now safely fetch the full invoice with items
  const invoice = await getTenantDb().invoice.findUnique({
    where: { token },
    include: {
      items: true,
      project: true,
    },
  });

  if (!invoice) return notFound();

  // If already paid
  if (invoice.status === "PAID" || Number(invoice.amountDue) <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-6 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#eaeaea] p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h1 className="text-[24px] font-medium tracking-tight text-black">Hóa đơn đã được thanh toán</h1>
          <p className="mt-2 text-[14px] text-gray-500">Cảm ơn bạn đã thanh toán hóa đơn {invoice.number}.</p>
          <Link href={`/document/${token}`} className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800">
            Xem lại hóa đơn
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = Number(invoice.subtotal);
  const tax = Number(invoice.tax);
  const discount = Number(invoice.discount);
  const amountDue = Number(invoice.amountDue);

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <div className="border-b border-[#eaeaea] bg-white px-6 h-16 flex items-center sticky top-0 z-40">
        <div className="w-full max-w-[1200px] mx-auto flex items-center gap-4">
          <Link href={`/document/${token}`} className="flex items-center justify-center h-8 w-8 rounded-full border border-[#eaeaea] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-black rounded-sm flex items-center justify-center">
              <ShieldCheck className="h-3 w-3 text-white" />
            </div>
            <span className="text-[14px] font-medium tracking-tight text-black">Thanh toán an toàn</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* CỘT TRÁI: Phương thức thanh toán */}
          <div className="w-full lg:w-[55%] xl:w-[60%] flex-shrink-0 order-2 lg:order-1">
            <h1 className="text-[32px] md:text-[40px] font-medium tracking-tighter leading-none mb-8">
              Chọn phương thức thanh toán
            </h1>
            
            <div className="grid gap-4 mb-8">
              {/* Option 1: QR Code / Transfer (DEFAULT & PRIORITY) */}
              <label className="relative flex cursor-pointer rounded-2xl border border-black bg-white p-5 shadow-sm transition-colors hover:bg-gray-50">
                <input type="radio" name="payment_method" value="qr" className="peer sr-only" defaultChecked />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-black">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-black">Mã QR / Chuyển khoản (Ưu tiên)</p>
                      <p className="text-[13px] text-gray-500 mt-0.5">Quét bằng ứng dụng ngân hàng</p>
                    </div>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 peer-checked:border-[6px] peer-checked:border-black transition-all"></div>
                </div>
              </label>

              {/* Option 2: Credit Card */}
              <label className="relative flex cursor-pointer rounded-2xl border border-[#eaeaea] bg-white p-5 shadow-sm transition-colors hover:border-black">
                <input type="radio" name="payment_method" value="card" className="peer sr-only" />
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-black">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-black">Thẻ Tín dụng / Ghi nợ</p>
                      <p className="text-[13px] text-gray-500 mt-0.5">Thanh toán qua cổng bảo mật</p>
                    </div>
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 peer-checked:border-[6px] peer-checked:border-black transition-all"></div>
                </div>
              </label>
            </div>

            {/* QR Code Area */}
            <div className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <h3 className="text-[18px] font-medium tracking-tight mb-2">Quét mã để thanh toán</h3>
              <p className="text-[13px] text-gray-500 mb-8">Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã này.</p>
              
              <div className="bg-white p-4 rounded-2xl border border-[#eaeaea] shadow-sm mb-6 inline-block">
                {/* Fallback to VietQR with dummy bank info if paymentChannels is empty */}
                <img 
                  src={`https://img.vietqr.io/image/vcb-0123456789-compact.png?amount=${amountDue}&addInfo=${encodeURIComponent(invoice.number)}&accountName=${encodeURIComponent("CONG TY TNHH ONG VANG")}`} 
                  alt="QR Code Thanh Toán" 
                  className="w-[240px] h-[240px] object-contain"
                />
              </div>

              <div className="w-full bg-gray-50 rounded-xl p-4 text-left border border-[#eaeaea]">
                <div className="grid grid-cols-[100px_1fr] gap-2 text-[14px]">
                  <span className="text-gray-500">Ngân hàng:</span>
                  <span className="font-medium text-black">Vietcombank</span>
                  <span className="text-gray-500">Số TK:</span>
                  <span className="font-medium text-black font-mono">0123 456 789</span>
                  <span className="text-gray-500">Chủ TK:</span>
                  <span className="font-medium text-black uppercase">CONG TY TNHH ONG VANG</span>
                  <span className="text-gray-500">Nội dung:</span>
                  <span className="font-medium text-black bg-yellow-100 px-1 rounded inline-block w-fit">
                    {invoice.number}
                  </span>
                </div>
              </div>

              <div className="mt-8 w-full">
                <button type="button" className="w-full flex items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-[15px] font-medium text-white hover:bg-gray-800 transition-colors">
                  <CheckCircle2 className="h-4 w-4" />
                  Xác nhận đã chuyển khoản
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Tóm tắt hóa đơn */}
          <div className="w-full lg:w-[45%] xl:w-[40%] order-1 lg:order-2">
            <div className="rounded-2xl border border-[#eaeaea] bg-white p-6 md:p-8 sticky top-24">
              <div className="pb-6 border-b border-[#eaeaea]">
                <p className="text-[12px] font-medium uppercase tracking-widest text-gray-400 mb-2">Hóa đơn</p>
                <h2 className="text-[24px] font-medium tracking-tight text-black">{invoice.number}</h2>
                {invoice.project && (
                  <p className="text-[14px] text-gray-500 mt-2">Dự án: {invoice.project.name}</p>
                )}
              </div>

              <div className="py-6 border-b border-[#eaeaea]">
                <h3 className="text-[13px] font-medium text-black mb-4 uppercase tracking-widest">Chi tiết các khoản</h3>
                <div className="space-y-4">
                  {invoice.items.length > 0 ? (
                    invoice.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="text-[14px] text-black">{item.name}</p>
                          {item.description && (
                            <p className="text-[13px] text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                        <p className="text-[14px] text-black whitespace-nowrap">
                          {formatCurrency(Number(item.total))}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[14px] text-gray-500">Hóa đơn không có hạng mục chi tiết.</p>
                  )}
                </div>
              </div>

              <div className="py-6 space-y-3 border-b border-[#eaeaea]">
                <div className="flex justify-between text-[14px] text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[14px] text-emerald-600">
                    <span>Chiết khấu</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-[14px] text-gray-600">
                    <span>Thuế</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[14px] font-medium text-black mb-1">Tổng thanh toán</p>
                    <p className="text-[12px] text-gray-500">Hạn chót: {invoice.dueDate ? formatDate(invoice.dueDate) : "Không xác định"}</p>
                  </div>
                  <p className="text-[32px] md:text-[40px] font-medium tracking-tighter text-black leading-none">
                    {formatCurrency(amountDue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

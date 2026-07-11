"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";

export function PaymentClient({ invoiceNumber, amountDue }: { invoiceNumber: string, amountDue: string | number }) {
  const [isOpen, setIsOpen] = useState(false);

  if (Number(amountDue) <= 0) {
    return (
      <div className="mt-4 p-3 bg-emerald-100 text-emerald-800 rounded-lg font-medium">
        Hóa đơn này đã được thanh toán đầy đủ.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button 
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-black px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800"
      >
        Thanh toán ngay
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#eaeaea] max-w-md w-full overflow-hidden relative">
            <div className="border-b border-[#eaeaea] p-4 text-black flex justify-between items-center">
              <h3 className="font-medium text-[15px]">Thông tin thanh toán</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-black">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Số tiền cần thanh toán</p>
                <p className="text-3xl font-medium text-black">{formatCurrency(Number(amountDue))}</p>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-lg border border-[#eaeaea] space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Ngân hàng</p>
                  <p className="font-semibold text-gray-900">Vietcombank - CN Sở Giao Dịch</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Số tài khoản</p>
                  <p className="font-semibold text-gray-900 text-lg">0123456789</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tên người thụ hưởng</p>
                  <p className="font-semibold text-gray-900">CÔNG TY TNHH ONG VÀNG</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Nội dung chuyển khoản (Bắt buộc)</p>
                  <p className="font-medium text-black bg-white p-2 rounded border border-[#eaeaea] text-center mt-1">
                    THANHTOAN {invoiceNumber}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 italic">Vui lòng ghi đúng nội dung chuyển khoản để hệ thống ghi nhận tự động. Giao dịch sẽ được cập nhật trong ít phút.</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50/50 border-t border-[#eaeaea] flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-[#eaeaea] bg-white px-5 py-2 text-[14px] font-medium text-black transition-colors hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

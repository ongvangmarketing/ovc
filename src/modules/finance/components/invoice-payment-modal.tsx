"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";

export function InvoicePaymentModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  amountDue,
  isPending
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (data: { amount: number, method: string, reference: string, paidAt: string, sendCustomerEmail: boolean }) => void;
  amountDue: number;
  isPending: boolean;
}) {
  const [amount, setAmount] = useState(amountDue);
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [sendCustomerEmail, setSendCustomerEmail] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-[#eaeaea] max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-[#eaeaea]">
          <h3 className="text-[15px] font-medium text-gray-900">Ghi nhận thanh toán</h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán (VNĐ)</label>
            <input 
              type="number" 
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              max={amountDue}
              className="w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 focus:border-black focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Còn nợ: {formatCurrency(amountDue)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức</label>
            <select 
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 focus:border-black focus:outline-none"
            >
              <option value="BANK_TRANSFER">Chuyển khoản</option>
              <option value="CASH">Tiền mặt</option>
              <option value="CARD">Thẻ tín dụng</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thanh toán</label>
            <input 
              type="date" 
              value={paidAt}
              onChange={e => setPaidAt(e.target.value)}
              className="w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 focus:border-black focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã tham chiếu / Ghi chú</label>
            <input 
              type="text" 
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="VD: FT2108154..."
              className="w-full rounded-lg border border-[#eaeaea] bg-white px-3 py-2 focus:border-black focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-[#eaeaea] bg-gray-50/50 p-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={sendCustomerEmail}
              onChange={e => setSendCustomerEmail(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <span>
              <span className="block font-medium text-gray-900">Gửi email xác nhận cho khách hàng</span>
              <span className="text-xs text-gray-500">Chỉ bật khi khách hàng cần nhận email phiếu thu.</span>
            </span>
          </label>
        </div>

        <div className="p-4 bg-gray-50/50 border-t border-[#eaeaea] flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="rounded-full border border-[#eaeaea] bg-white px-5 py-2 text-sm font-medium text-black hover:bg-gray-50"
            disabled={isPending}
          >
            Hủy
          </button>
          <button 
            type="button" 
            onClick={() => onConfirm({ amount, method, reference, paidAt: new Date(paidAt).toISOString(), sendCustomerEmail })}
            className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            disabled={isPending || amount <= 0}
          >
            {isPending ? "Đang xử lý..." : sendCustomerEmail ? "Ghi nhận & gửi email" : "Ghi nhận, không gửi email"}
          </button>
        </div>
      </div>
    </div>
  );
}

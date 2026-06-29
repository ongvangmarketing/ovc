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
  onConfirm: (data: { amount: number, method: string, reference: string, paidAt: string }) => void;
  amountDue: number;
  isPending: boolean;
}) {
  const [amount, setAmount] = useState(amountDue);
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="text-lg font-bold text-gray-900">Ghi nhận thanh toán</h3>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán (VNĐ)</label>
            <input 
              type="number" 
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              max={amountDue}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Còn nợ: {formatCurrency(amountDue)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức</label>
            <select 
              value={method}
              onChange={e => setMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã tham chiếu / Ghi chú</label>
            <input 
              type="text" 
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="VD: FT2108154..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isPending}
          >
            Hủy
          </button>
          <button 
            type="button" 
            onClick={() => onConfirm({ amount, method, reference, paidAt: new Date(paidAt).toISOString() })}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isPending || amount <= 0}
          >
            {isPending ? "Đang xử lý..." : "Ghi nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

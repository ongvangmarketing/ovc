"use client";

import { useState } from "react";
import { CheckCircle, X } from "lucide-react";

export function AdminSignModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  isPending 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (signature: string) => void;
  title: string;
  isPending: boolean;
}) {
  const [signature, setSignature] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Vui lòng nhập họ tên hoặc chữ ký điện tử để xác nhận phê duyệt tài liệu này. Hành động này không thể hoàn tác.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chữ ký (Họ tên)</label>
            <input 
              type="text" 
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="VD: Nguyễn Văn Admin"
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy bỏ
          </button>
          <button 
            type="button" 
            disabled={!signature.trim() || isPending}
            onClick={() => onConfirm(signature)}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isPending ? "Đang xử lý..." : "Xác nhận duyệt"}
          </button>
        </div>
      </div>
    </div>
  );
}

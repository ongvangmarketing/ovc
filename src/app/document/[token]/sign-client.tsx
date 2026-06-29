"use client";

import { useState } from "react";
import { signDocument } from "@/app/actions/finance";

function formatDateTime(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SignDocumentClient({
  token,
  docType,
  isSigned = false,
  signedAt,
}: {
  token: string;
  docType: "quotation" | "contract" | "invoice";
  isSigned?: boolean;
  signedAt?: string | Date | null;
}) {
  const [signatureData, setSignatureData] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  async function handleSign() {
    if (!signatureData.trim()) return alert("Vui lòng nhập họ tên hoặc chữ ký");
    
    setIsSigning(true);
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const { ip } = await res.json();
      const userAgent = window.navigator.userAgent;
      
      await signDocument(token, docType, signatureData, ip, userAgent);
      setSigned(true);
    } catch (err) {
      alert("Có lỗi xảy ra khi ký tài liệu");
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  }

  if (signed) {
    return (
      <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-emerald-800">Ký Duyệt Thành Công</h3>
        <p className="mt-2 text-emerald-600 font-medium">
          Cảm ơn bạn đã xác nhận tài liệu. Vui lòng tải lại trang để xem chi tiết.
        </p>
        <button onClick={() => window.location.reload()} className="mt-4 text-emerald-700 underline text-sm">Tải lại trang</button>
      </div>
    );
  }

  if (isSigned) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Tài liệu đã được ký</h3>
        <p className="mt-2 text-sm text-gray-500">
          Chữ ký khách hàng được ghi nhận {formatDateTime(signedAt) || "trước đó"}.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận & Ký duyệt</h3>
      <p className="text-sm text-gray-500 mb-6">
        Bằng việc ký tên vào ô bên dưới, bạn xác nhận đồng ý với tất cả nội dung trong tài liệu này.
      </p>
      
      <div className="mb-6 text-left">
        <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên / Chữ ký (Nhập tay)</label>
        <input 
          type="text" 
          value={signatureData}
          onChange={(e) => setSignatureData(e.target.value)}
          placeholder="Ví dụ: Nguyễn Văn A"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
        />
      </div>

      <button
        onClick={handleSign}
        disabled={isSigning || !signatureData.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSigning ? "Đang xử lý..." : "ĐỒNG Ý VÀ KÝ"}
      </button>
      
      <p className="mt-4 text-xs text-gray-400">
        Hệ thống sẽ lưu lại địa chỉ IP ({' '}đang lấy...{' '}) và thông tin thiết bị để phục vụ đối soát.
      </p>
    </div>
  );
}

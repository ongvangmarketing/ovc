"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [wb, setWb] = useState<any>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any).workbox !== undefined
    ) {
      const workbox = (window as any).workbox;
      setWb(workbox);

      const handleUpdate = () => {
        setShowPrompt(true);
      };

      workbox.addEventListener("waiting", handleUpdate);
      workbox.addEventListener("externalwaiting", handleUpdate);

      return () => {
        workbox.removeEventListener("waiting", handleUpdate);
        workbox.removeEventListener("externalwaiting", handleUpdate);
      };
    }
  }, []);

  const handleUpdate = () => {
    if (wb) {
      wb.addEventListener("controlling", () => {
        window.location.reload();
      });
      wb.messageSkipWaiting();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[999] bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in slide-in-from-bottom-5">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin-slow" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">Có phiên bản mới</h3>
          <p className="text-sm text-gray-500 mt-1 mb-3">
            Hệ thống vừa cập nhật một phiên bản mới. Vui lòng làm mới trang để áp dụng thay đổi.
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleUpdate} 
              className="w-full h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm"
            >
              Cập nhật ngay
            </button>
            <button 
              onClick={handleDismiss} 
              className="w-full h-9 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-md border border-gray-200 transition-colors text-sm"
            >
              Để sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

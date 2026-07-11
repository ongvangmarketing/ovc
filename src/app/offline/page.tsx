"use client";

import { WifiOff, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang ngoại tuyến</h1>
        <p className="text-gray-500 mb-8">
          Vui lòng kiểm tra lại kết nối mạng của bạn. Ứng dụng sẽ tự động tải lại khi có kết nối mạng.
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="w-full h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
          disabled={!isOnline}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          {isOnline ? "Tải lại trang" : "Đang kết nối lại..."}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect if the app is already installed
    const checkStandalone = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      );
    };
    setIsStandalone(checkStandalone());

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // If it's iOS and not standalone, we might want to show a custom prompt
    if (isIosDevice && !checkStandalone()) {
      const hasDismissed = localStorage.getItem("ovc_pwa_ios_dismissed");
      if (!hasDismissed) {
        // Delay showing prompt slightly
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }

    // Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const hasDismissed = localStorage.getItem("ovc_pwa_android_dismissed");
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem("ovc_pwa_ios_dismissed", "true");
    } else {
      localStorage.setItem("ovc_pwa_android_dismissed", "true");
    }
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 z-[999] bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-in slide-in-from-bottom-5">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">Cài đặt Ứng dụng</h3>
          {isIOS ? (
            <p className="text-sm text-gray-500 mt-1">
              Nhấn <Share className="w-4 h-4 inline mx-1" /> dưới thanh công cụ của Safari và chọn <strong>Thêm vào Màn hình chính</strong> để trải nghiệm tốt nhất.
            </p>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-3">
                Cài đặt ứng dụng Ong Vàng Cloud để truy cập nhanh chóng.
              </p>
              <button 
                onClick={handleInstallClick} 
                className="w-full h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors text-sm"
              >
                Cài đặt ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

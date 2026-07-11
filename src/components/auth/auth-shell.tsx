import type { ReactNode } from "react";
import { Layers3 } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#111] px-4 py-12 overflow-hidden">
      {/* Background texture from hero */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://ovc.vn/wp-content/uploads/2025/07/bg-slide.webp"
          alt="Hero background"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111]/70 via-[#111]/50 to-[#111]" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

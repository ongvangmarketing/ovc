import type { ReactNode } from "react";
import { Layers3 } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12 overflow-hidden">
      {/* Blurred Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:44px_44px] md:bg-[size:64px_64px]">
      </div>
      
      {/* White radial overlay to fade out grid in the center */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,white_20%,transparent_70%)] pointer-events-none">
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );
}

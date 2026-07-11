import type { ReactNode } from "react";
import { Layers3 } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-4 py-12">
      {children}
    </div>
  );
}

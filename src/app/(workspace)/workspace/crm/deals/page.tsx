import type { Metadata } from "next";
import { DealsClient } from "@/modules/crm/components/deals-client";

export const metadata: Metadata = {
  title: "Cơ hội",
};

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans pb-20 animate-in fade-in duration-300">
      <DealsClient />
    </div>
  );
}

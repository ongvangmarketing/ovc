import type { Metadata } from "next";

export const metadata: Metadata = { title: "Marketing" };

export default function MarketingPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marketing</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Chiến dịch email, ZNS và social media</p>
        </div>
      </div>
      <div className="empty-state">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mb-2">📢</div>
        <h3 className="font-semibold text-foreground">Module Marketing</h3>
        <p className="text-sm text-muted-foreground">Đang phát triển trong Phase 2</p>
      </div>
    </div>
  );
}

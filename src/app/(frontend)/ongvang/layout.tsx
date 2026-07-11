import type { Metadata } from "next";
import { Navigation } from "./_components/Navigation";
import { Footer } from "./_components/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Ong Vàng Marketing & Training",
    default: "Ong Vàng Marketing & Training — Giải pháp Digital Marketing Toàn diện",
  },
  description:
    "Giải pháp Digital Marketing tổng thể và Đào tạo thực chiến — Quảng cáo Facebook, Google Ads, SEO, Content và Đào tạo doanh nghiệp chuyên nghiệp tại Việt Nam.",
  keywords: ["marketing", "digital marketing", "facebook ads", "google ads", "seo", "đào tạo marketing"],
  openGraph: { type: "website", locale: "vi_VN", siteName: "Ong Vàng Marketing & Training" },
};

export default function OngVangLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Load Bebas Neue from Google Fonts */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .font-bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
      `}</style>

      <div
        className="min-h-screen text-stone-900"
        style={{ fontFamily: "'Inter', -apple-system, sans-serif", backgroundColor: "#FFFBF2" }}
      >
        <Navigation />
        <main id="main-content">{children}</main>
        <Footer />
      </div>
    </>
  );
}

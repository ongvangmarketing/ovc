import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OvNavigation } from "./_components/OvNavigation";
import { OvFooter } from "./_components/OvFooter";
import { getCourses, getOrganization, getServices } from "./actions";

export const metadata: Metadata = {
  metadataBase: new URL("https://ongvang.com.vn"),
  title: {
    template: "%s | Ong Vàng - Truyền thông, Đào tạo & Ứng dụng AI",
    absolute: "Ong Vàng - Truyền thông, Đào tạo & Ứng dụng AI",
  },
  description:
    "Ong Vàng cung cấp giải pháp truyền thông, đào tạo thực chiến và ứng dụng AI giúp doanh nghiệp tối ưu vận hành, phát triển thương hiệu và tăng trưởng bền vững.",
  keywords: [
    "Ong Vàng",
    "truyền thông",
    "ứng dụng AI",
    "đào tạo AI",
    "digital marketing",
    "dịch vụ marketing",
    "đào tạo marketing",
    "SEO",
    "Facebook Ads",
    "Google Ads",
    "content marketing",
    "marketing tổng thể",
  ],
  authors: [{ name: "Ong Vàng" }],
  creator: "Ong Vàng",
  publisher: "Ong Vàng",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/uploads/company/favicon-b8ad0d90-14c3-4712-806f-ddacdd9dc8c8.ico", sizes: "32x32" },
      { url: "/uploads/company/favicon-2d2cdcb8-982c-4082-86fc-8d34d0c76e3e.png", type: "image/png" },
    ],
    shortcut: "/uploads/company/favicon-b8ad0d90-14c3-4712-806f-ddacdd9dc8c8.ico",
    apple: "/uploads/company/favicon-2d2cdcb8-982c-4082-86fc-8d34d0c76e3e.png",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Ong Vàng",
    title: "Ong Vàng - Truyền thông, Đào tạo & Ứng dụng AI",
    description:
      "Giải pháp truyền thông, đào tạo thực chiến và ứng dụng AI cho doanh nghiệp Việt Nam.",
    images: [
      {
        url: "/brand/ong-vang-logo.png",
        width: 1200,
        height: 362,
        alt: "Ong Vàng",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ong Vàng - Truyền thông, Đào tạo & Ứng dụng AI",
    description:
      "Giải pháp truyền thông, đào tạo thực chiến và ứng dụng AI cho doanh nghiệp Việt Nam.",
    images: ["/brand/ong-vang-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

/**
 * SF Pro system font stack:
 * - Apple devices (Mac/iPhone/iPad) → SF Pro Display / SF Pro Text
 * - Windows → Segoe UI
 * - Android → Roboto
 * SF Pro không thể tự host (proprietary) — system-ui stack là cách chuẩn nhất.
 */
/**
 * Be Vietnam Pro — Google Fonts, tối ưu cho tiếng Việt
 * Bebas Neue — chỉ dùng cho chữ ghosted BG trang trí
 */
const BE_VIETNAM_PRO = "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif";

export default async function OvMainLayout({ children }: { children: ReactNode }) {
  const org = await getOrganization();
  const [services, courses] = org
    ? await Promise.all([getServices(org.id), getCourses(org.id)])
    : [[], []];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Bebas+Neue&display=swap');
        .ovmain-site h1 { font-size: 40px !important; }
        .ovmain-site { font-size: 16px; font-weight: 300; }
        .ovmain-site p { font-size: 16px !important; font-weight: 300 !important; }
        .ovmain-site h2 { font-size: 36px !important; }
        .ovmain-site h3 { font-size: 32px !important; }
        .ovmain-site h4 { font-size: 28px !important; }
        .ovmain-site h5 { font-size: 24px !important; }
        .ovmain-site h6 { font-size: 18px !important; }
        .ovmain-site .ovmain-hero-title { font-size: 78px !important; }
        .ovmain-site .ovmain-feature-title { font-size: 40px !important; }
        .ovmain-site .ovmain-solutions-title { font-size: 44px !important; }
        .ovmain-values-section {
          background: linear-gradient(135deg, #f1f5f9 0%, #ffffff 34%, #fff7ed 68%, #ffffff 100%);
        }
        .ovmain-card-orbit {
          animation: ovmain-card-orbit 5s ease-in-out infinite;
          transform-origin: center;
          transition: color 250ms ease, opacity 250ms ease;
        }
        .group:hover .ovmain-card-orbit {
          color: rgba(249, 115, 22, 0.32);
        }
        .ovmain-floating-badge {
          animation: ovmain-floating-badge 5.5s ease-in-out infinite;
        }
        .ovmain-floating-badge-delay-1 {
          animation-delay: 0.8s;
        }
        .ovmain-floating-badge-delay-2 {
          animation-delay: 1.4s;
        }
        .ovmain-floating-badge-delay-3 {
          animation-delay: 2.1s;
        }
        @keyframes ovmain-card-orbit {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-4deg); }
          50% { transform: translate3d(-5px, 7px, 0) rotate(7deg); }
        }
        @keyframes ovmain-floating-badge {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-1deg); }
          50% { transform: translate3d(0, -10px, 0) rotate(1deg); }
        }
        .ovmain-site h1,
        .ovmain-site h2,
        .ovmain-site h3,
        .ovmain-site h4,
        .ovmain-site h5,
        .ovmain-site h6 { line-height: 1.2 !important; }
        .ovmain-solutions-ghost {
          color: transparent;
          background: linear-gradient(180deg, #ffffff 0%, #ffedd5 48%, #f59e0b 100%);
          background-size: 100% 180%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 0.38;
          animation: ovmain-solutions-flow 6s ease-in-out infinite;
          filter: drop-shadow(0 14px 26px rgba(245, 158, 11, 0.12));
        }
        .ovmain-solutions-ghost.ovmain-training-ghost {
          background: linear-gradient(180deg, #ffffff 0%, #dbeafe 50%, #93c5fd 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 14px 26px rgba(59, 130, 246, 0.1));
        }
        .ovmain-solutions-ghost.ovmain-services-ghost {
          opacity: 0.16;
          filter: drop-shadow(0 18px 34px rgba(245, 158, 11, 0.08));
        }
        .ovmain-solutions-ghost.ovmain-contact-ghost {
          background: linear-gradient(180deg, #ffffff 0%, #fde68a 48%, #f97316 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 0.22;
          filter: drop-shadow(0 16px 30px rgba(249, 115, 22, 0.16));
        }
        .ovmain-site .ovmain-stat-value {
          font-size: 72px !important;
          font-weight: 900 !important;
          line-height: 1 !important;
        }
        .ovmain-site .ovmain-stat-label {
          font-size: 18px !important;
          line-height: 1.3 !important;
        }
        @keyframes ovmain-solutions-flow {
          0%, 100% {
            background-position: 50% 0%;
            transform: translateY(0);
            opacity: 0.3;
          }
          50% {
            background-position: 50% 100%;
            transform: translateY(10px);
            opacity: 0.5;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ovmain-solutions-ghost { animation: none; }
          .ovmain-card-orbit { animation: none; }
          .ovmain-floating-badge { animation: none; }
        }
        @media (max-width: 767px) {
          .ovmain-site .ovmain-hero-title { font-size: 46px !important; }
          .ovmain-site .ovmain-feature-title {
            font-size: 28px !important;
            line-height: 1.18 !important;
            overflow-wrap: anywhere;
            word-break: normal;
          }
          .ovmain-site .ovmain-solutions-title { font-size: 38px !important; }
          .ovmain-site .ovmain-stat-value { font-size: 44px !important; }
          .ovmain-site .ovmain-stat-label { font-size: 14px !important; }
          .ovmain-site p {
            font-size: 15px !important;
            line-height: 1.75 !important;
          }
          .ovmain-site .ovmain-topic-track {
            width: auto;
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px 18px;
            padding: 0 24px;
            white-space: normal;
          }
          .ovmain-site .ovmain-topic-track span {
            display: inline-flex;
            align-items: center;
          }
        }
      `}</style>
      <div
        className="ovmain-site min-h-screen bg-[#EEF2FF] text-slate-900"
        style={{ fontFamily: BE_VIETNAM_PRO }}

      >
        {/* Truyền logo & tên công ty từ DB xuống Navigation */}
        <OvNavigation logoUrl={org?.logo} orgName={org?.name} />
        <main id="main-content">{children}</main>
        <OvFooter
          logoUrl={org?.logo}
          orgName={org?.name}
          description={org?.description}
          phone={org?.phone}
          email={org?.email}
          address={org?.address}
          website={org?.website}
          services={services.map((service) => ({ id: service.id, name: service.name }))}
          courses={courses.map((course) => ({ id: course.id, title: course.title }))}
        />
      </div>
    </>
  );
}

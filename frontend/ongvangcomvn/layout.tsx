import type { Metadata } from "next";
import type { ReactNode } from "react";
import { OngvangcomvnNavigation } from "./_components/OngvangcomvnNavigation";
import { OngvangcomvnFooter } from "./_components/OngvangcomvnFooter";
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

export default async function OngvangcomvnMainLayout({ children }: { children: ReactNode }) {
  const org = await getOrganization();
  const [services, courses] = org
    ? await Promise.all([getServices(org.id), getCourses(org.id)])
    : [[], []];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Bebas+Neue&display=swap');
        .ongvangcomvn-site h1 { font-size: 40px !important; }
        .ongvangcomvn-site { font-size: 16px; font-weight: 300; }
        .ongvangcomvn-site p { font-size: 16px !important; font-weight: 300 !important; }
        .ongvangcomvn-site h2 { font-size: 36px !important; }
        .ongvangcomvn-site h3 { font-size: 32px !important; }
        .ongvangcomvn-site h4 { font-size: 28px !important; }
        .ongvangcomvn-site h5 { font-size: 24px !important; }
        .ongvangcomvn-site h6 { font-size: 18px !important; }
        .ongvangcomvn-site .ongvangcomvn-hero-title { font-size: 78px !important; }
        .ongvangcomvn-site .ongvangcomvn-page-title { font-size: 64px !important; line-height: 1.08 !important; font-weight: 700 !important; }
        .ongvangcomvn-site .ongvangcomvn-section-title { font-size: 48px !important; line-height: 1.08 !important; font-weight: 700 !important; }
        .ongvangcomvn-site .ongvangcomvn-card-title { font-size: 36px !important; line-height: 1.12 !important; font-weight: 700 !important; }
        .ongvangcomvn-site .ongvangcomvn-feature-title { font-size: 40px !important; font-weight: 700 !important; }
        .ongvangcomvn-site .ongvangcomvn-solutions-title { font-size: 44px !important; font-weight: 700 !important; }
        .ongvangcomvn-values-section {
          background: linear-gradient(135deg, #f1f5f9 0%, #ffffff 34%, #fff7ed 68%, #ffffff 100%);
        }
        .ongvangcomvn-card-orbit {
          animation: ongvangcomvn-card-orbit 5s ease-in-out infinite;
          transform-origin: center;
          transition: color 250ms ease, opacity 250ms ease;
        }
        .group:hover .ongvangcomvn-card-orbit {
          color: rgba(249, 115, 22, 0.32);
        }
        .ongvangcomvn-floating-badge {
          animation: ongvangcomvn-floating-badge 5.5s ease-in-out infinite;
        }
        .ongvangcomvn-floating-badge-delay-1 {
          animation-delay: 0.8s;
        }
        .ongvangcomvn-floating-badge-delay-2 {
          animation-delay: 1.4s;
        }
        .ongvangcomvn-floating-badge-delay-3 {
          animation-delay: 2.1s;
        }
        @keyframes ongvangcomvn-card-orbit {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-4deg); }
          50% { transform: translate3d(-5px, 7px, 0) rotate(7deg); }
        }
        @keyframes ongvangcomvn-floating-badge {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-1deg); }
          50% { transform: translate3d(0, -10px, 0) rotate(1deg); }
        }
        .ongvangcomvn-site h1,
        .ongvangcomvn-site h2,
        .ongvangcomvn-site h3,
        .ongvangcomvn-site h4,
        .ongvangcomvn-site h5,
        .ongvangcomvn-site h6 { line-height: 1.2 !important; }
        .ongvangcomvn-solutions-ghost {
          color: transparent;
          background: linear-gradient(180deg, #ffffff 0%, #ffedd5 48%, #f59e0b 100%);
          background-size: 100% 180%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 0.38;
          animation: ongvangcomvn-solutions-flow 6s ease-in-out infinite;
          filter: drop-shadow(0 14px 26px rgba(245, 158, 11, 0.12));
        }
        .ongvangcomvn-solutions-ghost.ongvangcomvn-training-ghost {
          background: linear-gradient(180deg, #ffffff 0%, #dbeafe 50%, #93c5fd 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 14px 26px rgba(59, 130, 246, 0.1));
        }
        .ongvangcomvn-solutions-ghost.ongvangcomvn-services-ghost {
          opacity: 0.16;
          filter: drop-shadow(0 18px 34px rgba(245, 158, 11, 0.08));
        }
        .ongvangcomvn-solutions-ghost.ongvangcomvn-contact-ghost {
          background: linear-gradient(180deg, #ffffff 0%, #fde68a 48%, #f97316 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          opacity: 0.22;
          filter: drop-shadow(0 16px 30px rgba(249, 115, 22, 0.16));
        }
        .ongvangcomvn-site .ongvangcomvn-stat-value {
          font-size: 72px !important;
          font-weight: 900 !important;
          line-height: 1 !important;
        }
        .ongvangcomvn-site .ongvangcomvn-stat-label {
          font-size: 18px !important;
          line-height: 1.3 !important;
        }
        @keyframes ongvangcomvn-solutions-flow {
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
          .ongvangcomvn-solutions-ghost { animation: none; }
          .ongvangcomvn-card-orbit { animation: none; }
          .ongvangcomvn-floating-badge { animation: none; }
        }
        @media (max-width: 767px) {
          .ongvangcomvn-site .ongvangcomvn-solutions-ghost {
            display: none !important;
          }
          .ongvangcomvn-site .ongvangcomvn-hero-title {
            font-size: 30px !important;
            line-height: 1.16 !important;
          }
          .ongvangcomvn-site .ongvangcomvn-page-title {
            font-size: 31px !important;
            line-height: 1.12 !important;
            font-weight: 600 !important;
            overflow-wrap: normal;
          }
          .ongvangcomvn-site .ongvangcomvn-section-title {
            font-size: 30px !important;
            line-height: 1.12 !important;
            font-weight: 600 !important;
            overflow-wrap: normal;
          }
          .ongvangcomvn-site .ongvangcomvn-card-title {
            font-size: 24px !important;
            line-height: 1.16 !important;
            font-weight: 600 !important;
          }
          .ongvangcomvn-site .ongvangcomvn-feature-title {
            font-size: 28px !important;
            font-weight: 600 !important;
            line-height: 1.18 !important;
            overflow-wrap: anywhere;
            word-break: normal;
          }
          .ongvangcomvn-site .ongvangcomvn-solutions-title { font-size: 38px !important; font-weight: 600 !important; }
          .ongvangcomvn-site .ongvangcomvn-stat-value { font-size: 44px !important; }
          .ongvangcomvn-site .ongvangcomvn-stat-label { font-size: 14px !important; }
          .ongvangcomvn-site p {
            font-size: 15px !important;
            line-height: 1.75 !important;
          }
          .ongvangcomvn-site .ongvangcomvn-topic-track {
            width: auto;
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
            gap: 12px 18px;
            padding: 0 24px;
            white-space: normal;
          }
          .ongvangcomvn-site .ongvangcomvn-topic-track span {
            display: inline-flex;
            align-items: center;
          }
        }
      `}</style>
      <div
        className="ongvangcomvn-site min-h-screen bg-[#EEF2FF] text-slate-900"
        style={{ fontFamily: BE_VIETNAM_PRO }}

      >
        {/* Truyền logo & tên công ty từ DB xuống Navigation */}
        <OngvangcomvnNavigation logoUrl={org?.logo} orgName={org?.name} />
        <main id="main-content">{children}</main>
        <OngvangcomvnFooter
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

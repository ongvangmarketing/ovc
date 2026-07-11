import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.ongvang.com.vn";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    template: "%s | Ong Vàng Workspace",
    default: "Ong Vàng Workspace — Nền tảng quản trị doanh nghiệp",
  },
  description:
    "Nền tảng quản trị doanh nghiệp toàn diện — CRM, Dự án, Tài chính, Đào tạo và Marketing trên một hệ thống thống nhất.",
  keywords: ["workspace", "CRM", "quản lý dự án", "hóa đơn", "đào tạo", "SaaS"],
  authors: [{ name: "Ong Vàng Team" }],
  creator: "Ong Vàng",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: appUrl,
    siteName: "Ong Vàng Workspace",
    title: "Ong Vàng Workspace",
    description: "Nền tảng quản trị doanh nghiệp toàn diện",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "OVC",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased overscroll-none" suppressHydrationWarning>
        <QueryProvider>
          <PwaProvider>
            {children}
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  borderRadius: "12px",
                  fontFamily: "var(--font-sans)",
                },
              }}
            />
          </PwaProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

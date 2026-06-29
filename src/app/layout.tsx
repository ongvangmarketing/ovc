import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
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
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Ong Vàng Workspace",
    title: "Ong Vàng Workspace",
    description: "Nền tảng quản trị doanh nghiệp toàn diện",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
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
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

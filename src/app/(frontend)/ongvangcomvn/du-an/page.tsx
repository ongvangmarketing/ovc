import type { Metadata } from "next";
import Link from "next/link";
import { OngvangcomvnReveal } from "../_components/OngvangcomvnReveal";

export const metadata: Metadata = {
  title: "Dự án truyền thông & AI tiêu biểu",
  description:
    "Các dự án truyền thông, marketing, đào tạo và ứng dụng AI do Ong Vàng đồng hành triển khai để tạo tăng trưởng rõ ràng cho doanh nghiệp.",
  alternates: { canonical: "/du-an" },
  openGraph: {
    title: "Dự án truyền thông & AI tiêu biểu | Ong Vàng",
    description:
      "Case study và dự án tiêu biểu về truyền thông, đào tạo và ứng dụng AI do Ong Vàng triển khai.",
    url: "/du-an",
  },
};

export default function OngvangcomvnProjectsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-white pt-40 pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-10 hidden justify-center overflow-hidden select-none md:flex opacity-[0.02]" aria-hidden>
          <span className="whitespace-nowrap text-[18vw] font-black uppercase leading-none tracking-tighter">PROJECT</span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <OngvangcomvnReveal>
            <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400 antialiased">Dự án tiêu biểu</p>
            <h1 className="!text-[clamp(36px,4.5vw,66px)] !leading-[1.05] font-medium tracking-tighter text-black antialiased max-w-4xl">
              Giá trị khách hàng.<br />Cam kết với uy tín.
            </h1>
            <p className="mt-8 max-w-2xl text-[18px] leading-relaxed text-gray-500 antialiased">
              Những dự án Ong Vàng đã đồng hành cùng doanh nghiệp để xây dựng thương hiệu, truyền thông và tăng trưởng rõ ràng hơn.
            </p>
          </OngvangcomvnReveal>
        </div>
      </section>

      <section className="bg-white pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <OngvangcomvnReveal>
            <div className="rounded-3xl border border-[#eaeaea] bg-[#fafafa] p-16 text-center">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400 antialiased">Đang tải dữ liệu</p>
              <h2 className="mt-4 text-[32px] font-medium tracking-tight text-black antialiased">Danh sách dự án đang được cập nhật.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-gray-500 antialiased">
                Ong Vàng đang đồng bộ dữ liệu dự án thật từ hệ thống. Khi dữ liệu sẵn sàng, các case study sẽ hiển thị tại đây.
              </p>
            </div>
          </OngvangcomvnReveal>
          
          <div className="mt-16 rounded-3xl border border-[#eaeaea] bg-white p-12 transition-all duration-300 hover:border-gray-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-2xl">
                <p className="text-[12px] font-semibold uppercase tracking-widest text-gray-400 antialiased">Cùng bắt đầu dự án mới</p>
                <h2 className="mt-3 text-[32px] font-medium tracking-tight text-black antialiased">Bạn đang cần một đối tác chiến lược?</h2>
              </div>
              <Link href="/ongvangcomvn/lien-he" className="inline-flex shrink-0 h-14 items-center justify-center rounded-full bg-black px-8 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 antialiased">
                Trao đổi dự án
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

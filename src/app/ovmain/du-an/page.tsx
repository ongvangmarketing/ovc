import type { Metadata } from "next";
import Link from "next/link";
import { OvReveal } from "../_components/OvReveal";

export const metadata: Metadata = {
  title: "Dự án truyền thông & AI tiêu biểu",
  description:
    "Các dự án truyền thông, marketing, đào tạo và ứng dụng AI do Ong Vàng đồng hành triển khai để tạo tăng trưởng rõ ràng cho doanh nghiệp.",
  alternates: { canonical: "/ovmain/du-an" },
  openGraph: {
    title: "Dự án truyền thông & AI tiêu biểu | Ong Vàng",
    description:
      "Case study và dự án tiêu biểu về truyền thông, đào tạo và ứng dụng AI do Ong Vàng triển khai.",
    url: "/ovmain/du-an",
  },
};

export default function OvProjectsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#f8f6f2] pt-40 pb-20">
        <div className="pointer-events-none absolute inset-x-0 top-10 flex justify-center overflow-hidden select-none" aria-hidden>
          <span className="ovmain-solutions-ghost whitespace-nowrap text-[18vw] font-black uppercase leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>PROJECT</span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <OvReveal>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-orange-500">Dự án tiêu biểu</p>
            <h1 className="max-w-4xl text-5xl font-black tracking-[0] text-slate-950 sm:text-6xl">
              Giá trị khách hàng.<br /><span className="text-orange-500">Cam kết với uy tín.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Những dự án Ong Vàng đã đồng hành cùng doanh nghiệp để xây dựng thương hiệu, truyền thông và tăng trưởng rõ ràng hơn.
            </p>
          </OvReveal>
        </div>
      </section>

      <section className="bg-[#f8f6f2] pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <OvReveal>
            <div className="rounded-lg border border-orange-100 bg-white/85 p-10 text-center shadow-sm">
              <p className="text-sm font-normal uppercase tracking-[0.18em] text-orange-500">Đang tải dữ liệu</p>
              <h2 className="mt-3 text-4xl font-normal text-slate-950">Danh sách dự án đang được cập nhật.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                Ong Vàng đang đồng bộ dữ liệu dự án thật từ hệ thống. Khi dữ liệu sẵn sàng, các case study sẽ hiển thị tại đây.
              </p>
            </div>
          </OvReveal>
          <div className="mt-12 rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-orange-500">Cùng bắt đầu dự án mới</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Bạn đang cần một đối tác chiến lược?</h2>
              </div>
              <Link href="/ovmain/lien-he" className="inline-flex shrink-0 justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-7 py-3 text-sm font-bold uppercase text-white shadow-lg shadow-orange-200">
                Trao đổi dự án →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

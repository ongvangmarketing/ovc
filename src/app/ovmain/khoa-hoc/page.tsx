import type { Metadata } from "next";
import Link from "next/link";
import { getOrganization, getCourses } from "../actions";
import { OvReveal } from "../_components/OvReveal";
import { OvHorizontalCarousel } from "../_components/OvHorizontalCarousel";
import { OvCoursesFilter } from "./OvCoursesFilter";

export const metadata: Metadata = {
  title: "Khóa học truyền thông, marketing & AI",
  description:
    "Các khóa học truyền thông, marketing và ứng dụng AI thực chiến giúp học viên áp dụng ngay vào công việc, tối ưu hiệu suất và đo lường kết quả rõ ràng.",
  alternates: { canonical: "/ovmain/khoa-hoc" },
  openGraph: {
    title: "Khóa học truyền thông, marketing & AI | Ong Vàng",
    description:
      "Đào tạo thực chiến về truyền thông, marketing và ứng dụng AI cho cá nhân, đội nhóm và doanh nghiệp.",
    url: "/ovmain/khoa-hoc",
  },
};

export default async function OvKhoaHocPage() {
  const org = await getOrganization();
  const courses = org ? await getCourses(org.id) : [];

  const serialized = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    thumbnail: c.thumbnail,
    price: Number(c.price),
    currency: c.currency,
    level: c.level,
    duration: c.duration,
    tags: c.tags,
    instructor: c.instructor?.name ?? "Ong Vàng Academy",
    instructorImage: c.instructor?.image ?? null,
    students: c._count?.enrollments ?? 0,
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#EEF2FF] pt-40 pb-20">
        <div className="pointer-events-none absolute -top-4 inset-x-0 hidden justify-center overflow-hidden select-none md:flex" aria-hidden="true">
          <span
            className="whitespace-nowrap text-[20vw] font-black uppercase leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: "transparent", WebkitTextStroke: "2px rgba(99,102,241,0.07)" }}
          >
            KHOA HOC
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <OvReveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-600">
              Khóa học nổi bật
            </div>
          </OvReveal>
          <OvReveal delay={0.1}>
            <h1 className="ovmain-page-title max-w-3xl tracking-tight text-slate-900">
            Học thông minh.<br />
            Ứng dụng hiệu quả.<br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Tăng trưởng bền vững.</span>
          </h1>
          </OvReveal>
          <OvReveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg text-slate-500 leading-relaxed">
              Các khóa học được thiết kế từ kinh nghiệm triển khai thực tế, giúp học viên hiểu đúng, làm được và đo lường được kết quả.
            </p>
          </OvReveal>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="border-y border-slate-200/60 bg-white py-4">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
            {[
              { icon: "🎥", label: "Video HD không giới hạn" },
              { icon: "📱", label: "Học mọi thiết bị" },
              { icon: "🔄", label: "Cập nhật liên tục" },
              { icon: "🎓", label: "Chứng chỉ hoàn thành" },
              { icon: "💬", label: "Hỗ trợ từ chuyên gia" },
            ].map((item) => (
              <div key={item.label} className="flex min-h-10 items-center justify-center gap-2 rounded-full bg-slate-50 px-3 text-center ring-1 ring-slate-100 sm:min-h-0 sm:justify-start sm:bg-transparent sm:px-0 sm:ring-0">
                <span className="text-sm">{item.icon}</span>
                <span className="text-xs font-medium leading-tight text-slate-500 sm:text-sm sm:font-normal">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses with filter */}
      <section className="bg-[#EEF2FF] py-20">
        <div className="mx-auto max-w-7xl px-6">
          {courses.length > 0 ? (
            <OvCoursesFilter courses={serialized} />
          ) : (
            <div className="flex flex-col items-center py-24 text-center">
              <p className="text-5xl mb-4">🎓</p>
              <h2 className="text-2xl font-bold text-slate-900">Khóa học đang được chuẩn bị</h2>
              <p className="mt-2 text-slate-500">Các khóa học sẽ sớm ra mắt. Đăng ký để được thông báo!</p>
              <Link href="/ovmain/lien-he" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-bold text-white transition-all hover:scale-105">
                Đăng ký nhận thông báo
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <OvReveal>
              <h2 className="ovmain-section-title text-slate-900">
                Học để làm thật.<br />Không học cho có.
              </h2>
            </OvReveal>
            <OvReveal direction="left">
              <p className="text-sm text-slate-400 font-normal">Cảm nhận từ học viên</p>
            </OvReveal>
          </div>
          <OvHorizontalCarousel>
            {[
              { name: "Nguyễn Thị Lan", role: "Quản lý marketing", text: "Khóa học thực tế, áp dụng ngay vào công việc. Giảng viên hỗ trợ rõ và dễ hiểu.", avatar: "NL", rating: 4.9 },
              { name: "Trần Văn Minh", role: "Chủ doanh nghiệp", text: "Sau khóa học, đội ngũ của tôi tự tin hơn khi triển khai chiến dịch và đọc báo cáo.", avatar: "TM", rating: 4.8 },
              { name: "Phạm Thu Hà", role: "Nhà sáng lập", text: "Nội dung cập nhật, không lý thuyết suông. Học xong có thể bắt tay làm ngay.", avatar: "PH", rating: 5.0 },
            ].map((item, i) => (
              <OvReveal key={item.name} delay={i * 0.1} className="w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[calc((100%_-_40px)/3)] sm:max-w-none">
                <div className="rounded-2xl border border-slate-100 bg-[#EEF2FF] p-6 hover:border-orange-100 transition-colors h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-xs font-bold text-white">
                      {item.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-normal text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                    <span className="ml-auto text-xs font-normal text-amber-500">★ {item.rating}</span>
                  </div>
                  <p className="flex-1 text-sm text-slate-600 leading-relaxed italic">&ldquo;{item.text}&rdquo;</p>
                </div>
              </OvReveal>
            ))}
          </OvHorizontalCarousel>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-20 text-center">
        <OvReveal><h2 className="ovmain-section-title text-slate-900">Chưa biết chọn khóa nào?</h2></OvReveal>
        <OvReveal delay={0.1}><p className="mt-3 text-slate-500">Để lại thông tin — chuyên gia sẽ tư vấn lộ trình phù hợp nhất.</p></OvReveal>
        <OvReveal delay={0.2}>
          <Link href="/ovmain/lien-he" className="mt-8 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 font-bold text-white shadow-xl shadow-orange-200 transition-all hover:scale-105">
            Tư vấn lộ trình học →
          </Link>
        </OvReveal>
      </section>
    </>
  );
}

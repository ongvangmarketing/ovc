import type { Metadata } from "next";
import Link from "next/link";
import { getOrganization, getCourses } from "../actions";
import { OngvangcomvnReveal } from "../_components/OngvangcomvnReveal";
import { OngvangcomvnHorizontalCarousel } from "../_components/OngvangcomvnHorizontalCarousel";
import { OngvangcomvnCoursesFilter } from "./OngvangcomvnCoursesFilter";

export const metadata: Metadata = {
  title: "Khóa học truyền thông, marketing & AI",
  description:
    "Các khóa học truyền thông, marketing và ứng dụng AI thực chiến giúp học viên áp dụng ngay vào công việc, tối ưu hiệu suất và đo lường kết quả rõ ràng.",
  alternates: { canonical: "/khoa-hoc" },
  openGraph: {
    title: "Khóa học truyền thông, marketing & AI | Ong Vàng",
    description:
      "Đào tạo thực chiến về truyền thông, marketing và ứng dụng AI cho cá nhân, đội nhóm và doanh nghiệp.",
    url: "/khoa-hoc",
  },
};

export default async function OngvangcomvnKhoaHocPage() {
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
      <section className="relative overflow-hidden bg-white pt-40 pb-20">
        <div className="pointer-events-none absolute -top-4 inset-x-0 hidden justify-center overflow-hidden select-none md:flex opacity-[0.02]" aria-hidden="true">
          <span className="whitespace-nowrap text-[20vw] font-black uppercase leading-none tracking-tighter">
            ACADEMY
          </span>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <OngvangcomvnReveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#eaeaea] bg-[#fafafa] px-4 py-1.5 text-[12px] font-medium tracking-wide text-gray-500 uppercase antialiased">
              Khóa học nổi bật
            </div>
          </OngvangcomvnReveal>
          <OngvangcomvnReveal delay={0.1}>
            <h1 className="!text-[clamp(36px,4.5vw,66px)] !leading-[1.05] font-medium tracking-tighter text-black antialiased max-w-4xl">
              Học thông minh.<br />
              Ứng dụng hiệu quả.<br />
              Tăng trưởng bền vững.
            </h1>
          </OngvangcomvnReveal>
          <OngvangcomvnReveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-[18px] text-gray-500 leading-relaxed antialiased">
              Các khóa học được thiết kế từ kinh nghiệm triển khai thực tế, giúp học viên hiểu đúng, làm được và đo lường được kết quả.
            </p>
          </OngvangcomvnReveal>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="border-y border-[#eaeaea] bg-[#fafafa] py-5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-4 sm:flex sm:flex-wrap sm:items-center sm:gap-x-10 sm:gap-y-4">
            {[
              { icon: "🎥", label: "Video HD không giới hạn" },
              { icon: "📱", label: "Học mọi thiết bị" },
              { icon: "🔄", label: "Cập nhật liên tục" },
              { icon: "🎓", label: "Chứng chỉ hoàn thành" },
              { icon: "💬", label: "Hỗ trợ từ chuyên gia" },
            ].map((item) => (
              <div key={item.label} className="flex min-h-10 items-center justify-center gap-3 rounded-full bg-white px-4 text-center border border-[#eaeaea] sm:min-h-0 sm:justify-start sm:bg-transparent sm:px-0 sm:border-0 transition-colors hover:text-black">
                <span className="text-[16px]">{item.icon}</span>
                <span className="text-[14px] font-medium text-gray-500 sm:font-normal antialiased hover:text-black transition-colors">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses with filter */}
      <section className="bg-white py-24 border-b border-[#eaeaea]">
        <div className="mx-auto max-w-7xl px-6">
          {courses.length > 0 ? (
            <OngvangcomvnCoursesFilter courses={serialized} />
          ) : (
            <div className="flex flex-col items-center py-32 text-center rounded-3xl border border-[#eaeaea] bg-[#fafafa]">
              <h2 className="text-[32px] font-medium tracking-tight text-black antialiased">Khóa học đang được chuẩn bị</h2>
              <p className="mt-4 text-[16px] text-gray-500 antialiased">Các khóa học sẽ sớm ra mắt. Đăng ký để được thông báo!</p>
              <Link href="/ongvangcomvn/lien-he" className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 antialiased">
                Đăng ký nhận thông báo
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#fafafa] py-24 border-b border-[#eaeaea]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <OngvangcomvnReveal>
              <h2 className="!text-[clamp(32px,4vw,56px)] !leading-[1.1] font-medium tracking-tighter text-black antialiased">
                Học để làm thật.<br />Không học cho có.
              </h2>
            </OngvangcomvnReveal>
            <OngvangcomvnReveal direction="left">
              <p className="text-[14px] font-medium uppercase tracking-widest text-gray-400 antialiased">Cảm nhận từ học viên</p>
            </OngvangcomvnReveal>
          </div>
          <OngvangcomvnHorizontalCarousel>
            {[
              { name: "Nguyễn Thị Lan", role: "Quản lý marketing", text: "Khóa học thực tế, áp dụng ngay vào công việc. Giảng viên hỗ trợ rõ và dễ hiểu.", avatar: "NL", rating: 4.9 },
              { name: "Trần Văn Minh", role: "Chủ doanh nghiệp", text: "Sau khóa học, đội ngũ của tôi tự tin hơn khi triển khai chiến dịch và đọc báo cáo.", avatar: "TM", rating: 4.8 },
              { name: "Phạm Thu Hà", role: "Nhà sáng lập", text: "Nội dung cập nhật, không lý thuyết suông. Học xong có thể bắt tay làm ngay.", avatar: "PH", rating: 5.0 },
            ].map((item, i) => (
              <OngvangcomvnReveal key={item.name} delay={i * 0.1} className="w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[calc((100%_-_40px)/3)] sm:max-w-none">
                <div className="rounded-3xl border border-[#eaeaea] bg-white p-8 transition-all hover:border-gray-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fafafa] border border-[#eaeaea] text-[13px] font-medium tracking-widest text-gray-500">
                      {item.avatar}
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-black antialiased">{item.name}</p>
                      <p className="text-[13px] text-gray-500 antialiased mt-0.5">{item.role}</p>
                    </div>
                    <span className="ml-auto text-[13px] font-medium text-black antialiased">★ {item.rating}</span>
                  </div>
                  <p className="flex-1 text-[15px] text-gray-500 leading-relaxed italic antialiased">&ldquo;{item.text}&rdquo;</p>
                </div>
              </OngvangcomvnReveal>
            ))}
          </OngvangcomvnHorizontalCarousel>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white py-32 text-center">
        <OngvangcomvnReveal><h2 className="!text-[clamp(40px,5vw,72px)] !leading-[1.05] font-medium tracking-tighter text-black antialiased">Chưa biết chọn khóa nào?</h2></OngvangcomvnReveal>
        <OngvangcomvnReveal delay={0.1}><p className="mt-6 text-[18px] text-gray-500 antialiased">Để lại thông tin — chuyên gia sẽ tư vấn lộ trình phù hợp nhất.</p></OngvangcomvnReveal>
        <OngvangcomvnReveal delay={0.2}>
          <Link href="/ongvangcomvn/lien-he" className="mt-10 inline-flex h-14 items-center justify-center rounded-full bg-black px-10 text-[15px] font-medium text-white transition-colors hover:bg-gray-800 antialiased">
            Tư vấn lộ trình học
          </Link>
        </OngvangcomvnReveal>
      </section>
    </>
  );
}

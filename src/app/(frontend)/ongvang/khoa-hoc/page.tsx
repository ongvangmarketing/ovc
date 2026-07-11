import type { Metadata } from "next";
import { getOngVangOrganization, getOngVangCourses } from "../actions";
import { CoursesClientSection } from "./CoursesClientSection";
import { ScrollReveal } from "../_components/ScrollReveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Khóa học",
  description: "Các khóa học Digital Marketing và Kinh doanh thực chiến — Học là làm được ngay với đội ngũ chuyên gia hàng đầu.",
};

export default async function KhoaHocPage() {
  const org = await getOngVangOrganization();
  const courses = org ? await getOngVangCourses(org.id) : [];

  // Serialize for client component (convert Decimal to number)
  const serializedCourses = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    thumbnail: c.thumbnail,
    price: Number(c.price),
    currency: c.currency,
    level: c.level,
    duration: c.duration,
    tags: c.tags,
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-40 pb-20">
        <div className="absolute top-1/2 left-0 -z-10 h-[500px] w-[500px] -translate-x-1/3 -translate-y-1/2 rounded-full bg-orange-600/15 blur-[100px]" />
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400">
              Đào tạo thực chiến
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Học xong là{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                làm được ngay
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mt-6 max-w-xl text-lg text-slate-400 leading-relaxed">
              Các khóa học được thiết kế bởi chuyên gia thực chiến, bám sát thực tế doanh nghiệp và thị trường Việt Nam.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="border-y border-white/[0.06] bg-slate-900/20 py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { icon: "🎥", label: "Video HD không giới hạn" },
              { icon: "📱", label: "Học mọi thiết bị" },
              { icon: "🔄", label: "Cập nhật liên tục" },
              { icon: "🎓", label: "Chứng chỉ hoàn thành" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-medium text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses with filter */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          {courses.length > 0 ? (
            <CoursesClientSection courses={serializedCourses} />
          ) : (
            <div className="flex flex-col items-center py-24 text-center">
              <div className="mb-4 text-5xl">🎓</div>
              <h2 className="text-2xl font-bold text-white">Khóa học đang được chuẩn bị</h2>
              <p className="mt-2 text-slate-500">Các khóa học sẽ sớm ra mắt. Đăng ký để được thông báo sớm nhất!</p>
              <Link href="/ongvang/lien-he" className="mt-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 font-semibold text-white transition-all hover:scale-105">
                Đăng ký nhận thông báo
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials / Social proof */}
      <section className="border-t border-white/[0.06] bg-slate-900/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <ScrollReveal>
              <h2 className="text-3xl font-black text-white sm:text-4xl">Học viên nói gì về chúng tôi</h2>
            </ScrollReveal>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Nguyễn Thị Lan", role: "Marketing Manager", text: "Khóa học thực tế, áp dụng được ngay vào công việc. Thầy giảng rất tâm huyết và luôn hỗ trợ học viên.", avatar: "NL" },
              { name: "Trần Văn Minh", role: "Chủ doanh nghiệp", text: "Sau khoá học, doanh thu từ Facebook Ads tăng 3x chỉ trong 2 tháng. Rất hài lòng với chất lượng đào tạo.", avatar: "TM" },
              { name: "Phạm Thu Hà", role: "Freelancer", text: "Đây là khóa học Marketing hay nhất mình từng tham gia. Nội dung cập nhật, không học lý thuyết suông.", avatar: "PH" },
            ].map((item, i) => (
              <ScrollReveal key={item.name} delay={i * 0.1}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20 transition-colors">
                  <div className="mb-4 flex text-amber-400">
                    {"★★★★★".split("").map((star, si) => (
                      <span key={si}>{star}</span>
                    ))}
                  </div>
                  <p className="mb-5 text-sm text-slate-300 leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-xs font-bold text-white">
                      {item.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-white sm:text-5xl">Chưa biết chọn khóa nào?</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mt-4 text-lg text-slate-400">Để lại thông tin và chúng tôi sẽ tư vấn lộ trình học phù hợp nhất.</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Link
              href="/ongvang/lien-he"
              className="mt-8 inline-flex rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              Tư vấn lộ trình học
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

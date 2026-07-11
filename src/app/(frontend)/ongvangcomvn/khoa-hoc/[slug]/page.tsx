import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Clock3, UserRound } from "lucide-react";
import { getCourseBySlug, getOrganization } from "../../actions";
import { OngvangcomvnReveal } from "../../_components/OngvangcomvnReveal";

function money(value: unknown, currency = "VND") {
  const amount = Number(value ?? 0);
  return amount > 0 ? new Intl.NumberFormat("vi-VN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount) : "Miễn phí";
}

function formatDate(value?: Date | null) {
  if (!value) return "Đang cập nhật";
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(value);
}

const levelLabels: Record<string, string> = { beginner: "Cơ bản", intermediate: "Trung cấp", advanced: "Nâng cao" };

function courseTitle(title: string) {
  return title
    .replace(/^OVC LMS:\s*/i, "")
    .replace("AI Productivity for Instructors", "Năng suất AI cho giảng viên")
    .replace("Operations & Finance for LMS", "Vận hành và tài chính trung tâm")
    .replace("Operations & Finance for...", "Vận hành và tài chính")
    .replace("Digital Marketing Foundation", "Nền tảng marketing số")
    .replace("Digital Marketing...", "Nền tảng marketing số")
    .replace("Content Automation Sprint", "Tự động hóa nội dung")
    .replace("AI for Marketing", "AI ứng dụng trong marketing");
}

function seoDescription(value?: string | null) {
  const fallback =
    "Khóa học truyền thông, marketing và ứng dụng AI thực chiến của Ong Vàng giúp học viên áp dụng ngay vào công việc và đo lường kết quả rõ ràng.";
  const text = (value || fallback).replace(/\s+/g, " ").trim();
  return text.length > 155 ? `${text.slice(0, 152).trim()}...` : text;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganization();
  if (!org) {
    return {
      title: "Khóa học truyền thông, marketing & AI",
      description: seoDescription(),
    };
  }

  const course = await getCourseBySlug(org.id, slug);
  if (!course || course.status !== "PUBLISHED") {
    return {
      title: "Khóa học truyền thông, marketing & AI",
      description: seoDescription(),
    };
  }

  const title = `${courseTitle(course.title)} - Đào tạo ứng dụng AI`;
  const description = seoDescription(course.description);
  const url = `/khoa-hoc/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | Ong Vàng`,
      description,
      url,
      images: course.thumbnail
        ? [
            {
              url: course.thumbnail,
              alt: courseTitle(course.title),
            },
          ]
        : undefined,
    },
    twitter: {
      title: `${title} | Ong Vàng`,
      description,
      images: course.thumbnail ? [course.thumbnail] : undefined,
    },
  };
}

export default async function OngvangcomvnCourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await getOrganization();
  if (!org) notFound();
  const course = await getCourseBySlug(org.id, slug);
  if (!course || course.status !== "PUBLISHED") notFound();
  const lessonCount = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);

  return (
    <>
      <section className="relative overflow-hidden bg-white pt-40 pb-20">
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_460px] lg:items-center">
          <div>
            <Link href="/ongvangcomvn/khoa-hoc" className="mb-10 inline-flex h-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-5 text-[14px] font-medium text-black transition-colors hover:bg-[#fafafa] antialiased"><ArrowLeft className="mr-2 h-4 w-4" /> Khóa học</Link>
            <OngvangcomvnReveal>
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400 antialiased">{levelLabels[course.level] ?? course.level}</p>
              <h1 className="!text-[clamp(30px,3.75vw,54px)] !leading-[1.05] font-medium tracking-tighter text-black antialiased max-w-4xl">{courseTitle(course.title)}</h1>
              <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-gray-500 antialiased">{course.description || "Khóa học thực chiến giúp học viên áp dụng ngay vào công việc và đo lường kết quả rõ ràng."}</p>
            </OngvangcomvnReveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[#eaeaea] bg-[#fafafa] p-6 transition-colors hover:border-gray-300">
                <UserRound className="h-5 w-5 text-black" />
                <p className="mt-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400">Giảng viên</p>
                <strong className="text-[16px] font-medium tracking-tight text-black mt-1 block">{course.instructor.name}</strong>
              </div>
              <div className="rounded-3xl border border-[#eaeaea] bg-[#fafafa] p-6 transition-colors hover:border-gray-300">
                <BookOpen className="h-5 w-5 text-black" />
                <p className="mt-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400">Bài học</p>
                <strong className="text-[16px] font-medium tracking-tight text-black mt-1 block">{lessonCount || "Đang cập nhật"}</strong>
              </div>
              <div className="rounded-3xl border border-[#eaeaea] bg-[#fafafa] p-6 transition-colors hover:border-gray-300">
                <Clock3 className="h-5 w-5 text-black" />
                <p className="mt-4 text-[12px] font-semibold uppercase tracking-widest text-gray-400">Thời lượng</p>
                <strong className="text-[16px] font-medium tracking-tight text-black mt-1 block">{course.duration ? `${Math.round(course.duration / 60)}h` : "Linh hoạt"}</strong>
              </div>
            </div>
          </div>
          <OngvangcomvnReveal direction="left">
            <div className="overflow-hidden rounded-3xl border border-[#eaeaea] bg-white transition-all hover:border-gray-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1">
              <div className="relative aspect-[16/10] bg-[#fafafa]">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                ) : <div className="flex h-full items-center justify-center text-4xl text-gray-300">🎓</div>}
              </div>
              <div className="p-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Học phí</p>
                <p className="mt-2 text-[32px] font-medium tracking-tight text-black antialiased">{money(course.price, course.currency)}</p>
                <div className="mt-8 border-t border-[#eaeaea] pt-8">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">Lịch khai giảng</p>
                  {course.classes.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {course.classes.map((cls) => (
                        <Link key={cls.id} href={`/ongvangcomvn/khoa-hoc/${slug}/dang-ky?class=${encodeURIComponent(cls.name)}`} className="group flex items-start justify-between gap-4 rounded-2xl border border-[#eaeaea] bg-[#fafafa] p-4 transition-colors hover:bg-white hover:border-gray-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
                          <div className="flex gap-4">
                            <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-black" />
                            <div>
                              <p className="text-[15px] font-medium text-black antialiased">{formatDate(cls.startDate ?? null)}</p>
                              <p className="text-[13px] text-gray-500 antialiased mt-0.5">{cls.name}</p>
                            </div>
                          </div>
                          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[10px] text-black transition-colors group-hover:border-black group-hover:bg-black group-hover:text-white">→</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#eaeaea] bg-[#fafafa] p-5">
                      <p className="text-[14px] text-gray-500 antialiased">Đang cập nhật lịch khai giảng</p>
                    </div>
                  )}
                </div>
                <Link href={`/ongvangcomvn/khoa-hoc/${slug}/dang-ky`} className="mt-8 inline-flex w-full justify-center rounded-full bg-black px-6 py-4 text-[14px] font-medium text-white transition-colors hover:bg-gray-800 antialiased">Đăng ký khóa học</Link>
              </div>
            </div>
          </OngvangcomvnReveal>
        </div>
      </section>

      <section className="bg-[#fafafa] py-24 border-t border-[#eaeaea]">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="!text-[clamp(32px,4vw,48px)] !leading-[1.1] mb-12 font-medium tracking-tighter text-black antialiased">Nội dung khóa học</h2>
          <div className="grid gap-6">
            {(course.sections.length ? course.sections : [{ id: "fallback", title: "Lộ trình học", lessons: [] }]).map((section, index) => (
              <div key={section.id} className="rounded-3xl border border-[#eaeaea] bg-white p-8 transition-all hover:border-gray-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Phần {index + 1}</p>
                <h3 className="text-[22px] font-medium tracking-tight text-black antialiased">{section.title}</h3>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {(section.lessons.length ? section.lessons : [{ id: "lesson", title: "Nội dung đang được cập nhật" }]).map((lesson) => (
                    <div key={lesson.id} className="flex items-center rounded-2xl border border-[#eaeaea] bg-[#fafafa] px-5 py-4 transition-colors hover:bg-white hover:border-gray-300">
                      <div className="mr-4 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-[10px]">✓</div>
                      <span className="text-[15px] font-medium text-gray-700 antialiased">{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

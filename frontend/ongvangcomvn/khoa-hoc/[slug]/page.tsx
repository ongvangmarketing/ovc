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
      <section className="relative overflow-hidden bg-[#f8f6f2] pt-40 pb-20">
        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_460px] lg:items-center">
          <div>
            <Link href="/khoa-hoc" className="mb-8 inline-flex items-center gap-2 text-sm font-normal text-orange-600 hover:text-orange-500"><ArrowLeft className="h-4 w-4" /> Khóa học</Link>
            <OngvangcomvnReveal>
              <p className="mb-3 text-sm font-normal uppercase tracking-widest text-orange-500">{levelLabels[course.level] ?? course.level}</p>
              <h1 className="ongvangcomvn-page-title max-w-4xl tracking-[0] text-slate-950">{courseTitle(course.title)}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{course.description || "Khóa học thực chiến giúp học viên áp dụng ngay vào công việc và đo lường kết quả rõ ràng."}</p>
            </OngvangcomvnReveal>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white p-4 shadow-sm"><UserRound className="h-5 w-5 text-orange-500" /><p className="mt-2 text-xs text-slate-400">Giảng viên</p><strong className="text-sm">{course.instructor.name}</strong></div>
              <div className="rounded-lg bg-white p-4 shadow-sm"><BookOpen className="h-5 w-5 text-orange-500" /><p className="mt-2 text-xs text-slate-400">Bài học</p><strong className="text-sm">{lessonCount || "Đang cập nhật"}</strong></div>
              <div className="rounded-lg bg-white p-4 shadow-sm"><Clock3 className="h-5 w-5 text-orange-500" /><p className="mt-2 text-xs text-slate-400">Thời lượng</p><strong className="text-sm">{course.duration ? `${Math.round(course.duration / 60)}h` : "Linh hoạt"}</strong></div>
            </div>
          </div>
          <OngvangcomvnReveal direction="left">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-orange-100">
              <div className="relative aspect-[16/10] bg-orange-50">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                ) : <div className="flex h-full items-center justify-center text-6xl text-orange-300">◎</div>}
              </div>
              <div className="p-6">
                <p className="text-xs font-normal uppercase text-slate-400">Học phí</p>
                <p className="mt-1 text-3xl font-normal text-orange-600">{money(course.price, course.currency)}</p>
                <div className="mt-5">
                  <p className="mb-2 text-xs font-normal uppercase text-slate-400">Lịch khai giảng</p>
                  {course.classes.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {course.classes.map((cls) => (
                        <div key={cls.id} className="flex items-start gap-3 rounded-lg bg-orange-50 p-3">
                          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-950">{formatDate(cls.startDate ?? null)}</p>
                            <p className="text-xs text-slate-500">{cls.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-orange-50 p-4">
                      <p className="text-sm text-slate-500">Đang cập nhật lịch khai giảng</p>
                    </div>
                  )}
                </div>
                <Link href="/lien-he" className="mt-5 inline-flex w-full justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-3 text-sm font-normal uppercase text-white shadow-lg shadow-orange-200">Đăng ký tư vấn</Link>
              </div>
            </div>
          </OngvangcomvnReveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-3xl font-normal text-slate-950">Nội dung khóa học</h2>
          <div className="grid gap-4">
            {(course.sections.length ? course.sections : [{ id: "fallback", title: "Lộ trình học", lessons: [] }]).map((section, index) => (
              <div key={section.id} className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-normal uppercase tracking-[0.14em] text-orange-500">Phần {index + 1}</p>
                <h3 className="mt-1 text-xl font-normal text-slate-950">{section.title}</h3>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {(section.lessons.length ? section.lessons : [{ id: "lesson", title: "Nội dung đang được cập nhật" }]).map((lesson) => (
                    <div key={lesson.id} className="rounded-lg bg-[#f8f6f2] px-4 py-3 text-sm font-normal text-slate-600">{lesson.title}</div>
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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrganization, getCourseBySlug } from "../../../actions";
import { OngvangcomvnCourseRegistrationForm } from "../../../_components/OngvangcomvnCourseRegistrationForm";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganization();
  if (!org) return { title: "Đăng ký khóa học" };

  const course = await getCourseBySlug(org.id, slug);
  if (!course) return { title: "Đăng ký khóa học" };

  return {
    title: `Đăng ký khóa học ${courseTitle(course.title)} - Ong Vàng`,
  };
}

export default async function CourseRegistrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ class?: string }>;
}) {
  const { slug } = await params;
  const { class: className } = await searchParams;
  const org = await getOrganization();
  if (!org) notFound();

  const course = await getCourseBySlug(org.id, slug);
  if (!course || course.status !== "PUBLISHED") {
    notFound();
  }

  const cTitle = courseTitle(course.title);
  const optionName = className ? `Lớp ${className}` : null;

  return (
    <main className="min-h-screen bg-white py-24 antialiased">
      <div className="mx-auto max-w-3xl px-6">
        <Link href={`/ongvangcomvn/khoa-hoc/${slug}`} className="mb-12 inline-flex h-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-5 text-[14px] font-medium text-black transition-colors hover:bg-[#fafafa]">
          <span className="mr-2">←</span> Quay lại trang khóa học
        </Link>
        <div className="mb-12">
          <h1 className="!text-[clamp(32px,4vw,48px)] !leading-[1.1] font-medium tracking-tighter text-black">
            Đăng ký khóa học
          </h1>
          <p className="mt-4 text-[18px] text-gray-500 leading-relaxed max-w-xl">
            Để lại thông tin để chúng tôi liên hệ tư vấn chi tiết về khóa học <strong className="text-black">{cTitle}</strong>.
          </p>
        </div>

        <OngvangcomvnCourseRegistrationForm
          organizationId={org.id}
          courseSlug={slug}
          courseName={cTitle}
          className={className}
        />
      </div>
    </main>
  );
}

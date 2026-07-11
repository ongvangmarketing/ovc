import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrganization, getServiceBySlug } from "../../../actions";
import { OngvangcomvnServiceRegistrationForm } from "../../../_components/OngvangcomvnServiceRegistrationForm";

const viText: Record<string, string> = {
  "Brand Package": "Gói thương hiệu",
  "Content Package": "Gói nội dung",
  "Design Package": "Gói thiết kế",
  "Basic Brand": "Gói thương hiệu cơ bản",
  "Premium Brand": "Gói thương hiệu nâng cao",
  "Basic Content": "Gói nội dung cơ bản",
  "Premium Content": "Gói nội dung nâng cao",
  "Basic Design": "Gói thiết kế cơ bản",
  "Premium Design": "Gói thiết kế nâng cao",
  "BASIC BRAND": "Gói thương hiệu cơ bản",
  "PREMIUM BRAND": "Gói thương hiệu nâng cao",
  "BASIC CONTENT": "Gói nội dung cơ bản",
  "PREMIUM CONTENT": "Gói nội dung nâng cao",
  "BASIC DESIGN": "Gói thiết kế cơ bản",
  "PREMIUM DESIGN": "Gói thiết kế nâng cao",
};

function toVietnameseLabel(value: string) {
  const trimmed = value.trim();
  return viText[trimmed] ?? trimmed;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const org = await getOrganization();
  if (!org) return { title: "Đăng ký dịch vụ" };

  const service = await getServiceBySlug(org.id, slug);
  if (!service) return { title: "Đăng ký dịch vụ" };

  return {
    title: `Đăng ký tư vấn ${toVietnameseLabel(service.name)} - Ong Vàng`,
  };
}

export default async function ServiceRegistrationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ option?: string }>;
}) {
  const { slug } = await params;
  const { option } = await searchParams;
  const org = await getOrganization();
  if (!org) notFound();

  const service = await getServiceBySlug(org.id, slug);
  if (!service || service.status !== "ACTIVE") {
    notFound();
  }

  const serviceName = toVietnameseLabel(service.name);
  const optionName = option ? toVietnameseLabel(option) : null;

  return (
    <main className="min-h-screen bg-white py-24 antialiased">
      <div className="mx-auto max-w-3xl px-6">
        <Link href={`/ongvangcomvn/dich-vu/${slug}`} className="mb-12 inline-flex h-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-5 text-[14px] font-medium text-black transition-colors hover:bg-[#fafafa]">
          <span className="mr-2">←</span> Quay lại trang dịch vụ
        </Link>
        <div className="mb-12">
          <h1 className="!text-[clamp(32px,4vw,48px)] !leading-[1.1] font-medium tracking-tighter text-black">
            Đăng ký tư vấn
          </h1>
          <p className="mt-4 text-[18px] text-gray-500 leading-relaxed max-w-xl">
            Để lại thông tin để chúng tôi liên hệ tư vấn chi tiết về dịch vụ <strong className="text-black">{serviceName}</strong>.
          </p>
        </div>

        <OngvangcomvnServiceRegistrationForm
          organizationId={org.id}
          serviceName={serviceName}
          optionName={optionName}
        />
      </div>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Globe2, Mail, MapPin, Phone } from "lucide-react";

const companyLinks = [
    { label: "Về chúng tôi", href: "/ongvangcomvn/gioi-thieu" },
    { label: "Dự án tiêu biểu", href: "/ongvangcomvn/du-an" },
    { label: "Liên hệ", href: "/ongvangcomvn/lien-he" },
];

export function OngvangcomvnFooter({ logoUrl, orgName, description, phone, email, address, website, services = [], courses = [] }: {
  logoUrl?: string | null;
  orgName?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  services?: { id: string; name: string }[];
  courses?: { id: string; title: string }[];
}) {
  const logoSrc = logoUrl || "/brand/ong-vang-logo.svg";
  const brandName = orgName || "Ong Vàng Marketing";
  const links = {
    "Dịch vụ": services.slice(0, 5).map((service) => ({ label: service.name, href: "/ongvangcomvn/dich-vu" })),
    "Đào tạo": courses.slice(0, 5).map((course) => ({ label: course.title, href: "/ongvangcomvn/khoa-hoc" })),
    "Công ty": companyLinks,
  };
  return (
    <footer className="relative overflow-hidden bg-white border-t border-[#eaeaea] text-gray-500 antialiased">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(to_right,#eaeaea_1px,transparent_1px),linear-gradient(to_bottom,#eaeaea_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)] [-webkit-mask-image:radial-gradient(circle_at_center,black,transparent_82%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/ongvangcomvn" className="mb-6 inline-block">
              <Image
                src={logoSrc}
                alt={brandName}
                width={150}
                height={48}
                unoptimized={Boolean(logoUrl)}
                className="h-10 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
              <span className="sr-only">{brandName}</span>
            </Link>
            <p className="text-[14px] leading-relaxed text-gray-500 max-w-xs">
              {description || "Giải pháp Marketing, Đào tạo và Chuyển đổi số giúp doanh nghiệp tăng trưởng bền vững."}
            </p>
            <div className="mt-6 grid max-w-sm gap-3 text-[14px] text-gray-500">
              {phone ? <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 transition-colors hover:text-black"><Phone className="h-4 w-4" /><span>{phone}</span></a> : null}
              {email ? <a href={`mailto:${email}`} className="flex items-center gap-3 transition-colors hover:text-black"><Mail className="h-4 w-4" /><span>{email}</span></a> : null}
              {address ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} className="flex items-center gap-3 transition-colors hover:text-black"><MapPin className="h-4 w-4" /><span>{address}</span></a> : null}
              {website ? <a href={website.startsWith("http") ? website : `https://${website}`} className="flex items-center gap-3 transition-colors hover:text-black"><Globe2 className="h-4 w-4" /><span>{website}</span></a> : null}
            </div>
            <div className="mt-8 flex gap-3">
              {[
                { label: "F", title: "Facebook" },
                { label: "YT", title: "YouTube" },
                { label: "TK", title: "TikTok" },
              ].map((s) => (
                <a key={s.label} href="#" title={s.title} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[11px] font-medium text-gray-500 hover:border-gray-300 hover:text-black transition-colors">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([cat, ls]) => (
            <div key={cat}>
              <h3 className="mb-5 text-[14px] font-medium text-black">{cat}</h3>
              <ul className="space-y-3">
                {ls.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[14px] text-gray-500 hover:text-black transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 border-t border-[#eaeaea] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-gray-500">
          <p>© {new Date().getFullYear()} Ong Vàng Marketing. All rights reserved.</p>
          <p>
            Powered by{" "}
            <Link href="/ongvangcomvn" className="font-medium text-black transition-colors hover:text-gray-500">
              Ong Vàng Marketing &amp; Training
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

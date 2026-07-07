import Image from "next/image";
import Link from "next/link";
import { Globe2, Mail, MapPin, Phone } from "lucide-react";

const companyLinks = [
    { label: "Về chúng tôi", href: "/gioi-thieu" },
    { label: "Dự án tiêu biểu", href: "/du-an" },
    { label: "Liên hệ", href: "/lien-he" },
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
    "Dịch vụ": services.slice(0, 5).map((service) => ({ label: service.name, href: "/dich-vu" })),
    "Đào tạo": courses.slice(0, 5).map((course) => ({ label: course.title, href: "/khoa-hoc" })),
    "Công ty": companyLinks,
  };
  return (
    <footer className="bg-[#171717] text-slate-400">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-5 inline-block">
              <Image
                src={logoSrc}
                alt={brandName}
                width={150}
                height={48}
                unoptimized={Boolean(logoUrl)}
                className="h-12 w-auto object-contain"
              />
              <span className="sr-only">{brandName}</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-xs">
              {description || "Giải pháp Marketing, Đào tạo và Chuyển đổi số giúp doanh nghiệp tăng trưởng bền vững."}
            </p>
            <div className="mt-5 grid max-w-sm gap-2.5 text-sm text-slate-500">
              {phone ? <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-start gap-2.5 transition hover:text-orange-400"><Phone className="mt-0.5 h-4 w-4 shrink-0" /><span>{phone}</span></a> : null}
              {email ? <a href={`mailto:${email}`} className="flex items-start gap-2.5 transition hover:text-orange-400"><Mail className="mt-0.5 h-4 w-4 shrink-0" /><span>{email}</span></a> : null}
              {address ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} className="flex items-start gap-2.5 transition hover:text-orange-400"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span>{address}</span></a> : null}
              {website ? <a href={website.startsWith("http") ? website : `https://${website}`} className="flex items-start gap-2.5 transition hover:text-orange-400"><Globe2 className="mt-0.5 h-4 w-4 shrink-0" /><span>{website}</span></a> : null}
            </div>
            <div className="mt-5 flex gap-2.5">
              {[
                { label: "F", title: "Facebook" },
                { label: "YT", title: "YouTube" },
                { label: "TK", title: "TikTok" },
              ].map((s) => (
                <a key={s.label} href="#" title={s.title} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-xs font-bold hover:border-orange-500/40 hover:text-orange-400 transition-colors">
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([cat, ls]) => (
            <div key={cat}>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{cat}</h3>
              <ul className="space-y-2.5">
                {ls.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-slate-500 hover:text-orange-400 transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} Ong Vàng Marketing. All rights reserved.</p>
          <p>
            Powered by{" "}
            <Link href="/" className="font-medium text-orange-600 transition hover:text-orange-500">
              Ong Vàng Marketing &amp; Training
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

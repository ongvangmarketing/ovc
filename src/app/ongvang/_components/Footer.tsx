import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  "Dịch vụ": [
    { label: "Quảng cáo Facebook Ads", href: "/ongvang/dich-vu" },
    { label: "Google Ads & SEO", href: "/ongvang/dich-vu" },
    { label: "Content Marketing", href: "/ongvang/dich-vu" },
    { label: "Thiết kế thương hiệu", href: "/ongvang/dich-vu" },
  ],
  "Đào tạo": [
    { label: "Khoá học Online", href: "/ongvang/khoa-hoc" },
    { label: "Học theo lộ trình", href: "/ongvang/khoa-hoc" },
    { label: "Đào tạo nội bộ doanh nghiệp", href: "/ongvang/lien-he" },
  ],
  "Công ty": [
    { label: "Về chúng tôi", href: "/ongvang" },
    { label: "Liên hệ", href: "/ongvang/lien-he" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/ongvang" className="mb-6 inline-block">
              {/* Use white version of logo by inverting/filtering */}
              <Image
                src="/brand/ong-vang-logo.svg"
                alt="Ong Vàng"
                width={130}
                height={34}
                className="brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-sm leading-relaxed text-stone-500 max-w-xs">
              Giải pháp Digital Marketing toàn diện và Đào tạo thực chiến giúp doanh nghiệp bứt phá trên môi trường số.
            </p>
            <div className="mt-6 flex gap-3">
              {["FB", "YT", "TK"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-700 bg-stone-800 text-xs font-bold text-stone-500 transition-colors hover:border-amber-500/40 hover:text-amber-400"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-stone-500">{cat}</h3>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-stone-500 hover:text-amber-400 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-600">
            © {new Date().getFullYear()} Ong Vàng Marketing & Training. All rights reserved.
          </p>
          <p className="text-sm text-stone-600">
            Powered by <span className="text-amber-600 font-medium">Ong Vàng Cloud</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

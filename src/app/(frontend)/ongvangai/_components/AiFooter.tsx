import Link from "next/link";

export function AiFooter() {
  const links = {
    "Dịch vụ": ["Facebook & Google Ads", "SEO & Content", "TikTok Marketing", "Tư vấn chiến lược"],
    "Đào tạo": ["Khóa học Online", "Đào tạo nội bộ", "Mentoring 1-1"],
    "Công ty": ["Về chúng tôi", "Case Studies", "Blog & Insights", "Liên hệ"],
    "Hỗ trợ": ["FAQ", "Chính sách bảo mật", "Điều khoản sử dụng"],
  };

  return (
    <footer className="bg-[#111] text-white">
      {/* Amber top border */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg,transparent,#f5a524,transparent)" }} />

      <div className="mx-auto max-w-[1120px] px-8 py-16 lg:py-20">
        {/* Top row */}
        <div className="mb-14 flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
          <div>
            {/* Brand */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px]"
                style={{ background: "linear-gradient(135deg,#ffb52e 0%,#ff7a1a 100%)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" fill="white" fillOpacity="0.9"/>
                  <path d="M12 6L17.2 9V15L12 18L6.8 15V9L12 6Z" fill="#f5a524"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Ong Vàng
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#6b6b6b]">
              Hệ sinh thái tư vấn chiến lược, đào tạo thực chiến, AI ứng dụng và chuyển đổi số bền vững cho doanh nghiệp.
            </p>
          </div>

          {/* Newsletter */}
          <div className="flex w-full max-w-sm flex-col gap-2 lg:w-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6b6b]">Nhận tin tức</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@company.com"
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-[#6b6b6b] outline-none focus:border-[#f5a524]/40 focus:bg-white/10 transition-all"
              />
              <button className="flex items-center gap-1 rounded-full bg-[#f5a524] px-5 py-2.5 text-sm font-bold text-[#111] transition-all hover:bg-[#fbbf24] active:scale-95">
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mb-14">
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#6b6b6b]">{cat}</p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="/ongvangai/lien-he" className="text-sm text-[#6b6b6b] transition-colors hover:text-white">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-[#6b6b6b]">© {new Date().getFullYear()} Ong Vàng Marketing & Training. All rights reserved.</p>
          <div className="flex gap-4">
            {["FB","YT","TK","ZL"].map((s) => (
              <a key={s} href="#" className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[11px] font-bold text-[#6b6b6b] transition-all hover:border-[#f5a524]/30 hover:text-[#f5a524]">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

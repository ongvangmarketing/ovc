"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/ongvangai", label: "Trang chủ" },
  { href: "/ongvangai/dich-vu", label: "Dịch vụ" },
  { href: "/ongvangai/khoa-hoc", label: "Khóa học" },
  { href: "/ongvangai/lien-he", label: "Liên hệ" },
];

export function AiNavigation({ logoUrl, orgName = "Ong Vàng" }: { logoUrl?: string | null; orgName?: string | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      {/* Sticky nav — Framer style: frosted cream glass, radius 24px, max-w */}
      <div className="sticky top-[18px] z-50 flex justify-center px-4">
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
          className="w-full max-w-[1120px]"
        >
          <div
            className={`flex items-center justify-between rounded-[24px] border border-[rgba(17,17,17,0.08)] px-[18px] py-[14px] transition-all duration-300 ${
              scrolled
                ? "bg-[#f7f4edf0] shadow-xl shadow-black/[0.06]"
                : "bg-[#f7f4edb8]"
            }`}
            style={{ backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
          >
            {/* Logo area */}
            <div className="flex items-center gap-[10px]">
              {/* Icon badge — amber gradient hex */}
              <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[12px]"
                style={{ background: "linear-gradient(135deg,#ffb52e 0%,#ff7a1a 100%)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" fill="white" fillOpacity="0.9"/>
                  <path d="M12 6L17.2 9V15L12 18L6.8 15V9L12 6Z" fill="#f5a524"/>
                </svg>
              </div>
              <Link href="/ongvangai" className="flex items-center group">
                {logoUrl ? (
                  <Image src={logoUrl} alt={orgName ?? "Ong Vàng"} width={110} height={28} className="h-7 w-auto object-contain" unoptimized />
                ) : (
                  <span className="font-grotesk text-[17px] font-700 text-[#111]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                    {orgName ?? "Ong Vàng"}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => {
                const isActive = link.href === "/ongvangai" ? pathname === "/ongvangai" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[14px] font-[500] transition-colors ${isActive ? "text-[#111]" : "text-[#6b6b6b] hover:text-[#111]"}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* CTA button */}
            <div className="flex items-center gap-3">
              <Link
                href="/ongvangai/lien-he"
                className="hidden items-center rounded-full bg-[#111] px-[16px] py-[11px] text-[13px] font-semibold text-white transition-all hover:bg-[#222] active:scale-95 md:flex"
              >
                Bắt đầu ngay
              </Link>
              <button
                className="flex flex-col items-center justify-center gap-[5px] rounded-xl p-2 md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {[0,1,2].map((i) => (
                  <span key={i} className={`block h-[2px] w-5 bg-[#111] transition-all duration-300 ${
                    i === 0 && menuOpen ? "translate-y-[7px] rotate-45" :
                    i === 1 && menuOpen ? "opacity-0" :
                    i === 2 && menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                  }`} />
                ))}
              </button>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-[80px] z-40 rounded-3xl border border-[rgba(17,17,17,0.08)] bg-[#f7f4ed] p-5 shadow-2xl shadow-black/10 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/ongvangai" ? pathname === "/ongvangai" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? "bg-[#111] text-white" : "text-[#6b6b6b] hover:bg-[rgba(17,17,17,0.05)] hover:text-[#111]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link href="/ongvangai/lien-he" onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-2xl bg-[#111] px-4 py-3 text-center text-sm font-semibold text-white">
                Bắt đầu ngay
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

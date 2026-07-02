"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserRound } from "lucide-react";
import { OvLoginModal } from "./OvLoginModal";

const navLinks = [
  { href: "/ovmain", label: "Trang chủ" },
  { href: "/ovmain/gioi-thieu", label: "Giới thiệu" },
  { href: "/ovmain/dich-vu", label: "Dịch vụ" },
  { href: "/ovmain/du-an", label: "Dự án" },
  { href: "/ovmain/khoa-hoc", label: "Khóa học" },
  { href: "/ovmain/lien-he", label: "Liên hệ" },
];

interface OvNavigationProps {
  /** Logo URL từ Organization.logo trong DB. Fallback sang SVG tĩnh nếu chưa cấu hình. */
  logoUrl?: string | null;
  /** Tên công ty để dùng làm alt text */
  orgName?: string | null;
}

export function OvNavigation({ logoUrl, orgName = "Ong Vàng" }: OvNavigationProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Logo element — dùng logo từ DB nếu có, fallback SVG tĩnh
  const logoSrc = logoUrl || "/brand/ong-vang-logo.svg";
  const logoEl = (
    <Image
      src={logoSrc}
      alt={orgName ?? "Ong Vàng"}
      width={306}
      height={80}
      priority
      className="h-12 w-auto object-contain transition-opacity group-hover:opacity-75 md:h-16"
      unoptimized={!!logoUrl} // tắt optimization cho external URL từ DB
    />
  );

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
      >
        <div
          className={`mx-4 mt-3 rounded-2xl transition-all duration-300 ${
            scrolled
              ? "border border-slate-200 bg-white/95 shadow-lg shadow-slate-200/60 backdrop-blur-xl"
              : "border border-white/60 bg-white/80 backdrop-blur-md"
          }`}
        >
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:h-20">
            {/* Logo */}
            <Link href="/ovmain" className="flex items-center group">
              {logoEl}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/ovmain" ? pathname === "/ovmain" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-bold uppercase rounded-full transition-all ${
                      isActive ? "text-white shadow-md shadow-orange-200/60" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="ov-nav-pill"
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-600"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setLoginOpen(true)} className="hidden h-11 items-center gap-2 rounded-full border border-orange-200 bg-white px-4 text-sm font-bold uppercase text-slate-700 transition hover:border-orange-400 hover:text-orange-600 md:inline-flex">
                <LogIn className="h-4 w-4" />Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 transition hover:bg-orange-100 md:hidden"
                aria-label="Đăng nhập"
              >
                <UserRound className="h-5 w-5" />
              </button>
              <Link
                href="/ovmain/lien-he"
                className="hidden h-11 md:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-6 text-sm font-bold uppercase text-white shadow-md shadow-orange-200/60 transition-all hover:scale-105 hover:shadow-orange-300 active:scale-95"
              >
                Tư vấn miễn phí
              </Link>
              <button
                id="ovmain-mobile-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex md:hidden flex-col items-center justify-center gap-1.5 w-9 h-9 rounded-xl bg-slate-100"
                aria-label="Toggle menu"
              >
                <span className={`block h-0.5 w-5 bg-slate-700 transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block h-0.5 w-5 bg-slate-700 transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-5 bg-slate-700 transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-24 z-40 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === "/ovmain" ? pathname === "/ovmain" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-bold uppercase transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-200/60"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <OvLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

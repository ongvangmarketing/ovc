"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, LogIn, Menu, UserRound, X } from "lucide-react";
import { OngvangcomvnLoginModal } from "./OngvangcomvnLoginModal";

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/ongvangcomvn/gioi-thieu", label: "Giới thiệu" },
  { href: "/ongvangcomvn/dich-vu", label: "Dịch vụ" },
  { href: "/ongvangcomvn/du-an", label: "Dự án" },
  { href: "/ongvangcomvn/khoa-hoc", label: "Khóa học" },
  { href: "/ongvangcomvn/lien-he", label: "Liên hệ" },
];

interface OngvangcomvnNavigationProps {
  /** Logo URL từ Organization.logo trong DB. Fallback sang SVG tĩnh nếu chưa cấu hình. */
  logoUrl?: string | null;
  /** Tên công ty để dùng làm alt text */
  orgName?: string | null;
}

export function OngvangcomvnNavigation({ logoUrl, orgName = "Ong Vàng" }: OngvangcomvnNavigationProps) {
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
      className="h-9 w-auto max-w-none object-contain transition-opacity hover:opacity-70"
      unoptimized={!!logoUrl} // tắt optimization cho external URL từ DB
    />
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          scrolled
            ? "border-b border-[#eaeaea] bg-white/80 backdrop-blur-md"
            : "border-b border-[#eaeaea] bg-white/80 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/ongvangcomvn" className="flex items-center">
            {logoEl}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" || pathname === "/ongvangcomvn" : pathname.startsWith(link.href) || pathname.startsWith(`/ongvangcomvn${link.href}`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2 text-[12px] font-semibold uppercase tracking-[0.08em] leading-none transition-colors antialiased after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-black/60 after:transition-transform hover:text-black hover:after:scale-x-100 ${
                    isActive ? "text-gray-900 after:scale-x-100" : "text-gray-400"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="hidden h-10 items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[15px] font-medium tracking-tight text-black transition-colors hover:bg-[#fafafa] md:inline-flex antialiased"
            >
              <LogIn className="h-3.5 w-3.5 text-gray-400" />
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-gray-500 transition-colors hover:bg-[#fafafa] hover:text-black md:hidden"
              aria-label="Đăng nhập"
            >
              <UserRound className="h-4 w-4" />
            </button>
            <button
              id="ongvangcomvn-mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-black transition-colors hover:bg-gray-50 md:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto border-t border-[#eaeaea] bg-white md:hidden"
            onMouseDown={() => setMenuOpen(false)}
          >
            <div
              className="mx-auto w-full max-w-7xl px-6 py-6"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mb-10 pt-4">
                <h2 className="text-[44px] font-medium leading-[0.95] tracking-tighter text-black">Bạn cần gì?</h2>
              </div>
              <nav className="grid gap-4">
                {navLinks.map((link) => {
                  const isActive = link.href === "/" ? pathname === "/" || pathname === "/ongvangcomvn" : pathname.startsWith(link.href) || pathname.startsWith(`/ongvangcomvn${link.href}`);
                  return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex w-fit items-center gap-3 text-[24px] font-medium leading-tight tracking-tight decoration-[1.5px] underline-offset-4 transition-colors hover:underline ${
                      isActive ? "text-black" : "text-gray-400 hover:text-black"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className={`h-4 w-4 transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                  </Link>
                  );
                })}
                <div className="mt-5 pt-5">
                  <Link
                    href="/ongvangcomvn/lien-he"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 text-[24px] font-medium leading-tight tracking-tight text-gray-400 decoration-[1.5px] underline-offset-4 transition-colors hover:text-black hover:underline"
                  >
                    Tư vấn miễn phí
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <OngvangcomvnLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

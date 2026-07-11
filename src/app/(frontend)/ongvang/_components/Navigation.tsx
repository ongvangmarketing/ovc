"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/ongvang", label: "Trang chủ" },
  { href: "/ongvang/dich-vu", label: "Dịch vụ" },
  { href: "/ongvang/khoa-hoc", label: "Khóa học" },
  { href: "/ongvang/lien-he", label: "Liên hệ" },
];

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
        style={{ viewTransitionName: "site-header" }}
      >
        <div
          className={`mx-4 mt-3 rounded-2xl transition-all duration-500 ${
            scrolled
              ? "border border-amber-200/60 bg-white/90 shadow-lg shadow-amber-100/50 backdrop-blur-xl"
              : "border border-amber-100/40 bg-white/70 backdrop-blur-md"
          }`}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
            {/* Logo */}
            <Link href="/ongvang" className="flex items-center group">
              <Image
                src="/brand/ong-vang-logo.svg"
                alt="Ong Vàng"
                width={130}
                height={34}
                priority
                className="transition-opacity group-hover:opacity-80"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/ongvang"
                    ? pathname === "/ongvang"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      isActive ? "text-orange-600" : "text-stone-600 hover:text-orange-600"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-orange-50 ring-1 ring-orange-200"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link
                href="/ongvang/lien-he"
                className="hidden md:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:scale-105 hover:shadow-orange-300 active:scale-95"
              >
                Tư vấn miễn phí
              </Link>

              {/* Hamburger */}
              <button
                id="mobile-menu-toggle"
                className="flex md:hidden flex-col items-center justify-center gap-1.5 w-9 h-9 rounded-xl bg-orange-50"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle mobile menu"
              >
                <span className={`block h-0.5 w-5 bg-stone-700 transition-transform duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <span className={`block h-0.5 w-5 bg-stone-700 transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 w-5 bg-stone-700 transition-transform duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-24 z-40 rounded-2xl border border-amber-100 bg-white p-5 shadow-xl shadow-amber-100 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/ongvang"
                    ? pathname === "/ongvang"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/ongvang/lien-he"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-center text-base font-bold text-white"
              >
                Tư vấn miễn phí
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

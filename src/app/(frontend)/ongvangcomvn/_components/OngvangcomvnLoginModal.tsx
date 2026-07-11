"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2, LockKeyhole, X } from "lucide-react";
import { signIn, signOut } from "@/lib/auth/client";

const roleRoutes: Record<string, string> = {
  CUSTOMER: "/customer",
  STUDENT: "/student",
  INSTRUCTOR: "/instructor",
  SUPER_ADMIN: "/workspace",
  ADMIN: "/workspace",
  MANAGER: "/workspace",
  STAFF: "/workspace",
};

export function OngvangcomvnLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signOut();
      await fetch("/api/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });
      const result = await signIn.email({ email: email.trim().toLowerCase(), password });
      if (result.error) {
        setError(result.error.message || "Thông tin đăng nhập chưa đúng.");
        return;
      }
      const user = result.data?.user as { role?: string | null } | undefined;
      onClose();
      window.location.assign(roleRoutes[user?.role || ""] || "/select-org");
    } catch {
      setError("Không thể đăng nhập lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="ov-login-title" className="relative w-full max-w-[420px] rounded-2xl border border-[#eaeaea] bg-white p-6 shadow-none sm:p-8" initial={{ y: 16, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0, scale: 0.98 }} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-black"><X className="h-4 w-4" /></button>
            <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-black"><LockKeyhole className="h-4 w-4" /></div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-gray-400">Ong Vàng Portal</p>
            <h2 id="ov-login-title" className="text-[32px] font-medium leading-none tracking-tighter text-black">Đăng nhập</h2>
            <p className="mt-3 text-[15px] leading-6 text-gray-500">Hệ thống sẽ tự đưa bạn về đúng cổng làm việc.</p>
            <form onSubmit={submit} className="mt-8 space-y-5">
              {error ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">{error}</div> : null}
              <label className="block text-[13px] font-medium text-black">Email
                <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-[#eaeaea] bg-white px-3 text-[15px] font-normal text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black" placeholder="ban@congty.vn" />
              </label>
              <label className="block text-[13px] font-medium text-black">Mật khẩu
                <span className="relative mt-2 block">
                  <input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-[#eaeaea] bg-white px-3 pr-11 text-[15px] font-normal text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black" placeholder="Nhập mật khẩu" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-black">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </span>
              </label>
              <div className="flex justify-end"><Link href="/ongvangcomvn/forgot-password" className="text-[13px] font-medium text-gray-500 transition-colors hover:text-black">Quên mật khẩu?</Link></div>
              <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-black text-[14px] font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Đang đăng nhập</> : "Đăng nhập"}</button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2, LockKeyhole, X } from "lucide-react";
import { signIn } from "@/lib/auth/client";

const roleRoutes: Record<string, string> = {
  CUSTOMER: "/customer",
  STUDENT: "/student",
  INSTRUCTOR: "/instructor",
  SUPER_ADMIN: "/workspace/dashboard",
  ADMIN: "/workspace/dashboard",
  MANAGER: "/workspace/dashboard",
  STAFF: "/workspace/dashboard",
};

export function OngvangcomvnLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
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
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Thông tin đăng nhập chưa đúng.");
        return;
      }
      const user = result.data?.user as { role?: string | null } | undefined;
      onClose();
      router.push(roleRoutes[user?.role || ""] || "/select-org");
      router.refresh();
    } catch {
      setError("Không thể đăng nhập lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="ov-login-title" className="relative w-full max-w-md rounded-lg border border-orange-100 bg-white p-7 shadow-2xl" initial={{ y: 24, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 16, opacity: 0, scale: 0.98 }} onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-orange-200"><LockKeyhole className="h-5 w-5" /></div>
            <h2 id="ov-login-title" className="font-black text-slate-950">Đăng nhập</h2>
            <p className="mt-2 text-slate-500">Hệ thống sẽ tự đưa bạn về đúng cổng làm việc.</p>
            <form onSubmit={submit} className="mt-6 space-y-4">
              {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">{error}</div> : null}
              <label className="block text-sm font-semibold text-slate-700">Email
                <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-md border border-slate-200 px-4 font-normal outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" placeholder="ban@congty.vn" />
              </label>
              <label className="block text-sm font-semibold text-slate-700">Mật khẩu
                <span className="relative mt-2 block">
                  <input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-md border border-slate-200 px-4 pr-12 font-normal outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100" placeholder="Nhập mật khẩu" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </span>
              </label>
              <div className="flex justify-end"><Link href="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Quên mật khẩu?</Link></div>
              <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-sm font-black uppercase text-white shadow-lg shadow-orange-200 transition hover:scale-[1.01] disabled:opacity-60">{loading ? <><Loader2 className="h-4 w-4 animate-spin" />Đang đăng nhập</> : "Đăng nhập"}</button>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { signIn, signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signOut();
      await fetch("/api/logout", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });

      const result = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      window.location.assign("/select-org");
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 inline-flex items-center rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
        OVC Workspace
      </div>

      <h1 className="text-[48px] md:text-[60px] tracking-tighter leading-[1.05] font-medium text-white mb-4">
        Chào mừng trở lại.
      </h1>

      <p className="text-[16px] text-white/70 leading-relaxed max-w-2xl mb-12">
        Hệ thống quản trị trung tâm giúp bạn dễ dàng theo dõi, cập nhật tiến độ công việc và quản lý dữ liệu của toàn bộ hệ thống OVC.
      </p>

      <div className="rounded-2xl border border-[#eaeaea] bg-white p-8 md:p-10 max-w-[480px]">
        <div className="mb-8">
          <h2 className="text-[24px] font-medium tracking-tight text-black">Đăng nhập tài khoản</h2>
          <p className="mt-1 text-[16px] text-gray-500">Sử dụng email và mật khẩu của bạn để truy cập.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-[14px] font-medium text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-[11px] lg:text-[12px] font-medium uppercase tracking-widest text-gray-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@congty.vn"
              required
              autoComplete="email"
              className="h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 text-[14px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[11px] lg:text-[12px] font-medium uppercase tracking-widest text-gray-400">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="h-10 w-full rounded-md border border-[#eaeaea] bg-white px-3 pr-10 text-[14px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-[14px] font-medium text-white transition-colors",
              loading ? "cursor-not-allowed opacity-70" : "hover:bg-gray-800"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-[13px] text-slate-500">
          <Link href="/register" className="transition-colors hover:text-black">
            Chưa có tài khoản?
          </Link>
          {" • "}
          <Link href="/forgot-password" className="transition-colors hover:text-black">
            Quên mật khẩu?
          </Link>
        </div>
      </div>
    </div>
  );
}

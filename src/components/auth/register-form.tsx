"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

export function RegisterForm() {
  const [name, setName] = useState("");
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
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setError(error.message ?? "Đăng ký thất bại. Vui lòng thử lại.");
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
      <div className="mb-6 inline-flex items-center rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white">
        OVC Workspace
      </div>

      <h1 className="text-3xl md:text-[40px] font-normal tracking-tight mb-4">
        <span className="text-black font-medium">Bắt đầu ngay,</span> <span className="text-slate-400">gia nhập cùng đội ngũ.</span>
      </h1>

      <p className="text-slate-500 text-[15px] max-w-2xl mb-12">
        Đăng ký tài khoản để truy cập vào hệ thống quản trị trung tâm, nơi kết nối mọi hoạt động và dữ liệu của bạn trên nền tảng OVC.
      </p>

      <div className="rounded-[24px] border border-slate-200 bg-white p-8 md:p-10 shadow-sm max-w-[480px]">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black">Tạo tài khoản mới</h2>
          <p className="mt-1 text-sm text-slate-500">Điền đầy đủ thông tin bên dưới để bắt đầu.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 text-[14px] font-medium text-red-800">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Họ và tên
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              autoComplete="name"
              className="h-12 w-full rounded-xl border border-[#eaeaea] bg-transparent px-4 text-[14px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
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
              className="h-12 w-full rounded-xl border border-[#eaeaea] bg-transparent px-4 text-[14px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[11px] font-medium uppercase tracking-widest text-slate-500">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="h-12 w-full rounded-xl border border-[#eaeaea] bg-transparent px-4 pr-10 text-[14px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-[14px] font-medium text-white transition-colors",
              loading ? "cursor-not-allowed opacity-70" : "hover:bg-gray-900"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
              </>
            ) : (
              "Đăng ký ngay"
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-[13px] text-slate-500">
          <Link href="/login" className="transition-colors hover:text-black">
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

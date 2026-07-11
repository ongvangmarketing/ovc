"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (error) {
        setError(error.message ?? "Không thể gửi yêu cầu. Vui lòng thử lại.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 inline-flex items-center rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white">
        OVC Workspace
      </div>

      <h1 className="text-[48px] md:text-[60px] tracking-tighter leading-[1.05] font-medium text-black mb-4">
        Quên mật khẩu.
      </h1>

      <p className="text-[16px] text-gray-500 leading-relaxed max-w-2xl mb-12">
        Nhập email của bạn để nhận liên kết khôi phục.
      </p>

      <div className="rounded-2xl border border-[#eaeaea] bg-white p-8 md:p-10 max-w-[480px]">
        {success ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-[14px] font-medium text-emerald-800">
              Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
            </div>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-full border border-[#eaeaea] bg-white px-6 py-2.5 text-[14px] font-medium text-black transition-colors hover:bg-gray-50"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading || !email}
              className={cn(
                "mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-2.5 text-[14px] font-medium text-white transition-colors",
                (loading || !email) ? "cursor-not-allowed opacity-70" : "hover:bg-gray-800"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Gửi liên kết khôi phục</span>
              )}
            </button>

            <div className="mt-8 text-center text-[13px] text-gray-500">
              <Link href="/login" className="transition-colors hover:text-black">
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

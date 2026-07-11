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
    <div className="w-full">
      <div className="mb-10 text-center">
        <h1 className="text-[28px] font-medium tracking-tight text-black">Quên mật khẩu</h1>
        <p className="mt-3 text-[14px] text-gray-500">
          Nhập email của bạn để nhận liên kết khôi phục
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-[14px] font-medium text-emerald-800">
            Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
          </div>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-[#eaeaea] bg-transparent text-[14px] font-medium text-black transition-colors hover:bg-gray-50"
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
            <label htmlFor="email" className="text-[11px] font-medium uppercase tracking-widest text-gray-500">
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
              className="h-12 w-full rounded-xl border border-[#eaeaea] bg-transparent px-4 text-[14px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className={cn(
              "mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-[14px] font-medium text-white transition-colors",
              (loading || !email) ? "cursor-not-allowed opacity-70" : "hover:bg-gray-900"
            )}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
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
  );
}

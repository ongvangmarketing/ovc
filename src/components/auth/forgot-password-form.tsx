"use client";

import { useState } from "react";
import Link from "next/link";
import { Layers3, Loader2 } from "lucide-react";
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
    <div className="w-full max-w-[400px]">
      {/* Mobile Logo */}
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 shadow-sm shadow-emerald-500/20">
          <Layers3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="block text-sm font-semibold text-foreground">Business Workspace</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-500">
          Nhập địa chỉ email của bạn, chúng tôi sẽ gửi liên kết khôi phục mật khẩu.
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 animate-fade-in">
            Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc thư rác) của bạn.
          </div>
          <Link
            href="/login"
            className="flex w-full items-center justify-center h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive animate-fade-in">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
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
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm shadow-slate-950/[0.02] transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="group relative flex h-11 w-full items-center justify-center overflow-hidden rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>Gửi liên kết khôi phục</span>
            )}
          </button>

          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-emerald-500"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

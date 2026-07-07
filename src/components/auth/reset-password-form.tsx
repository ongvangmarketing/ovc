"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers3, Loader2, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Liên kết không hợp lệ hoặc đã hết hạn.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token, // Pass the token from URL
      });

      if (error) {
        setError(error.message ?? "Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Đặt lại mật khẩu</h1>
        <p className="mt-2 text-sm text-slate-500">
          Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 animate-fade-in">
            Mật khẩu của bạn đã được cập nhật thành công! Đang chuyển hướng về trang đăng nhập...
          </div>
          <Link
            href="/login"
            className="flex w-full items-center justify-center h-11 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600"
          >
            Đăng nhập ngay
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

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
                disabled={!token}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-800 shadow-sm shadow-slate-950/[0.02] transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50 disabled:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                disabled={!token}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 pr-10 text-sm text-slate-800 shadow-sm shadow-slate-950/[0.02] transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token || !password || !confirmPassword}
            className="group relative flex h-11 w-full items-center justify-center overflow-hidden rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:pointer-events-none disabled:opacity-50 mt-6"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>Cập nhật mật khẩu</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

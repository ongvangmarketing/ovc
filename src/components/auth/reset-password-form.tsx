"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

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
        token,
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
    <div className="w-full">
      <div className="mb-10 text-center">
        <h1 className="text-[28px] font-medium tracking-tight text-black">Đặt lại mật khẩu</h1>
        <p className="mt-3 text-[14px] text-gray-500">
          Vui lòng nhập mật khẩu mới
        </p>
      </div>

      {success ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-[14px] font-medium text-emerald-800">
            Mật khẩu của bạn đã được cập nhật thành công! Đang chuyển hướng về trang đăng nhập...
          </div>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-black text-[14px] font-medium text-white transition-colors hover:bg-gray-900"
          >
            Đăng nhập ngay
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
            <label htmlFor="password" className="text-[11px] font-medium uppercase tracking-widest text-gray-500">
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
                className="h-12 w-full rounded-xl border border-[#eaeaea] bg-transparent px-4 pr-10 text-[14px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black disabled:bg-gray-50 disabled:text-gray-400"
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

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-[11px] font-medium uppercase tracking-widest text-gray-500">
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
                className="h-12 w-full rounded-xl border border-[#eaeaea] bg-transparent px-4 pr-10 text-[14px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token || !password || !confirmPassword}
            className={cn(
              "mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-[14px] font-medium text-white transition-colors",
              (loading || !token || !password || !confirmPassword) ? "cursor-not-allowed opacity-70" : "hover:bg-gray-900"
            )}
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

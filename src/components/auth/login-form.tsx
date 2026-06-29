"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Layers3, Loader2, LockKeyhole } from "lucide-react";
import { signIn } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

type LoginUser = {
  role?: string | null;
};

export function LoginForm() {
  const router = useRouter();
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
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      const role = (result.data?.user as LoginUser | undefined)?.role;
      if (role === "CUSTOMER") {
        router.push("/portal");
      } else if (role === "INSTRUCTOR") {
        router.push("/portal/instructor/dashboard");
      } else if (role === "STUDENT") {
        router.push("/portal/student/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      {/* Mobile Logo */}
      <div className="mb-10 flex items-center gap-3 lg:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-sm shadow-emerald-500/20">
          <Layers3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="block text-sm font-semibold text-foreground">Business Workspace</span>
          <span className="block text-xs text-muted-foreground">Secure access portal</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Đăng nhập</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sử dụng tài khoản của tổ chức để tiếp tục.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm shadow-slate-950/[0.02] transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Mật khẩu
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-emerald-600 transition-colors hover:text-emerald-700"
            >
              Quên mật khẩu?
            </Link>
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
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 pr-11 text-sm text-slate-800 shadow-sm shadow-slate-950/[0.02] transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 accent-emerald-500 focus:ring-emerald-500/20"
          />
          <label htmlFor="remember" className="text-sm text-muted-foreground">
            Ghi nhớ đăng nhập
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-semibold text-white transition-all duration-150",
            loading ? "cursor-not-allowed opacity-70" : "shadow-sm shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-md"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            "Đăng nhập"
          )}
        </button>

      </form>

      {/* Footer */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-emerald-600 transition-colors hover:text-emerald-700">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

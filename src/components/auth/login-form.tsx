"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Hexagon, Loader2 } from "lucide-react";
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
        router.push("/workspace/dashboard");
      }
      router.refresh();
    } catch {
      setError("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Mobile Logo */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Hexagon className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="font-bold text-foreground">Ong Vàng Workspace</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Chào mừng trở lại</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Đăng nhập để tiếp tục vào Workspace
        </p>
      </div>

      {/* Form */}
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
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
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
              className="text-xs text-primary hover:text-primary/80 transition-colors"
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
              className="w-full h-10 px-3 pr-10 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all"
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
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
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
            "w-full h-10 rounded-lg bg-primary text-white text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2",
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/90 shadow-sm hover:shadow-md"
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

        {/* Demo login hint */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground font-medium mb-1">Demo tài khoản</p>
          <p className="text-xs text-muted-foreground">Email: admin@ongvang.com</p>
          <p className="text-xs text-muted-foreground">Password: Ongvang@2026</p>
        </div>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-primary font-medium hover:text-primary/80 transition-colors">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

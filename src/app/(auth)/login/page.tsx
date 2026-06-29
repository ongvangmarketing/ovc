import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Đăng nhập | Ong Vàng Workspace",
};

export default function LoginPage() {
  return <LoginForm />;
}

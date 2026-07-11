import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Đăng ký | Business Workspace",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

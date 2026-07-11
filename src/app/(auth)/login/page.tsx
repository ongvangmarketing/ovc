import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Đăng nhập | Business Workspace",
};

export default async function LoginPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (result?.user) {
    redirect("/workspace");
  }

  return <LoginForm />;
}

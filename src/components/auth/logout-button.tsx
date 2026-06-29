"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { signOut } from "@/lib/auth/client";
import { cn } from "@/lib/utils/cn";

type LogoutButtonProps = {
  className?: string;
  label?: string;
  iconOnly?: boolean;
};

export function LogoutButton({ className, label = "Đăng xuất", iconOnly = false }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      await fetch("/api/logout", { method: "POST", credentials: "include" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <button type="button" onClick={handleLogout} className={className} title={label}>
      <LogOut className={cn(iconOnly ? "h-4 w-4" : "h-4 w-4")} />
      {iconOnly ? null : label}
    </button>
  );
}

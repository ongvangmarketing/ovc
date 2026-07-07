import { ShieldCheck, Users, Search } from "lucide-react";
import { UsersClient } from "./_components/users-client";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await requireAuth();
  
  if (session.user.role !== "SUPER_ADMIN" && session.user.email !== "admin@ongvang.com" && session.user.email !== "info@ovc.vn") {
    redirect("/workspace");
  }

  // Fetch all users in the system
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      organizationMembers: {
        select: {
          organization: {
            select: { name: true, slug: true }
          }
        }
      }
    }
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Users Management</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">Quản lý Tài khoản</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý toàn bộ tài khoản người dùng và quản trị viên trên nền tảng.
          </p>
        </div>
      </div>

      <UsersClient initialUsers={users} />
    </div>
  );
}

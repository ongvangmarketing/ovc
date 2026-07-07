"use client";

import { useState } from "react";
import { Search, MoreVertical, ShieldCheck, User as UserIcon, Lock, Unlock } from "lucide-react";
import { formatDateTime } from "@/lib/utils/format";

export function UsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");

  const filteredUsers = initialUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(search.toLowerCase()) || 
                          user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "ALL" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tài khoản..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="USER">User</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Người dùng</th>
                <th className="px-6 py-4 font-medium">Vai trò</th>
                <th className="px-6 py-4 font-medium">Tổ chức trực thuộc</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === "SUPER_ADMIN" ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                        <ShieldCheck className="h-3.5 w-3.5" /> Super Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        <UserIcon className="h-3.5 w-3.5" /> User
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.organizationMembers?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.organizationMembers.map((m: any, i: number) => (
                          <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {m.organization.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs italic text-slate-400">Không thuộc tổ chức nào</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        <Unlock className="h-3.5 w-3.5" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                        <Lock className="h-3.5 w-3.5" /> Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-900 transition">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy tài khoản nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

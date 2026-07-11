"use client";

import { useState } from "react";
import { KeyRound, Plus, Search, MoreVertical, Edit3, Trash2, Copy, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { deleteRole } from "@/actions/roles";

type RoleItem = {
  id: string;
  name: string;
  code: string;
  status: string;
  priority: number;
  dataScope: string;
  usersCount: number;
};

export function RolesList({ initialRoles }: { initialRoles: RoleItem[] }) {
  const [search, setSearch] = useState("");
  const [roles, setRoles] = useState(initialRoles);

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vai trò này?")) return;
    try {
      await deleteRole(id);
      setRoles(roles.filter(r => r.id !== id));
    } catch (e) {
      alert("Lỗi khi xóa vai trò");
    }
  };

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans animate-in fade-in duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#eaeaea] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-full bg-black px-3 py-1.5 text-[11px] font-semibold text-white tracking-wide uppercase">
                Vai trò
              </span>
            </div>
            <h1 className="text-[32px] md:text-[36px] tracking-tight leading-[1.15] font-medium text-black">
              Danh sách Vai trò
            </h1>
            <p className="text-[15px] text-gray-500 mt-2">
              Quản lý danh sách các vai trò (Roles) và cấp độ truy cập (Data Scope) trên toàn hệ thống.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/workspace/settings/roles-permissions/roles/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-black px-5 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors">
              <Plus className="h-4 w-4" /> Tạo Vai trò mới
            </Link>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc mã vai trò..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-full border border-[#eaeaea] text-[14px] focus:outline-none focus:border-gray-400 transition-colors bg-white"
            />
          </div>
          <div className="text-[13px] font-medium text-gray-500">
            Hiển thị <strong className="text-black">{filteredRoles.length}</strong> kết quả
          </div>
        </div>

        {/* Roles Table */}
        <div className="rounded-[24px] border border-[#eaeaea] bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-gray-50/50 text-[12px] uppercase tracking-wider text-gray-500 font-semibold border-b border-[#eaeaea]">
              <tr>
                <th className="px-6 py-4">Vai trò & Mã</th>
                <th className="px-6 py-4">Data Scope</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thành viên</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeaea]">
              {filteredRoles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50">
                        <Shield className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <strong className="block text-[15px] font-medium text-black">{role.name}</strong>
                        <span className="text-[13px] text-gray-500">{role.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full border border-[#eaeaea] bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 tracking-wide uppercase">
                      {role.dataScope}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[14px] font-medium text-black">{role.priority}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase border",
                      role.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"
                    )}>
                      {role.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[14px] font-medium text-black">{role.usersCount}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/workspace/settings/roles-permissions/roles/${role.id}`} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </Link>
                      <button type="button" className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(role.id)} type="button" className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[14px] text-gray-500">
                    Không tìm thấy vai trò nào phù hợp.
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

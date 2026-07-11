"use client";

import { useState } from "react";
import { Search, Shield, Building2, Users as UsersIcon, ChevronRight } from "lucide-react";
import { MemberAssignmentModal } from "./member-assignment-modal";

export function MembersList({
  initialMembers,
  roles,
  departments
}: {
  initialMembers: any[];
  roles: any[];
  departments: any[];
}) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const filteredMembers = initialMembers.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans animate-in fade-in duration-300">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-[32px] font-semibold tracking-tight text-gray-900 mb-2 flex items-center gap-3">
              <UsersIcon className="h-8 w-8 text-gray-400" />
              Thành viên & Phân quyền
            </h1>
            <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
              Quản lý danh sách thành viên trong tổ chức. Gán Vai trò (Role) và đưa thành viên vào các Phòng ban / Nhóm để phân quyền dữ liệu.
            </p>
          </div>
        </header>

        <div className="bg-white rounded-[24px] border border-[#eaeaea] shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-[#eaeaea] flex items-center justify-between bg-gray-50/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Tìm kiếm thành viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#eaeaea] rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-200 transition-shadow"
              />
            </div>
          </div>

          <div className="divide-y divide-[#eaeaea]">
            {filteredMembers.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-[14px]">
                Không tìm thấy thành viên nào.
              </div>
            ) : (
              filteredMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-[15px] text-gray-900">{member.name}</div>
                      <div className="text-[13px] text-gray-500">{member.email}</div>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center gap-6">
                    {/* Role */}
                    <div className="flex-1">
                      {member.role ? (
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                          <Shield className="h-3.5 w-3.5 text-blue-500" />
                          <span className="font-medium">{member.role.name}</span>
                        </div>
                      ) : (
                        <span className="text-[13px] text-gray-400 italic">Chưa có vai trò</span>
                      )}
                    </div>

                    {/* Department / Team */}
                    <div className="flex-1">
                      {member.department ? (
                        <div>
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-700 font-medium mb-0.5">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            {member.department.name}
                          </div>
                          {member.teams.length > 0 && (
                            <div className="text-[12px] text-gray-500 pl-5">
                              {member.teams.map((t: any) => t.name).join(", ")}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[13px] text-gray-400 italic">Chưa thuộc phòng ban</span>
                      )}
                    </div>
                  </div>

                  <div className="pl-4">
                    <button 
                      onClick={() => setSelectedUser(member)}
                      className="px-4 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-[#eaeaea] rounded-full hover:bg-gray-50 transition-colors flex items-center gap-1"
                    >
                      Phân quyền <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedUser && (
        <MemberAssignmentModal 
          user={selectedUser}
          roles={roles}
          departments={departments}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

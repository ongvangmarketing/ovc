"use client";

import { useState } from "react";
import { Plus, Search, MoreVertical, Edit3, Trash2, Users, Building2, ChevronDown, ChevronRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createDepartment, createTeam, deleteDepartment, deleteTeam } from "@/actions/departments";
import { useRouter } from "next/navigation";

type TeamItem = {
  id: string;
  name: string;
  code: string | null;
  _count: { users: number };
};

type DepartmentItem = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  usersCount: number;
  teamsCount: number;
  teams: TeamItem[];
};

export function DepartmentsList({ initialData }: { initialData: DepartmentItem[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedDepts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredDepts = initialData.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    (d.code && d.code.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddDept = async () => {
    const name = prompt("Nhập tên phòng ban mới:");
    if (!name) return;
    const code = prompt("Nhập mã phòng ban (vd: SALES, HR):");
    if (!code) return;

    try {
      await createDepartment({ name, code, description: "" });
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddTeam = async (deptId: string) => {
    const name = prompt("Nhập tên nhóm (team) mới:");
    if (!name) return;
    const code = prompt("Nhập mã nhóm (vd: TEAM_A):");
    if (!code) return;

    try {
      await createTeam({ departmentId: deptId, name, code, description: "" });
      setExpandedDepts(prev => ({ ...prev, [deptId]: true }));
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm("Xóa phòng ban này sẽ xóa luôn các team trực thuộc. Bạn có chắc chắn?")) return;
    try {
      await deleteDepartment(id);
      router.refresh();
    } catch (e: any) {
      alert("Lỗi khi xóa");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa team này?")) return;
    try {
      await deleteTeam(id);
      router.refresh();
    } catch (e: any) {
      alert("Lỗi khi xóa");
    }
  };

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans animate-in fade-in duration-300">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-[32px] font-semibold tracking-tight text-gray-900 mb-2 flex items-center gap-3">
              <Building2 className="h-8 w-8 text-gray-400" />
              Sơ đồ tổ chức
            </h1>
            <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
              Quản lý các phòng ban và đội nhóm trong tổ chức. Bạn có thể sử dụng các nhóm này để phân quyền truy cập tài nguyên (Leads, Deals, Tasks...).
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddDept} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-black px-5 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors">
              <Plus className="h-4 w-4" /> Thêm Phòng ban
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[24px] border border-[#eaeaea] shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-[#eaeaea] flex items-center justify-between bg-gray-50/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Tìm kiếm phòng ban..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#eaeaea] rounded-full text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-200 transition-shadow"
              />
            </div>
          </div>

          <div className="divide-y divide-[#eaeaea]">
            {filteredDepts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-[14px]">
                Không có dữ liệu phòng ban nào.
              </div>
            ) : (
              filteredDepts.map(dept => {
                const isExpanded = expandedDepts[dept.id];
                return (
                  <div key={dept.id} className="group flex flex-col transition-colors">
                    {/* Department Row */}
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => toggleExpand(dept.id)} className="p-1 hover:bg-gray-200 rounded-md text-gray-400 transition-colors">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[15px] text-gray-900">{dept.name}</span>
                            {dept.code && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-mono font-medium tracking-wide">
                                {dept.code}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-[13px] text-gray-500">
                            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {dept.usersCount} thành viên</span>
                            <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> {dept.teamsCount} nhóm</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleAddTeam(dept.id)} className="h-8 px-3 text-[13px] font-medium text-gray-700 bg-white border border-[#eaeaea] rounded-lg hover:bg-gray-50 transition-colors">
                          Thêm nhóm
                        </button>
                        <button onClick={() => handleDeleteDept(dept.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Teams List (Expanded) */}
                    {isExpanded && dept.teams.length > 0 && (
                      <div className="bg-gray-50/50 border-t border-[#eaeaea] pl-14 pr-4 py-2 divide-y divide-[#eaeaea]/50">
                        {dept.teams.map(team => (
                          <div key={team.id} className="flex items-center justify-between py-3 group/team">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                              <span className="font-medium text-[14px] text-gray-800">{team.name}</span>
                              {team.code && (
                                <span className="px-2 py-0.5 bg-white border border-[#eaeaea] text-gray-500 rounded text-[11px] font-mono tracking-wide">
                                  {team.code}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="text-[13px] text-gray-500 flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5" /> {team._count.users}
                              </span>
                              <button onClick={() => handleDeleteTeam(team.id)} className="p-1.5 opacity-0 group-hover/team:opacity-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {isExpanded && dept.teams.length === 0 && (
                      <div className="bg-gray-50/50 border-t border-[#eaeaea] pl-14 py-4 text-[13px] text-gray-400 italic">
                        Chưa có nhóm nào trực thuộc phòng ban này.
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

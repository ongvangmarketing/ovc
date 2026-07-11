"use client";

import { useState, useTransition } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { updateMemberAccess } from "@/actions/members";
import { useRouter } from "next/navigation";

export function MemberAssignmentModal({
  user,
  roles,
  departments,
  onClose
}: {
  user: any;
  roles: any[];
  departments: any[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(user.role?.id || "");
  const [selectedDeptId, setSelectedDeptId] = useState<string>(user.department?.id || "");
  
  const initialTeamIds = user.teams.map((t: any) => t.id);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(initialTeamIds);

  const selectedDept = departments.find(d => d.id === selectedDeptId);
  const availableTeams = selectedDept?.teams || [];

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateMemberAccess(user.id, {
          roleId: selectedRoleId || null,
          departmentId: selectedDeptId || null,
          teamIds: selectedTeamIds,
        });
        alert("Cập nhật quyền thành công!");
        router.refresh();
        onClose();
      } catch (error: any) {
        alert(error.message || "Lỗi khi cập nhật");
      }
    });
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeptId(e.target.value);
    // Khi đổi phòng ban, reset lại teams (vì team phụ thuộc dept)
    setSelectedTeamIds([]);
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[24px] shadow-xl overflow-hidden">
        <header className="flex items-center justify-between p-6 border-b border-[#eaeaea]">
          <div>
            <h3 className="text-[18px] font-semibold text-gray-900">Phân quyền Thành viên</h3>
            <p className="text-[13px] text-gray-500 mt-1">{user.name} ({user.email})</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-6 space-y-6">
          {/* Chọn Vai trò */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Vai trò chính (Role)</label>
            <select 
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-200 transition-shadow appearance-none"
            >
              <option value="">-- Không chọn --</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
              ))}
            </select>
            <p className="text-[12px] text-gray-500 mt-1.5">Vai trò sẽ quyết định các tính năng thành viên được sử dụng.</p>
          </div>

          {/* Chọn Phòng ban */}
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Phòng ban (Department)</label>
            <select 
              value={selectedDeptId}
              onChange={handleDeptChange}
              className="w-full h-10 px-3 bg-white border border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-gray-200 transition-shadow appearance-none"
            >
              <option value="">-- Không chọn --</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Chọn Team */}
          <div className={cn("transition-opacity duration-300", !selectedDeptId && "opacity-50 pointer-events-none")}>
            <label className="block text-[13px] font-medium text-gray-700 mb-2">Nhóm trực thuộc (Teams)</label>
            <div className="border border-[#eaeaea] rounded-lg p-3 space-y-2 max-h-[160px] overflow-y-auto">
              {availableTeams.length === 0 ? (
                <div className="text-[13px] text-gray-500 italic p-2">Không có nhóm nào trong phòng ban này.</div>
              ) : (
                availableTeams.map((team: any) => (
                  <label key={team.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedTeamIds.includes(team.id)}
                      onChange={() => handleTeamToggle(team.id)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-[14px] text-gray-800">{team.name}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-[12px] text-gray-500 mt-1.5">Có thể chọn nhiều nhóm cùng lúc.</p>
          </div>
        </div>

        <footer className="p-4 border-t border-[#eaeaea] flex justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-medium text-gray-600 hover:text-black transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black text-[14px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu thay đổi
          </button>
        </footer>
      </div>
    </div>
  );
}

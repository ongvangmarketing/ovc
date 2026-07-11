"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Search, User as UserIcon, Building2, Users as UsersIcon, ChevronDown, Check, Loader2 } from "lucide-react";
import { getResourceAccess, grantResourceAccess, revokeResourceAccess, searchAssignees } from "@/actions/resource-access";

export function ShareResourceModal({
  resourceType,
  resourceId,
  resourceName,
  onClose
}: {
  resourceType: string;
  resourceId: string;
  resourceName: string;
  onClose: () => void;
}) {
  const [accessList, setAccessList] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{users: any[], depts: any[], teams: any[]}>({users:[], depts:[], teams:[]});
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const fetchAccess = async () => {
    setIsLoading(true);
    const data = await getResourceAccess(resourceType, resourceId);
    setAccessList(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAccess();
  }, [resourceType, resourceId]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults({users:[], depts:[], teams:[]});
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchAssignees(search);
      setSearchResults(results);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleGrant = (type: "USER"|"DEPARTMENT"|"TEAM", id: string, level: "VIEW"|"EDIT"|"FULL" = "VIEW") => {
    startTransition(async () => {
      await grantResourceAccess(resourceType, resourceId, type, id, level);
      setSearch("");
      await fetchAccess();
    });
  };

  const handleRevoke = (id: string) => {
    startTransition(async () => {
      await revokeResourceAccess(id);
      await fetchAccess();
    });
  };

  const handleLevelChange = (id: string, type: "USER"|"DEPARTMENT"|"TEAM", assigneeId: string, level: "VIEW"|"EDIT"|"FULL") => {
    startTransition(async () => {
      await grantResourceAccess(resourceType, resourceId, type, assigneeId, level);
      await fetchAccess();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[24px] shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <header className="flex items-center justify-between p-5 border-b border-[#eaeaea]">
          <div>
            <h3 className="text-[16px] font-semibold text-gray-900">Chia sẻ {resourceName}</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Thêm người, nhóm hoặc phòng ban</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Search Input */}
        <div className="p-4 border-b border-[#eaeaea] relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Gõ tên email, tên người, hoặc phòng ban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 bg-gray-50 border border-transparent focus:bg-white focus:border-[#eaeaea] rounded-lg text-[14px] focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
            />
          </div>

          {/* Search Dropdown */}
          {search.trim() && (
            <div className="absolute left-4 right-4 top-full mt-2 bg-white border border-[#eaeaea] rounded-xl shadow-lg z-10 max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
              {searchResults.users.length === 0 && searchResults.depts.length === 0 && searchResults.teams.length === 0 && (
                <div className="p-3 text-[13px] text-gray-500 text-center">Không tìm thấy kết quả phù hợp.</div>
              )}
              
              {searchResults.users.map(u => (
                <button key={u.id} onClick={() => handleGrant("USER", u.id)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-gray-900">{u.name}</div>
                    <div className="text-[12px] text-gray-500">{u.email}</div>
                  </div>
                </button>
              ))}

              {searchResults.depts.map(d => (
                <button key={d.id} onClick={() => handleGrant("DEPARTMENT", d.id)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors">
                  <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-gray-900">{d.name}</div>
                    <div className="text-[12px] text-gray-500">Phòng ban</div>
                  </div>
                </button>
              ))}

              {searchResults.teams.map(t => (
                <button key={t.id} onClick={() => handleGrant("TEAM", t.id)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors">
                  <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <UsersIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-gray-900">{t.name}</div>
                    <div className="text-[12px] text-gray-500">Nhóm</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Access List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h4 className="text-[13px] font-medium text-gray-500 mb-2 px-1">Những người có quyền truy cập</h4>
          
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>
          ) : accessList.length === 0 ? (
            <div className="text-center p-6 text-[13px] text-gray-400 italic">Chưa chia sẻ cho ai. Chỉ người tạo mới có quyền.</div>
          ) : (
            accessList.map(access => {
              const entityName = access.user?.name || access.department?.name || access.team?.name;
              const entityEmail = access.user?.email || (access.department ? "Phòng ban" : "Nhóm");
              const entityType = access.user ? "USER" : access.department ? "DEPARTMENT" : "TEAM";
              const entityId = access.userId || access.departmentId || access.teamId;
              
              return (
                <div key={access.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                      entityType === "USER" ? "bg-gray-200" : entityType === "DEPARTMENT" ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"
                    }`}>
                      {entityType === "USER" ? (
                        <span className="text-sm font-medium text-gray-600">{entityName?.charAt(0)}</span>
                      ) : entityType === "DEPARTMENT" ? (
                        <Building2 className="h-4 w-4" />
                      ) : (
                        <UsersIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-gray-900">{entityName}</div>
                      <div className="text-[12px] text-gray-500">{entityEmail}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select 
                      value={access.permissionLevel}
                      onChange={(e) => handleLevelChange(access.id, entityType, entityId, e.target.value as any)}
                      className="text-[13px] bg-transparent font-medium text-gray-600 focus:outline-none cursor-pointer hover:bg-gray-100 py-1.5 px-2 rounded-md appearance-none"
                    >
                      <option value="VIEW">Chỉ xem (View)</option>
                      <option value="EDIT">Có thể sửa (Edit)</option>
                      <option value="FULL">Toàn quyền (Full)</option>
                    </select>
                    
                    <button 
                      onClick={() => handleRevoke(access.id)}
                      className="text-[13px] text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
                    >
                      Gỡ
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <footer className="p-4 border-t border-[#eaeaea] bg-gray-50/50 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-full bg-black text-[14px] font-medium text-white hover:bg-gray-800 transition-colors">
            Hoàn tất
          </button>
        </footer>
      </div>
    </div>
  );
}

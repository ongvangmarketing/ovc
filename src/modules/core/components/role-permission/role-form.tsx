"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Save, ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";
import { createRole, updateRole } from "@/actions/roles";
import { DataScope } from "@prisma/client";

const DATA_SCOPES = [
  { value: "ORGANIZATION", label: "Toàn bộ tổ chức", description: "Có quyền truy cập toàn bộ dữ liệu của tổ chức." },
  { value: "DEPARTMENT", label: "Phòng ban", description: "Chỉ truy cập dữ liệu của phòng ban (bao gồm các phòng ban con)." },
  { value: "TEAM", label: "Nhóm (Team)", description: "Chỉ truy cập dữ liệu của nhóm đang tham gia." },
  { value: "ASSIGNED", label: "Được giao (Assigned)", description: "Chỉ truy cập dữ liệu được giao trực tiếp." },
  { value: "SELF", label: "Cá nhân (Self)", description: "Chỉ xem dữ liệu do chính mình tạo ra." },
];

export type PermissionGroup = {
  group: string;
  permissions: { action: string; label: string }[];
};

export type RoleFormData = {
  name: string;
  code: string;
  description: string;
  priority: number;
  dataScope: string;
  status: string;
  parentId: string;
  permissionActions: string[];
};

export function RoleForm({ 
  isEdit = false, 
  roleId, 
  initialData, 
  availablePermissions 
}: { 
  isEdit?: boolean; 
  roleId?: string; 
  initialData?: RoleFormData;
  availablePermissions: PermissionGroup[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    description: initialData?.description || "",
    priority: initialData?.priority || 0,
    dataScope: initialData?.dataScope || "ORGANIZATION",
    status: initialData?.status || "ACTIVE",
    parentId: initialData?.parentId || "",
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    initialData?.permissionActions || []
  );

  const togglePermission = (action: string) => {
    setSelectedPermissions(prev => 
      prev.includes(action) ? prev.filter(p => p !== action) : [...prev, action]
    );
  };

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      alert("Vui lòng nhập Tên và Mã vai trò");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          priority: formData.priority,
          dataScope: formData.dataScope as DataScope,
          parentId: formData.parentId || undefined,
          permissions: selectedPermissions,
        };

        if (isEdit && roleId) {
          await updateRole(roleId, payload);
          alert("Cập nhật Vai trò thành công!");
        } else {
          await createRole(payload);
          alert("Tạo Vai trò thành công!");
        }
        router.push("/workspace/settings/roles-permissions/roles");
      } catch (error: any) {
        alert(error.message || "Đã có lỗi xảy ra");
      }
    });
  };

  return (
    <div className="p-8 md:p-12 h-full bg-white font-sans animate-in fade-in duration-300">
      <div className="max-w-[1000px] mx-auto">
        <header className="mb-8 flex items-center justify-between border-b border-[#eaeaea] pb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/workspace/settings/roles-permissions/roles"
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-[28px] font-medium tracking-tight text-black leading-none">
                {isEdit ? "Chỉnh sửa Vai trò" : "Tạo Vai trò mới"}
              </h1>
              {isEdit && <p className="text-[14px] text-gray-500 mt-2">Mã: {formData.code}</p>}
            </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu cấu hình
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Thông tin cơ bản */}
          <div className="lg:col-span-1 space-y-6">
            <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-medium text-black mb-5">Thông tin cơ bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Tên vai trò *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="VD: Sales Manager"
                    className="w-full h-10 px-3 rounded-xl border border-[#eaeaea] text-[14px] focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Mã Code * (Viết liền không dấu)</label>
                  <input 
                    type="text" 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value})}
                    placeholder="VD: SALES_MANAGER"
                    className="w-full h-10 px-3 rounded-xl border border-[#eaeaea] text-[14px] uppercase focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Mô tả</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="Mô tả chức năng của vai trò này..."
                    className="w-full p-3 rounded-xl border border-[#eaeaea] text-[14px] focus:outline-none focus:border-gray-400 resize-none"
                  />
                </div>
                
                <div className="pt-2">
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Độ ưu tiên (Priority)</label>
                  <input 
                    type="number" 
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                    className="w-full h-10 px-3 rounded-xl border border-[#eaeaea] text-[14px] focus:outline-none focus:border-gray-400"
                  />
                  <p className="text-[12px] text-gray-500 mt-1">Số càng lớn quyền lực càng cao (0-100).</p>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm">
              <h2 className="text-[16px] font-medium text-black mb-5">Cấu hình nâng cao</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Phạm vi Dữ liệu (Data Scope)</label>
                  <select 
                    value={formData.dataScope}
                    onChange={e => setFormData({...formData, dataScope: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-[#eaeaea] text-[14px] focus:outline-none focus:border-gray-400 bg-white"
                  >
                    {DATA_SCOPES.map(scope => (
                      <option key={scope.value} value={scope.value}>{scope.label}</option>
                    ))}
                  </select>
                  <p className="text-[12px] text-gray-500 mt-1.5">
                    {DATA_SCOPES.find(s => s.value === formData.dataScope)?.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#eaeaea]">
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Kế thừa Vai trò</label>
                  <select 
                    value={formData.parentId}
                    onChange={e => setFormData({...formData, parentId: e.target.value})}
                    className="w-full h-10 px-3 rounded-xl border border-[#eaeaea] text-[14px] focus:outline-none focus:border-gray-400 bg-white"
                  >
                    <option value="">-- Không kế thừa --</option>
                    <option value="3">Administrator</option>
                    <option value="1">Super Admin</option>
                  </select>
                  <p className="text-[12px] text-gray-500 mt-1.5">
                    Vai trò này sẽ tự động có tất cả các quyền của vai trò được kế thừa.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Cột phải: Permission Matrix */}
          <div className="lg:col-span-2">
            <section className="rounded-[24px] border border-[#eaeaea] bg-white p-6 shadow-sm min-h-full">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-medium text-black flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-emerald-600" /> Quyền hạn (Permissions)
                  </h2>
                  <p className="text-[14px] text-gray-500 mt-1">Chọn các Action được phép thực thi trong hệ thống.</p>
                </div>
                <div className="text-[13px] font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                  Đã chọn: {selectedPermissions.length} quyền
                </div>
              </div>

              <div className="space-y-6">
                {availablePermissions.map(group => {
                  const allInGroup = group.permissions.every(p => selectedPermissions.includes(p.action));
                  
                  const toggleGroup = () => {
                    if (allInGroup) {
                      const actionsToRemove = group.permissions.map(p => p.action);
                      setSelectedPermissions(prev => prev.filter(p => !actionsToRemove.includes(p)));
                    } else {
                      const actionsToAdd = group.permissions.map(p => p.action);
                      setSelectedPermissions(prev => Array.from(new Set([...prev, ...actionsToAdd])));
                    }
                  };

                  return (
                    <div key={group.group} className="rounded-xl border border-[#eaeaea] overflow-hidden">
                      <div className="bg-gray-50/80 px-4 py-3 border-b border-[#eaeaea] flex items-center justify-between">
                        <strong className="text-[14px] font-medium text-black uppercase tracking-wider">{group.group}</strong>
                        <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer hover:text-black">
                          <input 
                            type="checkbox" 
                            checked={allInGroup}
                            onChange={toggleGroup}
                            className="rounded border-gray-300 text-black focus:ring-black"
                          />
                          Chọn tất cả
                        </label>
                      </div>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {group.permissions.map(perm => (
                          <label 
                            key={perm.action}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                              selectedPermissions.includes(perm.action) 
                                ? "border-black bg-gray-50" 
                                : "border-[#eaeaea] hover:bg-gray-50 hover:border-gray-300"
                            )}
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedPermissions.includes(perm.action)}
                              onChange={() => togglePermission(perm.action)}
                              className="mt-0.5 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <div>
                              <strong className="block text-[14px] font-medium text-black">{perm.label}</strong>
                              <code className="text-[11px] text-gray-500 mt-0.5 block">{perm.action}</code>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

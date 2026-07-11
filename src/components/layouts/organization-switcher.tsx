"use client";

import { useState } from "react";
import { Building, ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";

import { switchOrganization } from "@/actions/organizations";

type OrganizationOption = {
  id: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
};

export function OrganizationSwitcher({ 
  organizations, 
  activeOrgId,
  isSuperAdmin = false 
}: { 
  organizations: OrganizationOption[], 
  activeOrgId?: string,
  isSuperAdmin?: boolean 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0] || { name: "Ong Vàng Workspace", id: "default" };
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOrganizations = normalizedQuery
    ? organizations.filter((org) => `${org.name} ${org.slug || ""}`.toLowerCase().includes(normalizedQuery))
    : organizations;

  const handleSwitch = async (orgId: string) => {
    if (orgId === activeOrg?.id) {
      setIsOpen(false);
      return;
    }
    try {
      const result = await switchOrganization(orgId);
      if (!result.success) {
        throw new Error(result.error || "Không thể chuyển workspace");
      }
      setIsOpen(false);
      setQuery("");
      router.refresh();
      window.location.assign("/workspace");
    } catch (e: unknown) {
      console.error("Failed to switch org:", e);
      alert("Không thể chuyển công ty: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const canSwitch = isSuperAdmin || organizations.length > 1;

  return (
    <div className="relative">
      <button 
        onClick={() => canSwitch && setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 items-center gap-2 rounded-md border border-[#eaeaea] bg-white px-3 text-black transition-colors",
          canSwitch ? "cursor-pointer hover:border-gray-300 hover:bg-gray-50" : "cursor-default"
        )}
      >
        {activeOrg?.logo ? (
          <img src={activeOrg.logo} alt="" className="h-4 w-4 rounded object-contain" />
        ) : (
          <Building className="w-4 h-4 text-gray-500" />
        )}
        <span className="max-w-[180px] truncate text-sm font-medium text-black">
          {activeOrg?.name || "Chọn Công ty"}
        </span>
        {canSwitch && <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && canSwitch ? (
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-white/90 p-6 backdrop-blur-sm">
          <div className="flex max-h-[min(760px,calc(100dvh-48px))] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-[#eaeaea] px-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Workspace</p>
                <h2 className="mt-1 text-[24px] font-medium tracking-tight text-black">Chọn công ty</h2>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-[#eaeaea] bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 overflow-y-auto px-6 py-6">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
                placeholder="Tìm theo tên công ty hoặc slug..."
                className="h-12 w-full rounded-md border border-[#eaeaea] bg-white pl-11 pr-4 text-[15px] text-black outline-none transition-colors placeholder:text-gray-400 focus:border-black"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#eaeaea] bg-white">
              <div className="grid grid-cols-[1fr_auto] border-b border-[#eaeaea] px-5 py-3 text-[11px] font-medium uppercase tracking-widest text-gray-400">
                <span>Các công ty</span>
                <span>Trạng thái</span>
              </div>
              <div className="divide-y divide-[#eaeaea]">
                {filteredOrganizations.length > 0 ? filteredOrganizations.map(org => (
                  <button
                    key={org.id}
                    onClick={() => handleSwitch(org.id)}
                    className="group grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#eaeaea] bg-white">
                        {org.logo ? <img src={org.logo} alt="" className="h-6 w-6 rounded object-contain" /> : <Building className="h-5 w-5 text-gray-500" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-medium text-black">{org.name}</span>
                        <span className="block truncate text-[13px] text-gray-500">{org.slug || "Không có slug"}</span>
                      </span>
                    </div>
                    {org.id === activeOrg?.id ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-black">
                        <Check className="h-3.5 w-3.5" />
                        Đang chọn
                      </span>
                    ) : (
                      <span className="text-[13px] font-medium text-gray-400 group-hover:text-black">Chọn</span>
                    )}
                  </button>
                )) : (
                  <div className="px-5 py-12 text-center">
                    <p className="text-[15px] font-medium text-black">Không tìm thấy công ty</p>
                    <p className="mt-1 text-sm text-gray-500">Thử nhập tên khác hoặc xoá bộ lọc tìm kiếm.</p>
                  </div>
                )}
              </div>
            </div>

            {isSuperAdmin ? (
              <button
                onClick={() => router.push("/super-admin/organizations")}
                className="mt-6 rounded-full bg-black px-6 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-gray-800"
              >
                Quản lý công ty
              </button>
            ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Building, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useRouter } from "next/navigation";

import { switchOrganization } from "@/app/actions/organizations";

type OrganizationOption = {
  id: string;
  name: string;
  slug?: string | null;
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
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const activeOrg = organizations.find(o => o.id === activeOrgId) || organizations[0] || { name: "Ong Vàng Workspace", id: "default" };

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
      router.refresh();
      window.location.assign("/workspace/dashboard");
    } catch (e: unknown) {
      console.error("Failed to switch org:", e);
      alert("Không thể chuyển công ty: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  const canSwitch = isSuperAdmin || organizations.length > 1;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => canSwitch && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-colors",
          canSwitch ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"
        )}
      >
        <Building className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
          {activeOrg?.name || "Chọn Công ty"}
        </span>
        {canSwitch && <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isOpen && canSwitch && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Các Công ty
          </div>
          {organizations.map(org => (
            <button
              key={org.id}
              onClick={() => handleSwitch(org.id)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between group"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {org.name}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[200px]">
                  {org.slug}
                </span>
              </div>
              {org.id === activeOrg?.id && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          ))}
          {isSuperAdmin && (
            <div className="border-t border-gray-100 mt-1">
              <button 
                onClick={() => router.push("/super-admin/organizations")}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium transition-colors"
              >
                + Quản lý Công ty
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

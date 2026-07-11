"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleAgentPermissionAction } from "@/modules/traveling/actions/traveling.actions";
import { cn } from "@/lib/utils/cn";

export function AgentPermissionToggle({
  memberId,
  permissionCode,
  isEnabled,
}: {
  memberId: string;
  permissionCode: string;
  isEnabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const res = await toggleAgentPermissionAction(memberId, permissionCode);
        if (!res.success || !('nextPermissions' in res)) throw new Error(('error' in res ? (res as any).error : null) || 'Lỗi không xác định');
        toast.success("Đã cập nhật quyền Đại lý");
      } catch (err: any) {
        toast.error(err.message || "Có lỗi xảy ra");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50 ${
        isEnabled ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span className="sr-only">Toggle permission</span>
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          isEnabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

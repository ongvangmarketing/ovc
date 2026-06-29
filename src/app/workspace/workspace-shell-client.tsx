"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Sidebar } from "@/components/layouts/sidebar";
import { Topbar } from "@/components/layouts/topbar";
import type { PlatformModuleCode } from "@/lib/modules/registry";

export function WorkspaceShellClient({
  children,
  switcher,
  enabledModuleCodes,
}: {
  children: ReactNode;
  switcher: ReactNode;
  enabledModuleCodes: PlatformModuleCode[];
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="workspace-shell flex min-h-screen overflow-x-hidden p-5">
      <div className="workspace-frame flex min-h-[calc(100dvh-2.5rem)] flex-1 rounded-[22px]">
        <Sidebar
          enabledModuleCodes={enabledModuleCodes}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <Topbar
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          >
            {switcher}
          </Topbar>
          <main className="scrollable flex-1 bg-white">{children}</main>
        </div>
      </div>
    </div>
  );
}

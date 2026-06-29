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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="workspace-shell flex min-h-screen overflow-x-hidden p-0 sm:p-5">
      <div className="workspace-frame flex min-w-0 flex-1 rounded-[18px] sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-[22px]">
        {mobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Đóng menu"
            className="fixed inset-0 z-[290] bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        ) : null}
        <Sidebar
          enabledModuleCodes={enabledModuleCodes}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onMobileNavigate={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <Topbar
            sidebarCollapsed={sidebarCollapsed}
            mobileSidebarOpen={mobileSidebarOpen}
            onToggleSidebar={() => {
              if (window.matchMedia("(max-width: 1023px)").matches) {
                setMobileSidebarOpen((current) => !current);
                return;
              }
              setSidebarCollapsed((current) => !current);
            }}
          >
            {switcher}
          </Topbar>
          <main className="scrollable flex-1 bg-white">{children}</main>
        </div>
      </div>
    </div>
  );
}

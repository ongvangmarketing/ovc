"use client";

import type { ReactNode, SetStateAction } from "react";
import { useState } from "react";

import { Sidebar } from "@/components/layouts/sidebar";
import { Topbar } from "@/components/layouts/topbar";
import type { PlatformModuleCode } from "@/lib/modules/registry";

const SIDEBAR_COLLAPSED_COOKIE = "ovc_sidebar_collapsed";

export function WorkspaceShellClient({
  children,
  switcher,
  enabledModuleCodes,
  brand,
  currentUser,
  initialSidebarCollapsed = false,
}: {
  children: ReactNode;
  switcher: ReactNode;
  enabledModuleCodes: PlatformModuleCode[];
  brand?: { name?: string | null; logo?: string | null };
  currentUser?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null };
  initialSidebarCollapsed?: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const updateSidebarCollapsed = (next: SetStateAction<boolean>) => {
    setSidebarCollapsed((current) => {
      const value = typeof next === "function" ? next(current) : next;
      document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
      return value;
    });
  };

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
          brand={brand}
          currentUser={currentUser}
          collapsed={sidebarCollapsed}
          onCollapsedChange={updateSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onMobileNavigate={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-white">
          <Topbar
            brand={brand}
            currentUser={currentUser}
            sidebarCollapsed={sidebarCollapsed}
            mobileSidebarOpen={mobileSidebarOpen}
            onToggleSidebar={() => {
              if (window.matchMedia("(max-width: 1023px)").matches) {
                setMobileSidebarOpen((current) => !current);
                return;
              }
              updateSidebarCollapsed((current) => !current);
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

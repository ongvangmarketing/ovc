"use client";

import type { ReactNode, SetStateAction } from "react";
import { useState } from "react";

import { Sidebar } from "@/components/layouts/sidebar";
import { Topbar } from "@/components/layouts/topbar";
import { MobileBottomNav } from "@/components/layouts/mobile-bottom-nav";
import type { PlatformModuleCode } from "@/lib/modules/registry";
import { ContextualAIPanel } from "@/modules/ai/components/contextual-ai-panel";
import type { AppLauncherPreferences } from "@/modules/core/types/app-launcher.types";

const SIDEBAR_COLLAPSED_COOKIE = "ovc_sidebar_collapsed";

export function WorkspaceShellClient({
  children,
  switcher,
  enabledModuleCodes,
  launcherPreferences,
  brand,
  currentUser,
  initialSidebarCollapsed = false,
}: {
  children: ReactNode;
  switcher: ReactNode;
  enabledModuleCodes: PlatformModuleCode[];
  launcherPreferences: AppLauncherPreferences;
  brand?: { name?: string | null; logo?: string | null };
  currentUser?: { name?: string | null; email?: string | null; image?: string | null; role?: string | null; organizationId?: string | null };
  initialSidebarCollapsed?: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialSidebarCollapsed);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const updateSidebarCollapsed = (next: SetStateAction<boolean>) => {
    setSidebarCollapsed((current) => {
      const value = typeof next === "function" ? next(current) : next;
      document.cookie = `${SIDEBAR_COLLAPSED_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
      return value;
    });
  };

  return (
    <div className="workspace-shell flex h-[100dvh] overflow-hidden bg-[#F4F5F7] lg:bg-white">
      <div className="workspace-frame flex min-w-0 flex-1 h-full overflow-hidden">
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
          launcherPreferences={launcherPreferences}
          brand={brand}
          currentUser={currentUser}
          switcher={switcher}
          collapsed={sidebarCollapsed}
          onCollapsedChange={updateSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onMobileNavigate={() => setMobileSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-white h-full overflow-hidden md:pb-0 pb-16">
          <Topbar
            brand={brand}
            currentUser={currentUser}
            sidebarCollapsed={sidebarCollapsed}
            mobileSidebarOpen={mobileSidebarOpen}
            enabledModuleCodes={enabledModuleCodes}
            launcherPreferences={launcherPreferences}
            onToggleSidebar={() => {
              if (window.matchMedia("(max-width: 1023px)").matches) {
                setMobileSidebarOpen((current) => !current);
              }
            }}
          />
          {currentUser?.role === "SUPER_ADMIN" ? <ContextualAIPanel /> : null}
          <main className="scrollable flex-1 relative bg-white min-h-0 flex flex-col overflow-y-auto overscroll-none">
            {/* Blurred Grid Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:44px_44px] md:bg-[size:64px_64px]" />
            {/* White radial overlay to fade out grid in the center */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,white_20%,transparent_70%)]" />
            
            <div className="relative z-10 flex flex-col flex-1 min-h-0">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      <MobileBottomNav 
        enabledModuleCodes={enabledModuleCodes}
        launcherPreferences={launcherPreferences}
        onOpenApps={() => {
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("open-mobile-apps"));
        }}
        onOpenProfile={() => {
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("open-mobile-profile"));
        }}
        onOpenNotifications={() => {
          if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("open-mobile-notifications"));
        }}
      />
    </div>
  );
}

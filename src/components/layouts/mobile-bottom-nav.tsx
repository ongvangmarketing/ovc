"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3x3, LayoutDashboard, MessageSquare, Bell, User as UserIcon, Folder } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { moduleDefinitions, type PlatformModuleCode } from "@/lib/modules/registry";
import type { AppLauncherPreferences } from "@/modules/core/types/app-launcher.types";

export function MobileBottomNav({
  unreadNotificationsCount = 0,
  unreadMessagesCount = 0,
  onOpenApps,
  onOpenProfile,
  onOpenNotifications,
  enabledModuleCodes = [],
  launcherPreferences,
}: {
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
  onOpenApps?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  enabledModuleCodes?: PlatformModuleCode[];
  launcherPreferences?: AppLauncherPreferences;
}) {
  const pathname = usePathname();

  // Load modules based on codes
  const moduleItems = useMemo(() => {
    return enabledModuleCodes
      .map((code) => moduleDefinitions.find((m) => m.code === code))
      .filter((m): m is NonNullable<typeof m> => m !== undefined);
  }, [enabledModuleCodes]);

  // Compute up to 4 pinned items
  const pinnedItems = useMemo(() => {
    const items = [...moduleItems];
    const itemByKey = new Map<string, any>();
    
    // Populate map with Level 1 (by code) and Level 2 (by href)
    items.forEach(item => {
      // Level 1 item
      itemByKey.set(item.code, {
        code: item.code,
        label: item.nav?.label || item.name,
        href: item.nav?.href || "",
        icon: item.nav?.icon
      });
      
      // Level 2 items
      if (item.nav?.children) {
        item.nav.children.forEach(child => {
          if (child.href) {
            itemByKey.set(child.href, {
              code: item.code, // keep parent code for badges
              label: child.label,
              href: child.href,
              icon: child.icon
            });
          }
        });
      }
    });

    let topKeys: string[] = [];
    
    if (launcherPreferences?.bottomNavOrder && launcherPreferences.bottomNavOrder.length > 0) {
      // Use explicitly defined bottomNavOrder, up to 4 items
      topKeys = launcherPreferences.bottomNavOrder.filter(key => itemByKey.has(key)).slice(0, 4);
    } else {
      // Fallback to Dashboard + top 3 visible items from App Launcher
      const orderedCodes = [
        ...(launcherPreferences?.order ?? []).filter((key) => itemByKey.has(key)),
        ...items.map((item) => item.code).filter((key) => !(launcherPreferences?.order ?? []).includes(key)),
      ];
      const hidden = new Set(launcherPreferences?.hidden ?? []);
      const visibleKeys = orderedCodes.filter(key => !hidden.has(key) && key !== "DASHBOARD");
      topKeys = ["DASHBOARD", ...visibleKeys.slice(0, 3)];
    }
    
    // Final fallback if everything is empty
    if (topKeys.length === 0) topKeys = ["DASHBOARD", "SETTINGS"].filter(key => itemByKey.has(key));
    
    return topKeys.map(key => itemByKey.get(key)).filter(Boolean);
  }, [moduleItems, launcherPreferences]);

  const navItems = useMemo(() => {
    const middleItems = pinnedItems.map(item => ({
      label: item.label,
      href: item.href,
      icon: item.icon ? ({ className }: { className?: string }) => <span className={cn("flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:stroke-[1.5]", className)}>{item.icon}</span> : Folder,
      isActive: pathname === item.href || (item.href !== "/workspace" && item.href !== "/workspace/dashboard" && pathname.startsWith(item.href)),
      badge: item.code === "CHAT" ? unreadMessagesCount : item.code === "ACCOUNT" ? unreadNotificationsCount : undefined,
    }));

    const endItems = [
      {
        label: "Ứng dụng",
        onClick: onOpenApps,
        icon: Grid3x3,
        isActive: false,
      },
    ];

    // Ensure we only have max 5 items total (4 pinned + 1 apps)
    return [...middleItems.slice(0, 4), ...endItems];
  }, [pathname, pinnedItems, onOpenApps, unreadMessagesCount, unreadNotificationsCount]);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[300] bg-white border-t border-[#eaeaea] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const content = (
            <>
              <div className="relative">
                <Icon className={cn("h-6 w-6 stroke-[1.5]", item.isActive ? "text-blue-600" : "text-slate-500")} />
                {!!item.badge && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-1 ring-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] mt-1 font-medium", item.isActive ? "text-blue-600" : "text-slate-500")}>
                {item.label}
              </span>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={i}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full"
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={i}
              onClick={item.onClick}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

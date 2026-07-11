export type AppLauncherPreferences = {
  version: 1;
  order: string[];
  hidden: string[];
  bottomNavOrder?: string[];
};

export const DEFAULT_APP_LAUNCHER_PREFERENCES: AppLauncherPreferences = {
  version: 1,
  order: [],
  hidden: ["AUTOMATION", "SERVICES"],
  bottomNavOrder: ["CHAT", "ACCOUNT"],
};

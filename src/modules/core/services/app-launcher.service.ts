import { AppLauncherRepository } from "../repositories/app-launcher.repository";
import {
  DEFAULT_APP_LAUNCHER_PREFERENCES,
  type AppLauncherPreferences,
} from "../types/app-launcher.types";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export class AppLauncherService {
  static normalizePreferences(
    value: unknown,
    allowedCodes?: string[],
  ): AppLauncherPreferences {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return DEFAULT_APP_LAUNCHER_PREFERENCES;
    }

    const raw = value as Record<string, unknown>;
    const isCurrentVersion = raw.version === 1;
    const allowed = allowedCodes ? new Set(allowedCodes) : null;
    const uniqueAllowed = (items: string[]) =>
      [...new Set(items)].filter((code) => !allowed || allowed.has(code));

    return {

      version: 1,
      order: uniqueAllowed(isStringArray(raw.order) ? raw.order : []),
      hidden: uniqueAllowed(
        isCurrentVersion && isStringArray(raw.hidden)
          ? raw.hidden
          : [...DEFAULT_APP_LAUNCHER_PREFERENCES.hidden, ...(isStringArray(raw.hidden) ? raw.hidden : [])],
      ),
      bottomNavOrder: isStringArray(raw.bottomNavOrder) ? raw.bottomNavOrder : DEFAULT_APP_LAUNCHER_PREFERENCES.bottomNavOrder,
    };
  }

  static async getPreferences(userId: string, organizationId: string) {
    const member = await AppLauncherRepository.findPreferences(userId, organizationId);
    return this.normalizePreferences(member?.launcherPreferences);
  }

  static async savePreferences(
    userId: string,
    organizationId: string,
    value: unknown,
    allowedCodes: string[],
  ) {
    const preferences = this.normalizePreferences(value, allowedCodes);
    await AppLauncherRepository.savePreferences(userId, organizationId, preferences);
    return preferences;
  }
}

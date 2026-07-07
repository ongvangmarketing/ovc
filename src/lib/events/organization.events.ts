import { revalidateTag } from "next/cache";

/**
 * Event triggers to invalidate Next.js cache and synchronize modules
 * when Organization Hub settings are changed.
 */
export const OrganizationEvents = {
  /**
   * Fired when the organization profile is updated
   */
  profileUpdated(organizationId: string) {
    // @ts-ignore
    revalidateTag('organization-profile');
    // We could emit a real node event here if we had long-running background workers
  },

  /**
   * Fired when brand identity is changed
   */
  brandUpdated(organizationId: string) {
    // @ts-ignore
    revalidateTag('organization-brand');
  },

  /**
   * Fired when locales, timezone or currency is changed
   */
  localeUpdated(organizationId: string) {
    // @ts-ignore
    revalidateTag('organization-locale');
  },

  /**
   * Fired when a module is enabled or disabled
   */
  moduleLicenseChanged(organizationId: string, moduleKey: string) {
    // @ts-ignore
    revalidateTag('organization-modules');
  },

  /**
   * Fired when workflows are updated
   */
  workflowUpdated(organizationId: string, moduleKey: string) {
    // @ts-ignore
    revalidateTag('organization-workflow');
  }
};

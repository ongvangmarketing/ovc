import { getTenantDb } from "@/lib/db";

export class OrganizationService {
  /**
   * Get basic Organization info (fallback to main organization record if profile not found)
   */
  static async getProfile(organizationId: string) {
      const profile = await getTenantDb().organizationProfile.findUnique({
        where: { organizationId },
      });
      if (profile) return profile;

      const org = await getTenantDb().organization.findUnique({
        where: { id: organizationId },
      });
      if (!org) return null;

      // Temporary fallback mapping
      return {
        organizationId: org.id,
        logo: org.logo,
        favicon: null,
        coverImage: null,
        slogan: org.description,
        address: org.address,
        ward: null,
        district: null,
        province: null,
        country: null,
        postalCode: null,
        latitude: null,
        longitude: null,
        googleMapUrl: null,
        businessLicense: null,
        representativeName: null,
        representativeTitle: null,
        representativePhone: org.phone,
        representativeEmail: org.email,
      };
    }

  /**
   * Get Brand identity settings
   */
  static async getBrand(organizationId: string) {
      const brand = await getTenantDb().organizationBrand.findUnique({
        where: { organizationId },
      });
      return brand || {
        primaryColor: '#F59E0B',
        secondaryColor: '#3B82F6',
        accentColor: '#10B981',
        fontFamily: 'var(--font-sans)',
        borderRadius: '0.5rem',
        buttonStyle: 'solid',
        iconStyle: 'solid',
        themeMode: 'light',
        customCss: '',
      };
    }

  /**
   * Get formatting rules and timezone
   */
  static async getLocale(organizationId: string) {
      const locale = await getTenantDb().organizationLocale.findUnique({
        where: { organizationId },
      });
      return locale || {
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi',
        currency: 'VND',
        currencySymbol: '₫',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm',
        firstDayOfWeek: '1',
      };
    }

  /**
   * Get all active modules for the organization
   */
  static async getModules(organizationId: string) {
      const modules = await getTenantDb().organizationModule.findMany({
        where: { organizationId, status: 'ACTIVE' },
      });
      if (modules.length > 0) return modules.map(m => m.moduleKey);

      // Fallback to old activeModules array
      const org = await getTenantDb().organization.findUnique({
        where: { id: organizationId },
        select: { activeModules: true }
      });
      return org?.activeModules || [];
    }

  /**
   * Get specific workflow
   */
  static async getWorkflow(organizationId: string, moduleKey: string, workflowKey: string) {
      const workflow = await getTenantDb().organizationWorkflow.findUnique({
        where: { organizationId_moduleKey_workflowKey: { organizationId, moduleKey, workflowKey } }
      });
      return workflow;
    }

  /**
   * Determine if a feature is enabled based on module licensing
   */
  static async hasModuleAccess(organizationId: string, moduleKey: string): Promise<boolean> {
    const activeModules = await this.getModules(organizationId);
    return activeModules.includes(moduleKey);
  }
}

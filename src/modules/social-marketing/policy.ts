import "server-only";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { organizationHasModule } from "@/lib/modules/entitlements";

export async function requireSocialMarketingAccess(options?: { write?: boolean; provider?: "FACEBOOK" }) {
  const session = await requireAuth();
  const organizationId = session.organizationId;
  if (!(await organizationHasModule(organizationId, "SOCIAL_MARKETING"))) {
    throw new Error("Module Social Marketing chưa được kích hoạt.");
  }

  const license = await db.organizationModuleLicense.findFirst({
    where: {
      organizationId,
      enabled: true,
      status: { in: ["ACTIVE", "TRIALING"] },
      module: { code: "SOCIAL_MARKETING", status: "ACTIVE" },
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { features: true, limits: true, settings: true },
  });
  if (!license) throw new Error("License Social Marketing không còn hiệu lực.");

  const features = (license.features || {}) as Record<string, unknown>;
  const settings = (license.settings || {}) as { providers?: Record<string, { enabled?: boolean }> };
  if (features.REPORT === false) throw new Error("Tính năng Marketing Report chưa được cấp.");
  if (options?.provider && settings.providers?.[options.provider]?.enabled === false) {
    throw new Error(`Nhà cung cấp ${options.provider} chưa được cấp.`);
  }

  if (options?.write && !["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(session.user.role || "")) {
    throw new Error("Bạn không có quyền thay đổi Social Marketing.");
  }

  return { session, organizationId, limits: (license.limits || {}) as Record<string, number> };
}


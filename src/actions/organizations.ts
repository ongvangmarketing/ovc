"use server";

import { getTenantDb } from "@/lib/db";
import { requireAuth, requireSuperAdmin } from "@/lib/auth/rbac";
import { defaultModuleCodes, normalizeModuleCode, type PlatformModuleCode } from "@/lib/modules/registry";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { updateCompanySettings } from "./settings";
import { OrganizationEvents } from "@/lib/events/organization.events";

const LICENSE_STATUSES = ["ACTIVE", "TRIALING", "SUSPENDED", "EXPIRED", "CANCELLED"] as const;

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function selectedModules(formData: FormData, key = "licensedModules") {
  const values = [
    ...formData.getAll(key),
    ...formData.getAll("activeModules"),
  ]
    .filter((value): value is string => typeof value === "string");

  return Array.from(
    new Set(values.map((value) => normalizeModuleCode(value)).filter(Boolean) as PlatformModuleCode[])
  );
}

function dateValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return null;

  const date = new Date(`${value}T23:59:59.999`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function licenseStatus(formData: FormData, code: PlatformModuleCode, enabled: boolean) {
  const value = textValue(formData, `licenseStatus_${code}`).toUpperCase();
  if (LICENSE_STATUSES.includes(value as (typeof LICENSE_STATUSES)[number])) {
    return value as (typeof LICENSE_STATUSES)[number];
  }

  return enabled ? "ACTIVE" : "SUSPENDED";
}

async function syncOrganizationModuleLicenses({
  organizationId,
  moduleCodes,
  planCode,
  formData,
}: {
  organizationId: string;
  moduleCodes: PlatformModuleCode[];
  planCode: string;
  formData: FormData;
}) {
  const selected = new Set(moduleCodes);
  const [platformModules, plan] = await Promise.all([
    getTenantDb().platformModule.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, code: true },
    }),
    planCode
      ? getTenantDb().platformPlan.findUnique({
          where: { code: planCode },
          select: { id: true },
        })
      : null,
  ]);

  const now = new Date();

  await Promise.all(
    platformModules.map((platformModule) => {
      const code = normalizeModuleCode(platformModule.code);
      if (!code) return Promise.resolve();

      const enabled = selected.has(code);
      const status = licenseStatus(formData, code, enabled);

      return getTenantDb().organizationModuleLicense.upsert({
        where: {
          organizationId_moduleId: {
            organizationId,
            moduleId: platformModule.id,
          },
        },
        update: {
          enabled,
          status,
          planId: plan?.id ?? null,
          expiresAt: dateValue(formData, `expiresAt_${code}`),
          revokedAt: enabled ? null : now,
        },
        create: {
          organizationId,
          moduleId: platformModule.id,
          planId: plan?.id ?? null,
          enabled,
          status,
          startsAt: now,
          expiresAt: dateValue(formData, `expiresAt_${code}`),
          revokedAt: enabled ? null : now,
        },
      });
    })
  );
}

function revalidateOrganizationAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/organizations");
  revalidatePath("/super-admin");
  revalidatePath("/super-admin/organizations");
  revalidatePath("/workspace", "layout");
}

export async function getOrganizations() {
  await requireSuperAdmin();
  try {
    const orgs = await getTenantDb().organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        moduleLicenses: {
          include: {
            module: true,
            plan: { select: { id: true, code: true, name: true } },
          },
        },
        _count: { select: { members: true, contacts: true, projects: true, moduleUsage: true } },
      },
    });
    return orgs;
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    return [];
  }
}

export async function createOrganization(formData: FormData) {
  await requireSuperAdmin();

  const name = textValue(formData, "name");
  const slug = textValue(formData, "slug").toLowerCase();
  const ownerEmail = textValue(formData, "ownerEmail").toLowerCase();
  const plan = textValue(formData, "plan") || "workspace-standard";
  const modules = selectedModules(formData);
  const activeModules = modules.length > 0 ? modules : defaultModuleCodes;

  if (!name || !slug || !ownerEmail) {
    throw new Error("Vui lòng nhập tên, slug và email chủ sở hữu.");
  }

  const owner = await getTenantDb().user.findUnique({ where: { email: ownerEmail } });
  if (!owner) {
    throw new Error("Không tìm thấy user chủ sở hữu.");
  }

  try {
    const organization = await getTenantDb().organization.create({
      data: {
        name,
        slug,
        ownerId: owner.id,
        website: textValue(formData, "website") || null,
        email: textValue(formData, "email") || null,
        phone: textValue(formData, "phone") || null,
        address: textValue(formData, "address") || null,
        description: textValue(formData, "description") || null,
        plan,
        isActive: formData.get("isActive") === "on",
        activeModules,
        members: {
          create: {
            userId: owner.id,
            role: "OWNER",
          },
        },
      },
    });

    await syncOrganizationModuleLicenses({
      organizationId: organization.id,
      moduleCodes: activeModules,
      planCode: plan,
      formData,
    });

    revalidateOrganizationAdmin();
  } catch (error) {
    console.error("Failed to create organization:", error);
    throw new Error("Không thể tạo tổ chức. Kiểm tra slug có bị trùng không.");
  }

  redirect("/super-admin/organizations");
}

export async function updateOrganization(orgId: string, formData: FormData) {
  await requireSuperAdmin();

  const name = textValue(formData, "name");
  const slug = textValue(formData, "slug").toLowerCase();
  const plan = textValue(formData, "plan") || "workspace-standard";
  const modules = selectedModules(formData);

  if (!name || !slug) {
    throw new Error("Vui lòng nhập tên và slug.");
  }

  try {
    await getTenantDb().organization.update({
      where: { id: orgId },
      data: {
        name,
        slug,
        website: textValue(formData, "website") || null,
        email: textValue(formData, "email") || null,
        phone: textValue(formData, "phone") || null,
        address: textValue(formData, "address") || null,
        description: textValue(formData, "description") || null,
        plan,
        isActive: formData.get("isActive") === "on",
      },
    });

    revalidateOrganizationAdmin();
  } catch (error) {
    console.error("Failed to update organization:", error);
    throw new Error("Không thể cập nhật tổ chức.");
  }
}

export async function deleteOrganization(orgId: string) {
  await requireSuperAdmin();

  const organizationCount = await getTenantDb().organization.count();
  if (organizationCount <= 1) {
    throw new Error("Không thể xóa tổ chức cuối cùng.");
  }

  try {
    await getTenantDb().organization.delete({ where: { id: orgId } });
    revalidateOrganizationAdmin();
  } catch (error) {
    console.error("Failed to delete organization:", error);
    throw new Error("Không thể xóa tổ chức.");
  }
}

export async function toggleOrganizationModule(orgId: string, module: string) {
  await requireSuperAdmin();
  try {
    const normalizedModule = normalizeModuleCode(module);
    if (!normalizedModule) throw new Error("Module không hợp lệ.");

    const org = await getTenantDb().organization.findUnique({ where: { id: orgId } });
    if (!org) throw new Error("Không tìm thấy tổ chức.");

    const platformModule = await getTenantDb().platformModule.findUnique({ where: { code: normalizedModule } });
    if (!platformModule) throw new Error("Module chưa được seed vào nền tảng.");

    const currentLicense = await getTenantDb().organizationModuleLicense.findUnique({
      where: {
        organizationId_moduleId: {
          organizationId: orgId,
          moduleId: platformModule.id,
        },
      },
    });

    const nextEnabled = !(currentLicense?.enabled && ["ACTIVE", "TRIALING"].includes(currentLicense.status));
    let activeModules = (org.activeModules || [])
      .map((code) => normalizeModuleCode(code))
      .filter(Boolean) as PlatformModuleCode[];

    if (nextEnabled) {
      activeModules = Array.from(new Set([...activeModules, normalizedModule]));
    } else {
      activeModules = activeModules.filter((code) => code !== normalizedModule);
    }

    const plan = org.plan
      ? await getTenantDb().platformPlan.findUnique({ where: { code: org.plan }, select: { id: true } })
      : null;

    await getTenantDb().$transaction([
      getTenantDb().organization.update({
        where: { id: orgId },
        data: { activeModules },
      }),
      getTenantDb().organizationModuleLicense.upsert({
        where: {
          organizationId_moduleId: {
            organizationId: orgId,
            moduleId: platformModule.id,
          },
        },
        update: {
          enabled: nextEnabled,
          status: nextEnabled ? "ACTIVE" : "SUSPENDED",
          planId: plan?.id ?? null,
          revokedAt: nextEnabled ? null : new Date(),
        },
        create: {
          organizationId: orgId,
          moduleId: platformModule.id,
          planId: plan?.id ?? null,
          enabled: nextEnabled,
          status: nextEnabled ? "ACTIVE" : "SUSPENDED",
          revokedAt: nextEnabled ? null : new Date(),
        },
      }),
    ]);

    revalidateOrganizationAdmin();
  } catch (error) {
    console.error("Failed to toggle module:", error);
    throw new Error("Không thể bật/tắt module.");
  }
}

export async function getPlatformProvisioningOptions() {
  await requireSuperAdmin();

  const [modules, rawPlans] = await Promise.all([
    getTenantDb().platformModule.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    getTenantDb().platformPlan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const plans = rawPlans.map(p => ({
    ...p,
    price: p.price ? Number(p.price) : 0,
  }));

  return { modules, plans };
}

export async function switchOrganization(orgId: string) {
  const session = await requireAuth();

  const organization = await getTenantDb().organization.findUnique({
    where: { id: orgId },
    select: { id: true },
  });

  if (!organization) {
    return { success: false, error: "Workspace không tồn tại" };
  }

  if (session.user.role !== "SUPER_ADMIN") {
    const member = await getTenantDb().organizationMember.findFirst({
      where: { userId: session.user.id, organizationId: orgId },
      select: { id: true },
    });

    if (!member) {
      return { success: false, error: "Bạn không thuộc workspace này" };
    }
  }

  await getTenantDb().session.updateMany({
    where: { userId: session.user.id },
    data: { activeOrganizationId: orgId },
  });

  const cookieStore = await cookies();
  cookieStore.set("better-auth.active_organization", orgId, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
  });

  revalidatePath("/workspace");
  revalidatePath("/workspace");
  return { success: true };
}

export async function updateOrganizationProfile(formData: FormData) {
  const session = await requireAuth();
  const organizationId = session.organizationId;
  if (!organizationId) {
    throw new Error("Active organization is required");
  }

  // 1. Sync to legacy Setting table + base Organization (for email compatibility)
  await updateCompanySettings(formData);

  // 2. Sync to new OrganizationProfile table
  const profileData = {
    representativeName: textValue(formData, "company_representative") || null,
    businessLicense: textValue(formData, "company_tax_code") || null,
    address: textValue(formData, "company_address") || null,
    logo: textValue(formData, "company_logo_url") || null,
    favicon: textValue(formData, "company_favicon_url") || null,
    representativePhone: textValue(formData, "company_hotline") || null,
    representativeEmail: textValue(formData, "company_email") || null,
    slogan: textValue(formData, "company_function") || null,
  };

  await getTenantDb().organizationProfile.upsert({
    where: { organizationId },
    create: {
      organizationId,
      ...profileData,
    },
    update: {
      ...profileData,
    },
  });

  OrganizationEvents.profileUpdated(organizationId);
  revalidatePath("/settings/organization");

  return { success: true };
}

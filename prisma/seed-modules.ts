import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

import { defaultModuleCodes, moduleDefinitions } from "../src/lib/modules/registry";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding platform modules...");

  for (const module of moduleDefinitions) {
    await prisma.platformModule.upsert({
      where: { code: module.code },
      update: {
        name: module.name,
        version: module.version,
        category: module.category as never,
        description: module.description,
        icon: module.icon,
        dependencies: module.dependencies,
        status: "ACTIVE",
        sortOrder: module.sortOrder,
        defaultSettings:
          module.code === "SOCIAL_MARKETING"
            ? { features: { REPORT: true }, providers: { FACEBOOK: { enabled: true } } }
            : undefined,
      },
      create: {
        code: module.code,
        name: module.name,
        version: module.version,
        category: module.category as never,
        description: module.description,
        icon: module.icon,
        dependencies: module.dependencies,
        status: "ACTIVE",
        sortOrder: module.sortOrder,
        defaultSettings:
          module.code === "SOCIAL_MARKETING"
            ? { features: { REPORT: true }, providers: { FACEBOOK: { enabled: true } } }
            : undefined,
      },
    });
  }

  const plan = await prisma.platformPlan.upsert({
    where: { code: "workspace-standard" },
    update: {
      name: "Workspace Standard",
      description: "Gói mặc định cho Ong Vàng Workspace.",
      isActive: true,
      sortOrder: 10,
    },
    create: {
      code: "workspace-standard",
      name: "Workspace Standard",
      description: "Gói mặc định cho Ong Vàng Workspace.",
      price: 0,
      currency: "VND",
      interval: "MONTHLY",
      isActive: true,
      sortOrder: 10,
    },
  });

  for (const code of defaultModuleCodes) {
    const module = await prisma.platformModule.findUnique({ where: { code } });
    if (!module) continue;

    await prisma.planModule.upsert({
      where: { planId_moduleId: { planId: plan.id, moduleId: module.id } },
      update: {},
      create: {
        planId: plan.id,
        moduleId: module.id,
      },
    });
  }

  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true, slug: true, activeModules: true, owner: { select: { email: true } } },
  });

  for (const organization of organizations) {
    const codes = new Set(
      (organization.activeModules.length > 0 ? organization.activeModules : defaultModuleCodes)
        .map((code) => code.toUpperCase())
        .map((code) => (code === "FINANCIAL" ? "FINANCE" : code))
    );

    codes.add("WORKSPACE");
    codes.add("REPORTS");
    codes.add("SETTINGS");
    codes.add("PORTAL");
    const isOngVangWorkspace =
      organization.slug.includes("ong-vang") ||
      organization.name.toLowerCase().includes("ong vàng") ||
      organization.owner.email.toLowerCase() === "marketing@ovc.vn";
    if (isOngVangWorkspace) codes.add("SOCIAL_MARKETING");

    for (const code of codes) {
      const module = await prisma.platformModule.findUnique({ where: { code } });
      if (!module) continue;

      await prisma.organizationModuleLicense.upsert({
        where: {
          organizationId_moduleId: {
            organizationId: organization.id,
            moduleId: module.id,
          },
        },
        update: {
          enabled: true,
          status: "ACTIVE",
          planId: plan.id,
          features: code === "SOCIAL_MARKETING" ? { REPORT: true } : undefined,
          limits: code === "SOCIAL_MARKETING" ? { connections: 2, facebookPages: 10, facebookAdAccounts: 5, manualSyncsPerDay: 20, scheduledSyncsPerDay: 4, historyMonths: 25 } : undefined,
          settings: code === "SOCIAL_MARKETING" ? { providers: { FACEBOOK: { enabled: true } }, syncTimezone: "Asia/Ho_Chi_Minh" } : undefined,
        },
        create: {
          organizationId: organization.id,
          moduleId: module.id,
          planId: plan.id,
          enabled: true,
          status: "ACTIVE",
          features: code === "SOCIAL_MARKETING" ? { REPORT: true } : undefined,
          limits: code === "SOCIAL_MARKETING" ? { connections: 2, facebookPages: 10, facebookAdAccounts: 5, manualSyncsPerDay: 20, scheduledSyncsPerDay: 4, historyMonths: 25 } : undefined,
          settings: code === "SOCIAL_MARKETING" ? { providers: { FACEBOOK: { enabled: true } }, syncTimezone: "Asia/Ho_Chi_Minh" } : undefined,
        },
      });
    }
  }

  console.log(`Seeded ${moduleDefinitions.length} platform modules for ${organizations.length} organizations.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

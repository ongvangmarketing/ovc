import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { hashPassword } from "@better-auth/utils/password";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const workspaceModules = ["WORKSPACE", "CRM", "FINANCE", "EDUCATION", "PROJECTS", "MARKETING", "REPORTS", "SETTINGS", "PORTAL"];

async function main() {
  console.log("Seeding database...");

  const password = await hashPassword("Ongvang@2026");

  const superAdmin = await prisma.user.upsert({
    where: { email: "info@ovc.vn" },
    update: {
      name: "Super Admin",
      role: "SUPER_ADMIN",
      emailVerified: true,
      isActive: true,
      onboarded: true,
    },
    create: {
      email: "info@ovc.vn",
      name: "Super Admin",
      role: "SUPER_ADMIN",
      emailVerified: true,
      isActive: true,
      onboarded: true,
    },
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: superAdmin.id,
      },
    },
    update: { password },
    create: {
      userId: superAdmin.id,
      accountId: superAdmin.id,
      providerId: "credential",
      password,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "marketing@ovc.vn" },
    update: {
      name: "Marketing OVC",
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
      onboarded: true,
    },
    create: {
      email: "marketing@ovc.vn",
      name: "Marketing OVC",
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
      onboarded: true,
    },
  });

  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: admin.id,
      },
    },
    update: { password },
    create: {
      userId: admin.id,
      accountId: admin.id,
      providerId: "credential",
      password,
    },
  });

  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { role: "ADMIN" }
    });
    console.log("Admin role ensured for marketing@ovc.vn.");
    
    // Check if we already have an organization
    let org = await prisma.organization.findUnique({ where: { slug: "ong-vang" } });
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: "Ong Vàng Workspace",
          slug: "ong-vang",
          ownerId: admin.id,
          website: "https://ovc.vn",
          email: "info@ovc.vn",
          phone: "0919 188 807",
          address: "Việt Nam",
          plan: "workspace-standard",
          activeModules: workspaceModules,
        }
      });
      console.log("Created default organization.");
    } else {
      org = await prisma.organization.update({
        where: { id: org.id },
        data: {
          name: "Ong Vàng Workspace",
          slug: "ong-vang",
          ownerId: admin.id,
          website: org.website || "https://ovc.vn",
          email: org.email || "info@ovc.vn",
          phone: org.phone || "0919 188 807",
          address: org.address || "Việt Nam",
          plan: "workspace-standard",
          isActive: true,
          activeModules: Array.from(new Set([...(org.activeModules || []), ...workspaceModules])),
        },
      });
    }

    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: admin.id,
        },
      },
      update: { role: "ADMIN" },
      create: {
        organizationId: org.id,
        userId: admin.id,
        role: "ADMIN",
      },
    });

    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: {
          organizationId: org.id,
          userId: superAdmin.id,
        },
      },
      update: { role: "OWNER" },
      create: {
        organizationId: org.id,
        userId: superAdmin.id,
        role: "OWNER",
      },
    });

    console.log("Ensured marketing@ovc.vn / Ongvang@2025 is ADMIN of Ong Vàng Workspace.");

    // Seed CRM Data
    const companyCount = await prisma.company.count();
    if (companyCount === 0) {
      const company1 = await prisma.company.create({
        data: {
          organizationId: org.id,
          name: "TechCorp Vietnam",
          website: "techcorp.vn",
          industry: "Technology"
        }
      });
      
      const company2 = await prisma.company.create({
        data: {
          organizationId: org.id,
          name: "Global Co.",
          website: "globalco.com",
          industry: "Retail"
        }
      });

      await prisma.contact.createMany({
        data: [
          {
            organizationId: org.id,
            companyId: company1.id,
            firstName: "Nguyễn",
            lastName: "Văn Anh",
            email: "anh.nguyen@techcorp.vn",
            phone: "0901234567",
            type: "CUSTOMER",
            priority: "HIGH",
            assigneeId: admin.id,
            tags: ["VIP", "Enterprise"]
          },
          {
            organizationId: org.id,
            companyId: company2.id,
            firstName: "Phạm",
            lastName: "Văn Cường",
            email: "cuong@globalco.com",
            phone: "0923456789",
            type: "PROSPECT",
            priority: "HIGH",
            assigneeId: admin.id,
            tags: ["International"]
          }
        ]
      });
      console.log("Seeded Contacts and Companies.");

      // Seed Deal Stages
      const stage1 = await prisma.dealStage.create({
        data: { organizationId: org.id, name: "Lead", color: "#94A3B8", order: 0 }
      });
      const stage2 = await prisma.dealStage.create({
        data: { organizationId: org.id, name: "Đã liên hệ", color: "#3B82F6", order: 1 }
      });
      const stage3 = await prisma.dealStage.create({
        data: { organizationId: org.id, name: "Đàm phán", color: "#F59E0B", order: 2 }
      });
      const stage4 = await prisma.dealStage.create({
        data: { organizationId: org.id, name: "Đã thắng", color: "#10B981", order: 3 }
      });

      // Seed Deals
      await prisma.deal.createMany({
        data: [
          {
            organizationId: org.id,
            title: "Website Redesign",
            value: 50000000,
            stageId: stage1.id,
            companyId: company1.id,
            assigneeId: admin.id,
            priority: "HIGH"
          },
          {
            organizationId: org.id,
            title: "ERP Integration",
            value: 200000000,
            stageId: stage2.id,
            companyId: company2.id,
            assigneeId: admin.id,
            priority: "URGENT"
          }
        ]
      });
      console.log("Seeded Deals.");
    }

    // Seed Projects
    const projectCount = await prisma.project.count();
    if (projectCount === 0) {
      await prisma.project.create({
        data: {
          organizationId: org.id,
          name: "Website Redesign 2026",
          description: "Redesign the corporate website with new brand guidelines.",
          status: "ACTIVE",
          priority: "HIGH",
          ownerId: admin.id,
          budget: 150000000
        }
      });
      console.log("Seeded Projects.");
    }

  } else {
    console.log("Admin user not found. Please use the application signup API or form to create one.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

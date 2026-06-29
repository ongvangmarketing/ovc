import "dotenv/config";
import { db } from "./src/lib/db";
import { hashPassword } from "better-auth/crypto";

async function restoreUsers() {
  console.log("Restoring admin users...");
  const password = await hashPassword("Ongvang@2026");

  // Create super admin
  const superAdmin = await db.user.upsert({
    where: { email: "admin@ongvang.com" },
    update: { role: "SUPER_ADMIN" },
    create: {
      email: "admin@ongvang.com",
      name: "Super Admin",
      role: "SUPER_ADMIN",
      emailVerified: true,
      isActive: true,
    }
  });

  await db.account.upsert({
    where: { providerId_accountId: { providerId: "credential", accountId: superAdmin.id } },
    update: { password },
    create: {
      userId: superAdmin.id,
      accountId: superAdmin.id,
      providerId: "credential",
      password: password
    }
  });

  // Create Công ty A
  const orgA = await db.organization.upsert({
    where: { slug: "cong-ty-a" },
    update: {},
    create: {
      id: "org_a",
      name: "Công ty A",
      slug: "cong-ty-a",
      isActive: true,
      ownerId: superAdmin.id,
    }
  });

  // Create Công ty B
  const orgB = await db.organization.upsert({
    where: { slug: "cong-ty-b" },
    update: {},
    create: {
      id: "org_b",
      name: "Công ty B",
      slug: "cong-ty-b",
      isActive: true,
      ownerId: superAdmin.id,
    }
  });

  // Create info@ovc.vn
  const infoUser = await db.user.upsert({
    where: { email: "info@ovc.vn" },
    update: { role: "ADMIN" },
    create: {
      email: "info@ovc.vn",
      name: "Admin Công Ty A",
      role: "ADMIN",
      emailVerified: true,
      isActive: true,
    }
  });

  await db.account.upsert({
    where: { providerId_accountId: { providerId: "credential", accountId: infoUser.id } },
    update: { password },
    create: {
      userId: infoUser.id,
      accountId: infoUser.id,
      providerId: "credential",
      password: password
    }
  });

  // Add infoUser to Công ty A
  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: orgA.id, userId: infoUser.id } },
    update: { role: "OWNER" },
    create: {
      organizationId: orgA.id,
      userId: infoUser.id,
      role: "OWNER"
    }
  });

  // Add super admin to both companies
  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: orgA.id, userId: superAdmin.id } },
    update: { role: "OWNER" },
    create: {
      organizationId: orgA.id,
      userId: superAdmin.id,
      role: "OWNER"
    }
  });

  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: orgB.id, userId: superAdmin.id } },
    update: { role: "OWNER" },
    create: {
      organizationId: orgB.id,
      userId: superAdmin.id,
      role: "OWNER"
    }
  });

  console.log("Restored successfully!");
}

restoreUsers().catch(console.error).finally(() => db.$disconnect());

require("dotenv").config();
const { db: prismaClient } = require("../src/lib/db");

async function main() {
  console.log("Seeding Organizations Data...");

  // Find Super Admin
  const superAdmin = await prismaClient.user.findFirst({
    where: { email: "info@ovc.vn" }
  });

  if (!superAdmin) {
    throw new Error("Super Admin info@ovc.vn not found. Please run seed-users.ts first.");
  }

  // Create Công ty A
  const orgA = await prismaClient.organization.upsert({
    where: { slug: "cong-ty-a" },
    update: { activeModules: ["CRM", "FINANCIAL"] },
    create: {
      name: "Công ty A (Chỉ có CRM và Tài chính)",
      slug: "cong-ty-a",
      ownerId: superAdmin.id,
      activeModules: ["CRM", "FINANCIAL"]
    }
  });

  // Create Công ty B
  const orgB = await prismaClient.organization.upsert({
    where: { slug: "cong-ty-b" },
    update: { activeModules: ["EDUCATION", "FINANCIAL"] },
    create: {
      name: "Công ty B (Chỉ có Đào tạo và Tài chính)",
      slug: "cong-ty-b",
      ownerId: superAdmin.id,
      activeModules: ["EDUCATION", "FINANCIAL"]
    }
  });

  // Assign other users to these orgs just to be safe
  const manager = await prismaClient.user.findFirst({ where: { email: "trung@ovc.vn" }});
  if (manager) {
    // Add manager to orgA
    const memberA = await prismaClient.organizationMember.findFirst({ where: { userId: manager.id, organizationId: orgA.id }});
    if (!memberA) {
      await prismaClient.organizationMember.create({
        data: { userId: manager.id, organizationId: orgA.id, role: "ADMIN" }
      });
    }
  }

  console.log("✅ Seeded Organizations successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });

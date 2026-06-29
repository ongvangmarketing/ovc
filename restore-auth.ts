import "dotenv/config";
import { auth } from "./src/lib/auth";
import { db } from "./src/lib/db";

async function main() {
  console.log("Registering admin users via better-auth...");
  
  // Create admin@ongvang.com
  try {
    const admin = await auth.api.signUpEmail({
      body: {
        email: "admin@ongvang.com",
        password: "Ongvang@2026",
        name: "Super Admin",
      }
    });
    console.log("Created admin@ongvang.com");
    
    if (admin && admin.user) {
      await db.user.update({
        where: { id: admin.user.id },
        data: { role: "SUPER_ADMIN" }
      });
    }
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      console.log("admin@ongvang.com already exists. Setting password...");
      // Try to update password via auth.api if supported, or just ignore if they can log in
    } else {
      console.error("Error creating admin:", err);
    }
  }

  // Create info@ovc.vn
  try {
    const info = await auth.api.signUpEmail({
      body: {
        email: "info@ovc.vn",
        password: "Ongvang@2026",
        name: "Admin Công Ty A",
      }
    });
    console.log("Created info@ovc.vn");
    
    if (info && info.user) {
      await db.user.update({
        where: { id: info.user.id },
        data: { role: "ADMIN" }
      });
    }
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      console.log("info@ovc.vn already exists.");
    } else {
      console.error("Error creating info:", err);
    }
  }

  // Set organizations
  const adminUser = await db.user.findFirst({ where: { email: "admin@ongvang.com" } });
  const infoUser = await db.user.findFirst({ where: { email: "info@ovc.vn" } });
  
  if (adminUser) {
    const orgA = await db.organization.upsert({
      where: { slug: "cong-ty-a" },
      update: {},
      create: {
        id: "org_a",
        name: "Công ty A",
        slug: "cong-ty-a",
        isActive: true,
        ownerId: adminUser.id,
      }
    });

    const orgB = await db.organization.upsert({
      where: { slug: "cong-ty-b" },
      update: {},
      create: {
        id: "org_b",
        name: "Công ty B",
        slug: "cong-ty-b",
        isActive: true,
        ownerId: adminUser.id,
      }
    });

    await db.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: orgA.id, userId: adminUser.id } },
      update: { role: "OWNER" },
      create: { organizationId: orgA.id, userId: adminUser.id, role: "OWNER" }
    });
    
    await db.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: orgB.id, userId: adminUser.id } },
      update: { role: "OWNER" },
      create: { organizationId: orgB.id, userId: adminUser.id, role: "OWNER" }
    });

    if (infoUser) {
      await db.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: orgA.id, userId: infoUser.id } },
        update: { role: "OWNER" },
        create: { organizationId: orgA.id, userId: infoUser.id, role: "OWNER" }
      });
    }
  }

  console.log("Done configuring auth users!");
}

main().catch(console.error).finally(() => process.exit(0));

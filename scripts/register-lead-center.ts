import { db } from "../src/lib/db/index";

async function main() {
  // 1. Create or Update the PlatformModule for LEAD_CENTER
  const pm = await db.platformModule.upsert({
    where: { code: "LEAD_CENTER" },
    update: {
      category: "MARKETING",
      sortOrder: 15,
      icon: "inbox"
    },
    create: {
      code: "LEAD_CENTER",
      name: "Lead Center",
      version: "1.0.0",
      category: "MARKETING",
      description: "Tiếp nhận, làm sạch và phân bổ nguồn khách hàng tiềm năng.",
      icon: "inbox",
      sortOrder: 15,
      status: "ACTIVE"
    }
  });
  console.log("Registered Platform Module:", pm.code);

  // 2. Add to organization OVMAIN
  let org = await db.organization.findFirst({
    where: { slug: "ovmain" }
  });
  
  if (!org) {
     org = await db.organization.findFirst({
        where: { slug: "OVMAIN" }
     });
  }

  if (org) {
    if (!org.activeModules.includes("LEAD_CENTER")) {
      await db.organization.update({
        where: { id: org.id },
        data: {
          activeModules: { push: "LEAD_CENTER" }
        }
      });
      console.log(`Pushed to activeModules array for org: ${org.name}`);
    } else {
      console.log(`activeModules already contains LEAD_CENTER for org: ${org.name}`);
    }

    const existingLicense = await db.organizationModuleLicense.findFirst({
      where: {
        organizationId: org.id,
        moduleId: pm.id
      }
    });

    if (!existingLicense) {
      await db.organizationModuleLicense.create({
        data: {
          organizationId: org.id,
          moduleId: pm.id,
          status: "ACTIVE",
          enabled: true,
        }
      });
      console.log(`Created Module License for org: ${org.name}`);
    } else {
      console.log(`Module License already exists for org: ${org.name}`);
    }
  } else {
    console.log("Org OVMAIN not found!");
  }
}

main().catch(console.error).finally(() => process.exit(0));

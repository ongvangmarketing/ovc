import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Initializing Web Builder Module...");

  // 1. Create the PlatformModule if it doesn't exist
  const websiteModule = await prisma.platformModule.upsert({
    where: { code: "WEBSITE" },
    update: {
      name: "Web Builder",
      description: "Drag-and-drop website and landing page builder with Business Blocks.",
      category: "WEBSITE", // From PlatformModuleCategory enum
      status: "ACTIVE",
    },
    create: {
      code: "WEBSITE",
      name: "Web Builder",
      description: "Drag-and-drop website and landing page builder with Business Blocks.",
      category: "WEBSITE",
      status: "ACTIVE",
    }
  });
  console.log("Web Builder module created in Super Admin:", websiteModule.name);

  // 2. Grant permissions to OVMain (assume it's the first org or ong-vang)
  let org = await prisma.organization.findFirst({
    where: { slug: "ong-vang" }
  });
  if (!org) {
    org = await prisma.organization.findFirst();
  }

  if (org) {
    const currentModules = org.activeModules || [];
    if (!currentModules.includes("WEBSITE")) {
      await prisma.organization.update({
        where: { id: org.id },
        data: {
          activeModules: [...currentModules, "WEBSITE"]
        }
      });
      console.log("Granted WEBSITE module access to organization:", org.name);
    } else {
      console.log("Organization already has access to WEBSITE module.");
    }
  } else {
    console.log("Could not find default organization 'ong-vang' (OVMain).");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

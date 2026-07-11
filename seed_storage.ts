import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const orgId = "org_main";

  let conn = await prisma.storageConnection.findFirst({
    where: { organizationId: orgId, provider: "LOCAL" }
  });

  if (!conn) {
    conn = await prisma.storageConnection.create({
      data: {
        organizationId: orgId,
        name: "Local Default Storage",
        provider: "LOCAL",
        status: "ACTIVE",
        credentials: {},
        rootFolder: "/uploads",
        isDefault: true
      }
    });
  }

  await prisma.storagePolicy.upsert({
    where: {
      organizationId_fileCategory: {
        organizationId: orgId,
        fileCategory: "CHAT_ATTACHMENT"
      }
    },
    update: {
      connectionId: conn.id,
      isActive: true
    },
    create: {
      organizationId: orgId,
      name: "Chat Attachments Policy",
      fileCategory: "CHAT_ATTACHMENT",
      connectionId: conn.id,
      isActive: true,
    }
  });

  console.log("Seeded storage policy successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orgId = "org_main";
  const connections = await prisma.storageConnection.findMany({ where: { organizationId: orgId } });
  console.log("CONNECTIONS:", JSON.stringify(connections, null, 2));

  const policies = await prisma.storagePolicy.findMany({ where: { organizationId: orgId } });
  console.log("POLICIES:", JSON.stringify(policies, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

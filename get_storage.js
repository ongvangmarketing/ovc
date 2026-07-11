import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  const orgId = "org_main";
  const connections = await prisma.storageConnection.findMany({ where: { organizationId: orgId } });
  console.log("CONNECTIONS:");
  console.log(JSON.stringify(connections, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

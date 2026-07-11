import { config } from 'dotenv';
config();
import { getSystemDb } from './src/lib/db';

async function main() {
  const db = getSystemDb();
  const orgId = "org_main";

  const policy = await db.storagePolicy.findFirst({
    where: { organizationId: orgId, fileCategory: "CHAT_ATTACHMENT" },
    include: { connection: true }
  });

  console.log("Current Policy:", JSON.stringify(policy, null, 2));

  const files = await db.storageFile.findMany({
    where: { category: "CHAT_ATTACHMENT" },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log("Recent Files:", JSON.stringify(files, null, 2));
}
main().catch(console.error);

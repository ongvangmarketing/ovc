import { config } from 'dotenv';
config();
import { getSystemDb } from './src/lib/db';

async function main() {
  const db = getSystemDb();
  const orgId = "org_main";

  let conn = await db.storageConnection.findFirst({
    where: { organizationId: orgId, provider: "GOOGLE_DRIVE" }
  });

  if (!conn) {
    conn = await db.storageConnection.findFirst({
      where: { organizationId: orgId }
    });
  }

  if (!conn) {
    console.log("No connections found! Creating LOCAL connection...");
    conn = await db.storageConnection.create({
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
  } else {
    console.log("Found existing connection:", conn.name, "provider:", conn.provider);
  }

  await db.storagePolicy.upsert({
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

  console.log("Storage Policy configured successfully!");
}

main().catch(console.error);

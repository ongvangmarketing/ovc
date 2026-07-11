import { getSystemDb } from "./src/lib/db";
import { config } from "dotenv";

async function main() {
  config();
  const prisma = getSystemDb();
  const deleted = await prisma.chatConversation.deleteMany({
    where: {
      name: {
        startsWith: "Zalo-"
      }
    }
  });
  console.log("Deleted", deleted.count, "conversations");
}

main().catch(console.error);

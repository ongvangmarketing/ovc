import { getSystemDb } from "../src/lib/db";
import { ImapSyncService } from "../src/modules/core-mail/services/imap-sync.service";

async function run() {
  const prisma = getSystemDb();
  console.log("Finding mailbox...");
  const mailbox = await prisma.mailAccount.findFirst();
  if (!mailbox) {
    console.log("No mailbox found.");
    return;
  }
  
  console.log(`Clearing old messages for ${mailbox.emailAddress}...`);
  await prisma.mailAttachment.deleteMany({ where: { message: { mailAccountId: mailbox.id } } });
  await prisma.mailMessage.deleteMany({ where: { mailAccountId: mailbox.id } });
  await prisma.mailThread.deleteMany({ where: { mailAccountId: mailbox.id } });
  
  console.log("Syncing...");
  const result = await ImapSyncService.syncAccount(mailbox.id);
  console.log("Sync result:", result);
}
run();

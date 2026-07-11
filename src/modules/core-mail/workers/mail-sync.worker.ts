import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { ImapSyncService } from "../services/imap-sync.service";
import { getSystemDb } from "@/lib/db";

// Use environment variable or default local redis
const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

export const mailSyncQueueName = "mail-sync-queue";

/**
 * Worker that processes email sync jobs.
 */
export const startMailSyncWorker = () => {
  const worker = new Worker(
    mailSyncQueueName,
    async (job: Job) => {
      const { accountId } = job.data;
      if (!accountId) {
        throw new Error("Missing accountId in job data");
      }

      console.log(`[MailSyncWorker] Starting sync for account: ${accountId}`);
      
      const result = await ImapSyncService.syncAccount(accountId);
      
      if (result.success) {
        console.log(`[MailSyncWorker] Sync complete for ${accountId}. Fetched ${result.syncedCount} new emails.`);
      } else {
        console.error(`[MailSyncWorker] Sync failed for ${accountId}: ${result.error}`);
        throw new Error(result.error);
      }
      
      return result;
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log(`[MailSyncWorker] Job ${job.id} has completed!`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[MailSyncWorker] Job ${job?.id} has failed with ${err.message}`);
  });

  return worker;
};

/**
 * Convenience function to queue all accounts for sync.
 * This can be called periodically by a Cron job.
 */
export const queueAllAccountsForSync = async (Queue: any) => {
  const db = getSystemDb();
  const accounts = await db.mailAccount.findMany({
    select: { id: true }
  });

  const mailQueue = new Queue(mailSyncQueueName, { connection });

  for (const acc of accounts) {
    await mailQueue.add(`sync-${acc.id}-${Date.now()}`, { accountId: acc.id }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      }
    });
  }
  
  console.log(`[MailSyncWorker] Queued ${accounts.length} accounts for sync`);
};

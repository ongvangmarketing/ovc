import "dotenv/config"; // Load biến môi trường từ .env
import { initReminderWorker } from "@/lib/automation/reminder-queue";
import { startMailSyncWorker, queueAllAccountsForSync } from "@/modules/core-mail/workers/mail-sync.worker";
import { Queue } from "bullmq";

async function main() {
  console.log("==========================================");
  console.log("🚀 Bắt đầu khởi chạy OVC Reminder Worker 🚀");
  console.log("==========================================");

  // Khởi tạo Worker
  const reminderWorker = initReminderWorker();
  const mailSyncWorker = startMailSyncWorker();

  console.log(`[Worker] Đang lắng nghe hàng đợi để gửi Email / Zalo...`);
  console.log(`[Worker] Đang lắng nghe hàng đợi đồng bộ IMAP...`);
  console.log(`[Worker] Nhấn Ctrl+C để thoát.`);

  // Khởi chạy tác vụ định kỳ (Cron) để đồng bộ email mỗi 5 phút
  console.log(`[Worker] Đã bật tác vụ định kỳ: Queue tất cả Mailbox mỗi 5 phút.`);
  const cronInterval = setInterval(() => {
    queueAllAccountsForSync(Queue).catch(e => console.error("[MailSyncWorker] Lỗi khi queue", e));
  }, 5 * 60 * 1000);

  // Xử lý ngắt tiến trình duyên dáng (Graceful shutdown)
  const shutdown = async () => {
    console.log("\n[Worker] Nhận tín hiệu tắt máy. Đang dọn dẹp...");
    clearInterval(cronInterval);
    await reminderWorker.close();
    await mailSyncWorker.close();
    console.log("[Worker] Đã tắt thành công.");
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("Lỗi nghiêm trọng khi chạy Worker:", err);
  process.exit(1);
});

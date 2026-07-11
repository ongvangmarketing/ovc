import { Queue, Worker, Job } from "bullmq";
import { redis } from "@/lib/queue/redis";

export const REMINDER_QUEUE_NAME = "automation-reminders-queue";

// Khởi tạo Queue (Nơi đón nhận các lệnh gửi nhắc nhở)
export const reminderQueue = new Queue(REMINDER_QUEUE_NAME, {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000, // Thử lại sau 5s, 25s, 125s nếu lỗi
    },
    removeOnComplete: true, // Xóa khỏi queue sau khi xong để nhẹ bộ nhớ
    removeOnFail: false,    // Giữ lại để debug nếu lỗi
  },
});

// Hàm trợ giúp để add job vào queue (Hỗ trợ hẹn giờ gửi - delay)
export async function enqueueReminder(
  jobId: string, 
  payload: any, 
  delayMs?: number
) {
  return reminderQueue.add("send-reminder", payload, {
    jobId,
    delay: delayMs,
  });
}

import { getSystemDb } from "@/lib/db";
import { sendEmail, renderEmailTemplate } from "@/lib/email/service";

// Khởi tạo Worker (Máy nghiền - Nơi thực thi việc gửi tin)
// Lưu ý: Trong Next.js, worker nên chạy cẩn thận để tránh duplicate trong môi trường dev
export function initReminderWorker() {
  const worker = new Worker(
    REMINDER_QUEUE_NAME,
    async (job: Job) => {
      console.log(`[ReminderWorker] Đang xử lý Job ${job.id}...`);
      
      const { reminderId, targetEntityId, organizationId } = job.data;
      const db = getSystemDb();

      // 1. Lấy thông tin chiến dịch Reminder
      const reminder = await db.automationReminder.findUnique({
        where: { id: reminderId },
      });

      if (!reminder || reminder.status !== "ACTIVE") {
        console.log(`[ReminderWorker] Bỏ qua Job ${job.id} - Reminder đã tắt hoặc bị xóa.`);
        return { success: false, reason: "Reminder inactive" };
      }

      // 2. Lấy thông tin thực thể (Hóa đơn/Hợp đồng/Báo giá) và kiểm tra Stop Condition
      let recipientEmail = "";
      let targetName = "";
      
      if (reminder.triggerSource === "invoice") {
        const invoice = await db.invoice.findUnique({ 
          where: { id: targetEntityId },
          include: { contact: true, company: true }
        });
        if (!invoice || invoice.status === "PAID" || invoice.status === "CANCELLED") return { success: false, reason: "Stop condition met" };
        recipientEmail = invoice.contact?.email || invoice.company?.email || "";
        targetName = invoice.title || invoice.number;
      } 
      else if (reminder.triggerSource === "contract") {
        const contract = await db.contract.findUnique({ 
          where: { id: targetEntityId },
          include: { contact: true, company: true }
        });
        if (!contract || contract.status === "CANCELLED" || contract.status === "EXPIRED") return { success: false, reason: "Stop condition met" };
        recipientEmail = contract.contact?.email || contract.company?.email || "";
        targetName = contract.title || contract.number;
      }
      else if (reminder.triggerSource === "quotation") {
        const quotation = await db.quotation.findUnique({ 
          where: { id: targetEntityId },
          include: { contact: true, company: true }
        });
        if (!quotation || quotation.status === "ACCEPTED" || quotation.status === "REJECTED") return { success: false, reason: "Stop condition met" };
        recipientEmail = quotation.contact?.email || quotation.company?.email || "";
        targetName = quotation.title || quotation.number;
      }

      if (!recipientEmail) {
        console.log(`[ReminderWorker] Job ${job.id} thất bại - Không tìm thấy Email người nhận.`);
        return { success: false, reason: "No recipient email" };
      }

      // 3. Chuẩn bị biến và Gọi Template Engine
      try {
        const templateConfig = reminder.templateConfig as any;
        const templateCode = templateConfig?.templateCode || "REMINDER_DEFAULT";
        
        // Truyền các biến động vào cho Template Engine xử lý
        const variables = {
          targetName,
          customerName: recipientEmail,
          entityId: targetEntityId
        };

        const { subject, html } = await renderEmailTemplate({
          organizationId,
          code: templateCode,
          variables,
          fallbackSubject: `[Thông báo quan trọng] - ${reminder.name}`,
          fallbackBody: templateConfig?.message || `<p>Kính gửi quý khách, hệ thống xin gửi nhắc nhở liên quan đến: ${targetName}</p>`,
        });

        await sendEmail({
          organizationId: organizationId,
          to: recipientEmail,
          subject: subject,
          html: html,
          relatedType: "automation_reminder",
          relatedId: reminder.id,
        });

        // 4. Ghi log thành công
        await db.reminderLog.create({
          data: {
            organizationId,
            reminderId,
            targetEntityId,
            recipientData: { email: recipientEmail },
            channel: "EMAIL",
            status: "SUCCESS",
          }
        });

      } catch (err: any) {
        // Ghi log thất bại
        await db.reminderLog.create({
          data: {
            organizationId,
            reminderId,
            targetEntityId,
            recipientData: { email: recipientEmail },
            channel: "EMAIL",
            status: "FAILED",
            errorMessage: err.message,
          }
        });
        throw err; // Để BullMQ biết mà retry
      }
      
      console.log(`[ReminderWorker] Đã hoàn thành Job ${job.id} - Gửi email tới ${recipientEmail}`);
      return { success: true };
    },
    { connection: redis as any, }
  );

  worker.on("completed", (job) => {
    console.log(`[ReminderWorker] Job ${job.id} thành công.`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[ReminderWorker] Job ${job?.id} thất bại:`, err.message);
  });

  return worker;
}

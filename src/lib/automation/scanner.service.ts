import { enqueueReminder } from "@/lib/automation/reminder-queue";
import { getSystemDb } from "@/lib/db";
import { startOfDay, endOfDay, addDays, subDays } from "date-fns";

export class ReminderScannerService {
  static async scanAndEnqueue() {
    const db = getSystemDb();
    console.log("[Scanner] Bắt đầu quét các chiến dịch Reminder...");

    const activeRules = await db.automationReminder.findMany({
      where: { status: "ACTIVE" },
    });

    let jobsQueued = 0;
    const today = new Date();

    for (const rule of activeRules) {
      let targetDate = today;
      if (rule.timingType === "before" && rule.timingValue) {
        targetDate = addDays(today, rule.timingValue);
      } else if (rule.timingType === "after" && rule.timingValue) {
        targetDate = subDays(today, rule.timingValue);
      }

      const dateStart = startOfDay(targetDate);
      const dateEnd = endOfDay(targetDate);

      let foundEntities: { id: string }[] = [];

      try {
        if (rule.triggerSource === "invoice") {
          foundEntities = await db.invoice.findMany({
            where: {
              organizationId: rule.organizationId,
              dueDate: { gte: dateStart, lte: dateEnd },
              status: { notIn: ["PAID", "CANCELLED"] },
            },
            select: { id: true },
          });
        } 
        else if (rule.triggerSource === "contract") {
          foundEntities = await db.contract.findMany({
            where: {
              organizationId: rule.organizationId,
              validUntil: { gte: dateStart, lte: dateEnd },
              status: { notIn: ["SIGNED", "CANCELLED", "EXPIRED"] },
            },
            select: { id: true },
          });
        } 
        else if (rule.triggerSource === "quotation") {
          foundEntities = await db.quotation.findMany({
            where: {
              organizationId: rule.organizationId,
              validUntil: { gte: dateStart, lte: dateEnd },
              status: { notIn: ["ACCEPTED", "REJECTED", "EXPIRED"] },
            },
            select: { id: true },
          });
        }

        for (const entity of foundEntities) {
          const idempotencyKey = `rem_${rule.id}_${entity.id}_${dateStart.getTime()}`;
          await enqueueReminder(idempotencyKey, {
            reminderId: rule.id,
            targetEntityId: entity.id,
            organizationId: rule.organizationId,
          });
          jobsQueued++;
        }
      } catch (err) {
        console.error(`[Scanner] Lỗi khi xử lý Rule ${rule.id}:`, err);
      }
    }

    console.log(`[Scanner] Đã quét xong. Tổng số Jobs đưa vào Queue: ${jobsQueued}`);
    return jobsQueued;
  }
}

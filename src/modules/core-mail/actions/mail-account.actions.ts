"use server";

import { MailAccountService } from "../services/mail-account.service";
import { CreateMailAccountDto } from "../types/core-mail.types";
import { revalidatePath } from "next/cache";
import { queueAllAccountsForSync, mailSyncQueueName } from "../workers/mail-sync.worker";
import { Queue } from "bullmq";
import IORedis from "ioredis";

export async function createMailAccountAction(data: CreateMailAccountDto, permissions: { memberId: string; role: string }[] = []) {
  try {
    const { db } = await import("@/lib/db");
    
    if (data.isSystem) {
      await db.mailAccount.updateMany({
        where: { organizationId: data.organizationId },
        data: { isSystem: false }
      });
      
      const { updateSettings } = await import("@/actions/settings");
      await updateSettings({
        smtp_host: data.smtpHost || "",
        smtp_port: data.smtpPort?.toString() || "465",
        smtp_user: data.smtpUsername || "",
        smtp_pass: data.smtpPassword || "",
        smtp_from_email: data.emailAddress || "",
        smtp_from_name: data.displayName || "",
        mail_mailer: "smtp",
        mail_scheme: data.smtpPort === 465 ? "smtps" : "smtp",
      });
    }

    const account = await db.mailAccount.create({
      data: {
        ...data,
        members: {
          create: permissions.filter(p => p.memberId).map(p => ({
            user: { connect: { id: p.memberId } },
            permissions: [p.role as any],
          }))
        }
      }
    });
    try {
      const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
      const mailQueue = new Queue(mailSyncQueueName, { connection });
      await mailQueue.add(`sync-${account.id}-${Date.now()}`, { accountId: account.id });
    } catch (e) {
      console.error("Failed to queue initial sync", e);
    }

    revalidatePath("/admin/settings/mail");
    return { success: true, account };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMailAccountAction(id: string, data: Partial<CreateMailAccountDto>, permissions: { memberId: string; role: string }[] = []) {
  try {
    const { db } = await import("@/lib/db");
    
    // Xóa members cũ và tạo mới lại cho đơn giản
    await db.mailAccountMember.deleteMany({
      where: { mailAccountId: id }
    });

    if (data.isSystem && data.organizationId) {
      await db.mailAccount.updateMany({
        where: { organizationId: data.organizationId, id: { not: id } },
        data: { isSystem: false }
      });

      const { updateSettings } = await import("@/actions/settings");
      await updateSettings({
        smtp_host: data.smtpHost || "",
        smtp_port: data.smtpPort?.toString() || "465",
        smtp_user: data.smtpUsername || "",
        smtp_pass: data.smtpPassword || "",
        smtp_from_email: data.emailAddress || "",
        smtp_from_name: data.displayName || "",
        mail_mailer: "smtp",
        mail_scheme: data.smtpPort === 465 ? "smtps" : "smtp",
      });
    }

    const account = await db.mailAccount.update({
      where: { id, organizationId: data.organizationId },
      data: {
        ...data,
        members: {
          create: permissions.filter(p => p.memberId).map(p => ({
            user: { connect: { id: p.memberId } },
            permissions: [p.role as any],
          }))
        }
      }
    });
    try {
      const connection = new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379");
      const mailQueue = new Queue(mailSyncQueueName, { connection });
      await mailQueue.add(`sync-${account.id}-${Date.now()}`, { accountId: account.id });
    } catch (e) {
      console.error("Failed to queue sync on update", e);
    }

    revalidatePath("/admin/settings/mail");
    return { success: true, account };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMailAccountsAction(organizationId: string) {
  try {
    const { db } = await import("@/lib/db");
    const accounts = await db.mailAccount.findMany({
      where: { organizationId },
      include: {
        members: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, accounts };
  } catch (error: any) {
    return { success: false, error: error.message, accounts: [] };
  }
}

export async function sendTestMailboxAction(data: CreateMailAccountDto, testEmail: string) {
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: data.smtpHost,
      port: data.smtpPort,
      secure: data.smtpPort === 465,
      auth: {
        user: data.smtpUsername,
        pass: data.smtpPassword,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"${data.displayName}" <${data.emailAddress}>`,
      to: testEmail,
      subject: "Test kết nối Mailbox thành công - OVC Workspace",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Kết nối SMTP thành công!</h2>
          <p>Xin chào,</p>
          <p>Nếu bạn nhận được email này, cấu hình SMTP của Mailbox <strong>${data.emailAddress}</strong> đã hoạt động chính xác trên hệ thống OVC Workspace.</p>
          <p>Cấu hình đã sử dụng:</p>
          <ul>
            <li>Host: ${data.smtpHost}</li>
            <li>Port: ${data.smtpPort}</li>
            <li>Username: ${data.smtpUsername}</li>
          </ul>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

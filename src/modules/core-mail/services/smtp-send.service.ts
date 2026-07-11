import nodemailer from "nodemailer";
import { getSystemDb } from "@/lib/db";
import { StorageGateway } from "@/modules/core-storage/services/StorageGateway";

export interface SendMailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    path?: string; // URL from StorageGateway or local path
    content?: string | Buffer; // For base64 or raw content
  }[];
  replyToMessageId?: string; // Original Message-ID if replying
}

export class SmtpSendService {
  static async sendMail(accountId: string, options: SendMailOptions) {
    const prisma = getSystemDb();

    // 1. Fetch account credentials
    const account = await prisma.mailAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error("Tài khoản mail không tồn tại.");
    }

    if (account.status !== "ACTIVE") {
      throw new Error("Tài khoản mail đang bị vô hiệu hóa.");
    }

    // 2. Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: account.smtpHost,
      port: account.smtpPort,
      secure: account.smtpSsl,
      auth: {
        user: account.smtpUsername,
        pass: account.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // 3. Prepare mail options
    const mailOptions: nodemailer.SendMailOptions = {
      from: account.displayName 
        ? `"${account.displayName}" <${account.emailAddress}>` 
        : account.emailAddress,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map((att) => {
        let content = att.content;
        if (typeof content === "string") {
          content = Buffer.from(content, "base64");
        }
        return {
          filename: att.filename,
          path: att.path,
          content: content,
        };
      }),
    };

    if (options.cc) {
      mailOptions.cc = Array.isArray(options.cc) ? options.cc.join(", ") : options.cc;
    }
    if (options.bcc) {
      mailOptions.bcc = Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc;
    }
    if (options.replyToMessageId) {
      mailOptions.inReplyTo = options.replyToMessageId;
    }
    if (account.replyTo) {
      mailOptions.replyTo = account.replyTo;
    }

    // 4. Send email
    let info;
    try {
      info = await transporter.sendMail(mailOptions);
    } catch (error: any) {
      console.error("[SMTP Sync] Lỗi gửi mail:", error);
      throw new Error(`Gửi email thất bại: ${error.message}`);
    }

    // 5. Save sent message to database (in 'sent' folder)
    try {
      // Create a basic thread if none exists (just a placeholder)
      const thread = await prisma.mailThread.create({
        data: {
          organizationId: account.organizationId,
          mailAccountId: account.id,
          subject: options.subject,
          lastMessageAt: new Date(),
          messageCount: 1,
        }
      });

      const message = await prisma.mailMessage.create({
        data: {
          organizationId: account.organizationId,
          mailAccountId: account.id,
          threadId: thread.id,
          messageId: info?.messageId || `sent-${Date.now()}@ovc.vn`,
          folder: "Sent",
          fromName: account.displayName,
          fromEmail: account.emailAddress,
          to: Array.isArray(options.to) ? options.to : [options.to],
          cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : [],
          bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : [],
          subject: options.subject,
          bodyHtml: options.html,
          bodyText: options.html.replace(/<[^>]+>/g, ""), // basic strip html
          receivedAt: new Date(),
          isRead: true,
        },
      });

      // Save attachments and upload to StorageGateway
      if (options.attachments && options.attachments.length > 0) {
        for (const att of options.attachments) {
          let fileUrl = att.path || "";
          let bufferContent: Buffer | null = null;
          let fileSize = 0;

          // Convert content to Buffer if it exists
          if (att.content) {
            if (Buffer.isBuffer(att.content)) {
              bufferContent = att.content;
            } else if (typeof att.content === "string") {
              // Assume base64 if it's a string from client
              bufferContent = Buffer.from(att.content, "base64");
            }
          }

          if (bufferContent) {
            fileSize = bufferContent.length;
            try {
              const storageFile = await StorageGateway.upload(
                bufferContent,
                att.filename,
                "application/octet-stream", // generic fallback
                "MAIL_ATTACHMENT",
                "MAIL",
                account.organizationId,
                message.id
              );
              fileUrl = `/api/storage/download?fileId=${storageFile.id}`;
            } catch (err) {
              console.error("[SMTP Sync] Lỗi upload attachment to StorageGateway:", err);
            }
          }

          await prisma.mailAttachment.create({
            data: {
              messageId: message.id,
              fileName: att.filename,
              mimeType: "application/octet-stream", // Fallback
              size: fileSize,
              fileUrl: fileUrl,
            }
          });
        }
      }

      return {
        success: true,
        messageId: info.messageId,
        dbMessageId: message.id,
      };
    } catch (dbError) {
      console.error("[SMTP Sync] Lỗi lưu email đã gửi vào DB:", dbError);
      // We don't throw here because the email was already sent successfully
      return {
        success: true,
        messageId: info.messageId,
        note: "Email sent but failed to save in Sent folder",
      };
    }
  }
}

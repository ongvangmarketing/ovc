import { Resend } from "resend";
import nodemailer from "nodemailer";

import { db } from "@/lib/db";

export type EmailSendInput = {
  organizationId: string;
  to: string | string[];
  subject: string;
  html: string;
  templateCode?: string;
  relatedType?: string;
  relatedId?: string;
  fromEmail?: string;
  fromName?: string;
  metadata?: Record<string, unknown>;
};

export type TemplateRenderInput = {
  organizationId: string;
  code: string;
  variables: Record<string, unknown>;
  fallbackSubject: string;
  fallbackBody: string;
};

const mailOnceMemory = new Map<string, number>();

export function normalizeTemplateCode(code: string) {
  return code.trim().replace(/-/g, "_").toUpperCase();
}

export function formatVnd(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  })
    .format(Number.isFinite(amount) ? amount : 0)
    .replace(/\s/g, "");
}

export function formatMailDate(value: unknown) {
  if (!value) return "---";
  const date = new Date(value as string | Date);
  if (Number.isNaN(date.getTime())) return "---";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function stringify(value: unknown) {
  if (value == null) return "";
  if (value instanceof Date) return formatMailDate(value);
  return String(value);
}

function toJsonValue(value: unknown) {
  if (value == null) return undefined;
  return JSON.parse(JSON.stringify(value));
}

export function renderString(template: string, variables: Record<string, unknown>) {
  return Object.entries(variables).reduce((text, [key, value]) => {
    const safeValue = stringify(value);
    return text
      .replaceAll(`{{${key}}}`, safeValue)
      .replaceAll(`{${key}}`, safeValue);
  }, template);
}

export async function renderEmailTemplate(input: TemplateRenderInput) {
  const normalized = normalizeTemplateCode(input.code);
  const template = await db.emailTemplate.findFirst({
    where: {
      organizationId: input.organizationId,
      code: { in: [input.code, normalized, input.code.toLowerCase()] },
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const subject = template?.subject ?? input.fallbackSubject;
  const body = template?.body ?? input.fallbackBody;

  return {
    code: template?.code ?? normalized,
    subject: renderString(subject, input.variables),
    html: renderString(body, input.variables),
  };
}

export async function sendEmail(input: EmailSendInput) {
  const recipients = Array.isArray(input.to) ? input.to.filter(Boolean) : [input.to].filter(Boolean);
  if (!recipients.length) {
    throw new Error("Email recipient is required");
  }

  const settings = await db.setting.findMany({
    where: { organizationId: input.organizationId },
  });
  const settingsMap = Object.fromEntries(settings.map((item) => [item.key, item.value ?? ""]));

  const fromEmail = input.fromEmail || settingsMap.smtp_from_email || process.env.RESEND_FROM_EMAIL || "info@ovc.vn";
  const fromName = input.fromName || settingsMap.smtp_from_name || process.env.RESEND_FROM_NAME || "Ong Vàng Workspace";
  const smtpHost = settingsMap.smtp_host?.trim();
  const smtpUser = settingsMap.smtp_user?.trim();
  const smtpPass = settingsMap.smtp_pass?.trim();
  const smtpPort = Number(settingsMap.smtp_port || 465);
  const shouldUseSmtp = Boolean(smtpHost && smtpUser && smtpPass);
  const provider = shouldUseSmtp ? "smtp" : process.env.RESEND_API_KEY ? "resend" : "not_configured";

  const log = await db.emailLog.create({
    data: {
      organizationId: input.organizationId,
      status: "PENDING",
      provider,
      templateCode: input.templateCode,
      subject: input.subject,
      to: recipients,
      fromEmail,
      fromName,
      relatedType: input.relatedType,
      relatedId: input.relatedId,
      metadata: toJsonValue(input.metadata),
    },
  });

  if (!shouldUseSmtp && !process.env.RESEND_API_KEY) {
    await db.emailLog.update({
      where: { id: log.id },
      data: {
        status: "SKIPPED",
        errorMessage: "SMTP/RESEND is not configured. Email content was rendered and logged only.",
      },
    });
    return { sent: false, skipped: true, logId: log.id };
  }

  try {
    if (shouldUseSmtp) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number.isFinite(smtpPort) ? smtpPort : 465,
        secure: settingsMap.mail_scheme === "smtps" || smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const result = await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: recipients,
        subject: input.subject,
        html: input.html,
      });

      await db.emailLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          messageId: result.messageId,
          sentAt: new Date(),
          metadata: toJsonValue({ ...(input.metadata ?? {}), providerMessageId: result.messageId }),
        },
      });

      return { sent: true, skipped: false, logId: log.id, messageId: result.messageId };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: recipients,
      subject: input.subject,
      html: input.html,
    });

    await db.emailLog.update({
      where: { id: log.id },
      data: {
        status: "SENT",
        messageId: result.data?.id,
        sentAt: new Date(),
        metadata: toJsonValue({ ...(input.metadata ?? {}), providerMessageId: result.data?.id }),
      },
    });

    return { sent: true, skipped: false, logId: log.id, messageId: result.data?.id };
  } catch (error) {
    await db.emailLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown email provider error",
      },
    });
    throw error;
  }
}

export async function sendMailOnce(key: string, seconds: number, callback: () => Promise<unknown>) {
  const now = Date.now();
  const expiresAt = mailOnceMemory.get(key);
  if (expiresAt && expiresAt > now) {
    return { skipped: true };
  }

  mailOnceMemory.set(key, now + seconds * 1000);
  try {
    await callback();
    return { skipped: false };
  } catch (error) {
    mailOnceMemory.delete(key);
    throw error;
  }
}

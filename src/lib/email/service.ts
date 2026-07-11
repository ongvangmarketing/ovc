import { Resend } from "resend";
import nodemailer from "nodemailer";

import { getTenantDb } from "@/lib/db";
import { getOrganizationPublicBaseUrl } from "@/lib/workspace-domain";
import { wrapGoogleWorkspaceStyle, MetaBoxItem } from "./templates";

export type EmailSendInput = {
  organizationId: string;
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
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
  metaBoxItems?: MetaBoxItem[];
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

async function companyVariables(organizationId: string) {
  const [organization, settings] = await Promise.all([
    getTenantDb().organization.findUnique({
      where: { id: organizationId },
      select: { name: true, logo: true, website: true, email: true, phone: true, address: true, description: true },
    }),
    getTenantDb().setting.findMany({
      where: { 
        organizationId, 
        key: { startsWith: "company_" }
      },
    }),
  ]);
  const settingsMap = Object.fromEntries(settings.map((item) => [item.key, item.value ?? ""]));

  return {
    company_workspace_name: settingsMap.company_workspace_name || settingsMap.company_name || organization?.name || "",
    company_name: settingsMap.company_name || organization?.name || "",
    company_logo: settingsMap.company_logo_url || organization?.logo || "",
    company_logo_url: settingsMap.company_logo_url || organization?.logo || "",
    company_favicon: settingsMap.company_favicon_url || "",
    company_favicon_url: settingsMap.company_favicon_url || "",
    company_tax_code: settingsMap.company_tax_code || "",
    company_address: settingsMap.company_address || organization?.address || "",
    company_representative: settingsMap.company_representative || "",
    company_function: settingsMap.company_function || organization?.description || "",
    company_email: settingsMap.company_email || organization?.email || "",
    company_website: settingsMap.company_website || organization?.website || "",
    company_hotline: settingsMap.company_hotline || organization?.phone || "",
  };
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
  const compVars = await companyVariables(input.organizationId);
  const variables = {
    ...input.variables,
    ...compVars,
  };
  const normalized = normalizeTemplateCode(input.code);
  const template = await getTenantDb().emailTemplate.findFirst({
    where: {
      organizationId: input.organizationId,
      code: { in: [input.code, normalized, input.code.toLowerCase()] },
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!template) {
    throw new Error(`Không tìm thấy mẫu email đang hoạt động cho mã ${normalized}.`);
  }

  const subject = template.subject;
  const body = template.body;

  const rawHtml = renderString(body, variables);
  
  const finalHtml = wrapGoogleWorkspaceStyle(rawHtml, variables, input.metaBoxItems);

  return {
    code: template.code,
    subject: renderString(subject, variables),
    html: finalHtml,
  };
}

export async function sendEmail(input: EmailSendInput) {
  const recipients = Array.isArray(input.to) ? input.to.filter(Boolean) : [input.to].filter(Boolean);
  if (!recipients.length) {
    throw new Error("Email recipient is required");
  }

  const settings = await getTenantDb().setting.findMany({
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

  const log = await getTenantDb().emailLog.create({
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
  const publicBaseUrl = await getOrganizationPublicBaseUrl(input.organizationId, "portal").catch(() => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  const trackingPixel = `<img src="${publicBaseUrl}/api/email/open/${log.id}.png" width="1" height="1" alt="" style="display:none!important;opacity:0;width:1px;height:1px;border:0;" />`;
  const htmlWithTracking = `${input.html || ""}${trackingPixel}`;

  if (!shouldUseSmtp && !process.env.RESEND_API_KEY) {
    await getTenantDb().emailLog.update({
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
        html: htmlWithTracking,
        attachments: input.attachments,
      });

      await getTenantDb().emailLog.update({
        where: { id: log.id },
        data: {
          status: "SENT",
          messageId: result.messageId,
          sentAt: new Date(),
          attachmentsCount: input.attachments?.length ?? 0,
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
      html: htmlWithTracking,
      attachments: input.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content.toString("base64"),
        contentType: attachment.contentType,
      })),
    });

    await getTenantDb().emailLog.update({
      where: { id: log.id },
      data: {
        status: "SENT",
        messageId: result.data?.id,
        sentAt: new Date(),
        attachmentsCount: input.attachments?.length ?? 0,
        metadata: toJsonValue({ ...(input.metadata ?? {}), providerMessageId: result.data?.id }),
      },
    });

    return { sent: true, skipped: false, logId: log.id, messageId: result.data?.id };
  } catch (error) {
    await getTenantDb().emailLog.update({
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

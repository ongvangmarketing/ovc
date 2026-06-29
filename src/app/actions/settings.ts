"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { defaultTemplates, buildTemplateHtml } from "./default-templates";
import { hashPassword } from "better-auth/crypto";
import { sendPortalAccountEmail } from "@/lib/email/flows";
import { renderEmailTemplate, sendEmail } from "@/lib/email/service";

// --- SETTINGS ---
export async function getSettings() {
  const session = await requireAuth();
  
  const settings = await db.setting.findMany({
    where: { organizationId: session.organizationId }
  });
  
  // Convert array to key-value object
  return settings.reduce((acc: Record<string, string>, curr: { key: string; value: string | null }) => {
    acc[curr.key] = curr.value || "";
    return acc;
  }, {});
}

export async function updateSettings(data: Record<string, string>) {
  const session = await requireAuth();
  
  // Upsert each setting
  for (const [key, value] of Object.entries(data)) {
    await db.setting.upsert({
      where: {
        organizationId_key: {
          organizationId: session.organizationId,
          key: key
        }
      },
      update: { value },
      create: {
        organizationId: session.organizationId,
        key: key,
        value: value,
        type: "string"
      }
    });
  }

  revalidatePath("/workspace/settings");
  return { success: true };
}

export async function sendTestEmail(to: string) {
  const session = await requireAuth();
  const recipient = to.trim();

  if (!recipient || !recipient.includes("@")) {
    throw new Error("Email nhận test không hợp lệ");
  }

  const variables = {
    customer_name: session.user.name || "Khách hàng Ong Vàng",
    email: recipient,
    password: "OngVang@Test",
    portal_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    staff_name: session.user.name || session.user.email,
    company_name: "Ong Vàng Workspace",
  };

  const template = await renderEmailTemplate({
    organizationId: session.organizationId,
    code: "CUSTOMER_ACCOUNT_CREATED",
    variables,
    fallbackSubject: "Tài khoản Portal Ong Vàng đã được kích hoạt",
    fallbackBody: `
      <div style="font-family: Inter, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
        <h2 style="margin: 0 0 12px; color: #f97316;">Ong Vàng Workspace</h2>
        <p>Xin chào {{customer_name}},</p>
        <p>Tài khoản Portal của bạn đã được kích hoạt.</p>
        <p>Email đăng nhập: <strong>{{email}}</strong></p>
        <p>Mật khẩu: <strong>{{password}}</strong></p>
        <p><a href="{{portal_url}}">Đăng nhập Portal</a></p>
      </div>
    `,
  });

  const result = await sendEmail({
    organizationId: session.organizationId,
    to: recipient,
    subject: `[TEST] ${template.subject}`,
    html: template.html,
    templateCode: template.code,
    relatedType: "SystemSetting",
    relatedId: "email-test",
    metadata: {
      action: "email_setup_test",
      operatorEmail: session.user.email,
    },
  });

  revalidatePath("/workspace/settings");
  return result;
}

// --- EMAIL TEMPLATES ---
export async function getEmailTemplates() {
  const session = await requireAuth();
  
  const templates = await db.emailTemplate.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "asc" }
  });

  return templates;
}

export async function getEmailLogs() {
  const session = await requireAuth();

  return db.emailLog.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getMembers() {
  const session = await requireAuth();

  return db.organizationMember.findMany({
    where: { organizationId: session.organizationId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getActivityLogs() {
  const session = await requireAuth();

  return db.activityLog.findMany({
    where: { organizationId: session.organizationId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function updateEmailTemplate(code: string, data: { name: string, subject: string, body: string, variables: string[] }) {
  const session = await requireAuth();
  
  await db.emailTemplate.upsert({
    where: {
      organizationId_code: {
        organizationId: session.organizationId,
        code
      }
    },
    update: {
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables
    },
    create: {
      organizationId: session.organizationId,
      code,
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables
    }
  });

  revalidatePath("/workspace/settings");
  return { success: true };
}

export async function seedDefaultTemplates() {
  const session = await requireAuth();
  
  for (const t of defaultTemplates) {
    const finalHtml = buildTemplateHtml(t);
    await db.emailTemplate.upsert({
      where: {
        organizationId_code: {
          organizationId: session.organizationId,
          code: t.code
        }
      },
      update: {}, // don't overwrite if exists
      create: {
        organizationId: session.organizationId,
        code: t.code,
        name: t.name,
        subject: t.subject,
        body: finalHtml,
        variables: t.variables
      }
    });
  }
}

function randomPassword() {
  return `OngVang@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function sendPortalAccessEmailForUser(userId: string, password?: string) {
  const session = await requireAuth();

  const member = await db.organizationMember.findFirst({
    where: {
      organizationId: session.organizationId,
      userId,
    },
    include: { user: true },
  });

  if (!member) {
    throw new Error("User không thuộc workspace hiện tại");
  }

  const loginPassword = password?.trim() || randomPassword();
  const hashedPassword = await hashPassword(loginPassword);

  await db.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: member.user.id,
      },
    },
    update: { password: hashedPassword },
    create: {
      userId: member.user.id,
      accountId: member.user.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  await sendPortalAccountEmail({
    organizationId: session.organizationId,
    recipientEmail: member.user.email,
    recipientName: member.user.name || member.user.email,
    loginPassword,
    portalRole: member.user.role,
    operatorName: session.user.name,
    operatorEmail: session.user.email,
    relatedType: "User",
    relatedId: member.user.id,
    sendRecipient: true,
  });

  revalidatePath("/workspace/settings");
  return {
    success: true,
    email: member.user.email,
    generatedPassword: password ? null : loginPassword,
  };
}

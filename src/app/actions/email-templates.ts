"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { renderEmailTemplate, sendEmail } from "@/lib/email/service";

export async function getEmailTemplates() {
  const session = await requireAuth();
  
  const templates = await db.emailTemplate.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "asc" }
  });

  return templates;
}

export async function createEmailTemplate(data: { code: string, name: string, subject: string, body: string, variables: string[] }) {
  const session = await requireAuth();

  // Validate unique code
  const existing = await db.emailTemplate.findUnique({
    where: {
      organizationId_code: {
        organizationId: session.organizationId,
        code: data.code,
      }
    }
  });

  if (existing) {
    throw new Error("Mã Code template đã tồn tại. Vui lòng chọn mã khác.");
  }

  await db.emailTemplate.create({
    data: {
      organizationId: session.organizationId,
      code: data.code,
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables,
      isActive: true,
    }
  });

  revalidatePath("/workspace/settings");
  return { success: true };
}

export async function updateEmailTemplate(id: string, data: { name: string, subject: string, body: string, variables: string[] }) {
  const session = await requireAuth();
  
  await db.emailTemplate.update({
    where: {
      id,
      organizationId: session.organizationId,
    },
    data: {
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables
    }
  });

  revalidatePath("/workspace/settings");
  return { success: true };
}

export async function toggleEmailTemplateActive(id: string, isActive: boolean) {
  const session = await requireAuth();
  
  await db.emailTemplate.update({
    where: {
      id,
      organizationId: session.organizationId,
    },
    data: {
      isActive
    }
  });

  revalidatePath("/workspace/settings");
  return { success: true };
}

export async function sendTestEmailTemplate(id: string, testEmail: string) {
  const session = await requireAuth();
  
  const template = await db.emailTemplate.findUnique({
    where: {
      id,
      organizationId: session.organizationId,
    }
  });

  if (!template) {
    throw new Error("Không tìm thấy template");
  }

  // Tạo mock variables
  const mockVariables = template.variables.reduce((acc, curr) => {
    acc[curr] = `[${curr} mẫu]`;
    return acc;
  }, {} as Record<string, string>);

  const rendered = await renderEmailTemplate({
    organizationId: session.organizationId,
    code: template.code,
    variables: mockVariables,
    fallbackSubject: template.subject,
    fallbackBody: template.body,
  });

  await sendEmail({
    organizationId: session.organizationId,
    to: testEmail,
    subject: `[TEST] ${rendered.subject}`,
    html: rendered.html,
    templateCode: template.code,
  });

  return { success: true };
}

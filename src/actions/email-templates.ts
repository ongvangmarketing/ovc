"use server";

import { revalidatePath } from "next/cache";
import { getTenantDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { renderEmailTemplate, sendEmail } from "@/lib/email/service";
import { buildTemplateHtml, defaultTemplates, inferTemplateModule, templateCopyByCode } from "@/actions/default-templates";

export async function getEmailTemplates() {
  const session = await requireAuth();
  
  const templates = await getTenantDb().emailTemplate.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { createdAt: "asc" }
  });

  return templates;
}

export async function createEmailTemplate(data: { code: string, name: string, subject: string, body: string, variables: string[] }) {
  const session = await requireAuth();

  // Validate unique code
  const existing = await getTenantDb().emailTemplate.findUnique({
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

  await getTenantDb().emailTemplate.create({
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
  
  await getTenantDb().emailTemplate.update({
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
  
  await getTenantDb().emailTemplate.update({
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

export async function applyMinimalEmailTemplateDesign() {
  const session = await requireAuth();
  const legacyCodes = ["SEND_QUOTATION", "SEND_CONTRACT", "SEND_INVOICE"];
  await getTenantDb().emailTemplate.deleteMany({
    where: { organizationId: session.organizationId, code: { in: legacyCodes } },
  });

  const templates = await getTenantDb().emailTemplate.findMany({
    where: { organizationId: session.organizationId },
  });
  const defaultsByCode = new Map(defaultTemplates.map((template) => [template.code, template]));
  const existingCodes = new Set(templates.map((template) => template.code));

  await Promise.all([
    ...templates.map((template) => {
      const canonical = defaultsByCode.get(template.code);
      const source = {
        code: template.code,
        module: canonical?.module || inferTemplateModule(template),
        name: template.name,
        body: templateCopyByCode[template.code]
          || canonical?.body
          || `Thông báo <strong>${template.name}</strong> đã được cập nhật.<br><br>Vui lòng kiểm tra thông tin chi tiết và thực hiện bước tiếp theo trên hệ thống.`,
        variables: template.variables,
      };

      return getTenantDb().emailTemplate.update({
        where: { id: template.id, organizationId: session.organizationId },
        data: { body: buildTemplateHtml(source) },
      });
    }),
    ...defaultTemplates
      .filter((template) => !existingCodes.has(template.code))
      .map((template) => getTenantDb().emailTemplate.create({
        data: {
          organizationId: session.organizationId,
          code: template.code,
          name: template.name,
          subject: template.subject,
          body: buildTemplateHtml({
            ...template,
            body: templateCopyByCode[template.code] || template.body,
          }),
          variables: template.variables,
          isActive: true,
        },
      })),
    getTenantDb().setting.upsert({
      where: {
        organizationId_key: {
          organizationId: session.organizationId,
          key: "email_global_layout",
        },
      },
      update: { value: "" },
      create: {
        organizationId: session.organizationId,
        key: "email_global_layout",
        value: "",
      },
    }),
  ]);
  revalidatePath("/workspace/settings/email-templates");
  return { success: true, total: templates.length + defaultTemplates.filter((template) => !existingCodes.has(template.code)).length };
}

export async function sendTestEmailTemplate(id: string, testEmail: string) {
  const session = await requireAuth();
  
  const template = await getTenantDb().emailTemplate.findUnique({
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

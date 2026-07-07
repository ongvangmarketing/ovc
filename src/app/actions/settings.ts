"use server";

import { randomUUID } from "crypto";
import { promises as dns } from "dns";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { defaultTemplates, buildTemplateHtml } from "./default-templates";
import { hashPassword } from "better-auth/crypto";
import { sendPortalAccountEmail } from "@/lib/email/flows";
import { renderEmailTemplate, sendEmail } from "@/lib/email/service";
import { getOrganizationPublicBaseUrl } from "@/lib/workspace-domain";

export type WorkspaceDomainConfig = {
  id: string;
  domain: string;
  target: "portal" | "homepage" | "marketing" | "training" | "app";
  status: "pending" | "dns_verified" | "ssl_pending" | "active" | "failed";
  verificationName: string;
  verificationValue: string;
  cnameTarget: string;
  aRecordTarget: string;
  sslStatus: "pending" | "issued" | "failed";
  lastCheckedAt?: string;
  lastError?: string;
  createdAt: string;
};

// --- SETTINGS ---
export async function getSettings() {
  const session = await requireAuth();
  
  const [settings, organization] = await Promise.all([
    db.setting.findMany({
      where: { organizationId: session.organizationId }
    }),
    db.organization.findUnique({
      where: { id: session.organizationId },
      select: { name: true, logo: true, website: true, email: true, phone: true, address: true, description: true },
    }),
  ]);
  
  // Convert array to key-value object
  const result = settings.reduce((acc: Record<string, string>, curr: { key: string; value: string | null }) => {
    acc[curr.key] = curr.value || "";
    return acc;
  }, {});

  return {
    ...result,
    company_workspace_name: result.company_workspace_name || result.company_name || organization?.name || "",
    company_name: result.company_name || organization?.name || "",
    company_logo_url: result.company_logo_url || organization?.logo || "",
    company_website: result.company_website || organization?.website || "",
    company_email: result.company_email || organization?.email || "",
    company_hotline: result.company_hotline || organization?.phone || "",
    company_address: result.company_address || organization?.address || "",
    company_function: result.company_function || organization?.description || "",
  };
}

function customDomainCnameTarget() {
  const configured = process.env.CUSTOM_DOMAIN_CNAME_TARGET || process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_TARGET;
  if (configured) return configured.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    return new URL(appUrl).hostname;
  } catch {
    return "domains.app.ovc.vn";
  }
}

async function customDomainARecordTarget() {
  const configured = process.env.CUSTOM_DOMAIN_A_TARGET || process.env.CUSTOM_DOMAIN_IPV4;
  if (configured) return configured;

  const candidates = [
    process.env.CUSTOM_DOMAIN_CNAME_TARGET,
    process.env.NEXT_PUBLIC_CUSTOM_DOMAIN_TARGET,
    process.env.NEXT_PUBLIC_APP_URL,
    "app.ovc.vn",
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const host = cleanDomain(candidate);
    if (!host || host === "localhost" || host === "127.0.0.1") continue;
    try {
      const [record] = await dns.resolve4(host);
      if (record) return record;
    } catch {
      // Try the next configured hostname.
    }
  }

  return "35.247.144.101";
}

function cleanDomain(value: string) {
  return value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, "");
}

function verificationName(domain: string) {
  return `_ovc-domain.${domain}`;
}

function verificationValue(organizationId: string, domain: string) {
  return `ovc-domain=${organizationId}:${domain}`;
}

function parseWorkspaceDomains(value?: string | null): WorkspaceDomainConfig[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function loadWorkspaceDomains(organizationId: string) {
  const setting = await db.setting.findUnique({
    where: {
      organizationId_key: {
        organizationId,
        key: "workspace_custom_domains",
      },
    },
  });

  return parseWorkspaceDomains(setting?.value);
}

async function normalizeWorkspaceDomains(domains: WorkspaceDomainConfig[]) {
  const aRecordTarget = await customDomainARecordTarget();
  const cnameTarget = customDomainCnameTarget();

  return domains.map((domain) => ({
    ...domain,
    cnameTarget: domain.cnameTarget || cnameTarget,
    aRecordTarget: !domain.aRecordTarget || domain.aRecordTarget.includes("Chưa cấu hình") ? aRecordTarget : domain.aRecordTarget,
  }));
}

async function saveWorkspaceDomains(organizationId: string, domains: WorkspaceDomainConfig[]) {
  await db.setting.upsert({
    where: {
      organizationId_key: {
        organizationId,
        key: "workspace_custom_domains",
      },
    },
    update: { value: JSON.stringify(domains) },
    create: {
      organizationId,
      key: "workspace_custom_domains",
      value: JSON.stringify(domains),
      type: "json",
    },
  });
}

async function verifyDomainDns(domainConfig: WorkspaceDomainConfig) {
  const errors: string[] = [];
  let txtOk = false;
  let aRecordOk = false;

  try {
    const txtRecords = await dns.resolveTxt(domainConfig.verificationName);
    txtOk = txtRecords.some((record) => record.join("").trim() === domainConfig.verificationValue);
    if (!txtOk) errors.push("TXT xác minh chưa đúng.");
  } catch {
    errors.push("Chưa tìm thấy TXT xác minh.");
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(domainConfig.aRecordTarget)) {
    try {
      const aRecords = await dns.resolve4(domainConfig.domain);
      aRecordOk = aRecords.includes(domainConfig.aRecordTarget);
      if (!aRecordOk) errors.push(`A record chưa trỏ về IP ${domainConfig.aRecordTarget}.`);
    } catch {
      errors.push("Chưa tìm thấy A record.");
    }
  } else {
    errors.push("Chưa có IP public để trỏ A record.");
  }

  const dnsVerified = txtOk && aRecordOk;

  return {
    status: dnsVerified ? "dns_verified" as const : "failed" as const,
    sslStatus: dnsVerified ? "pending" as const : domainConfig.sslStatus,
    lastError: dnsVerified ? "" : errors.join(" "),
    lastCheckedAt: new Date().toISOString(),
  };
}

async function provisionWorkspaceDomainSsl(domainConfig: WorkspaceDomainConfig) {
  const webhookUrl = process.env.SSL_PROVISION_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      status: "active" as const,
      sslStatus: "issued" as const,
      lastError: "",
    };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.SSL_PROVISION_WEBHOOK_TOKEN ? { authorization: `Bearer ${process.env.SSL_PROVISION_WEBHOOK_TOKEN}` } : {}),
    },
    body: JSON.stringify({
      domain: domainConfig.domain,
      target: domainConfig.target,
      id: domainConfig.id,
    }),
  });

  if (!response.ok) {
    return {
      status: "ssl_pending" as const,
      sslStatus: "pending" as const,
      lastError: "DNS đã đúng, hệ thống đang chờ hạ tầng cấp SSL tự động.",
    };
  }

  return {
    status: "active" as const,
    sslStatus: "issued" as const,
    lastError: "",
  };
}

export async function getWorkspaceDomains() {
  const session = await requireAuth();
  const domains = await loadWorkspaceDomains(session.organizationId);
  const normalizedDomains = await normalizeWorkspaceDomains(domains);

  if (JSON.stringify(domains) !== JSON.stringify(normalizedDomains)) {
    await saveWorkspaceDomains(session.organizationId, normalizedDomains);
  }

  return normalizedDomains;
}

export async function createWorkspaceDomain(input: { domain: string; target: "portal" | "homepage" | "marketing" | "training" | "app" }) {
  const session = await requireAuth();
  const domain = cleanDomain(input.domain);

  if (!domain || !domain.includes(".") || domain.includes(" ")) {
    throw new Error("Tên miền không hợp lệ.");
  }

  const domains = await loadWorkspaceDomains(session.organizationId);
  if (domains.some((item) => item.domain === domain)) {
    throw new Error("Tên miền này đã được thêm.");
  }

  const domainConfig: WorkspaceDomainConfig = {
    id: randomUUID(),
    domain,
    target: input.target,
    status: "pending",
    verificationName: verificationName(domain),
    verificationValue: verificationValue(session.organizationId, domain),
    cnameTarget: customDomainCnameTarget(),
    aRecordTarget: await customDomainARecordTarget(),
    sslStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  await saveWorkspaceDomains(session.organizationId, [domainConfig, ...domains]);
  revalidatePath("/workspace/settings/domains");
  return { success: true, domain: domainConfig };
}

export async function checkWorkspaceDomain(id: string) {
  const session = await requireAuth();
  const domains = await loadWorkspaceDomains(session.organizationId);
  const domain = domains.find((item) => item.id === id);
  if (!domain) throw new Error("Không tìm thấy tên miền.");

  const verified = await verifyDomainDns(domain);
  const sslResult = verified.status === "dns_verified"
    ? await provisionWorkspaceDomainSsl({ ...domain, ...verified })
    : null;
  const updatedDomain = {
    ...domain,
    ...verified,
    ...(sslResult || { status: verified.status, sslStatus: verified.sslStatus }),
  };

  const nextDomains = domains.map((item) => item.id === id ? updatedDomain : item);
  await saveWorkspaceDomains(session.organizationId, nextDomains);
  revalidatePath("/workspace/settings/domains");
  return { success: true, domain: updatedDomain };
}

export async function activateWorkspaceDomain(id: string) {
  const session = await requireAuth();
  const domains = await loadWorkspaceDomains(session.organizationId);
  const domain = domains.find((item) => item.id === id);
  if (!domain) throw new Error("Không tìm thấy tên miền.");
  if (!["dns_verified", "ssl_pending", "active"].includes(domain.status)) {
    throw new Error("Tên miền cần xác minh DNS trước.");
  }

  const sslResult = await provisionWorkspaceDomainSsl(domain);
  const updatedDomain = {
    ...domain,
    ...sslResult,
    lastCheckedAt: new Date().toISOString(),
  };

  await saveWorkspaceDomains(session.organizationId, domains.map((item) => item.id === id ? updatedDomain : item));
  revalidatePath("/workspace/settings/domains");
  return { success: true, domain: updatedDomain };
}

export async function removeWorkspaceDomain(id: string) {
  const session = await requireAuth();
  const domains = await loadWorkspaceDomains(session.organizationId);
  await saveWorkspaceDomains(session.organizationId, domains.filter((item) => item.id !== id));
  revalidatePath("/workspace/settings/domains");
  return { success: true };
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

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function uploadBrandImage(file: FormDataEntryValue | null, type: "logo" | "favicon") {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error(`${type === "logo" ? "Logo" : "Favicon"} phải là file ảnh`);
  if (file.size > 2 * 1024 * 1024) throw new Error(`${type === "logo" ? "Logo" : "Favicon"} tối đa 2MB`);
  if (type === "logo" && (file.type === "image/x-icon" || file.type === "image/vnd.microsoft.icon" || file.name.toLowerCase().endsWith(".ico"))) {
    throw new Error("Logo không dùng file ICO. Vui lòng upload PNG, JPG, SVG hoặc WEBP.");
  }

  const ext = file.type === "image/png"
    ? "png"
    : file.type === "image/webp"
      ? "webp"
      : file.type === "image/svg+xml"
        ? "svg"
        : file.type === "image/x-icon" || file.type === "image/vnd.microsoft.icon"
          ? "ico"
          : "jpg";
  const filename = `${type}-${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "company");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/company/${filename}`;
}

export async function updateCompanySettings(formData: FormData) {
  const session = await requireAuth();
  const uploadedLogo = await uploadBrandImage(formData.get("company_logo_file"), "logo");
  const uploadedFavicon = await uploadBrandImage(formData.get("company_favicon_file"), "favicon");
  const existing = (await getSettings()) as Record<string, string>;

  const settings = {
    company_workspace_name: textValue(formData, "company_workspace_name") || existing.company_workspace_name,
    company_name: textValue(formData, "company_name") || existing.company_name,
    company_logo_url: uploadedLogo || textValue(formData, "company_logo_url") || existing.company_logo_url,
    company_favicon_url: uploadedFavicon || textValue(formData, "company_favicon_url") || existing.company_favicon_url,
    company_tax_code: textValue(formData, "company_tax_code") || existing.company_tax_code || "",
    company_address: textValue(formData, "company_address") || existing.company_address || "",
    company_representative: textValue(formData, "company_representative") || existing.company_representative || "",
    company_function: textValue(formData, "company_function") || existing.company_function || "",
    company_email: textValue(formData, "company_email") || existing.company_email || "",
    company_website: textValue(formData, "company_website") || existing.company_website || "",
    company_hotline: textValue(formData, "company_hotline") || existing.company_hotline || "",
  };

  if (!settings.company_workspace_name) settings.company_workspace_name = settings.company_name;
  if (!settings.company_name) settings.company_name = "Ong Vàng Workspace";

  await db.organization.update({
    where: { id: session.organizationId },
    data: {
      name: settings.company_name,
      logo: settings.company_logo_url || null,
      website: settings.company_website || null,
      email: settings.company_email || null,
      phone: settings.company_hotline || null,
      address: settings.company_address || null,
      description: settings.company_function || null,
    },
  });

  for (const [key, value] of Object.entries(settings)) {
    await db.setting.upsert({
      where: {
        organizationId_key: {
          organizationId: session.organizationId,
          key,
        },
      },
      update: { value },
      create: {
        organizationId: session.organizationId,
        key,
        value,
        type: "string",
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/workspace/settings/roles");
  revalidatePath("/customer");
  revalidatePath("/workspace/settings");
  return { success: true, settings };
}

export async function sendTestEmail(to: string) {
  const session = await requireAuth();
  const recipient = to.trim();

  if (!recipient || !recipient.includes("@")) {
    throw new Error("Email nhận test không hợp lệ");
  }

  const portalUrl = await getOrganizationPublicBaseUrl(session.organizationId, "portal");
  const variables = {
    customer_name: session.user.name || "Khách hàng Ong Vàng",
    email: recipient,
    password: "OngVang@Test",
    portal_url: portalUrl,
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

// --- DEPRECATED: Email templates moved to actions/email-templates.ts ---

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

export async function sendPortalAccessEmailForUser(userId: string, password?: string, portalPath = "/customer") {
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
    portalPath,
  });

  revalidatePath("/workspace/settings");
  return {
    success: true,
    email: member.user.email,
    generatedPassword: password ? null : loginPassword,
  };
}

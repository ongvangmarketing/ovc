"use server";

import { db } from "@/lib/db";
import { assertLicensedModule } from "@/lib/modules/guards";

const requireCrmSession = () => assertLicensedModule("CRM");
import { sendPortalAccountEmail } from "@/lib/email/flows";
import { hashPassword } from "better-auth/crypto";
import { revalidatePath } from "next/cache";

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export async function getContacts() {
  const session = await requireCrmSession();

  try {
    const contacts = await db.contact.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        assignee: true,
      }
    });
    return toPlain(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw new Error("Failed to fetch contacts");
  }
}

export async function getDeals() {
  const session = await requireCrmSession();

  try {
    const deals = await db.deal.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        company: true,
        contact: true,
        stage: true,
        assignee: true,
      }
    });
    return toPlain(deals);
  } catch (error) {
    console.error("Error fetching deals:", error);
    throw new Error("Failed to fetch deals");
  }
}

export async function getContactById(id: string) {
  const session = await requireCrmSession();

  try {
    const contact = await db.contact.findUnique({
      where: { id, organizationId: session.organizationId },
      include: {
        company: true,
        deals: { orderBy: { createdAt: "desc" } },
        quotations: { orderBy: { createdAt: "desc" } },
        contracts: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" }, include: { payments: true } },
        activities: { orderBy: { createdAt: "desc" }, take: 20 },
        assignee: true,
      }
    });
    if (!contact) return null;

    const projects = await db.project.findMany({
      where: {
        organizationId: session.organizationId,
        contactId: contact.id,
        isArchived: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        files: {
          include: { uploader: true },
          orderBy: { createdAt: "desc" },
        },
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            assignee: true,
            attachments: {
              include: { uploader: true },
              orderBy: { createdAt: "desc" },
            },
          },
          take: 30,
        },
        owner: true,
      },
    });

    const tasks = projects.flatMap((project) =>
      project.tasks.map((task) => ({
        ...task,
        project: {
          id: project.id,
          name: project.name,
          color: project.color,
        },
      }))
    );

    const files = [
      ...projects.flatMap((project) =>
        project.files.map((file) => ({
          ...file,
          project: {
            id: project.id,
            name: project.name,
          },
        }))
      ),
      ...projects.flatMap((project) =>
        project.tasks.flatMap((task) =>
          task.attachments.map((file) => ({
            ...file,
            project: {
              id: project.id,
              name: project.name,
            },
            task: {
              id: task.id,
              title: task.title,
            },
          }))
        )
      ),
    ].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());

    const relatedLogTargets = [
      { entity: ["Contact", "contact", "Khách hàng", "Khach hang"], ids: [contact.id] },
      { entity: ["Quotation", "quotation", "Báo giá", "Bao gia"], ids: contact.quotations.map((item) => item.id) },
      { entity: ["Contract", "contract", "Hợp đồng", "Hop dong"], ids: contact.contracts.map((item) => item.id) },
      { entity: ["Invoice", "invoice", "Hóa đơn", "Hoa don"], ids: contact.invoices.map((item) => item.id) },
      { entity: ["Project", "project", "Dự án", "Du an"], ids: projects.map((item) => item.id) },
      { entity: ["Task", "task", "Nhiệm vụ", "Nhiem vu"], ids: tasks.map((item) => item.id) },
    ].filter((target) => target.ids.length);

    const activityLogs = await db.activityLog.findMany({
      where: {
        organizationId: session.organizationId,
        OR: relatedLogTargets.map((target) => ({
          entity: { in: target.entity },
          entityId: { in: target.ids },
        })),
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return toPlain({ ...contact, projects, tasks, files, activityLogs });
  } catch (error) {
    console.error("Error fetching contact details:", error);
    throw new Error("Failed to fetch contact details");
  }
}

export async function getCompanies() {
  const session = await requireCrmSession();

  try {
    const companies = await db.company.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
    });
    return toPlain(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw new Error("Failed to fetch companies");
  }
}

export async function getContactAssignees() {
  const session = await requireCrmSession();

  try {
    const members = await db.organizationMember.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { user: { name: "asc" } },
      include: { user: true },
    });

    return toPlain(
      members
        .filter((member) => member.user.isActive)
        .map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
        }))
    );
  } catch (error) {
    console.error("Error fetching contact assignees:", error);
    throw new Error("Failed to fetch contact assignees");
  }
}

export type ContactPayload = {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  type?: "LEAD" | "PROSPECT" | "CUSTOMER" | "PARTNER" | "VENDOR";
  status?: "ACTIVE" | "INACTIVE" | "BLOCKED";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  source?: string;
  tags?: string[];
  notes?: string;
  address?: string;
  city?: string;
  country?: string;
  companyId?: string | null;
  companyName?: string;
  companyEmail?: string;
  companyTaxCode?: string;
  assigneeId?: string | null;
};

export type TaxCodeLookupResult = {
  taxCode: string;
  name: string;
  internationalName?: string;
  shortName?: string;
  address?: string;
  status?: string;
  source?: string;
  updatedAt?: string;
};

function randomPassword() {
  return `OngVang@${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function lookupCompanyByTaxCode(taxCode: string): Promise<{ success: true; data: TaxCodeLookupResult } | { success: false; error: string }> {
  await requireCrmSession();

  const normalizedTaxCode = taxCode.trim().replace(/\s+/g, "");
  if (normalizedTaxCode.length < 10) {
    return { success: false, error: "Mã số thuế chưa đủ để tra cứu" };
  }

  try {
    const response = await fetch(`https://api.vietqr.io/v2/business/${encodeURIComponent(normalizedTaxCode)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return { success: false, error: "Nguồn tra cứu MST chưa phản hồi" };
    }

    const result = await response.json() as {
      code?: string;
      desc?: string;
      data?: {
        id?: string;
        name?: string;
        internationalName?: string;
        shortName?: string;
        address?: string;
        status?: string;
      };
      metadata?: {
        source?: string;
        updatedAt?: string;
      };
    };

    if (result.code !== "00" || !result.data?.name) {
      return { success: false, error: result.desc || "Không tìm thấy thông tin theo mã số thuế" };
    }

    return {
      success: true,
      data: {
        taxCode: result.data.id || normalizedTaxCode,
        name: result.data.name,
        internationalName: result.data.internationalName,
        shortName: result.data.shortName,
        address: result.data.address,
        status: result.data.status,
        source: result.metadata?.source,
        updatedAt: result.metadata?.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error looking up company tax code:", error);
    return { success: false, error: "Không thể tra cứu mã số thuế lúc này" };
  }
}

function normalizeContactPayload(input: ContactPayload) {
  return {
    firstName: input.firstName.trim(),
    lastName: input.lastName?.trim() || "",
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    mobile: input.mobile?.trim() || null,
    jobTitle: input.jobTitle?.trim() || null,
    department: input.department?.trim() || null,
    type: input.type || "CUSTOMER",
    status: input.status || "ACTIVE",
    priority: input.priority || "MEDIUM",
    source: input.source?.trim() || null,
    tags: input.tags?.map((tag) => tag.trim()).filter(Boolean) || [],
    notes: input.notes?.trim() || null,
    address: input.address?.trim() || null,
    city: input.city?.trim() || null,
    country: input.country?.trim() || "Vietnam",
    companyId: input.companyId || null,
    companyName: input.companyName?.trim() || "",
    companyEmail: input.companyEmail?.trim() || "",
    companyTaxCode: input.companyTaxCode?.trim() || "",
    assigneeId: input.assigneeId || null,
  };
}

function customFieldsObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function normalizeLookup(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

function companyTaxCodeFromFields(value: unknown) {
  const taxCode = customFieldsObject(value).taxCode;
  return typeof taxCode === "string" ? taxCode.trim() : "";
}

async function findCompanyByTaxCode(organizationId: string, taxCode: string) {
  const normalizedTaxCode = normalizeLookup(taxCode);
  if (!normalizedTaxCode) return null;

  const companies = await db.company.findMany({
    where: { organizationId },
  });

  return companies.find((company) => normalizeLookup(companyTaxCodeFromFields(company.customFields)) === normalizedTaxCode) || null;
}

async function resolveCompanyId(organizationId: string, payload: ReturnType<typeof normalizeContactPayload>) {
  const companyCustomFields = payload.companyTaxCode ? { taxCode: payload.companyTaxCode } : undefined;
  const companyData = {
    name: payload.companyName,
    email: payload.companyEmail || null,
    phone: payload.phone || payload.mobile,
    address: payload.address,
    city: payload.city,
    country: payload.country,
    customFields: companyCustomFields,
  };

  if (payload.companyId) {
    const existing = await db.company.findFirst({
      where: { id: payload.companyId, organizationId },
    });
    if (!existing) return null;

    await db.company.update({
      where: { id: existing.id },
      data: {
        name: payload.companyName || existing.name,
        email: payload.companyEmail || existing.email,
        phone: companyData.phone || existing.phone,
        address: payload.address || existing.address,
        city: payload.city || existing.city,
        country: payload.country || existing.country,
        ...(payload.companyTaxCode
          ? { customFields: { ...customFieldsObject(existing.customFields), taxCode: payload.companyTaxCode } }
          : {}),
      },
    });
    return existing.id;
  }

  if (!payload.companyName) return null;

  let existing = await findCompanyByTaxCode(organizationId, payload.companyTaxCode);

  if (!existing && payload.companyEmail) {
    existing = await db.company.findFirst({
      where: {
        organizationId,
        email: {
          equals: payload.companyEmail,
          mode: "insensitive",
        },
      },
    });
  }

  if (!existing && !payload.companyTaxCode && !payload.companyEmail) {
    existing = await db.company.findFirst({
      where: {
        organizationId,
        name: {
          equals: payload.companyName,
          mode: "insensitive",
        },
      },
    });
  }

  if (existing) {
    const currentCompany = await db.company.findUnique({ where: { id: existing.id } });
    if (!currentCompany) return existing.id;

    await db.company.update({
      where: { id: existing.id },
      data: {
        name: payload.companyName || currentCompany.name,
        email: payload.companyEmail || currentCompany.email,
        phone: companyData.phone || currentCompany.phone,
        address: payload.address || currentCompany.address,
        city: payload.city || currentCompany.city,
        country: payload.country || currentCompany.country,
        ...(payload.companyTaxCode
          ? { customFields: { ...customFieldsObject(currentCompany.customFields), taxCode: payload.companyTaxCode } }
          : {}),
      },
    });
    return existing.id;
  }

  const company = await db.company.create({
    data: {
      organizationId,
      ...companyData,
    },
  });
  return company.id;
}

async function resolveAssigneeId(organizationId: string, assigneeId: string | null) {
  if (!assigneeId) return null;

  const member = await db.organizationMember.findFirst({
    where: {
      organizationId,
      userId: assigneeId,
      user: { isActive: true },
    },
  });

  return member ? assigneeId : null;
}

export async function createContact(data: ContactPayload) {
  const session = await requireCrmSession();
  const payload = normalizeContactPayload(data);

  if (!payload.firstName) return { success: false, error: "Tên khách hàng là bắt buộc" };

  try {
    const companyId = await resolveCompanyId(session.organizationId, payload);
    const assigneeId = await resolveAssigneeId(session.organizationId, payload.assigneeId);
    const contactData = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      mobile: payload.mobile,
      jobTitle: payload.jobTitle,
      department: payload.department,
      type: payload.type,
      status: payload.status,
      priority: payload.priority,
      source: payload.source,
      tags: payload.tags,
      notes: payload.notes,
      address: payload.address,
      city: payload.city,
      country: payload.country,
      assigneeId,
    };
    const contact = await db.contact.create({
      data: {
        ...contactData,
        companyId,
        organizationId: session.organizationId,
      },
    });
    revalidatePath("/workspace/crm/contacts");
    revalidatePath("/workspace/crm/companies");
    return { success: true, id: contact.id };
  } catch (error) {
    console.error("Error creating contact:", error);
    return { success: false, error: "Không thể tạo khách hàng" };
  }
}

export async function updateContact(id: string, data: ContactPayload) {
  const session = await requireCrmSession();
  const payload = normalizeContactPayload(data);

  if (!payload.firstName) return { success: false, error: "Tên khách hàng là bắt buộc" };

  try {
    const companyId = await resolveCompanyId(session.organizationId, payload);
    const assigneeId = await resolveAssigneeId(session.organizationId, payload.assigneeId);
    const contactData = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      mobile: payload.mobile,
      jobTitle: payload.jobTitle,
      department: payload.department,
      type: payload.type,
      status: payload.status,
      priority: payload.priority,
      source: payload.source,
      tags: payload.tags,
      notes: payload.notes,
      address: payload.address,
      city: payload.city,
      country: payload.country,
      assigneeId,
    };
    const result = await db.contact.updateMany({
      where: { id, organizationId: session.organizationId },
      data: {
        ...contactData,
        companyId,
      },
    });
    if (!result.count) return { success: false, error: "Không tìm thấy khách hàng" };
    revalidatePath("/workspace/crm/contacts");
    revalidatePath("/workspace/crm/companies");
    revalidatePath(`/workspace/crm/contacts/${id}`);
    revalidatePath(`/workspace/crm/contacts/${id}/edit`);
    return { success: true, id };
  } catch (error) {
    console.error("Error updating contact:", error);
    return { success: false, error: "Không thể cập nhật khách hàng" };
  }
}

export async function sendPortalAccessEmailForContact(contactId: string, password?: string) {
  const session = await requireCrmSession();

  const contact = await db.contact.findFirst({
    where: { id: contactId, organizationId: session.organizationId },
    include: { company: true },
  });

  if (!contact) {
    throw new Error("Không tìm thấy khách hàng");
  }

  if (!contact.email) {
    throw new Error("Khách hàng chưa có email để cấp Portal");
  }

  const normalizedEmail = contact.email.trim().toLowerCase();
  const existingUsers = await db.user.findMany({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
  });

  if (existingUsers.length > 1) {
    throw new Error("Email này đã có user bị trùng. Vui lòng gộp user trước khi cấp Portal.");
  }

  const loginPassword = password?.trim() || randomPassword();
  const hashedPassword = await hashPassword(loginPassword);
  const name = `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || contact.company?.name || contact.email;

  const user = existingUsers[0]
    ? await db.user.update({
        where: { id: existingUsers[0].id },
        data: {
          name,
          email: normalizedEmail,
          phone: contact.phone || contact.mobile || undefined,
          isActive: true,
          role: "CUSTOMER",
        },
      })
    : await db.user.create({
        data: {
          name,
          email: normalizedEmail,
          emailVerified: true,
          phone: contact.phone || contact.mobile || null,
          role: "CUSTOMER",
          isActive: true,
          onboarded: true,
        },
      });

  await db.contact.update({
    where: { id: contact.id },
    data: { email: normalizedEmail },
  });

  await db.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: session.organizationId,
        userId: user.id,
      },
    },
    update: { role: "VIEWER" },
    create: {
      organizationId: session.organizationId,
      userId: user.id,
      role: "VIEWER",
      permissions: ["portal.customer"],
    },
  });

  await db.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: user.id,
      },
    },
    update: { password: hashedPassword },
    create: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });

  await sendPortalAccountEmail({
    organizationId: session.organizationId,
    recipientEmail: user.email,
    recipientName: user.name || user.email,
    loginPassword,
    portalRole: "CUSTOMER",
    operatorName: session.user.name,
    operatorEmail: session.user.email,
    relatedType: "Contact",
    relatedId: contact.id,
    sendRecipient: true,
  });

  revalidatePath(`/workspace/crm/contacts/${contact.id}`);
  revalidatePath("/workspace/settings");

  return {
    success: true,
    email: user.email,
    generatedPassword: password ? null : loginPassword,
  };
}

export async function getCompanyById(id: string) {
  const session = await requireCrmSession();
  try {
    const company = await db.company.findFirst({
      where: { id, organizationId: session.organizationId },
      include: {
        contacts: true,
        deals: true
      }
    });
    return toPlain(company);
  } catch (error) {
    console.error("Error fetching company by id:", error);
    return null;
  }
}

export async function updateCompany(id: string, data: Partial<{
  name: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  size: string | null;
  revenue: number | null;
  country: string;
  address: string | null;
  city: string | null;
  description: string | null;
  tags: string[];
}>) {
  const session = await requireCrmSession();
  try {
    await db.company.updateMany({
      where: { id, organizationId: session.organizationId },
      data,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating company:", error);
    return { success: false, error: "Failed to update company" };
  }
}

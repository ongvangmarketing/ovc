"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createCompanyAction(formData: FormData) {
  const session = await requireAuth();
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const industry = formData.get("industry") as string;
  const address = formData.get("address") as string;
  const description = formData.get("description") as string;
  const taxCode = (formData.get("taxCode") as string)?.trim();

  if (!name) throw new Error("Tên Công ty là bắt buộc");

  const companyData = {
    name,
    email: email || null,
    phone: phone || null,
    website: website || null,
    industry: industry || null,
    address: address || null,
    description: description || null,
    customFields: taxCode ? { taxCode } : undefined,
  };

  let existingCompany: { id: string; customFields: unknown } | null = null;
  if (taxCode) {
    const companies = await db.company.findMany({
      where: { organizationId: session.organizationId },
      select: { id: true, customFields: true },
    });
    existingCompany = companies.find((company) => {
      const fields = company.customFields;
      if (!fields || typeof fields !== "object" || Array.isArray(fields)) return false;
      return String((fields as Record<string, unknown>).taxCode || "").trim() === taxCode;
    }) || null;
  }

  const company = existingCompany
    ? await db.company.update({
        where: { id: existingCompany.id, organizationId: session.organizationId },
        data: {
          ...companyData,
          customFields: {
            ...((existingCompany.customFields && typeof existingCompany.customFields === "object" && !Array.isArray(existingCompany.customFields))
              ? existingCompany.customFields as Record<string, unknown>
              : {}),
            taxCode,
          },
        },
      })
    : await db.company.create({
        data: {
          ...companyData,
          organizationId: session.organizationId,
        }
      });

  revalidatePath("/workspace/crm/companies");
  return company.id;
}

export async function updateCompanyAction(id: string, formData: FormData) {
  const session = await requireAuth();
  
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const website = formData.get("website") as string;
  const industry = formData.get("industry") as string;
  const address = formData.get("address") as string;
  const description = formData.get("description") as string;
  const taxCode = (formData.get("taxCode") as string)?.trim();

  if (!name) throw new Error("Tên Công ty là bắt buộc");

  const current = await db.company.findFirst({
    where: { id, organizationId: session.organizationId },
    select: { customFields: true },
  });
  const currentFields = current?.customFields && typeof current.customFields === "object" && !Array.isArray(current.customFields)
    ? current.customFields as Record<string, unknown>
    : {};

  await db.company.update({
    where: { id, organizationId: session.organizationId },
    data: {
      name,
      email: email || null,
      phone: phone || null,
      website: website || null,
      industry: industry || null,
      address: address || null,
      description: description || null,
      customFields: taxCode ? { ...currentFields, taxCode } : currentFields as Prisma.InputJsonValue,
    }
  });

  revalidatePath("/workspace/crm/companies");
  revalidatePath(`/workspace/crm/companies/${id}`);
}

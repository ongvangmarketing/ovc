"use server";

import { requireAuth } from "@/lib/auth/require-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    taxCode: taxCode || null,
  };

  let existingCompany: { id: string } | null = null;
  if (taxCode) {
    existingCompany = await db.company.findFirst({
      where: {
        organizationId: session.organizationId,
        taxCode,
      },
      select: { id: true },
    });
  }

  const company = existingCompany
    ? await db.company.update({
        where: { id: existingCompany.id, organizationId: session.organizationId },
        data: companyData,
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
      taxCode: taxCode || null,
    }
  });

  revalidatePath("/workspace/crm/companies");
  revalidatePath(`/workspace/crm/companies/${id}`);
}

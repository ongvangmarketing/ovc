"use server";

import { getTenantDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { agencyTemplate } from "@/lib/templates/agency";

export async function createPageAction(formData: FormData) {
  const title = formData.get("title") as string;
  let slug = formData.get("slug") as string;
  const template = formData.get("template") as string;
  
  if (!title) {
    throw new Error("Title is required");
  }
  
  if (!slug) {
    slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  // In a real app, we would get the organizationId from the auth session
  // For now, we'll just grab the first one
  const org = await getTenantDb().organization.findFirst();
  
  if (!org) {
    throw new Error("Organization not found");
  }

  // Check if slug exists
  const existing = await getTenantDb().page.findFirst({
    where: { organizationId: org.id, slug }
  });

  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  let jsonValue = undefined;
  if (template === "agency") {
    jsonValue = agencyTemplate;
  }

  const page = await getTenantDb().page.create({
    data: {
      organizationId: org.id,
      title,
      slug,
      status: "DRAFT",
      content: jsonValue,
    }
  });

  revalidatePath("/workspace/website/pages");
  return { id: page.id };
}

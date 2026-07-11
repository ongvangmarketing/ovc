"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getOrganization() {
  let org = await prisma.organization.findFirst({
    where: { name: { contains: "Ong Vàng", mode: "insensitive" } },
  });
  if (!org) org = await prisma.organization.findFirst();
  return org;
}

export async function getServices(organizationId: string) {
  return await prisma.service.findMany({
    where: { organizationId, status: "ACTIVE" },
    include: {
      options: { where: { status: "ACTIVE" }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCourses(organizationId: string) {
  return await prisma.course.findMany({
    where: { organizationId, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });
}

export async function submitLead(formData: FormData) {
  const organizationId = formData.get("organizationId") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const note = formData.get("note") as string;
  if (!organizationId || !fullName) return { error: "Vui lòng điền họ tên!" };
  try {
    const newLead = await prisma.lead.create({
      data: { organizationId, fullName, email, phone, note, status: "NEW", sourceId: null },
    });
    revalidatePath("/ongvangai");
    return { success: true, lead: newLead };
  } catch (error: any) {
    return { error: error.message || "Có lỗi xảy ra." };
  }
}

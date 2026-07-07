"use server";

import { db as prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Lấy Organization "Ong Vàng" hoặc lấy org đầu tiên trong DB để test
 */
export async function getOngVangOrganization() {
  let org = await prisma.organization.findUnique({ where: { slug: "ongvangcomvn" } });

  if (!org) org = await prisma.organization.findFirst({
    where: {
      name: {
        contains: "Ong Vàng",
        mode: "insensitive",
      },
    },
  });

  if (!org) {
    org = await prisma.organization.findFirst();
  }

  return org;
}

export async function getOngVangStats(organizationId: string) {
  const [projects, contacts, services, courses] = await Promise.all([
    prisma.project.count({ where: { organizationId } }),
    prisma.contact.count({ where: { organizationId } }),
    prisma.service.count({ where: { organizationId, status: "ACTIVE" } }),
    prisma.course.count({ where: { organizationId, status: "PUBLISHED" } }),
  ]);

  return { projects, contacts, services, courses };
}

/** Lấy Services kèm theo ServiceOptions (gói dịch vụ chi tiết) */
export async function getOngVangServices(organizationId: string) {
  return await prisma.service.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
    },
    include: {
      options: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getOngVangCourses(organizationId: string) {
  return await prisma.course.findMany({
    where: {
      organizationId,
      status: "PUBLISHED",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function submitContactLead(formData: FormData) {
  const organizationId = formData.get("organizationId") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const note = formData.get("note") as string;

  if (!organizationId || !fullName) {
    return { error: "Vui lòng điền họ tên!" };
  }

  try {
    const newLead = await prisma.lead.create({
      data: {
        organizationId,
        fullName,
        email,
        phone,
        note,
        status: "NEW",
        sourceId: null,
      },
    });

    revalidatePath("/ongvang");
    return { success: true, lead: newLead };
  } catch (error: unknown) {
    console.error("Error creating lead:", error);
    return { error: error instanceof Error ? error.message : "Có lỗi xảy ra, vui lòng thử lại sau." };
  }
}

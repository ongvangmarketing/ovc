import { getTenantDb } from "@/lib/db";

export async function getCompanyById(organizationId: string, id: string) {
  const company = await getTenantDb().company.findUnique({
    where: { id, organizationId },
    include: {
      contacts: true,
      deals: true,
    },
  });
  return company;
}

export async function searchCompanies(organizationId: string, query: string = "") {
  const companies = await getTenantDb().company.findMany({
    where: {
      organizationId,
      OR: [
        { contacts: { some: {} } },
        { deals: { some: {} } },
        { website: { not: null } },
        { industry: { not: null } },
        { revenue: { not: null } },
      ],
      NOT: [
        { name: { equals: "Học viên", mode: "insensitive" } },
        { name: { equals: "Khách hàng", mode: "insensitive" } },
      ],
      ...(query
        ? {
            name: { contains: query, mode: "insensitive" },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return companies;
}

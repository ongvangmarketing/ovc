import { CreateLeadDTO, LeadDashboardStats } from "../types/lead.types";
import { LeadRepository } from "../repositories/lead.repository";
import { LeadStatus } from "@prisma/client";

export class LeadService {
  static async getLeadsForDashboard(orgId: string, query: string, statusFilter: string, page: number, pageSize: number): Promise<LeadDashboardStats> {
    const baseWhere = { organizationId: orgId };
    
    const where = {
      ...baseWhere,
      ...(query ? {
        OR: [
          { fullName: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query, mode: "insensitive" as const } }
        ]
      } : {}),
      ...(statusFilter && statusFilter !== 'ALL' ? { status: statusFilter as LeadStatus } : {}),
    };

    const [totalLeads, leads, statsData, totalAll] = await Promise.all([
      LeadRepository.count(where),
      LeadRepository.findMany({
        where,
        include: { source: true, assignee: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      LeadRepository.groupByStatus(baseWhere),
      LeadRepository.count(baseWhere)
    ]);

    const statsMap = statsData.reduce((acc, curr) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      leads: JSON.parse(JSON.stringify(leads)),
      statsMap,
      totalAll
    };
  }

  static async createLead(data: CreateLeadDTO) {
    let score = 0;
    if (data.email) score += 10;
    if (data.phone) score += 20;
    if (data.companyName) score += 20;
    if (data.utmSource === "facebook" || data.utmSource === "Facebook Ads") score += 10;
    if (data.utmSource === "website" || data.utmSource === "Organic") score += 15;

    let status: LeadStatus = "NEW";
    let duplicateOf = null;
    
    if (data.email || data.phone) {
      const existing = await LeadRepository.findFirst({
        organizationId: data.organizationId,
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      });

      if (existing) {
        status = "DUPLICATE";
        duplicateOf = existing.id;
      }
    }

    const newLead = await LeadRepository.create({
      organizationId: data.organizationId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      companyName: data.companyName,
      sourceId: data.sourceId,
      utmSource: data.utmSource,
      note: data.note,
      score,
      status,
      createdBy: data.createdBy,
      formId: data.formId,
      webhookId: data.webhookId,
    });

    if (duplicateOf) {
      await LeadRepository.createDuplicateLog({
        leadId: newLead.id,
        matchedLeadId: duplicateOf,
        matchPercent: 100,
        matchReason: "Trùng khớp Email hoặc Số điện thoại",
      });
    }

    return newLead;
  }

  static async convertToCRM(leadId: string, userId: string) {
    const lead = await LeadRepository.findById(leadId);
    if (!lead) throw new Error("Lead not found");
    if (lead.status === "CONVERTED") throw new Error("Lead already converted");

    return await LeadRepository.executeTransaction(async (tx) => {
      const contact = await tx.contact.create({
        data: {
          organizationId: lead.organizationId,
          firstName: lead.fullName.split(" ")[0] || "Unknown",
          lastName: lead.fullName.split(" ").slice(1).join(" "),
          email: lead.email,
          phone: lead.phone,
          type: "CUSTOMER",
          assigneeId: lead.assignedTo || userId,
          source: lead.utmSource || "Lead Center",
          notes: lead.note,
        },
      });

      const deal = await tx.deal.create({
        data: {
          organizationId: lead.organizationId,
          title: lead.companyName ? `Cơ hội từ ${lead.companyName}` : `Cơ hội từ ${lead.fullName}`,
          status: "OPEN",
          contactId: contact.id,
          assigneeId: lead.assignedTo || userId,
          notes: lead.note,
        },
      });

      await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: "CONVERTED",
          convertedCustomerId: contact.id,
          convertedOpportunityId: deal.id,
          convertedAt: new Date(),
          updatedBy: userId,
        },
      });

      return { contact, deal };
    });
  }

  static async getLeadDetailData(orgId: string, leadId: string) {
    const { db } = await import("@/lib/db");
    return db.lead.findUnique({
      where: { id: leadId, organizationId: orgId },
      include: {
        source: true,
        assignee: true,
        tagItems: { include: { tag: true } },
        activities: { orderBy: { createdAt: 'desc' } },
        duplicateLogs1: { include: { matchedLead: true } }
      },
    });
  }

  static async getLeadForEdit(orgId: string, leadId: string) {
    const { db } = await import("@/lib/db");
    return db.lead.findUnique({
      where: { id: leadId, organizationId: orgId }
    });
  }

  static async getLeadsDataForDashboard(orgId: string) {
    const { db } = await import("@/lib/db");
    return db.lead.findMany({
      where: { organizationId: orgId },
      select: { status: true, score: true, utmSource: true }
    });
  }
}

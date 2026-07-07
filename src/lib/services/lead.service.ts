import { db } from "@/lib/db";
import { LeadStatus } from "@prisma/client";

export class LeadService {
  /**
   * Tạo Lead mới, tự động phát hiện trùng lặp và chấm điểm AI cơ bản.
   */
  static async createLead(data: {
    organizationId: string;
    fullName: string;
    email?: string;
    phone?: string;
    companyName?: string;
    sourceId?: string;
    utmSource?: string;
    note?: string;
    createdBy?: string;
    formId?: string;
    webhookId?: string;
  }) {
    // 1. Chấm điểm cơ bản (AI Rule-based Scoring)
    let score = 0;
    if (data.email) score += 10;
    if (data.phone) score += 20;
    if (data.companyName) score += 20;
    if (data.utmSource === "facebook" || data.utmSource === "Facebook Ads") score += 10;
    if (data.utmSource === "website" || data.utmSource === "Organic") score += 15;

    // 2. Phát hiện trùng lặp
    let status: LeadStatus = "NEW";
    let duplicateOf = null;
    
    if (data.email || data.phone) {
      const existing = await db.lead.findFirst({
        where: {
          organizationId: data.organizationId,
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.phone ? [{ phone: data.phone }] : []),
          ],
        },
      });

      if (existing) {
        status = "DUPLICATE";
        duplicateOf = existing.id;
      }
    }

    // 3. Tạo Lead
    const newLead = await db.lead.create({
      data: {
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
      },
    });

    // 4. Ghi log trùng lặp nếu có
    if (duplicateOf) {
      await db.leadDuplicateLog.create({
        data: {
          leadId: newLead.id,
          matchedLeadId: duplicateOf,
          matchPercent: 100,
          matchReason: "Trùng khớp Email hoặc Số điện thoại",
        },
      });
    }

    return newLead;
  }

  /**
   * Chuyển đổi Lead sang Contact & Deal (CRM)
   */
  static async convertToCRM(leadId: string, userId: string) {
    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error("Lead not found");
    if (lead.status === "CONVERTED") throw new Error("Lead already converted");

    return await db.$transaction(async (tx) => {
      // 1. Tạo Contact
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

      // 2. Tạo Deal (Opportunity) nếu có CompanyName thì dùng làm Tên Deal, nếu không dùng tên Khách
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

      // 3. Cập nhật trạng thái Lead
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
}

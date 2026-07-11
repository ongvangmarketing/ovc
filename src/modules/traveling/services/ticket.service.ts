import { getTenantDb } from "@/lib/db";

export class TicketService {
  static async getTickets(orgId: string) {
    return getTenantDb().ticketEvent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async createTicket(orgId: string, agentId: string, data: any) {
    return getTenantDb().ticketEvent.create({
      data: {
        ...data,
        organizationId: orgId,
        agentId,
      },
    });
  }

  static async deleteTicket(orgId: string, id: string) {
    const ticket = await getTenantDb().ticketEvent.findUnique({ where: { id } });
    if (!ticket || ticket.organizationId !== orgId) {
      throw new Error("Vé không tồn tại hoặc không có quyền truy cập.");
    }
    return getTenantDb().ticketEvent.delete({ where: { id } });
  }
}

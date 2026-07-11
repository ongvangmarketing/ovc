import { requireAuth } from "@/lib/auth/require-auth";
import TicketsClient from "./tickets-client";
import { TicketService } from "@/modules/traveling/services/ticket.service";

export default async function TicketsManagementPage() {
  let authData;
  try {
    authData = await requireAuth();
  } catch {
    // handled by layout
  }

  if (!authData) return null;

  const tickets = await TicketService.getTickets(authData.organizationId);

  return <TicketsClient initialTickets={tickets} />;
}

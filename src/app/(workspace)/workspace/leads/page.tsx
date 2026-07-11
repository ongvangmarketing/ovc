import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Search, Filter, MoreVertical, FileText } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-auth";
import { LeadService } from "@/modules/leads/services/lead.service";
import { sendPortalAccessEmailForContact } from "@/modules/crm/actions/crm.actions";

export const metadata: Metadata = { title: "Leads | Vercel UI" };

import { convertLeadToCustomerAction } from "@/modules/leads/actions/lead.actions";
import { LeadsDashboardClient } from "@/modules/leads/components/leads-dashboard-client";

export default async function LeadCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; perPage?: string }>;
}) {
  const session = await requireAuth();
  const orgId = session.organizationId;
  const { q, status, page, perPage } = await searchParams;
  const query = q || "";
  const statusFilter = status || "ALL";
  
  const allowedPageSizes = [20, 50, 100] as const;
  const requestedPageSize = Number(perPage || 20);
  const pageSize = allowedPageSizes.includes(requestedPageSize as (typeof allowedPageSizes)[number])
    ? requestedPageSize
    : 20;
  const currentPage = Math.max(1, Number(page || 1) || 1);

  const { totalLeads, leads, statsMap, totalAll } = await LeadService.getLeadsForDashboard(
    orgId,
    query,
    statusFilter,
    currentPage,
    pageSize
  );

  const newLeadsCount = statsMap['NEW'] || 0;
  const contactedLeadsCount = statsMap['CONTACTED'] || 0;
  const qualifiedLeadsCount = statsMap['QUALIFIED'] || 0;
  const convertedLeadsCount = statsMap['CONVERTED'] || 0;

  const totalPages = Math.max(1, Math.ceil(totalLeads / pageSize));
  
  const paginationItems = (() => {
    if (totalPages <= 8) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const pages = new Set<number>([1, 2, 3, totalPages - 2, totalPages - 1, totalPages]);
    if (currentPage < totalPages - 2) {
      pages.add(currentPage - 1);
      pages.add(currentPage);
      pages.add(currentPage + 1);
      pages.add(currentPage + 2);
      pages.add(currentPage + 3);
    }
    const sortedPages = Array.from(pages).filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    return sortedPages.reduce<(number | string)[]>((items, pageNumber, index) => {
      const previousPage = sortedPages[index - 1];
      if (previousPage && pageNumber - previousPage > 1) {
        items.push(`ellipsis-${previousPage}-${pageNumber}`);
      }
      items.push(pageNumber);
      return items;
    }, []);
  })();

  const tabs = [
    { name: 'Tất cả lead', value: 'ALL', count: totalAll },
    { name: 'Lead mới', value: 'NEW', count: newLeadsCount },
    { name: 'Đang chăm sóc', value: 'CONTACTED', count: contactedLeadsCount },
    { name: 'Tiềm năng', value: 'QUALIFIED', count: qualifiedLeadsCount },
    { name: 'Đã chốt', value: 'CONVERTED', count: convertedLeadsCount },
  ];

  return (
    <LeadsDashboardClient 
      query={query}
      statusFilter={statusFilter}
      pageSize={pageSize}
      currentPage={currentPage}
      totalLeads={totalLeads}
      totalPages={totalPages}
      tabs={tabs}
      leads={leads}
      paginationItems={paginationItems}
      convertLeadToCustomer={convertLeadToCustomerAction}
    />
  );
}

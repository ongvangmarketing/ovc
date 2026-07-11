export interface CreateLeadDTO {
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
}

export interface LeadDashboardStats {
  totalLeads: number;
  leads: any[]; // Ideally mapped to a specific Lead list item type
  statsMap: Record<string, number>;
  totalAll: number;
}

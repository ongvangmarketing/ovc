export type DocumentStatus = "DRAFT" | "PENDING" | "SENT" | "VIEWED" | "SIGNED" | "PAID" | "CANCELLED";

export type FinanceEmailSendPayload = {
  to: string | string[];
  subject?: string;
  html?: string;
  attachPdf?: boolean;
  publicBaseUrl?: string;
};
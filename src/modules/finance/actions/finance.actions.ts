"use server";

import * as EmailFlows from "@/lib/email/flows";
import { FinanceService } from "../services/finance.service";
import type { FinanceEmailSendPayload } from "../types/finance.types";

export async function getQuotations() {
  return FinanceService.getQuotations();
}

export async function getQuotationById(id: string) {
  return FinanceService.getQuotationById(id);
}

export async function getContracts() {
  return FinanceService.getContracts();
}

export async function getInvoices() {
  return FinanceService.getInvoices();
}

export async function adminApproveDocument(type: "quotation" | "contract" | "invoice", id: string) {
  return FinanceService.adminApproveDocument(type, id);
}

export async function generateDocumentToken(type: "quotation" | "contract" | "invoice", id: string) {
  return FinanceService.generateDocumentToken(type, id);
}

export async function convertQuotationToContract(quotationId: string) {
  return FinanceService.convertQuotationToContract(quotationId);
}

export async function convertQuotationToInvoice(quotationId: string) {
  return FinanceService.convertQuotationToInvoice(quotationId);
}

export async function convertContractToInvoice(contractId: string) {
  return FinanceService.convertContractToInvoice(contractId);
}

export async function signDocument(
  token: string,
  type: "quotation" | "contract" | "invoice",
  signatureData: string | { signerName: string; signerEmail?: string; signerPhone?: string; signatureData: string },
  ip: string,
  userAgent: string,
) {
  return FinanceService.signDocument(token, type, signatureData, ip, userAgent);
}

export async function getPayments() {
  return FinanceService.getPayments();
}

export async function getNextQuotationNumber() {
  return FinanceService.getNextQuotationNumber();
}

export async function createQuotation(data: any) {
  return FinanceService.createQuotation(data);
}

export async function updateQuotation(id: string, data: any) {
  return FinanceService.updateQuotation(id, data);
}

export async function createContract(data: any) {
  return FinanceService.createContract(data);
}

export async function updateContract(id: string, data: any) {
  return FinanceService.updateContract(id, data);
}

export async function getNextInvoiceNumber() {
  return FinanceService.getNextInvoiceNumber();
}

export async function getNextContractNumber() {
  return FinanceService.getNextContractNumber();
}

export async function getNextReceiptNumber() {
  return FinanceService.getNextReceiptNumber();
}

export async function createInvoice(data: any) {
  return FinanceService.createInvoice(data);
}

export async function createInvoiceFromQuotation(quotationId: string) {
  return FinanceService.createInvoiceFromQuotation(quotationId);
}

export async function updateInvoice(id: string, data: any) {
  return FinanceService.updateInvoice(id, data);
}

export async function createInvoiceFromInstallment(installmentId: string) {
  return FinanceService.createInvoiceFromInstallment(installmentId);
}

export async function recordPayment(invoiceId: string, amount: number, method: any, notes?: string, date?: string, sendCustomerEmail = false) {
  return FinanceService.recordPayment(invoiceId, amount, method, notes, date, sendCustomerEmail);
}

export async function createPayment(data: {
  number?: string | null;
  invoiceId?: string | null;
  amount: number;
  currency?: string;
  method: any;
  status?: any;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string | null;
}) {
  return FinanceService.createPayment(data);
}

export async function updatePayment(id: string, data: {
  number?: string | null;
  invoiceId?: string | null;
  amount: number;
  currency?: string;
  method: any;
  status?: any;
  reference?: string | null;
  notes?: string | null;
  paidAt?: string | null;
}) {
  return FinanceService.updatePayment(id, data);
}

export async function getDocumentEmailDraft(type: "quotation" | "contract" | "invoice", id: string, publicBaseUrl?: string) {
  return FinanceService.getDocumentEmailDraft(type, id, publicBaseUrl);
}

export async function sendDocumentEmail(
  type: "quotation" | "contract" | "invoice",
  id: string,
  emailOrPayload: string | FinanceEmailSendPayload,
  publicBaseUrl?: string
) {
  return FinanceService.sendDocumentEmail(type, id, emailOrPayload, publicBaseUrl);
}

export async function getPaymentEmailDraft(id: string) {
  return FinanceService.getPaymentEmailDraft(id);
}

export async function renderFinanceDocumentEmailDraft(
  organizationId: string,
  type: "quotation" | "contract" | "invoice",
  id: string,
  publicBaseUrl?: string
) {
  return EmailFlows.renderFinanceDocumentEmailDraft({ organizationId, type, id, publicBaseUrl });
}

export async function sendPaymentEmail(id: string, payload?: FinanceEmailSendPayload) {
  return FinanceService.sendPaymentEmail(id, payload);
}

export async function updateQuotationStatus(id: string, status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED") {
  return FinanceService.updateQuotationStatus(id, status);
}

export async function updateContractStatus(id: string, status: "DRAFT" | "SENT" | "SIGNED" | "EXPIRED" | "CANCELLED") {
  return FinanceService.updateContractStatus(id, status);
}

export async function adminSignDocument(type: "quotation" | "contract" | "invoice", id: string, signatureData: string) {
  return FinanceService.adminSignDocument(type, id, signatureData);
}

export async function adminRevokeSignature(type: "quotation" | "contract" | "invoice", id: string) {
  return FinanceService.adminRevokeSignature(type, id);
}

export async function adminRevokeCustomerSignature(type: "quotation" | "contract" | "invoice", id: string) {
  return FinanceService.adminRevokeCustomerSignature(type, id);
}

export async function deleteQuotation(id: string) {
  return FinanceService.deleteQuotation(id);
}

export async function createInvoiceFromContract(contractId: string) {
  return FinanceService.createInvoiceFromContract(contractId);
}

export async function deleteContract(id: string) {
  return FinanceService.deleteContract(id);
}

export async function deleteInvoice(id: string) {
  return FinanceService.deleteInvoice(id);
}

export async function deletePayment(id: string) {
  return FinanceService.deletePayment(id);
}

export type { FinanceEmailSendPayload } from "../types/finance.types";

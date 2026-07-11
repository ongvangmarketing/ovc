import { getSettings } from "@/actions/settings";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { QuotationFormClient } from "@/modules/finance/components/quotation-form-client";
import { getQuotationForEdit } from "@/modules/finance/services/quotation.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function customFieldsObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function normalizeLookup(value?: string | null) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function companyTaxCode(company?: { name?: string | null; taxCode?: string | null; customFields?: unknown } | null) {
  const fields = customFieldsObject(company?.customFields);
  const taxCode = String(company?.taxCode || fields.taxCode || "").trim();
  const name = String(company?.name || "").trim();
  if (taxCode) return taxCode;
  return /^\d{10,14}(-\d{1,3})?$/.test(name) ? name : "";
}

function companyDisplayName(company?: { name?: string | null; customFields?: unknown } | null) {
  const fields = customFieldsObject(company?.customFields);
  const name = String(fields.companyName || fields.name || fields.businessName || company?.name || "").trim();
  const taxCode = normalizeLookup(companyTaxCode(company));
  return name && normalizeLookup(name) !== taxCode ? name : "";
}

function companyRepresentative(company?: { representativeName?: string | null; customFields?: unknown } | null) {
  const fields = customFieldsObject(company?.customFields);
  return String(company?.representativeName || fields.representativeName || fields.representative || fields.legalRepresentative || fields.contactPerson || fields.companyRepresentative || "").trim();
}

function companyRepresentativeTitle(company?: { representativeTitle?: string | null; customFields?: unknown } | null) {
  const fields = customFieldsObject(company?.customFields);
  return String(company?.representativeTitle || fields.representativeTitle || fields.position || fields.jobTitle || fields.title || "").trim();
}

function contactIdentityNumber(contact?: { identityNumber?: string | null; customFields?: unknown } | null) {
  const fields = customFieldsObject(contact?.customFields);
  return String(contact?.identityNumber || fields.identityNumber || fields.cccd || fields.citizenId || fields.idNumber || "").trim();
}

function contactTitle(contact?: { customFields?: unknown } | null) {
  const fields = customFieldsObject(contact?.customFields);
  return String(fields.title || fields.position || fields.jobTitle || fields.role || "").trim();
}

function contactDisplayName(contact?: { name?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null } | null) {
  return String(contact?.name || `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim() || contact?.email || "").trim();
}

function quotePrefix(value: unknown) {
  if (typeof value !== "string") return "BG";
  try {
    const parsed = JSON.parse(value) as { prefix?: unknown };
    return typeof parsed.prefix === "string" ? parsed.prefix.trim() : "BG";
  } catch {
    return "BG";
  }
}

function fullQuotationNumber(number: string, formatValue: unknown) {
  const currentNumber = number.trim();
  const prefix = quotePrefix(formatValue);
  if (!currentNumber || !prefix || currentNumber.startsWith(prefix)) return currentNumber;

  return `${prefix}${currentNumber}`;
}

export default async function EditQuotationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireAuth();
  
  const data = await getQuotationForEdit(session.organizationId, id);

  if (!data) return notFound();

  const { quotation, initialCompanies, initialContacts } = data;

  const settings = await getSettings();
  const paymentMethodsJson = (settings as any).payment_methods || null;
  const formattedNumber = fullQuotationNumber(quotation.number, (settings as any).FORMAT_QUOTE);
  const directCompanyName = companyDisplayName(quotation.company);
  const contactCompanyName = companyDisplayName(quotation.contact?.company);
  const bestCompany = directCompanyName ? quotation.company : quotation.contact?.company || quotation.company;
  const bestCompanyName = companyDisplayName(bestCompany) || contactCompanyName || directCompanyName;
  const bestCompanyTaxCode = companyTaxCode(bestCompany) || companyTaxCode(quotation.company) || companyTaxCode(quotation.contact?.company);
  const contactName = contactDisplayName(quotation.contact);
  const initialData = {
    ...quotation,
    number: formattedNumber,
    companyId: bestCompany?.id || quotation.companyId,
    companyName: bestCompanyName,
    companyTaxCode: bestCompanyTaxCode,
    companyRepresentative: companyRepresentative(bestCompany) || contactName,
    companyRepresentativeTitle: companyRepresentativeTitle(bestCompany) || contactTitle(quotation.contact),
    contactName,
    contactPhone: bestCompany?.phone || quotation.contact?.phone || "",
    contactEmail: bestCompany?.email || quotation.contact?.email || "",
    contactAddress: bestCompany?.address || quotation.contact?.address || "",
    contactIdentityNumber: contactIdentityNumber(quotation.contact),
  };

  return (
    <QuotationFormClient
      mode="edit"
      initialData={JSON.parse(JSON.stringify(initialData))}
      dynamicPaymentChannels={paymentMethodsJson}
      initialCompanies={JSON.parse(JSON.stringify(initialCompanies))}
      initialContacts={JSON.parse(JSON.stringify(initialContacts))}
    />
  );
}

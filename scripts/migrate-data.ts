import * as dotenv from "dotenv";

import {
  ContractStatus,
  InvoiceStatus,
  PaymentMethod,
  ProjectStatus,
  PrismaClient,
  QuotationStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createConnection, type Connection, type RowDataPacket } from "mysql2/promise";
import { randomUUID } from "crypto";

dotenv.config({ path: ".env.local" });
dotenv.config();

type LegacyRow = RowDataPacket & Record<string, unknown>;

type ImportCounters = {
  scanned: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
};

type ImportSummary = Record<string, ImportCounters>;

const dryRun = process.env.LEGACY_IMPORT_DRY_RUN !== "false";
const wipeTarget = process.env.LEGACY_IMPORT_WIPE_TARGET === "true";

const counters: ImportSummary = {
  companies: emptyCounters(),
  contacts: emptyCounters(),
  projects: emptyCounters(),
  quotations: emptyCounters(),
  quotationItems: emptyCounters(),
  contracts: emptyCounters(),
  contractItems: emptyCounters(),
  paymentInstallments: emptyCounters(),
  invoices: emptyCounters(),
  invoiceItems: emptyCounters(),
  payments: emptyCounters(),
  emailTemplates: emptyCounters(),
};

const legacyContactIds = new Map<string, string>();
const legacyCompanyIds = new Map<string, string>();
const legacyProjectIds = new Map<string, string>();
const legacyQuotationIds = new Map<string, string>();
const legacyContractIds = new Map<string, string>();
const legacyInvoiceIds = new Map<string, string>();

const pgPool = new Pool({ connectionString: requiredEnv("DATABASE_URL") });
const db = new PrismaClient({ adapter: new PrismaPg(pgPool) });

function emptyCounters(): ImportCounters {
  return { scanned: 0, created: 0, updated: 0, skipped: 0, failed: 0 };
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  return String(value);
}

function asNullableString(value: unknown): string | null {
  const text = asString(value).trim();
  return text ? text : null;
}

function asNumber(value: unknown, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function asDateOrNow(value: unknown): Date {
  return asDate(value) ?? new Date();
}

function legacyId(row: LegacyRow): string {
  return asString(row.id);
}

function splitName(row: LegacyRow): { firstName: string; lastName: string } {
  const raw =
    asNullableString(row.name) ??
    asNullableString(row.contact_person) ??
    asNullableString(row.company) ??
    "Khách hàng";
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "Khách", lastName: "" };
  }
  return {
    firstName: parts.slice(-1).join(" "),
    lastName: parts.slice(0, -1).join(" "),
  };
}

function mapQuotationStatus(status: unknown): QuotationStatus {
  const value = asString(status).toLowerCase();
  if (["accepted", "approved", "signed"].includes(value)) return QuotationStatus.ACCEPTED;
  if (["rejected", "declined", "cancelled", "canceled"].includes(value)) return QuotationStatus.REJECTED;
  if (["expired"].includes(value)) return QuotationStatus.EXPIRED;
  if (["converted"].includes(value)) return QuotationStatus.CONVERTED;
  if (["sent"].includes(value)) return QuotationStatus.SENT;
  return QuotationStatus.DRAFT;
}

function mapContractStatus(status: unknown, signedAt?: unknown): ContractStatus {
  const value = asString(status).toLowerCase();
  if (signedAt || ["signed", "active"].includes(value)) return ContractStatus.SIGNED;
  if (["cancelled", "canceled", "rejected"].includes(value)) return ContractStatus.CANCELLED;
  if (["expired"].includes(value)) return ContractStatus.EXPIRED;
  if (["sent"].includes(value)) return ContractStatus.SENT;
  return ContractStatus.DRAFT;
}

function mapInvoiceStatus(status: unknown): InvoiceStatus {
  const value = asString(status).toLowerCase();
  if (["paid"].includes(value)) return InvoiceStatus.PAID;
  if (["partially_paid", "partial"].includes(value)) return InvoiceStatus.PARTIAL;
  if (["overdue"].includes(value)) return InvoiceStatus.OVERDUE;
  if (["cancelled", "canceled"].includes(value)) return InvoiceStatus.CANCELLED;
  if (["sent"].includes(value)) return InvoiceStatus.SENT;
  if (["viewed"].includes(value)) return InvoiceStatus.VIEWED;
  return InvoiceStatus.DRAFT;
}

function mapPaymentMethod(method: unknown): PaymentMethod {
  const value = asString(method).toLowerCase();
  if (value.includes("cash")) return PaymentMethod.CASH;
  if (value.includes("card")) return PaymentMethod.CARD;
  if (value.includes("momo")) return PaymentMethod.MOMO;
  if (value.includes("zalo")) return PaymentMethod.ZALOPAY;
  if (value.includes("vnpay")) return PaymentMethod.VNPAY;
  if (value.includes("stripe")) return PaymentMethod.STRIPE;
  if (value.includes("paypal")) return PaymentMethod.PAYPAL;
  return PaymentMethod.BANK_TRANSFER;
}

async function legacyConnection(database: string): Promise<Connection> {
  const socketPath = process.env.LEGACY_DB_SOCKET || undefined;
  return createConnection({
    host: process.env.LEGACY_DB_HOST || "127.0.0.1",
    port: envNumber("LEGACY_DB_PORT", 3306),
    user: process.env.LEGACY_DB_USER || "root",
    password: process.env.LEGACY_DB_PASSWORD || "",
    database,
    socketPath,
    namedPlaceholders: true,
  });
}

async function tableExists(conn: Connection, table: string): Promise<boolean> {
  const [rows] = await conn.query<LegacyRow[]>("SHOW TABLES LIKE ?", [table]);
  return rows.length > 0;
}

async function selectAll(conn: Connection, table: string): Promise<LegacyRow[]> {
  if (!(await tableExists(conn, table))) {
    return [];
  }
  const [rows] = await conn.query<LegacyRow[]>(`SELECT * FROM \`${table}\``);
  return rows;
}

async function upsertLegacyId<T>(
  key: keyof ImportSummary,
  legacy: LegacyRow,
  createOrUpdate: () => Promise<T>,
): Promise<T | null> {
  counters[key].scanned += 1;
  try {
    if (dryRun) {
      counters[key].skipped += 1;
      return null;
    }
    const result = await createOrUpdate();
    counters[key].created += 1;
    return result;
  } catch (error) {
    counters[key].failed += 1;
    console.warn(`[${String(key)}] failed legacy id ${legacyId(legacy)}:`, error);
    return null;
  }
}

async function wipeOrganizationData(organizationId: string) {
  if (!wipeTarget || dryRun) return;

  await db.payment.deleteMany({ where: { organizationId } });
  await db.invoiceItem.deleteMany({ where: { invoice: { organizationId } } });
  await db.invoice.deleteMany({ where: { organizationId } });
  await db.paymentInstallment.deleteMany({ where: { contract: { organizationId } } });
  await db.contractItem.deleteMany({ where: { contract: { organizationId } } });
  await db.contract.deleteMany({ where: { organizationId } });
  await db.quotationItem.deleteMany({ where: { quotation: { organizationId } } });
  await db.quotation.deleteMany({ where: { organizationId } });
  await db.task.deleteMany({ where: { project: { organizationId } } });
  await db.taskList.deleteMany({ where: { project: { organizationId } } });
  await db.project.deleteMany({ where: { organizationId } });
  await db.deal.deleteMany({ where: { organizationId } });
  await db.contact.deleteMany({ where: { organizationId } });
  await db.company.deleteMany({ where: { organizationId } });
}

async function main() {
  const orgSlug = process.env.LEGACY_IMPORT_ORGANIZATION_SLUG || "ong-vang";
  const ownerEmail = process.env.LEGACY_IMPORT_OWNER_EMAIL || "admin@ongvang.com";

  const organization = await db.organization.findFirst({ where: { slug: orgSlug } });
  const owner = await db.user.findFirst({ where: { email: ownerEmail } }) ?? await db.user.findFirst();

  if (!organization) {
    throw new Error(`Target organization not found: ${orgSlug}`);
  }
  if (!owner) {
    throw new Error("Target owner/user not found. Seed at least one user first.");
  }

  const importRun = dryRun
    ? null
    : await db.legacyImportRun.create({
        data: {
          organizationId: organization.id,
          mode: "IMPORT",
          status: "RUNNING",
        },
      });

  const crmDb = process.env.LEGACY_DB_CRM_DATABASE || "ongvang_crm";
  const appDb = process.env.LEGACY_DB_APP_DATABASE || process.env.LEGACY_DB_CRM_DATABASE || "ongvang_crm";
  const crm = await legacyConnection(crmDb);
  const app = appDb === crmDb ? crm : await legacyConnection(appDb);

  try {
    console.log(`Legacy import source: ${crmDb}`);
    console.log(`Legacy app source: ${appDb}`);
    console.log(`Target organization: ${organization.name} (${organization.slug})`);
    console.log(`Mode: ${dryRun ? "DRY_RUN" : "IMPORT"}`);

    await wipeOrganizationData(organization.id);

    await migrateCustomers(crm, organization.id);
    await migrateProjects(crm, organization.id, owner.id);
    await migrateQuotations(crm, organization.id, owner.id);
    await migrateContracts(crm, organization.id, owner.id);
    await migrateInvoices(crm, organization.id, owner.id);
    await migratePayments(crm, organization.id);
    await migrateEmailTemplates(app, organization.id);

    if (importRun) {
      await db.legacyImportRun.update({
        where: { id: importRun.id },
        data: {
          status: "COMPLETED",
          finishedAt: new Date(),
          summary: counters,
        },
      });
    }

    console.table(counters);
  } catch (error) {
    if (importRun) {
      await db.legacyImportRun.update({
        where: { id: importRun.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          summary: counters,
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
    }
    throw error;
  } finally {
    await crm.end();
    if (app !== crm) await app.end();
    await db.$disconnect();
    await pgPool.end();
  }
}

async function migrateCustomers(conn: Connection, organizationId: string) {
  const rows = await selectAll(conn, "customers");

  for (const row of rows) {
    const companyName = asNullableString(row.company);
    let companyId: string | null = null;

    if (companyName) {
      const company = await upsertLegacyId("companies", row, async () =>
        db.company.upsert({
          where: {
            id: legacyCompanyIds.get(legacyId(row)) || "__missing__",
          },
          create: {
            organizationId,
            name: companyName,
            email: asNullableString(row.email),
            phone: asNullableString(row.phone),
            address: asNullableString(row.address),
            customFields: { legacyTable: "customers", legacyId: legacyId(row) },
            createdAt: asDateOrNow(row.created_at),
            updatedAt: asDateOrNow(row.updated_at),
          },
          update: {
            email: asNullableString(row.email),
            phone: asNullableString(row.phone),
            address: asNullableString(row.address),
            updatedAt: asDateOrNow(row.updated_at),
          },
        }),
      );
      companyId = company?.id ?? null;
      if (companyId) legacyCompanyIds.set(legacyId(row), companyId);
    }

    const names = splitName(row);
    const contact = await upsertLegacyId("contacts", row, async () =>
      db.contact.create({
        data: {
          organizationId,
          firstName: names.firstName,
          lastName: names.lastName,
          email: asNullableString(row.email),
          phone: asNullableString(row.phone),
          address: asNullableString(row.address),
          type: asString(row.customer_type).toLowerCase() === "business" ? "CUSTOMER" : "PROSPECT",
          status: asString(row.status).toLowerCase() === "inactive" ? "INACTIVE" : "ACTIVE",
          source: asNullableString(row.lead_source),
          notes: asNullableString(row.notes),
          companyId,
          customFields: {
            legacyTable: "customers",
            legacyId: legacyId(row),
            userId: row.user_id ?? null,
            contactPerson: row.contact_person ?? null,
          },
          createdAt: asDateOrNow(row.created_at),
          updatedAt: asDateOrNow(row.updated_at),
        },
      }),
    );

    if (contact) {
      legacyContactIds.set(legacyId(row), contact.id);
    } else if (dryRun) {
      legacyContactIds.set(legacyId(row), `dry-contact-${legacyId(row)}`);
    }
  }
}

async function migrateProjects(conn: Connection, organizationId: string, ownerId: string) {
  const rows = await selectAll(conn, "projects");

  for (const row of rows) {
    await upsertLegacyId("projects", row, async () => {
      const project = await db.project.create({
        data: {
          organizationId,
          ownerId,
          name: asString(row.name, `Project ${legacyId(row)}`),
          description: asNullableString(row.internal_notes),
          status: mapProjectStatus(row.status),
          startDate: asDate(row.start_date),
          dueDate: asDate(row.deadline),
          budget: asNumber(row.contract_value),
          contactId: legacyContactIds.get(asString(row.customer_id)),
          customFields: {
            legacyTable: "projects",
            legacyId: legacyId(row),
            slug: row.slug ?? null,
            projectType: row.project_type ?? null,
            progress: row.progress ?? null,
            teamMembers: row.team_members ?? null,
            domainName: row.domain_name ?? null,
            renewalStatus: row.renewal_status ?? null,
          },
          createdAt: asDateOrNow(row.created_at),
          updatedAt: asDateOrNow(row.updated_at),
        },
      });
      legacyProjectIds.set(legacyId(row), project.id);
      return project;
    });

    if (dryRun) {
      legacyProjectIds.set(legacyId(row), `dry-project-${legacyId(row)}`);
    }
  }
}

function mapProjectStatus(status: unknown): ProjectStatus {
  const value = asString(status).toLowerCase();
  if (["planning"].includes(value)) return ProjectStatus.PLANNING;
  if (["on_hold", "hold", "paused"].includes(value)) return ProjectStatus.ON_HOLD;
  if (["completed", "done"].includes(value)) return ProjectStatus.COMPLETED;
  if (["cancelled", "canceled"].includes(value)) return ProjectStatus.CANCELLED;
  return ProjectStatus.ACTIVE;
}

async function migrateQuotations(conn: Connection, organizationId: string, creatorId: string) {
  const rows = await selectAll(conn, "quotations");

  for (const row of rows) {
    const quotation = await upsertLegacyId("quotations", row, async () =>
      db.quotation.create({
        data: {
          organizationId,
          creatorId,
          token: asNullableString(row.hash) ?? randomUUID(),
          number: asNullableString(row.number) ?? asNullableString(row.code) ?? `BG-${legacyId(row)}`,
          title: asNullableString(row.subject) ?? asNullableString(row.code) ?? `Báo giá ${legacyId(row)}`,
          status: mapQuotationStatus(row.status),
          contactId: legacyContactIds.get(asString(row.customer_id)),
          dealId: undefined,
          currency: asString(row.currency, "VND"),
          subtotal: asNumber(row.subtotal ?? row.total_amount),
          tax: asNumber(row.total_tax ?? row.tax_amount),
          discount: asNumber(row.discount_total ?? row.discount_amount),
          total: asNumber(row.total ?? row.grand_total),
          validUntil: asDate(row.open_till ?? row.valid_until),
          notes: asNullableString(row.notes ?? row.adminnote),
          terms: asNullableString(row.terms ?? row.content),
          sentAt: asString(row.status).toLowerCase() === "sent" ? asDate(row.updated_at) : null,
          acceptedAt: asDate(row.signed_at),
          adminSignedAt: asDate(row.admin_signed_at),
          signedAt: asDate(row.signed_at),
          createdAt: asDateOrNow(row.created_at),
          updatedAt: asDateOrNow(row.updated_at),
        },
      }),
    );

    const quotationId = quotation?.id ?? (dryRun ? `dry-quotation-${legacyId(row)}` : null);
    if (quotationId) {
      legacyQuotationIds.set(legacyId(row), quotationId);
      await migrateQuotationItems(conn, legacyId(row), quotationId);
    }
  }
}

async function migrateQuotationItems(conn: Connection, legacyQuotationId: string, quotationId: string) {
  const rows = await tableExists(conn, "quotation_items")
    ? await conn.query<LegacyRow[]>("SELECT * FROM `quotation_items` WHERE quotation_id = ?", [legacyQuotationId]).then(([r]) => r)
    : [];

  for (const [index, row] of rows.entries()) {
    await upsertLegacyId("quotationItems", row, async () =>
      db.quotationItem.create({
        data: {
          quotationId,
          name: asString(row.description, `Item ${index + 1}`),
          description: asNullableString(row.long_description),
          quantity: asNumber(row.qty, 1),
          unitPrice: asNumber(row.rate),
          tax: asNumber(row.tax_rate),
          total: asNumber(row.total ?? row.amount),
          order: index,
        },
      }),
    );
  }
}

async function migrateContracts(conn: Connection, organizationId: string, creatorId: string) {
  const rows = await selectAll(conn, "contracts");

  for (const row of rows) {
    const contract = await upsertLegacyId("contracts", row, async () =>
      db.contract.create({
        data: {
          organizationId,
          creatorId,
          token: asNullableString(row.hash) ?? randomUUID(),
          number: asNullableString(row.code) ?? asNullableString(row.subject)?.match(/^(HDDV-\d+|HD-\d+)/)?.[0] ?? `HD-${legacyId(row)}`,
          title: asNullableString(row.subject) ?? `Hợp đồng ${legacyId(row)}`,
          status: mapContractStatus(row.status, row.signed_at),
          contactId: legacyContactIds.get(asString(row.customer_id)),
          dealId: undefined,
          currency: "VND",
          total: asNumber(row.contract_value ?? row.value),
          terms: asNullableString(row.content),
          validFrom: asDate(row.datestart ?? row.start_date),
          validUntil: asDate(row.dateend ?? row.end_date),
          sentAt: asString(row.status).toLowerCase() === "sent" ? asDate(row.updated_at) : null,
          adminSignedAt: asDate(row.admin_signed_at),
          signedAt: asDate(row.signed_at),
          createdAt: asDateOrNow(row.created_at),
          updatedAt: asDateOrNow(row.updated_at),
        },
      }),
    );

    const contractId = contract?.id ?? (dryRun ? `dry-contract-${legacyId(row)}` : null);
    if (contractId) {
      legacyContractIds.set(legacyId(row), contractId);
      await migrateContractItems(conn, legacyId(row), contractId);
      await migratePaymentInstallments(conn, legacyId(row), contractId);
    }
  }
}

async function migrateContractItems(conn: Connection, legacyContractId: string, contractId: string) {
  const rows = await tableExists(conn, "contract_items")
    ? await conn.query<LegacyRow[]>("SELECT * FROM `contract_items` WHERE contract_id = ?", [legacyContractId]).then(([r]) => r)
    : [];

  for (const [index, row] of rows.entries()) {
    await upsertLegacyId("contractItems", row, async () =>
      db.contractItem.create({
        data: {
          contractId,
          name: asString(row.description, `Item ${index + 1}`),
          description: asNullableString(row.long_description),
          quantity: asNumber(row.qty, 1),
          unitPrice: asNumber(row.rate),
          total: asNumber(row.total ?? row.amount),
          order: index,
        },
      }),
    );
  }
}

async function migratePaymentInstallments(conn: Connection, legacyContractId: string, contractId: string) {
  if (!(await tableExists(conn, "payment_installments"))) return;

  const [rows] = await conn.query<LegacyRow[]>(
    "SELECT * FROM `payment_installments` WHERE payable_type LIKE ? AND payable_id = ?",
    ["%Contract%", legacyContractId],
  );

  for (const row of rows) {
    await upsertLegacyId("paymentInstallments", row, async () =>
      db.paymentInstallment.create({
        data: {
          contractId,
          name: asString(row.name, "Thanh toán"),
          amount: asNumber(row.amount),
          dueDate: asDateOrNow(row.due_date),
          status: asString(row.status, "PENDING").toUpperCase(),
        },
      }),
    );
  }
}

async function migrateInvoices(conn: Connection, organizationId: string, creatorId: string) {
  const rows = await selectAll(conn, "invoices");

  for (const row of rows) {
    const invoice = await upsertLegacyId("invoices", row, async () =>
      db.invoice.create({
        data: {
          organizationId,
          creatorId,
          token: asNullableString(row.hash) ?? randomUUID(),
          number: `${asString(row.prefix, "HD-")}${asString(row.number, legacyId(row))}`,
          title: asNullableString(row.clientnote) ?? `Hóa đơn ${legacyId(row)}`,
          status: mapInvoiceStatus(row.status),
          contactId: legacyContactIds.get(asString(row.customer_id)),
          projectId: legacyProjectIds.get(asString(row.project_id)),
          contractId: legacyContractIds.get(asString(row.number)),
          currency: asString(row.currency, "VND"),
          subtotal: asNumber(row.subtotal ?? row.amount),
          tax: asNumber(row.total_tax),
          discount: asNumber(row.discount_total),
          total: asNumber(row.total ?? row.amount),
          amountPaid: asNumber(row.amount_paid),
          amountDue: Math.max(0, asNumber(row.total ?? row.amount) - asNumber(row.amount_paid)),
          notes: asNullableString(row.adminnote),
          terms: asNullableString(row.terms),
          dueDate: asDate(row.duedate ?? row.due_date),
          issuedAt: asDate(row.date),
          adminSignedAt: asDate(row.admin_signed_at),
          signedAt: asDate(row.signed_at),
          createdAt: asDateOrNow(row.created_at),
          updatedAt: asDateOrNow(row.updated_at),
        },
      }),
    );

    const invoiceId = invoice?.id ?? (dryRun ? `dry-invoice-${legacyId(row)}` : null);
    if (invoiceId) {
      legacyInvoiceIds.set(legacyId(row), invoiceId);
      await migrateInvoiceItems(conn, legacyId(row), invoiceId);
    }
  }
}

async function migrateInvoiceItems(conn: Connection, legacyInvoiceId: string, invoiceId: string) {
  const rows = await tableExists(conn, "invoice_items")
    ? await conn.query<LegacyRow[]>("SELECT * FROM `invoice_items` WHERE invoice_id = ?", [legacyInvoiceId]).then(([r]) => r)
    : [];

  for (const [index, row] of rows.entries()) {
    await upsertLegacyId("invoiceItems", row, async () =>
      db.invoiceItem.create({
        data: {
          invoiceId,
          name: asString(row.description, `Item ${index + 1}`),
          description: asNullableString(row.long_description),
          quantity: asNumber(row.qty, 1),
          unitPrice: asNumber(row.rate),
          tax: asNumber(row.tax_rate),
          total: asNumber(row.total ?? row.amount),
          order: index,
        },
      }),
    );
  }
}

async function migratePayments(conn: Connection, organizationId: string) {
  const rows = await selectAll(conn, "payments");

  for (const row of rows) {
    const invoiceId = legacyInvoiceIds.get(asString(row.invoice_id));
    if (!invoiceId) {
      counters.payments.scanned += 1;
      counters.payments.skipped += 1;
      continue;
    }

    await upsertLegacyId("payments", row, async () =>
      db.payment.create({
        data: {
          organizationId,
          invoiceId,
          amount: asNumber(row.amount),
          method: mapPaymentMethod(row.paymentmode ?? row.payment_method),
          status: "COMPLETED",
          reference: asNullableString(row.transactionid ?? row.transaction_id),
          notes: asNullableString(row.note),
          paidAt: asDate(row.date ?? row.paid_at),
          createdAt: asDateOrNow(row.created_at),
          updatedAt: asDateOrNow(row.updated_at),
        },
      }),
    );
  }
}

async function migrateEmailTemplates(conn: Connection, organizationId: string) {
  const rows = await selectAll(conn, "email_templates");

  for (const row of rows) {
    await upsertLegacyId("emailTemplates", row, async () =>
      db.emailTemplate.upsert({
        where: {
          organizationId_code: {
            organizationId,
            code: asString(row.key ?? row.code, `LEGACY_${legacyId(row)}`).toUpperCase(),
          },
        },
        create: {
          organizationId,
          code: asString(row.key ?? row.code, `LEGACY_${legacyId(row)}`).toUpperCase(),
          name: asString(row.name, "Legacy template"),
          subject: asString(row.subject),
          body: asString(row.html_body ?? row.body),
          variables: extractVariables(asString(row.subject) + " " + asString(row.html_body ?? row.body)),
          isActive: asString(row.status, "published").toLowerCase() === "published",
        },
        update: {
          name: asString(row.name, "Legacy template"),
          subject: asString(row.subject),
          body: asString(row.html_body ?? row.body),
          variables: extractVariables(asString(row.subject) + " " + asString(row.html_body ?? row.body)),
          isActive: asString(row.status, "published").toLowerCase() === "published",
        },
      }),
    );
  }
}

function extractVariables(text: string): string[] {
  return Array.from(text.matchAll(/\{([a-zA-Z0-9_]+)\}/g))
    .map((match) => match[1])
    .filter((value, index, all) => value && all.indexOf(value) === index);
}

main().catch(async (error) => {
  console.error("Legacy migration failed:", error);
  await db.$disconnect();
  await pgPool.end();
  process.exit(1);
});

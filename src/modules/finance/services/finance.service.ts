import { getTenantDb } from "@/lib/db";
import { assertLicensedModule } from "@/lib/modules/guards";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import * as EmailFlows from "@/lib/email/flows";
import * as TrainingNotifications from "@/lib/notifications/training";
import * as FinanceNotifications from "@/lib/notifications/finance";
import * as FinanceTypes from "../types/finance.types";
import { generateAutoCode } from "@/lib/utils/auto-code";

const requireFinanceSession = () => assertLicensedModule("FINANCE");


export class FinanceService {


static toClientData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

/**
 * Lấy danh sách Báo giá
 */
static async getQuotations() {
  const session = await requireAuth();
  
  const quotations = await getTenantDb().quotation.findMany({
    where: { organizationId: session.organizationId },
    include: {
      contact: { include: { company: true } },
      deal: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return FinanceService.toClientData(quotations);
}

/**
 * Lấy chi tiết Báo giá
 */
static async getQuotationById(id: string) {
  const session = await requireAuth();
  
  const quotation = await getTenantDb().quotation.findUnique({
    where: { id, organizationId: session.organizationId },
    include: {
      contact: { include: { company: true } },
      deal: true,
      project: true,
      creator: true,
      items: { orderBy: { order: "asc" } },
    },
  });

  if (!quotation) return null;
  return FinanceService.toClientData(quotation);
}

/**
 * Lấy danh sách Hợp đồng
 */
static async getContracts() {
  const session = await requireAuth();
  
  const contracts = await getTenantDb().contract.findMany({
    where: { organizationId: session.organizationId },
    include: {
      contact: { include: { company: true } },
      deal: true,
      paymentInstallments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return FinanceService.toClientData(contracts);
}

/**
 * Lấy danh sách Hóa đơn
 */
static async getInvoices() {
  const session = await requireAuth();
  
  const invoices = await getTenantDb().invoice.findMany({
    where: {
      organizationId: session.organizationId,
      number: { not: { startsWith: "HP-" } },
    },
    include: {
      contact: { include: { company: true } },
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return FinanceService.toClientData(invoices);
}

/**
 * Admin duyệt tài liệu (Quotation / Contract / Invoice)
 */
static async adminApproveDocument(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireAuth();

  const data = {
    adminSignedAt: new Date(),
    status: "SENT" as any, // Cập nhật trạng thái thành SENT để sẵn sàng gửi
  };

  if (type === "quotation") {
    const result = await getTenantDb().quotation.updateMany({ where: { id, organizationId: session.organizationId }, data });
    if (!result.count) throw new Error("Quotation not found");
  } else if (type === "contract") {
    const result = await getTenantDb().contract.updateMany({ where: { id, organizationId: session.organizationId }, data });
    if (!result.count) throw new Error("Contract not found");
  } else if (type === "invoice") {
    const result = await getTenantDb().invoice.updateMany({ where: { id, organizationId: session.organizationId }, data });
    if (!result.count) throw new Error("Invoice not found");
  }

  revalidatePath(`/workspace/finance/${type}s`);
  return { success: true };
}

/**
 * Tạo token public cho tài liệu nếu chưa có
 */
static async generateDocumentToken(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireAuth();
  
  // Logic kiểm tra và sinh token ngẫu nhiên
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const updateData = { token };

  if (type === "quotation") {
    await getTenantDb().quotation.updateMany({ where: { id, organizationId: session.organizationId, token: null }, data: updateData }).catch(() => {});
  } else if (type === "contract") {
    await getTenantDb().contract.updateMany({ where: { id, organizationId: session.organizationId, token: null }, data: updateData }).catch(() => {});
  } else if (type === "invoice") {
    await getTenantDb().invoice.updateMany({ where: { id, organizationId: session.organizationId, token: null }, data: updateData }).catch(() => {});
  }
  
  return { success: true };
}

/**
 * Convert Quotation -> Contract
 */
static async convertQuotationToContract(quotationId: string) {
  const session = await requireAuth();
  
  const quotation = await getTenantDb().quotation.findUnique({
    where: { id: quotationId, organizationId: session.organizationId },
    include: { items: true }
  });

  if (!quotation || quotation.status !== "ACCEPTED") {
    throw new Error("Báo giá chưa được khách hàng chấp nhận");
  }

  const contract = await getTenantDb().contract.create({
    data: {
      organizationId: session.organizationId,
      number: `HD-${Date.now()}`,
      title: `Hợp đồng cho: ${quotation.title}`,
      contactId: quotation.contactId,
      dealId: quotation.dealId,
      creatorId: session.user.id,
      currency: quotation.currency,
      total: quotation.total,
      items: {
        create: quotation.items.map(item => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          order: item.order,
        }))
      }
    }
  });

  // Update Quotation to link with this Contract and mark converted
  await getTenantDb().quotation.update({
    where: { id: quotation.id },
    data: { contractId: contract.id, convertedAt: new Date(), status: "CONVERTED" }
  });

  revalidatePath("/workspace/finance/contracts");
  revalidatePath("/workspace/finance/quotations");
  
  return { success: true, contractId: contract.id };
}

/**
 * Convert Quotation -> Invoice
 */
static async convertQuotationToInvoice(quotationId: string) {
  const session = await requireAuth();
  
  const quotation = await getTenantDb().quotation.findUnique({
    where: { id: quotationId, organizationId: session.organizationId },
    include: { items: true }
  });

  if (!quotation || quotation.status !== "ACCEPTED") {
    throw new Error("Báo giá chưa được khách hàng chấp nhận");
  }

  const invoice = await getTenantDb().invoice.create({
    data: {
      organizationId: session.organizationId,
      number: `INV-${Date.now()}`,
      title: `Hóa đơn cho: ${quotation.title}`,
      contactId: quotation.contactId,
      creatorId: session.user.id,
      currency: quotation.currency,
      subtotal: quotation.subtotal,
      discount: quotation.discount,
      discountType: quotation.discountType,
      tax: quotation.tax,
      taxRate: quotation.taxRate,
      total: quotation.total,
      amountDue: quotation.total,
      items: {
        create: quotation.items.map(item => ({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
          total: item.total,
          order: item.order,
        }))
      }
    }
  });

  await getTenantDb().quotation.update({
    where: { id: quotation.id },
    data: { invoiceId: invoice.id, convertedAt: new Date(), status: "CONVERTED" }
  });

  revalidatePath("/workspace/finance/invoices");
  revalidatePath("/workspace/finance/quotations");

  return { success: true, invoiceId: invoice.id };
}



/**
 * Khách hàng ký duyệt tài liệu (Public)
 */
static async signDocument(
  token: string,
  type: "quotation" | "contract" | "invoice",
  signatureData: string | { signerName: string; signerEmail?: string; signerPhone?: string; signatureData: string },
  ip: string,
  userAgent: string,
) {
  const includeData = type === "contract" ? { paymentInstallments: true } : undefined;

  const doc = await (getTenantDb() as any)[type].findUnique({
    where: { token },
    include: includeData
  });

  if (!doc) throw new Error("Document not found");

  const payload = typeof signatureData === "string"
    ? { signerName: "Khách hàng", signerEmail: "", signerPhone: "", signatureData }
    : signatureData;

  const signerName = payload.signerName?.trim() || "Khách hàng";
  const signerEmail = payload.signerEmail?.trim() || null;
  const signerPhone = payload.signerPhone?.trim() || "";
  const finalSignatureData = signerPhone
    ? JSON.stringify({ signatureData: payload.signatureData, signerPhone })
    : payload.signatureData;

  const signature = await getTenantDb().documentSignature.create({
    data: {
      organizationId: doc.organizationId,
      signerName,
      signerEmail,
      signatureData: finalSignatureData,
      ipAddress: ip,
      userAgent
    }
  });

  const updateData: any = {
    signatureId: signature.id,
    signedAt: new Date(),
  };

  if (type === "quotation") updateData.status = "ACCEPTED";
  else if (type === "contract") updateData.status = "SIGNED";
  
  await (getTenantDb() as any)[type].update({
    where: { id: doc.id },
    data: updateData
  });

  await FinanceNotifications.notifyFinanceDocumentEvent({
    organizationId: doc.organizationId,
    type,
    id: doc.id,
    number: doc.number,
    customerName: signerName,
    event: "signed",
    metadata: { signatureId: signature.id, signerEmail, signerPhone },
    dedupeMinutes: 60,
  }).catch((error) => console.error("Không thể tạo thông báo khách ký tài liệu", error));

  try {
    await EmailFlows.sendSignedDocumentEmails({
      organizationId: doc.organizationId,
      type,
      id: doc.id,
    });
  } catch (emailError) {
    console.error("Không thể gửi email sau khi khách ký tài liệu", emailError);
  }

  if (type === "contract" && doc.paymentInstallments && doc.paymentInstallments.length > 0) {
    for (const [index, installment] of doc.paymentInstallments.entries()) {
      const invoiceToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const invoice = await getTenantDb().invoice.create({
        data: {
          organizationId: doc.organizationId,
          number: `${doc.number}-INV${index + 1}`,
          title: installment.name,
          contactId: doc.contactId,
          contractId: doc.id,
          creatorId: doc.creatorId,
          currency: doc.currency,
          subtotal: installment.amount,
          total: installment.amount,
          amountDue: installment.amount,
          dueDate: installment.dueDate,
          status: "DRAFT",
          token: invoiceToken,
          items: {
            create: [
              {
                name: installment.name,
                description: `Thanh toán đợt ${index + 1} theo hợp đồng ${doc.number}`,
                unit: "Đợt",
                quantity: 1,
                unitPrice: installment.amount,
                total: installment.amount,
                order: 1
              }
            ]
          }
        }
      });
      
      await getTenantDb().paymentInstallment.update({
        where: { id: installment.id },
        data: { invoiceId: invoice.id }
      });
    }
  }

  return { success: true };
}

static async getPayments() {
  const session = await requireAuth();

  const payments = await getTenantDb().payment.findMany({
    where: { organizationId: session.organizationId },
    include: {
      invoice: {
        include: { contact: { include: { company: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return FinanceService.toClientData(payments);
}




static financeEntity(type: "quotation" | "contract" | "invoice") {
  if (type === "quotation") return { entity: "Quotation", label: "báo giá" };
  if (type === "contract") return { entity: "Contract", label: "hợp đồng" };
  return { entity: "Invoice", label: "hóa đơn" };
}

static safeFinanceEmailBaseUrl(baseUrl?: string) {
  if (!baseUrl) return undefined;
  try {
    const url = new URL(baseUrl);
    const allowedHosts = new Set(["app.ovc.vn", "app.ongvang.com.vn", "localhost", "127.0.0.1"]);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    if (!allowedHosts.has(url.hostname)) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}



static normalizeEmailRecipients(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value : [value || ""];
  return Array.from(
    new Set(
      raw
        .flatMap((item) => String(item || "").split(/[\n,;]+/))
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}


static itemUnitData(unit?: unknown) {
  if (typeof unit !== "string") return {};
  const value = unit.trim();
  return value ? { unit: value } : {};
}

// ======================== QUOTATION ========================

// --- Added Helper for Contact/Company cross-update ---
static async handleTargetData(data: any, organizationId: string) {
  let contactId = data.contactId || undefined;
  let companyId = data.companyId || undefined;
  const companyDirectFields = {
    ...(data.companyTaxCode !== undefined ? { taxCode: data.companyTaxCode || null } : {}),
    ...(data.companyRepresentative !== undefined ? { representativeName: data.companyRepresentative || null } : {}),
    ...(data.companyRepresentativeTitle !== undefined ? { representativeTitle: data.companyRepresentativeTitle || null } : {}),
  };

  // Handle Company
  if (data.targetType === "company" || data.companyName) {
    if (companyId) {
      await getTenantDb().company.update({
        where: { id: companyId },
        data: {
          name: data.companyName || undefined,
          phone: data.contactPhone || undefined,
          email: data.contactEmail || undefined,
          address: data.contactAddress || undefined,
          ...companyDirectFields,
        }
      });
    } else if (data.companyName) {
      const newCompany = await getTenantDb().company.create({
        data: {
          organizationId,
          name: data.companyName,
          phone: data.contactPhone || null,
          email: data.contactEmail || null,
          address: data.contactAddress || null,
          ...companyDirectFields,
        }
      });
      companyId = newCompany.id;
    }
  }

  // Handle Contact
  if (data.targetType !== "company" || data.contactName) {
    if (contactId) {
      await getTenantDb().contact.update({
        where: { id: contactId },
        data: {
          firstName: data.contactName || undefined,
          lastName: "",
          phone: data.contactPhone || undefined,
          email: data.contactEmail || undefined,
          address: data.contactAddress || undefined,
          companyId: companyId || undefined,
          ...(data.contactIdentityNumber !== undefined ? { identityNumber: data.contactIdentityNumber || null } : {}),
        }
      });
    } else if (data.contactName) {
      const newContact = await getTenantDb().contact.create({
        data: {
          organizationId,
          firstName: data.contactName,
          lastName: "",
          phone: data.contactPhone || null,
          email: data.contactEmail || null,
          address: data.contactAddress || null,
          companyId: companyId || undefined,
          ...(data.contactIdentityNumber ? { identityNumber: data.contactIdentityNumber } : {}),
        }
      });
      contactId = newContact.id;
    }
  }

  return { contactId, companyId };
}
// -----------------------------------------------------

static async getNextQuotationNumber() {
  const session = await requireFinanceSession();
  return generateAutoCode(session.organizationId, "FORMAT_QUOTE", "BG-");
}

static async createQuotation(data: any) {
  const session = await requireFinanceSession();
  const { contactId, companyId } = await FinanceService.handleTargetData(data, session.organizationId);
  const sourceDeal = data.dealId
    ? await getTenantDb().deal.findFirst({
        where: { id: data.dealId, organizationId: session.organizationId },
        select: { contactId: true, companyId: true, assigneeId: true },
      })
    : null;
  const quoteCode = await generateAutoCode(session.organizationId, "FORMAT_QUOTE", "BG-");
  
  const quotation = await getTenantDb().quotation.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: data.number || quoteCode,
      title: data.title,
      contact: contactId || sourceDeal?.contactId ? { connect: { id: contactId || sourceDeal!.contactId! } } : undefined,
      company: companyId || sourceDeal?.companyId ? { connect: { id: companyId || sourceDeal!.companyId! } } : undefined,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      creator: { connect: { id: session.user.id } },
      assignee: data.assigneeId || sourceDeal?.assigneeId ? { connect: { id: data.assigneeId || sourceDeal!.assigneeId! } } : undefined,
      deal: data.dealId ? { connect: { id: data.dealId } } : undefined,
      currency: data.currency || "VND",
      status: data.status || "DRAFT",
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      discountType: data.discountType || "fixed",
      tax: data.tax || 0,
      taxRate: data.taxRate || 0,
      total: data.total || 0,
      notes: data.notes || null,
      terms: data.terms || null,
      customerSignatureRequired: data.customerSignatureRequired !== false,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
          ...FinanceService.itemUnitData(item.unit),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.total || 0,
          order: item.order || 0
        })) || []
      }
    }
  });
  
  revalidatePath("/workspace/finance/quotations");
  revalidatePath(`/workspace/finance/quotations/${quotation.id}`);
  revalidatePath(`/document/${quotation.token}`);
  revalidatePath(`/document/${quotation.token}/print`);
  return { success: true, id: quotation.id, token: quotation.token };
}

static async updateQuotation(id: string, data: any) {
  const session = await requireFinanceSession();
  const { contactId, companyId } = await FinanceService.handleTargetData(data, session.organizationId);

  const existing = await getTenantDb().quotation.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    throw new Error("Quotation not found");
  }

  await getTenantDb().quotationItem.deleteMany({ where: { quotationId: id } });

  const quotation = await getTenantDb().quotation.update({
    where: { id },
    data: {
      number: data.number || existing.number,
      title: data.title,
      contact: contactId ? { connect: { id: contactId } } : { disconnect: true },
      company: companyId ? { connect: { id: companyId } } : { disconnect: true },
      project: data.projectId ? { connect: { id: data.projectId } } : { disconnect: true },
      deal: data.dealId ? { connect: { id: data.dealId } } : { disconnect: true },
      assignee: data.assigneeId ? { connect: { id: data.assigneeId } } : { disconnect: true },
      currency: data.currency || "VND",
      status: data.status || existing.status,
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      discountType: data.discountType || "fixed",
      tax: data.tax || 0,
      taxRate: data.taxRate || 0,
      total: data.total || 0,
      notes: data.notes || null,
      terms: data.terms || null,
      customerSignatureRequired: data.customerSignatureRequired !== false,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
          ...FinanceService.itemUnitData(item.unit),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.total || 0,
          order: item.order || 0,
        })) || [],
      },
    },
  });

  revalidatePath("/workspace/finance/quotations");
  revalidatePath(`/workspace/finance/quotations/${id}`);
  revalidatePath(`/workspace/finance/quotations/${id}/edit`);
  revalidatePath(`/document/${quotation.token}`);
  revalidatePath(`/document/${quotation.token}/print`);
  return { success: true, id: quotation.id, token: quotation.token };
}

// ======================== CONTRACT ========================
static async createContract(data: any) {
  const session = await requireFinanceSession();
  const { contactId, companyId } = await FinanceService.handleTargetData(data, session.organizationId);
  const contractCode = await generateAutoCode(session.organizationId, "FORMAT_CONTRACT", "HD-");
  const sourceQuotation = data.quotationId
    ? await getTenantDb().quotation.findFirst({
        where: { id: data.quotationId, organizationId: session.organizationId },
        select: { contactId: true, companyId: true, dealId: true, assigneeId: true },
      })
    : null;
  
  const contract = await getTenantDb().contract.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: data.number || contractCode,
      title: data.title,
      status: data.status || "DRAFT",
      contact: contactId || sourceQuotation?.contactId ? { connect: { id: contactId || sourceQuotation!.contactId! } } : undefined,
      deal: data.dealId || sourceQuotation?.dealId ? { connect: { id: data.dealId || sourceQuotation!.dealId! } } : undefined,
      company: companyId || sourceQuotation?.companyId ? { connect: { id: companyId || sourceQuotation!.companyId! } } : undefined,
      assignee: data.assigneeId || sourceQuotation?.assigneeId ? { connect: { id: data.assigneeId || sourceQuotation!.assigneeId! } } : undefined,
      creator: { connect: { id: session.user.id } },
      currency: data.currency || "VND",
      paymentChannels: data.paymentChannels || ["company"],
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      discountType: data.discountType || "fixed",
      tax: data.tax || 0,
      total: data.total || 0,
      notes: data.notes || null,
      terms: data.terms || null,
      customerSignatureRequired: data.customerSignatureRequired !== false,
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
          ...FinanceService.itemUnitData(item.unit),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total || 0,
          order: item.order || 0
        })) || []
      },
      paymentInstallments: {
        create: data.paymentInstallments?.map((inst: any) => ({
          name: inst.name,
          amount: inst.amount,
          dueDate: new Date(inst.dueDate),
          status: "PENDING"
        })) || []
      }
    }
  });

  if (data.quotationId) {
    await getTenantDb().quotation.updateMany({
      where: { id: data.quotationId, organizationId: session.organizationId },
      data: {
        contractId: contract.id,
        convertedAt: new Date(),
        status: "CONVERTED",
      },
    });
    revalidatePath(`/workspace/finance/quotations/${data.quotationId}`);
    revalidatePath(`/workspace/finance/quotations/${data.quotationId}/edit`);
  }
  
  revalidatePath("/workspace/finance/contracts");
  revalidatePath(`/workspace/finance/contracts/${contract.id}`);
  revalidatePath(`/document/${contract.token}`);
  revalidatePath(`/document/${contract.token}/print`);
  return { success: true, id: contract.id, token: contract.token };
}

static async updateContract(id: string, data: any) {
  const session = await requireFinanceSession();
  const { contactId, companyId } = await FinanceService.handleTargetData(data, session.organizationId);

  const existing = await getTenantDb().contract.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    throw new Error("Contract not found");
  }

  // First, delete existing items and installments to replace them
  // This is a simple approach, ideally we should upsert
  await getTenantDb().contractItem.deleteMany({ where: { contractId: id } });
  await getTenantDb().paymentInstallment.deleteMany({ where: { contractId: id, invoiceId: null } });

  const contract = await getTenantDb().contract.update({
    where: { id },
    data: {
      title: data.title,
      status: data.status || existing.status,
      contact: data.contactId ? { connect: { id: data.contactId } } : { disconnect: true },
      deal: data.dealId ? { connect: { id: data.dealId } } : { disconnect: true },
      company: companyId ? { connect: { id: companyId } } : undefined,
      assignee: data.assigneeId ? { connect: { id: data.assigneeId } } : undefined,
      currency: data.currency || "VND",
      paymentChannels: data.paymentChannels || ["company"],
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      discountType: data.discountType || "fixed",
      tax: data.tax || 0,
      total: data.total || 0,
      notes: data.notes || null,
      terms: data.terms || null,
      customerSignatureRequired: data.customerSignatureRequired !== false,
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
          ...FinanceService.itemUnitData(item.unit),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total || 0,
          order: item.order || 0
        })) || []
      },
      paymentInstallments: {
        create: data.paymentInstallments?.filter((inst: any) => !inst.id || !inst.invoiceId).map((inst: any) => ({
          name: inst.name,
          amount: inst.amount,
          dueDate: new Date(inst.dueDate),
          status: "PENDING"
        })) || []
      }
    }
  });

  revalidatePath("/workspace/finance/contracts");
  revalidatePath(`/workspace/finance/contracts/${id}`);
  revalidatePath(`/workspace/finance/contracts/${id}/edit`);
  revalidatePath(`/document/${contract.token}`);
  revalidatePath(`/document/${contract.token}/print`);
  return { success: true, id: contract.id, token: contract.token };
}

// ======================== INVOICE ========================
static async getNextInvoiceNumber() {
  const session = await requireFinanceSession();
  return generateAutoCode(session.organizationId, "FORMAT_INVOICE", "HD-");
}

static async getNextContractNumber() {
  const session = await requireFinanceSession();
  return generateAutoCode(session.organizationId, "FORMAT_CONTRACT", "HD-");
}

static async getNextReceiptNumber() {
  const session = await requireFinanceSession();
  return generateAutoCode(session.organizationId, "FORMAT_RECEIPT", "PT-");
}

static async createInvoice(data: any) {
  const session = await requireFinanceSession();
  const { contactId, companyId } = await FinanceService.handleTargetData(data, session.organizationId);
  const sourceContract = data.contractId
    ? await getTenantDb().contract.findFirst({
        where: { id: data.contractId, organizationId: session.organizationId },
        select: { contactId: true, companyId: true, dealId: true, assigneeId: true },
      })
    : null;
  const invoiceCode = await generateAutoCode(session.organizationId, "FORMAT_INVOICE", "HD-");

  const invoice = await getTenantDb().invoice.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: data.number || invoiceCode,
      title: data.title,
      status: data.status || "DRAFT",
      contact: contactId || sourceContract?.contactId ? { connect: { id: contactId || sourceContract!.contactId! } } : undefined,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      company: companyId || sourceContract?.companyId ? { connect: { id: companyId || sourceContract!.companyId! } } : undefined,
      assignee: data.assigneeId || sourceContract?.assigneeId ? { connect: { id: data.assigneeId || sourceContract!.assigneeId! } } : undefined,
      deal: data.dealId || sourceContract?.dealId ? { connect: { id: data.dealId || sourceContract!.dealId! } } : undefined,
      contract: data.contractId ? { connect: { id: data.contractId } } : undefined,
      creator: { connect: { id: session.user.id } },
      currency: data.currency || "VND",
      paymentChannels: data.paymentChannels || ["company"],
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      discountType: data.discountType || "fixed",
      tax: data.tax || 0,
      taxRate: data.taxRate || 0,
      total: Number(data.total || 0),
      amountPaid: Number(data.amountPaid || 0),
      amountDue: Math.max(0, Number(data.total || 0) - Number(data.amountPaid || 0)),
      notes: data.notes || null,
      terms: data.terms || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      issuedAt: data.issuedAt ? new Date(data.issuedAt) : new Date(),
      customerSignatureRequired: data.customerSignatureRequired !== false,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
          ...FinanceService.itemUnitData(item.unit),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.total || 0,
          order: item.order || 0,
        })) || [],
      },
    },
  });

  revalidatePath("/workspace/finance/invoices");
  revalidatePath(`/workspace/finance/invoices/${invoice.id}`);
  revalidatePath(`/document/${invoice.token}`);
  revalidatePath(`/document/${invoice.token}/print`);
  return { success: true, id: invoice.id, token: invoice.token };
}

static async convertContractToInvoice(contractId: string) {
  const session = await requireFinanceSession();

  const contract = await getTenantDb().contract.findUnique({
    where: { id: contractId, organizationId: session.organizationId },
    include: { items: { orderBy: { order: "asc" } } },
  });

  if (!contract) throw new Error("Contract not found");
  if (contract.status !== "SIGNED") throw new Error("Hợp đồng chưa được ký");

  const invoiceCode = await generateAutoCode(session.organizationId, "FORMAT_INVOICE", "HD-");

  const invoice = await getTenantDb().invoice.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: invoiceCode,
      title: `Hóa đơn theo hợp đồng ${contract.number}`,
      status: "DRAFT",
      contact: contract.contactId ? { connect: { id: contract.contactId } } : undefined,
      company: contract.companyId ? { connect: { id: contract.companyId } } : undefined,
      deal: contract.dealId ? { connect: { id: contract.dealId } } : undefined,
      assignee: contract.assigneeId ? { connect: { id: contract.assigneeId } } : undefined,
      contract: { connect: { id: contract.id } },
      creator: { connect: { id: session.user.id } },
      currency: contract.currency,
      paymentChannels: contract.paymentChannels || ["company"],
      subtotal: contract.subtotal || contract.total,
      discount: contract.discount || 0,
      discountType: contract.discountType || "fixed",
      tax: contract.tax || 0,
      total: contract.total || 0,
      amountDue: contract.total || 0,
      notes: contract.notes || null,
      terms: contract.terms || null,
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      signedAt: contract.signedAt || null,
      signature: contract.signatureId ? { connect: { id: contract.signatureId } } : undefined,
      customerSignatureRequired: contract.customerSignatureRequired !== false,
      items: {
        create: contract.items.map((item) => ({
          name: item.name,
          description: item.description || null,
          ...FinanceService.itemUnitData(item.unit),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total || 0,
          order: item.order || 0,
        })),
      },
    },
  });

  revalidatePath("/workspace/finance/invoices");
  revalidatePath(`/workspace/finance/invoices/${invoice.id}`);
  revalidatePath(`/workspace/finance/contracts/${contract.id}`);
  return { success: true, invoiceId: invoice.id, id: invoice.id };
}

static async createInvoiceFromQuotation(quotationId: string) {
  const session = await requireFinanceSession();

  const quotation = await getTenantDb().quotation.findFirst({
    where: { id: quotationId, organizationId: session.organizationId },
    include: {
      items: { orderBy: { order: "asc" } },
      contract: { include: { items: { orderBy: { order: "asc" } } } },
    },
  });

  if (!quotation) throw new Error("Quotation not found");

  if (quotation.contract && quotation.contract.status === "SIGNED") {
    return FinanceService.convertContractToInvoice(quotation.contract.id);
  }

  if (!["ACCEPTED", "CONVERTED"].includes(quotation.status)) {
    throw new Error("Báo giá chưa được ký duyệt/chấp nhận");
  }

  const invoiceCode = await generateAutoCode(session.organizationId, "FORMAT_INVOICE", "HD-");

  const invoice = await getTenantDb().invoice.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: invoiceCode,
      title: `Hóa đơn theo báo giá ${quotation.number}`,
      status: "DRAFT",
      contact: quotation.contactId ? { connect: { id: quotation.contactId } } : undefined,
      project: quotation.projectId ? { connect: { id: quotation.projectId } } : undefined,
      creator: { connect: { id: session.user.id } },
      currency: quotation.currency,
      paymentChannels: ["company"],
      subtotal: quotation.subtotal || 0,
      discount: quotation.discount || 0,
      discountType: quotation.discountType || "fixed",
      tax: quotation.tax || 0,
      taxRate: quotation.taxRate || 0,
      total: quotation.total || 0,
      amountDue: quotation.total || 0,
      notes: quotation.notes || null,
      terms: quotation.terms || null,
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: {
        create: quotation.items.map((item) => ({
          name: item.name,
          description: item.description || null,
          ...FinanceService.itemUnitData(item.unit),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.total || 0,
          order: item.order || 0,
        })),
      },
    },
  });

  await getTenantDb().quotation.updateMany({
    where: { id: quotation.id, organizationId: session.organizationId },
    data: { invoiceId: invoice.id, convertedAt: new Date(), status: "CONVERTED" },
  });

  revalidatePath("/workspace/finance/invoices");
  revalidatePath(`/workspace/finance/invoices/${invoice.id}`);
  revalidatePath(`/workspace/finance/quotations/${quotation.id}`);
  return { success: true, invoiceId: invoice.id, id: invoice.id };
}

static async updateInvoice(id: string, data: any) {
  const session = await requireFinanceSession();
  const { contactId, companyId } = await FinanceService.handleTargetData(data, session.organizationId);

  const existing = await getTenantDb().invoice.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) throw new Error("Invoice not found");

  await getTenantDb().invoiceItem.deleteMany({ where: { invoiceId: id } });

  const total = Number(data.total || 0);
  const amountPaid = Number(data.amountPaid ?? existing.amountPaid ?? 0);
  const invoice = await getTenantDb().invoice.update({
    where: { id },
    data: {
      number: data.number || existing.number,
      title: data.title,
      status: data.status || existing.status,
      contact: contactId ? { connect: { id: contactId } } : { disconnect: true },
      project: data.projectId ? { connect: { id: data.projectId } } : { disconnect: true },
      company: companyId ? { connect: { id: companyId } } : { disconnect: true },
      assignee: data.assigneeId ? { connect: { id: data.assigneeId } } : { disconnect: true },
      deal: data.dealId ? { connect: { id: data.dealId } } : { disconnect: true },
      contract: data.contractId ? { connect: { id: data.contractId } } : { disconnect: true },
      currency: data.currency || "VND",
      paymentChannels: data.paymentChannels || ["company"],
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      discountType: data.discountType || "fixed",
      tax: data.tax || 0,
      taxRate: data.taxRate || 0,
      total,
      amountPaid,
      amountDue: Math.max(0, total - amountPaid),
      notes: data.notes || null,
      terms: data.terms || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      issuedAt: data.issuedAt ? new Date(data.issuedAt) : null,
      customerSignatureRequired: data.customerSignatureRequired !== false,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
          ...FinanceService.itemUnitData(item.unit),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          tax: item.tax || 0,
          total: item.total || 0,
          order: item.order || 0,
        })) || [],
      },
    },
  });

  revalidatePath("/workspace/finance/invoices");
  revalidatePath(`/workspace/finance/invoices/${id}`);
  revalidatePath(`/workspace/finance/invoices/${id}/edit`);
  revalidatePath(`/document/${invoice.token}`);
  revalidatePath(`/document/${invoice.token}/print`);
  return { success: true, id: invoice.id, token: invoice.token };
}

static async createInvoiceFromInstallment(installmentId: string) {
  const session = await requireFinanceSession();
  
  const installment = await getTenantDb().paymentInstallment.findUnique({
    where: { id: installmentId },
    include: { contract: true }
  });

  if (!installment || !installment.contract) throw new Error("Installment not found");

  const contract = installment.contract;

  if (installment.invoiceId) {
    throw new Error("Hóa đơn đã được tạo cho đợt này rồi");
  }

  const invoiceCode = await generateAutoCode(session.organizationId, "FORMAT_INVOICE", "HD-");

  const invoice = await getTenantDb().invoice.create({
    data: {
      organizationId: session.organizationId,
      token: randomUUID(),
      number: invoiceCode,
      title: `Hóa đơn: ${installment.name} (${contract.number})`,
      contactId: contract.contactId,
      contractId: contract.id,
      creatorId: session.user.id,
      currency: contract.currency,
      paymentChannels: contract.paymentChannels || ["company"],
      subtotal: installment.amount,
      total: installment.amount,
      amountDue: installment.amount,
      issuedAt: new Date(),
      dueDate: installment.dueDate,
      items: {
        create: [{
          name: installment.name,
          description: `Thanh toán ${installment.name} cho hợp đồng ${contract.number}`,
          ...FinanceService.itemUnitData("Đợt"),
          quantity: 1,
          unitPrice: installment.amount,
          total: installment.amount,
          order: 0
        }]
      }
    }
  });

  await getTenantDb().paymentInstallment.update({
    where: { id: installmentId },
    data: { invoiceId: invoice.id }
  });

  revalidatePath("/workspace/finance/contracts");
  revalidatePath("/workspace/finance/invoices");
  
  return { success: true, invoiceId: invoice.id };
}

// ======================== PAYMENT ========================
static async recordPayment(invoiceId: string, amount: number, method: any, notes?: string, date?: string, sendCustomerEmail = false) {
  const session = await requireFinanceSession();
  
  const invoice = await getTenantDb().invoice.findFirst({
    where: { id: invoiceId, organizationId: session.organizationId },
    include: { payments: true }
  });

  if (!invoice) throw new Error("Invoice not found");

  const receiptCode = await generateAutoCode(session.organizationId, "FORMAT_RECEIPT", "PT-");

  const newPayment = await getTenantDb().payment.create({
    data: {
      organizationId: session.organizationId,
      invoiceId: invoice.id,
      amount: amount,
      method: method,
      notes: notes,
      paidAt: date ? new Date(date) : new Date(),
      number: receiptCode,
      status: "COMPLETED",
    }
  });

  // Calculate total paid
  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(amount);
  const status = totalPaid >= Number(invoice.total) ? 'PAID' : 'PARTIAL';

  await getTenantDb().invoice.update({
    where: { id: invoice.id },
    data: { status, amountDue: Math.max(0, Number(invoice.total) - totalPaid) }
  });

  // Update payment installment if linked
  const installment = await getTenantDb().paymentInstallment.findFirst({ where: { invoiceId: invoice.id } });
  if (installment && status === "PAID") {
    await getTenantDb().paymentInstallment.update({ where: { id: installment.id }, data: { status: "PAID" } });
  }

  if (sendCustomerEmail) {
    await EmailFlows.sendPaymentEmails({
      organizationId: session.organizationId,
      paymentId: newPayment.id,
      cookieHeader: (await cookies()).toString(),
    });
  }

  revalidatePath("/workspace/finance/invoices");
  revalidatePath("/workspace/finance/payments");
  revalidatePath(`/workspace/finance/invoices/${invoice.id}`);
  revalidatePath(`/workspace/finance/payments/${newPayment.id}`);
  return { success: true, paymentId: newPayment.id };
}

static async recalculateInvoicePaymentStatus(invoiceId?: string | null) {
  if (!invoiceId) return;

  const invoice = await getTenantDb().invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (!invoice) return;

  const totalPaid = invoice.payments.reduce((sum, payment) => {
    if (["COMPLETED", "PROCESSING", "PENDING"].includes(payment.status)) {
      return sum + Number(payment.amount);
    }
    return sum;
  }, 0);
  const amountDue = Math.max(0, Number(invoice.total) - totalPaid);
  const status =
    totalPaid <= 0
      ? invoice.sentAt
        ? "SENT"
        : "DRAFT"
      : amountDue <= 0
        ? "PAID"
        : "PARTIAL";

  await getTenantDb().invoice.update({
    where: { id: invoice.id },
    data: {
      status: status as any,
      amountDue,
      paidAt: amountDue <= 0 ? invoice.paidAt || new Date() : invoice.paidAt,
    },
  });

  const installment = await getTenantDb().paymentInstallment.findFirst({ where: { invoiceId: invoice.id } });
  if (installment) {
    await getTenantDb().paymentInstallment.update({
      where: { id: installment.id },
      data: { status: amountDue <= 0 ? "PAID" : "PENDING" },
    });
  }
}

static async createPayment(data: {
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
  const session = await requireFinanceSession();
  const receiptCode = await generateAutoCode(session.organizationId, "FORMAT_RECEIPT", "PT-");
  const invoice = data.invoiceId
    ? await getTenantDb().invoice.findFirst({ where: { id: data.invoiceId, organizationId: session.organizationId } })
    : null;

  if (data.invoiceId && !invoice) throw new Error("Invoice not found");

  const payment = await getTenantDb().payment.create({
    data: {
      organizationId: session.organizationId,
      number: data.number || receiptCode,
      invoiceId: invoice?.id || null,
      amount: data.amount || 0,
      currency: data.currency || invoice?.currency || "VND",
      method: data.method || "BANK_TRANSFER",
      status: data.status || "COMPLETED",
      reference: data.reference || null,
      notes: data.notes || null,
      paidAt: data.paidAt ? new Date(data.paidAt) : new Date(),
    },
  });

  await FinanceService.recalculateInvoicePaymentStatus(invoice?.id);

  revalidatePath("/workspace/finance/payments");
  revalidatePath(`/workspace/finance/payments/${payment.id}`);
  if (invoice?.id) revalidatePath(`/workspace/finance/invoices/${invoice.id}`);
  return { success: true, paymentId: payment.id };
}

static async updatePayment(id: string, data: {
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
  const session = await requireFinanceSession();
  const existing = await getTenantDb().payment.findFirst({ where: { id, organizationId: session.organizationId } });
  if (!existing) throw new Error("Payment not found");

  const invoice = data.invoiceId
    ? await getTenantDb().invoice.findFirst({ where: { id: data.invoiceId, organizationId: session.organizationId } })
    : null;

  if (data.invoiceId && !invoice) throw new Error("Invoice not found");

  const payment = await getTenantDb().payment.update({
    where: { id },
    data: {
      number: data.number || existing.number,
      invoiceId: invoice?.id || null,
      amount: data.amount || 0,
      currency: data.currency || invoice?.currency || existing.currency,
      method: data.method || existing.method,
      status: data.status || existing.status,
      reference: data.reference || null,
      notes: data.notes || null,
      paidAt: data.paidAt ? new Date(data.paidAt) : null,
    },
  });

  await FinanceService.recalculateInvoicePaymentStatus(existing.invoiceId);
  if (existing.invoiceId !== invoice?.id) await FinanceService.recalculateInvoicePaymentStatus(invoice?.id);

  revalidatePath("/workspace/finance/payments");
  revalidatePath(`/workspace/finance/payments/${payment.id}`);
  if (existing.invoiceId) revalidatePath(`/workspace/finance/invoices/${existing.invoiceId}`);
  if (invoice?.id) revalidatePath(`/workspace/finance/invoices/${invoice.id}`);
  return { success: true, paymentId: payment.id };
}

// ======================== EMAIL ========================
static async getDocumentEmailDraft(type: "quotation" | "contract" | "invoice", id: string, publicBaseUrl?: string) {
  const session = await requireFinanceSession();
  return EmailFlows.renderFinanceDocumentEmailDraft({
    organizationId: session.organizationId,
    type,
    id,
    publicBaseUrl: FinanceService.safeFinanceEmailBaseUrl(publicBaseUrl),
  });
}

static async sendDocumentEmail(
  type: "quotation" | "contract" | "invoice",
  id: string,
  emailOrPayload: string | FinanceTypes.FinanceEmailSendPayload,
  publicBaseUrl?: string
) {
  const session = await requireFinanceSession();
  const payload: FinanceTypes.FinanceEmailSendPayload =
    typeof emailOrPayload === "string" ? { to: emailOrPayload, publicBaseUrl } : emailOrPayload;
  const recipients = FinanceService.normalizeEmailRecipients(payload.to);

  const doc =
    type === "quotation"
      ? await getTenantDb().quotation.findFirst({ where: { id, organizationId: session.organizationId } })
      : type === "contract"
        ? await getTenantDb().contract.findFirst({ where: { id, organizationId: session.organizationId } })
        : await getTenantDb().invoice.findFirst({ where: { id, organizationId: session.organizationId } });

  if (!doc) throw new Error("Document not found");
  if (!doc.token) throw new Error("Token không tồn tại, vui lòng tạo token public trước khi gửi");
  if (!doc.adminSignedAt) throw new Error("Admin cần ký tài liệu trước khi gửi email.");
  if (!recipients.length) throw new Error("Vui lòng nhập ít nhất một email người nhận.");

  const emailResult = await EmailFlows.sendFinanceDocumentEmail({
    organizationId: session.organizationId,
    type,
    id,
    to: recipients,
    subject: payload.subject,
    html: payload.html,
    attachPdf: payload.attachPdf,
    publicBaseUrl: FinanceService.safeFinanceEmailBaseUrl(payload.publicBaseUrl || publicBaseUrl),
  });

  if (!emailResult.sent) {
    throw new Error("Khách hàng đã tắt nhận email cho loại tài liệu này trong Portal.");
  }

  const sentAt = new Date();

  // Update sent timestamp and status.
  if (doc.status === "DRAFT") {
    if (type === "quotation") {
      await getTenantDb().quotation.update({ where: { id }, data: { status: "SENT", sentAt } });
    } else if (type === "contract") {
      await getTenantDb().contract.update({ where: { id }, data: { status: "SENT", sentAt } });
    } else {
      await getTenantDb().invoice.update({ where: { id }, data: { status: "SENT", sentAt } });
    }
  } else if (type === "quotation") {
    await getTenantDb().quotation.update({ where: { id }, data: { sentAt } });
  } else if (type === "contract") {
    await getTenantDb().contract.update({ where: { id }, data: { sentAt } });
  } else {
    await getTenantDb().invoice.update({ where: { id }, data: { sentAt } });
  }

  await getTenantDb().activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.user.id,
      action: "sent",
      entity: FinanceService.financeEntity(type).entity,
      entityId: id,
      description: `Gửi ${FinanceService.financeEntity(type).label} qua email`,
      metadata: { email: recipients, attachPdf: payload.attachPdf !== false },
    },
  });

  revalidatePath(`/workspace/finance/${type}s`);
  revalidatePath(`/workspace/finance/${type}s/${id}`);
  return { success: true, message: "Email đã được gửi thành công!" };
}

static async getPaymentEmailDraft(id: string) {
  const session = await requireFinanceSession();
  const payment = await getTenantDb().payment.findFirst({
    where: { id, organizationId: session.organizationId },
    include: { invoice: { include: { contact: true } } },
  });

  if (!payment) throw new Error("Không tìm thấy phiếu thanh toán.");
  if (!payment.invoice) throw new Error("Phiếu thanh toán chưa liên kết hóa đơn.");
  const draft = await EmailFlows.renderPaymentEmailDraft({ organizationId: session.organizationId, paymentId: payment.id });
  const { variables: _variables, ...safeDraft } = draft;
  return safeDraft;
}

static async sendPaymentEmail(id: string, payload?: FinanceTypes.FinanceEmailSendPayload) {
  const session = await requireFinanceSession();
  const payment = await getTenantDb().payment.findFirst({
    where: { id, organizationId: session.organizationId },
    include: { invoice: { include: { contact: true } } },
  });

  if (!payment) throw new Error("Không tìm thấy phiếu thanh toán.");
  if (!payment.invoice) throw new Error("Phiếu thanh toán chưa liên kết hóa đơn.");
  const recipients = FinanceService.normalizeEmailRecipients(payload?.to || payment.invoice.contact?.email || "");
  if (!recipients.length) throw new Error("Vui lòng nhập ít nhất một email người nhận.");

  await EmailFlows.sendPaymentEmails({
    organizationId: session.organizationId,
    paymentId: payment.id,
    to: recipients,
    subject: payload?.subject,
    html: payload?.html,
    attachPdf: payload?.attachPdf,
    cookieHeader: (await cookies()).toString(),
  });

  await getTenantDb().activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.user.id,
      action: "sent",
      entity: "Payment",
      entityId: id,
      description: "Gửi xác nhận thanh toán qua email",
      metadata: { email: recipients, attachPdf: payload?.attachPdf !== false },
    },
  });

  revalidatePath("/workspace/finance/payments");
  revalidatePath(`/workspace/finance/payments/${id}`);
  if (payment.invoiceId) revalidatePath(`/workspace/finance/invoices/${payment.invoiceId}`);
  return { success: true, message: "Email thanh toán đã được gửi." };
}

static async updateQuotationStatus(id: string, status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED") {
  const session = await requireFinanceSession();
  const result = await getTenantDb().quotation.updateMany({
    where: { id, organizationId: session.organizationId },
    data: { status }
  });
  if (!result.count) throw new Error("Quotation not found");
  revalidatePath("/workspace/finance/quotations");
  revalidatePath(`/workspace/finance/quotations/${id}`);
  return { success: true };
}

static async updateContractStatus(id: string, status: "DRAFT" | "SENT" | "SIGNED" | "EXPIRED" | "CANCELLED") {
  const session = await requireFinanceSession();
  const result = await getTenantDb().contract.updateMany({
    where: { id, organizationId: session.organizationId },
    data: { status }
  });
  if (!result.count) throw new Error("Contract not found");
  revalidatePath("/workspace/finance/contracts");
  revalidatePath(`/workspace/finance/contracts/${id}`);
  return { success: true };
}

static async adminSignDocument(type: "quotation" | "contract" | "invoice", id: string, signatureData: string) {
  const session = await requireFinanceSession();
  const entity = FinanceService.financeEntity(type);

  const recordAdminSignature = () =>
    getTenantDb().documentSignature.create({
      data: {
        organizationId: session.organizationId,
        signerName: session.user.name || "Admin",
        signerEmail: session.user.email,
        signatureData,
      },
    });

  const signedAt = new Date();

  if (type === "quotation") {
    const result = await getTenantDb().quotation.updateMany({
      where: { id, organizationId: session.organizationId },
      data: { adminSignedAt: signedAt, status: "ACCEPTED" },
    });
    if (!result.count) throw new Error("Quotation not found");
    await recordAdminSignature();
  } else if (type === "contract") {
    const result = await getTenantDb().contract.updateMany({
      where: { id, organizationId: session.organizationId },
      data: { adminSignedAt: signedAt, status: "SIGNED" },
    });
    if (!result.count) throw new Error("Contract not found");
    await recordAdminSignature();
  } else {
    const doc = await getTenantDb().invoice.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true, status: true },
    });
    if (!doc) throw new Error("Invoice not found");
    await getTenantDb().invoice.update({
      where: { id: doc.id },
      data: { adminSignedAt: signedAt, status: doc.status },
    });
    await recordAdminSignature();
  }

  await getTenantDb().activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.user.id,
      action: "admin_signed",
      entity: entity.entity,
      entityId: id,
      description: `Admin ký ${entity.label}`,
    },
  });

  revalidatePath(`/workspace/finance/${type}s`);
  revalidatePath(`/workspace/finance/${type}s/${id}`);
  return { success: true };
}

static async adminRevokeSignature(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireFinanceSession();
  const entity = FinanceService.financeEntity(type);

  if (type === "quotation") {
    const doc = await getTenantDb().quotation.findFirst({ where: { id, organizationId: session.organizationId }, select: { id: true, status: true } });
    if (!doc) throw new Error("Quotation not found");
    await getTenantDb().quotation.update({
      where: { id: doc.id },
      data: { adminSignedAt: null, status: doc.status === "ACCEPTED" ? "SENT" : doc.status },
    });
  } else if (type === "contract") {
    const doc = await getTenantDb().contract.findFirst({ where: { id, organizationId: session.organizationId }, select: { id: true, status: true } });
    if (!doc) throw new Error("Contract not found");
    await getTenantDb().contract.update({
      where: { id: doc.id },
      data: { adminSignedAt: null, status: doc.status === "SIGNED" ? "SENT" : doc.status },
    });
  } else {
    const doc = await getTenantDb().invoice.findFirst({ where: { id, organizationId: session.organizationId }, select: { id: true, status: true } });
    if (!doc) throw new Error("Invoice not found");
    await getTenantDb().invoice.update({
      where: { id: doc.id },
      data: { adminSignedAt: null, status: doc.status },
    });
  }

  await getTenantDb().activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.user.id,
      action: "admin_signature_revoked",
      entity: entity.entity,
      entityId: id,
      description: `Hủy chữ ký admin của ${entity.label}`,
    },
  });

  revalidatePath(`/workspace/finance/${type}s`);
  revalidatePath(`/workspace/finance/${type}s/${id}`);
  return { success: true };
}

static async adminRevokeCustomerSignature(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireFinanceSession();
  const entity = FinanceService.financeEntity(type);
  let token: string | null = null;
  let signatureId: string | null = null;

  if (type === "quotation") {
    const doc = await getTenantDb().quotation.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true, token: true, status: true, signedAt: true, signatureId: true },
    });
    if (!doc) throw new Error("Quotation not found");
    if (!doc.signedAt && !doc.signatureId) throw new Error("Tài liệu chưa có chữ ký khách để hủy.");
    token = doc.token;
    signatureId = doc.signatureId;
    await getTenantDb().quotation.update({
      where: { id: doc.id },
      data: { signedAt: null, signatureId: null, status: doc.status === "ACCEPTED" ? "SENT" : doc.status },
    });
  } else if (type === "contract") {
    const doc = await getTenantDb().contract.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true, token: true, status: true, signedAt: true, signatureId: true },
    });
    if (!doc) throw new Error("Contract not found");
    if (!doc.signedAt && !doc.signatureId) throw new Error("Tài liệu chưa có chữ ký khách để hủy.");
    token = doc.token;
    signatureId = doc.signatureId;
    await getTenantDb().contract.update({
      where: { id: doc.id },
      data: { signedAt: null, signatureId: null, status: doc.status === "SIGNED" ? "SENT" : doc.status },
    });
  } else {
    const doc = await getTenantDb().invoice.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true, token: true, status: true, signedAt: true, signatureId: true },
    });
    if (!doc) throw new Error("Invoice not found");
    if (!doc.signedAt && !doc.signatureId) throw new Error("Tài liệu chưa có chữ ký khách để hủy.");
    token = doc.token;
    signatureId = doc.signatureId;
    await getTenantDb().invoice.update({
      where: { id: doc.id },
      data: { signedAt: null, signatureId: null, status: doc.status },
    });
  }

  if (signatureId) {
    await getTenantDb().documentSignature.deleteMany({
      where: {
        id: signatureId,
        organizationId: session.organizationId,
      },
    });
  }

  await getTenantDb().activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.user.id,
      action: "customer_signature_revoked",
      entity: entity.entity,
      entityId: id,
      description: `Hủy chữ ký khách hàng của ${entity.label}`,
    },
  });

  revalidatePath(`/workspace/finance/${type}s`);
  revalidatePath(`/workspace/finance/${type}s/${id}`);
  if (token) {
    revalidatePath(`/document/${token}`);
    revalidatePath(`/document/${token}/print`);
  }
  return { success: true };
}

static async deleteQuotation(id: string) {
  const session = await requireFinanceSession();
  const result = await getTenantDb().quotation.deleteMany({ where: { id, organizationId: session.organizationId } });
  if (!result.count) throw new Error("Quotation not found");
  revalidatePath("/workspace/finance/quotations");
  return { success: true };
}

static async createInvoiceFromContract(contractId: string) {
  return FinanceService.convertContractToInvoice(contractId);
}

static async deleteContract(id: string) {
  const session = await requireFinanceSession();
  const result = await getTenantDb().contract.deleteMany({ where: { id, organizationId: session.organizationId } });
  if (!result.count) throw new Error("Contract not found");
  revalidatePath("/workspace/finance/contracts");
  return { success: true };
}

static async deleteInvoice(id: string) {
  const session = await requireFinanceSession();
  // Clear linked installments first to avoid foreign key constraint errors
  await getTenantDb().paymentInstallment.updateMany({
    where: { invoiceId: id },
    data: { invoiceId: null }
  });
  const result = await getTenantDb().invoice.deleteMany({ where: { id, organizationId: session.organizationId } });
  if (!result.count) throw new Error("Invoice not found");
  revalidatePath("/workspace/finance/invoices");
  return { success: true };
}

static async deletePayment(id: string) {
  const session = await requireFinanceSession();
  const existing = await getTenantDb().payment.findFirst({ where: { id, organizationId: session.organizationId } });
  const result = await getTenantDb().payment.deleteMany({ where: { id, organizationId: session.organizationId } });
  if (!result.count) throw new Error("Payment not found");
  await FinanceService.recalculateInvoicePaymentStatus(existing?.invoiceId);
  revalidatePath("/workspace/finance/payments");
  revalidatePath("/workspace/finance/invoices");
  return { success: true };
}

}

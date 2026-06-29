"use server";

import { db } from "@/lib/db";
import { assertLicensedModule } from "@/lib/modules/guards";

const requireFinanceSession = () => assertLicensedModule("FINANCE");
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { sendFinanceDocumentEmail, sendPaymentEmails } from "@/lib/email/flows";

function financeEntity(type: "quotation" | "contract" | "invoice") {
  if (type === "quotation") return { entity: "Quotation", label: "báo giá" };
  if (type === "contract") return { entity: "Contract", label: "hợp đồng" };
  return { entity: "Invoice", label: "hóa đơn" };
}

// ======================== QUOTATION ========================
export async function createQuotation(data: any) {
  const session = await requireFinanceSession();
  
  const quotation = await db.quotation.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: data.number || `BG-${Date.now()}`,
      title: data.title,
      contact: data.contactId ? { connect: { id: data.contactId } } : undefined,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      deal: data.dealId ? { connect: { id: data.dealId } } : undefined,
      creator: { connect: { id: session.user.id } },
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
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
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

export async function updateQuotation(id: string, data: any) {
  const session = await requireFinanceSession();

  const existing = await db.quotation.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    throw new Error("Quotation not found");
  }

  await db.quotationItem.deleteMany({ where: { quotationId: id } });

  const quotation = await db.quotation.update({
    where: { id },
    data: {
      number: data.number || existing.number,
      title: data.title,
      contact: data.contactId ? { connect: { id: data.contactId } } : { disconnect: true },
      project: data.projectId ? { connect: { id: data.projectId } } : { disconnect: true },
      deal: data.dealId ? { connect: { id: data.dealId } } : { disconnect: true },
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
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
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
export async function createContract(data: any) {
  const session = await requireFinanceSession();
  
  const contract = await db.contract.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: data.number || `HD-${Date.now()}`,
      title: data.title,
      status: data.status || "DRAFT",
      contact: data.contactId ? { connect: { id: data.contactId } } : undefined,
      deal: data.dealId ? { connect: { id: data.dealId } } : undefined,
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
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
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
    await db.quotation.updateMany({
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

export async function updateContract(id: string, data: any) {
  const session = await requireFinanceSession();

  const existing = await db.contract.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) {
    throw new Error("Contract not found");
  }

  // First, delete existing items and installments to replace them
  // This is a simple approach, ideally we should upsert
  await db.contractItem.deleteMany({ where: { contractId: id } });
  await db.paymentInstallment.deleteMany({ where: { contractId: id, invoiceId: null } });

  const contract = await db.contract.update({
    where: { id },
    data: {
      title: data.title,
      status: data.status || existing.status,
      contact: data.contactId ? { connect: { id: data.contactId } } : { disconnect: true },
      deal: data.dealId ? { connect: { id: data.dealId } } : { disconnect: true },
      currency: data.currency || "VND",
      paymentChannels: data.paymentChannels || ["company"],
      subtotal: data.subtotal || 0,
      discount: data.discount || 0,
      discountType: data.discountType || "fixed",
      tax: data.tax || 0,
      total: data.total || 0,
      notes: data.notes || null,
      terms: data.terms || null,
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
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
export async function createInvoiceFromContract(contractId: string) {
  const session = await requireFinanceSession();

  const contract = await db.contract.findFirst({
    where: { id: contractId, organizationId: session.organizationId },
    include: { items: { orderBy: { order: "asc" } } },
  });

  if (!contract) throw new Error("Contract not found");
  if (contract.status !== "SIGNED") throw new Error("Hợp đồng chưa được ký");

  const invoice = await db.invoice.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: `HD-${Date.now()}`,
      title: `Hóa đơn theo hợp đồng ${contract.number}`,
      status: "DRAFT",
      contact: contract.contactId ? { connect: { id: contract.contactId } } : undefined,
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
      items: {
        create: contract.items.map((item) => ({
          name: item.name,
          description: item.description || null,
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

export async function createInvoiceFromQuotation(quotationId: string) {
  const session = await requireFinanceSession();

  const quotation = await db.quotation.findFirst({
    where: { id: quotationId, organizationId: session.organizationId },
    include: {
      items: { orderBy: { order: "asc" } },
      contract: { include: { items: { orderBy: { order: "asc" } } } },
    },
  });

  if (!quotation) throw new Error("Quotation not found");

  if (quotation.contract && quotation.contract.status === "SIGNED") {
    return createInvoiceFromContract(quotation.contract.id);
  }

  if (!["ACCEPTED", "CONVERTED"].includes(quotation.status)) {
    throw new Error("Báo giá chưa được ký duyệt/chấp nhận");
  }

  const invoice = await db.invoice.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: `HD-${Date.now()}`,
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

  await db.quotation.updateMany({
    where: { id: quotation.id, organizationId: session.organizationId },
    data: { invoiceId: invoice.id, convertedAt: new Date(), status: "CONVERTED" },
  });

  revalidatePath("/workspace/finance/invoices");
  revalidatePath(`/workspace/finance/invoices/${invoice.id}`);
  revalidatePath(`/workspace/finance/quotations/${quotation.id}`);
  return { success: true, invoiceId: invoice.id, id: invoice.id };
}

export async function createInvoice(data: any) {
  const session = await requireFinanceSession();

  const total = Number(data.total || 0);
  const amountPaid = Number(data.amountPaid || 0);
  const invoice = await db.invoice.create({
    data: {
      organization: { connect: { id: session.organizationId } },
      token: randomUUID(),
      number: data.number || `HD-${Date.now()}`,
      title: data.title,
      status: data.status || "DRAFT",
      contact: data.contactId ? { connect: { id: data.contactId } } : undefined,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      contract: data.contractId ? { connect: { id: data.contractId } } : undefined,
      creator: { connect: { id: session.user.id } },
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
      issuedAt: data.issuedAt ? new Date(data.issuedAt) : new Date(),
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
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

export async function updateInvoice(id: string, data: any) {
  const session = await requireFinanceSession();

  const existing = await db.invoice.findFirst({
    where: { id, organizationId: session.organizationId },
  });

  if (!existing) throw new Error("Invoice not found");

  await db.invoiceItem.deleteMany({ where: { invoiceId: id } });

  const total = Number(data.total || 0);
  const amountPaid = Number(data.amountPaid ?? existing.amountPaid ?? 0);
  const invoice = await db.invoice.update({
    where: { id },
    data: {
      number: data.number || existing.number,
      title: data.title,
      status: data.status || existing.status,
      contact: data.contactId ? { connect: { id: data.contactId } } : { disconnect: true },
      project: data.projectId ? { connect: { id: data.projectId } } : { disconnect: true },
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
      items: {
        create: data.items?.map((item: any) => ({
          name: item.name,
          description: item.description || null,
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

export async function createInvoiceFromInstallment(installmentId: string) {
  const session = await requireFinanceSession();
  
  const installment = await db.paymentInstallment.findUnique({
    where: { id: installmentId },
    include: { contract: true }
  });

  if (!installment || !installment.contract) throw new Error("Installment not found");

  const contract = installment.contract;

  if (installment.invoiceId) {
    throw new Error("Hóa đơn đã được tạo cho đợt này rồi");
  }

  const invoice = await db.invoice.create({
    data: {
      organizationId: session.organizationId,
      token: randomUUID(),
      number: `INV-${Date.now()}`,
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
          quantity: 1,
          unitPrice: installment.amount,
          total: installment.amount,
          order: 0
        }]
      }
    }
  });

  await db.paymentInstallment.update({
    where: { id: installmentId },
    data: { invoiceId: invoice.id }
  });

  revalidatePath("/workspace/finance/contracts");
  revalidatePath("/workspace/finance/invoices");
  
  return { success: true, invoiceId: invoice.id };
}

// ======================== PAYMENT ========================
export async function recordPayment(invoiceId: string, data: { amount: number, method: any, reference?: string, notes?: string, paidAt: string }) {
  const session = await requireFinanceSession();
  
  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, organizationId: session.organizationId },
    include: { payments: true }
  });

  if (!invoice) throw new Error("Invoice not found");

  const newPayment = await db.payment.create({
    data: {
      organizationId: session.organizationId,
      invoiceId: invoice.id,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
      notes: data.notes,
      paidAt: new Date(data.paidAt)
    }
  });

  // Calculate total paid
  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0) + Number(data.amount);
  const status = totalPaid >= Number(invoice.total) ? 'PAID' : 'PARTIAL';

  await db.invoice.update({
    where: { id: invoice.id },
    data: { status, amountDue: Math.max(0, Number(invoice.total) - totalPaid) }
  });

  // Update payment installment if linked
  const installment = await db.paymentInstallment.findFirst({ where: { invoiceId: invoice.id } });
  if (installment && status === "PAID") {
    await db.paymentInstallment.update({ where: { id: installment.id }, data: { status: "PAID" } });
  }

  await sendPaymentEmails({ organizationId: session.organizationId, paymentId: newPayment.id });

  revalidatePath("/workspace/finance/invoices");
  revalidatePath("/workspace/finance/payments");
  return { success: true, paymentId: newPayment.id };
}

async function recalculateInvoicePaymentStatus(invoiceId?: string | null) {
  if (!invoiceId) return;

  const invoice = await db.invoice.findUnique({
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

  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      status: status as any,
      amountDue,
      paidAt: amountDue <= 0 ? invoice.paidAt || new Date() : invoice.paidAt,
    },
  });

  const installment = await db.paymentInstallment.findFirst({ where: { invoiceId: invoice.id } });
  if (installment) {
    await db.paymentInstallment.update({
      where: { id: installment.id },
      data: { status: amountDue <= 0 ? "PAID" : "PENDING" },
    });
  }
}

export async function createPayment(data: {
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
  const invoice = data.invoiceId
    ? await db.invoice.findFirst({ where: { id: data.invoiceId, organizationId: session.organizationId } })
    : null;

  if (data.invoiceId && !invoice) throw new Error("Invoice not found");

  const payment = await db.payment.create({
    data: {
      organizationId: session.organizationId,
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

  await recalculateInvoicePaymentStatus(invoice?.id);

  revalidatePath("/workspace/finance/payments");
  revalidatePath(`/workspace/finance/payments/${payment.id}`);
  if (invoice?.id) revalidatePath(`/workspace/finance/invoices/${invoice.id}`);
  return { success: true, paymentId: payment.id };
}

export async function updatePayment(id: string, data: {
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
  const existing = await db.payment.findFirst({ where: { id, organizationId: session.organizationId } });
  if (!existing) throw new Error("Payment not found");

  const invoice = data.invoiceId
    ? await db.invoice.findFirst({ where: { id: data.invoiceId, organizationId: session.organizationId } })
    : null;

  if (data.invoiceId && !invoice) throw new Error("Invoice not found");

  const payment = await db.payment.update({
    where: { id },
    data: {
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

  await recalculateInvoicePaymentStatus(existing.invoiceId);
  if (existing.invoiceId !== invoice?.id) await recalculateInvoicePaymentStatus(invoice?.id);

  revalidatePath("/workspace/finance/payments");
  revalidatePath(`/workspace/finance/payments/${payment.id}`);
  if (existing.invoiceId) revalidatePath(`/workspace/finance/invoices/${existing.invoiceId}`);
  if (invoice?.id) revalidatePath(`/workspace/finance/invoices/${invoice.id}`);
  return { success: true, paymentId: payment.id };
}

// ======================== EMAIL ========================
export async function sendDocumentEmail(type: "quotation" | "contract" | "invoice", id: string, email: string) {
  const session = await requireFinanceSession();

  const doc =
    type === "quotation"
      ? await db.quotation.findFirst({ where: { id, organizationId: session.organizationId } })
      : type === "contract"
        ? await db.contract.findFirst({ where: { id, organizationId: session.organizationId } })
        : await db.invoice.findFirst({ where: { id, organizationId: session.organizationId } });

  if (!doc) throw new Error("Document not found");
  if (!doc.token) throw new Error("Token không tồn tại, vui lòng tạo token public trước khi gửi");
  if (!doc.adminSignedAt) throw new Error("Admin cần ký tài liệu trước khi gửi email.");

  const emailResult = await sendFinanceDocumentEmail({
    organizationId: session.organizationId,
    type,
    id,
    to: email,
  });

  if (!emailResult.sent) {
    throw new Error("Khách hàng đã tắt nhận email cho loại tài liệu này trong Portal.");
  }

  const sentAt = new Date();

  // Update sent timestamp and status.
  if (doc.status === "DRAFT") {
    if (type === "quotation") {
      await db.quotation.update({ where: { id }, data: { status: "SENT", sentAt } });
    } else if (type === "contract") {
      await db.contract.update({ where: { id }, data: { status: "SENT", sentAt } });
    } else {
      await db.invoice.update({ where: { id }, data: { status: "SENT", sentAt } });
    }
  } else if (type === "quotation") {
    await db.quotation.update({ where: { id }, data: { sentAt } });
  } else if (type === "contract") {
    await db.contract.update({ where: { id }, data: { sentAt } });
  } else {
    await db.invoice.update({ where: { id }, data: { sentAt } });
  }

  await db.activityLog.create({
    data: {
      organizationId: session.organizationId,
      userId: session.user.id,
      action: "sent",
      entity: financeEntity(type).entity,
      entityId: id,
      description: `Gửi ${financeEntity(type).label} qua email`,
      metadata: { email },
    },
  });

  revalidatePath(`/workspace/finance/${type}s`);
  revalidatePath(`/workspace/finance/${type}s/${id}`);
  return { success: true, message: "Email đã được gửi thành công!" };
}

export async function updateQuotationStatus(id: string, status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED") {
  const session = await requireFinanceSession();
  const result = await db.quotation.updateMany({
    where: { id, organizationId: session.organizationId },
    data: { status }
  });
  if (!result.count) throw new Error("Quotation not found");
  revalidatePath("/workspace/finance/quotations");
  revalidatePath(`/workspace/finance/quotations/${id}`);
  return { success: true };
}

export async function updateContractStatus(id: string, status: "DRAFT" | "SENT" | "SIGNED" | "EXPIRED" | "CANCELLED") {
  const session = await requireFinanceSession();
  const result = await db.contract.updateMany({
    where: { id, organizationId: session.organizationId },
    data: { status }
  });
  if (!result.count) throw new Error("Contract not found");
  revalidatePath("/workspace/finance/contracts");
  revalidatePath(`/workspace/finance/contracts/${id}`);
  return { success: true };
}

export async function adminSignDocument(type: "quotation" | "contract" | "invoice", id: string, signatureData: string) {
  const session = await requireFinanceSession();
  const entity = financeEntity(type);

  const recordAdminSignature = () =>
    db.documentSignature.create({
      data: {
        organizationId: session.organizationId,
        signerName: session.user.name || "Admin",
        signerEmail: session.user.email,
        signatureData,
      },
    });

  const signedAt = new Date();

  if (type === "quotation") {
    const result = await db.quotation.updateMany({
      where: { id, organizationId: session.organizationId },
      data: { adminSignedAt: signedAt, status: "ACCEPTED" },
    });
    if (!result.count) throw new Error("Quotation not found");
    await recordAdminSignature();
  } else if (type === "contract") {
    const result = await db.contract.updateMany({
      where: { id, organizationId: session.organizationId },
      data: { adminSignedAt: signedAt, status: "SIGNED" },
    });
    if (!result.count) throw new Error("Contract not found");
    await recordAdminSignature();
  } else {
    const doc = await db.invoice.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true, status: true },
    });
    if (!doc) throw new Error("Invoice not found");
    await db.invoice.update({
      where: { id: doc.id },
      data: { adminSignedAt: signedAt, status: doc.status },
    });
    await recordAdminSignature();
  }

  await db.activityLog.create({
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

export async function adminRevokeSignature(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireFinanceSession();
  const entity = financeEntity(type);

  if (type === "quotation") {
    const doc = await db.quotation.findFirst({ where: { id, organizationId: session.organizationId }, select: { id: true, status: true } });
    if (!doc) throw new Error("Quotation not found");
    await db.quotation.update({
      where: { id: doc.id },
      data: { adminSignedAt: null, status: doc.status === "ACCEPTED" ? "SENT" : doc.status },
    });
  } else if (type === "contract") {
    const doc = await db.contract.findFirst({ where: { id, organizationId: session.organizationId }, select: { id: true, status: true } });
    if (!doc) throw new Error("Contract not found");
    await db.contract.update({
      where: { id: doc.id },
      data: { adminSignedAt: null, status: doc.status === "SIGNED" ? "SENT" : doc.status },
    });
  } else {
    const doc = await db.invoice.findFirst({ where: { id, organizationId: session.organizationId }, select: { id: true, status: true } });
    if (!doc) throw new Error("Invoice not found");
    await db.invoice.update({
      where: { id: doc.id },
      data: { adminSignedAt: null, status: doc.status },
    });
  }

  await db.activityLog.create({
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

export async function adminRevokeCustomerSignature(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireFinanceSession();
  const entity = financeEntity(type);
  let token: string | null = null;
  let signatureId: string | null = null;

  if (type === "quotation") {
    const doc = await db.quotation.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true, token: true, status: true, signedAt: true, signatureId: true },
    });
    if (!doc) throw new Error("Quotation not found");
    if (!doc.signedAt && !doc.signatureId) throw new Error("Tài liệu chưa có chữ ký khách để hủy.");
    token = doc.token;
    signatureId = doc.signatureId;
    await db.quotation.update({
      where: { id: doc.id },
      data: { signedAt: null, signatureId: null, status: doc.status === "ACCEPTED" ? "SENT" : doc.status },
    });
  } else if (type === "contract") {
    const doc = await db.contract.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true, token: true, status: true, signedAt: true, signatureId: true },
    });
    if (!doc) throw new Error("Contract not found");
    if (!doc.signedAt && !doc.signatureId) throw new Error("Tài liệu chưa có chữ ký khách để hủy.");
    token = doc.token;
    signatureId = doc.signatureId;
    await db.contract.update({
      where: { id: doc.id },
      data: { signedAt: null, signatureId: null, status: doc.status === "SIGNED" ? "SENT" : doc.status },
    });
  } else {
    const doc = await db.invoice.findFirst({
      where: { id, organizationId: session.organizationId },
      select: { id: true, token: true, status: true, signedAt: true, signatureId: true },
    });
    if (!doc) throw new Error("Invoice not found");
    if (!doc.signedAt && !doc.signatureId) throw new Error("Tài liệu chưa có chữ ký khách để hủy.");
    token = doc.token;
    signatureId = doc.signatureId;
    await db.invoice.update({
      where: { id: doc.id },
      data: { signedAt: null, signatureId: null, status: doc.status },
    });
  }

  if (signatureId) {
    await db.documentSignature.deleteMany({
      where: {
        id: signatureId,
        organizationId: session.organizationId,
      },
    });
  }

  await db.activityLog.create({
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

export async function deleteQuotation(id: string) {
  const session = await requireFinanceSession();
  const result = await db.quotation.deleteMany({ where: { id, organizationId: session.organizationId } });
  if (!result.count) throw new Error("Quotation not found");
  revalidatePath("/workspace/finance/quotations");
  return { success: true };
}

export async function deleteContract(id: string) {
  const session = await requireFinanceSession();
  const result = await db.contract.deleteMany({ where: { id, organizationId: session.organizationId } });
  if (!result.count) throw new Error("Contract not found");
  revalidatePath("/workspace/finance/contracts");
  return { success: true };
}

export async function deleteInvoice(id: string) {
  const session = await requireFinanceSession();
  // Clear linked installments first to avoid foreign key constraint errors
  await db.paymentInstallment.updateMany({
    where: { invoiceId: id },
    data: { invoiceId: null }
  });
  const result = await db.invoice.deleteMany({ where: { id, organizationId: session.organizationId } });
  if (!result.count) throw new Error("Invoice not found");
  revalidatePath("/workspace/finance/invoices");
  return { success: true };
}

export async function deletePayment(id: string) {
  const session = await requireFinanceSession();
  const existing = await db.payment.findFirst({ where: { id, organizationId: session.organizationId } });
  const result = await db.payment.deleteMany({ where: { id, organizationId: session.organizationId } });
  if (!result.count) throw new Error("Payment not found");
  await recalculateInvoicePaymentStatus(existing?.invoiceId);
  revalidatePath("/workspace/finance/payments");
  revalidatePath("/workspace/finance/invoices");
  return { success: true };
}

"use server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";
import { sendSignedDocumentEmails } from "@/lib/email/flows";

function toClientData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

/**
 * Lấy danh sách Báo giá
 */
export async function getQuotations() {
  const session = await requireAuth();
  
  const quotations = await db.quotation.findMany({
    where: { organizationId: session.organizationId },
    include: {
      contact: { include: { company: true } },
      deal: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return toClientData(quotations);
}

/**
 * Lấy danh sách Hợp đồng
 */
export async function getContracts() {
  const session = await requireAuth();
  
  const contracts = await db.contract.findMany({
    where: { organizationId: session.organizationId },
    include: {
      contact: { include: { company: true } },
      deal: true,
      paymentInstallments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return toClientData(contracts);
}

/**
 * Lấy danh sách Hóa đơn
 */
export async function getInvoices() {
  const session = await requireAuth();
  
  const invoices = await db.invoice.findMany({
    where: { organizationId: session.organizationId },
    include: {
      contact: { include: { company: true } },
      project: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return toClientData(invoices);
}

/**
 * Admin duyệt tài liệu (Quotation / Contract / Invoice)
 */
export async function adminApproveDocument(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireAuth();

  const data = {
    adminSignedAt: new Date(),
    status: "SENT" as any, // Cập nhật trạng thái thành SENT để sẵn sàng gửi
  };

  if (type === "quotation") {
    const result = await db.quotation.updateMany({ where: { id, organizationId: session.organizationId }, data });
    if (!result.count) throw new Error("Quotation not found");
  } else if (type === "contract") {
    const result = await db.contract.updateMany({ where: { id, organizationId: session.organizationId }, data });
    if (!result.count) throw new Error("Contract not found");
  } else if (type === "invoice") {
    const result = await db.invoice.updateMany({ where: { id, organizationId: session.organizationId }, data });
    if (!result.count) throw new Error("Invoice not found");
  }

  revalidatePath(`/workspace/finance/${type}s`);
  return { success: true };
}

/**
 * Tạo token public cho tài liệu nếu chưa có
 */
export async function generateDocumentToken(type: "quotation" | "contract" | "invoice", id: string) {
  const session = await requireAuth();
  
  // Logic kiểm tra và sinh token ngẫu nhiên
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const updateData = { token };

  if (type === "quotation") {
    await db.quotation.updateMany({ where: { id, organizationId: session.organizationId, token: null }, data: updateData }).catch(() => {});
  } else if (type === "contract") {
    await db.contract.updateMany({ where: { id, organizationId: session.organizationId, token: null }, data: updateData }).catch(() => {});
  } else if (type === "invoice") {
    await db.invoice.updateMany({ where: { id, organizationId: session.organizationId, token: null }, data: updateData }).catch(() => {});
  }
  
  return { success: true };
}

/**
 * Convert Quotation -> Contract
 */
export async function convertQuotationToContract(quotationId: string) {
  const session = await requireAuth();
  
  const quotation = await db.quotation.findUnique({
    where: { id: quotationId, organizationId: session.organizationId },
    include: { items: true }
  });

  if (!quotation || quotation.status !== "ACCEPTED") {
    throw new Error("Báo giá chưa được khách hàng chấp nhận");
  }

  const contract = await db.contract.create({
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
  await db.quotation.update({
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
export async function convertQuotationToInvoice(quotationId: string) {
  const session = await requireAuth();
  
  const quotation = await db.quotation.findUnique({
    where: { id: quotationId, organizationId: session.organizationId },
    include: { items: true }
  });

  if (!quotation || quotation.status !== "ACCEPTED") {
    throw new Error("Báo giá chưa được khách hàng chấp nhận");
  }

  const invoice = await db.invoice.create({
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

  await db.quotation.update({
    where: { id: quotation.id },
    data: { invoiceId: invoice.id, convertedAt: new Date(), status: "CONVERTED" }
  });

  revalidatePath("/workspace/finance/invoices");
  revalidatePath("/workspace/finance/quotations");

  return { success: true, invoiceId: invoice.id };
}

/**
 * Convert Contract -> Invoice
 */
export async function convertContractToInvoice(contractId: string) {
  const session = await requireAuth();
  
  const contract = await db.contract.findUnique({
    where: { id: contractId, organizationId: session.organizationId },
    include: { items: true }
  });

  if (!contract || contract.status !== "SIGNED") {
    throw new Error("Hợp đồng chưa được khách hàng ký");
  }

  const invoice = await db.invoice.create({
    data: {
      organizationId: session.organizationId,
      number: `INV-${Date.now()}`,
      title: `Hóa đơn Hợp đồng: ${contract.number}`,
      contactId: contract.contactId,
      contractId: contract.id,
      creatorId: session.user.id,
      currency: contract.currency,
      subtotal: contract.total, // For simplicity
      total: contract.total,
      amountDue: contract.total,
      items: {
        create: contract.items.map(item => ({
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

  revalidatePath("/workspace/finance/invoices");
  revalidatePath("/workspace/finance/contracts");

  return { success: true, invoiceId: invoice.id };
}

/**
 * Khách hàng ký duyệt tài liệu (Public)
 */
export async function signDocument(token: string, type: "quotation" | "contract" | "invoice", signatureData: string, ip: string, userAgent: string) {
  const includeData = type === "contract" ? { paymentInstallments: true } : undefined;

  const doc = await (db as any)[type].findUnique({
    where: { token },
    include: includeData
  });

  if (!doc) throw new Error("Document not found");

  const signature = await db.documentSignature.create({
    data: {
      organizationId: doc.organizationId,
      signerName: "Khách hàng", // Should be captured from input
      signatureData,
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
  
  await (db as any)[type].update({
    where: { id: doc.id },
    data: updateData
  });

  await sendSignedDocumentEmails({
    organizationId: doc.organizationId,
    type,
    id: doc.id,
  });

  if (type === "contract" && doc.paymentInstallments && doc.paymentInstallments.length > 0) {
    for (const [index, installment] of doc.paymentInstallments.entries()) {
      const invoiceToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const invoice = await db.invoice.create({
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
                quantity: 1,
                unitPrice: installment.amount,
                total: installment.amount,
                order: 1
              }
            ]
          }
        }
      });
      
      await db.paymentInstallment.update({
        where: { id: installment.id },
        data: { invoiceId: invoice.id }
      });
    }
  }

  return { success: true };
}

export async function getPayments() {
  const session = await requireAuth();

  const payments = await db.payment.findMany({
    where: { organizationId: session.organizationId },
    include: {
      invoice: {
        include: { contact: { include: { company: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return toClientData(payments);
}

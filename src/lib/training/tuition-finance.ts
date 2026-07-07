import { ContactStatus, ContactType, InvoiceStatus } from "@prisma/client";
import { randomUUID } from "crypto";

import { db } from "@/lib/db";

type TuitionFinanceSession = {
  organizationId: string;
  userId: string;
};

export function legacyTuitionInvoiceNumber(enrollmentId: string) {
  return `HP-${enrollmentId.slice(-8).toUpperCase()}`;
}

export function legacySequentialTuitionInvoiceNumber(sequence: number) {
  return `HP-${String(sequence).padStart(6, "0")}`;
}

export function tuitionInvoicePeriod(date = new Date()) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}${date.getFullYear()}`;
}

export function formatTuitionInvoiceNumber(period: string, sequence: number) {
  return `HP-${period}${String(sequence).padStart(2, "0")}`;
}

async function nextTuitionInvoiceNumber(organizationId: string, date = new Date()) {
  const period = tuitionInvoicePeriod(date);
  const invoices = await db.invoice.findMany({
    where: {
      organizationId,
      number: { startsWith: `HP-${period}` },
    },
    select: { number: true },
  });

  const maxSequence = invoices.reduce((max, invoice) => {
    const match = new RegExp(`^HP-${period}(\\d{2})$`).exec(invoice.number);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return formatTuitionInvoiceNumber(period, maxSequence + 1);
}

export async function syncTuitionInvoiceForSession(enrollmentId: string, session: TuitionFinanceSession) {
  const enrollment = await db.enrollment.findFirst({
    where: { id: enrollmentId, course: { organizationId: session.organizationId } },
    include: { course: true, student: true, class: true },
  });

  if (!enrollment) return { success: false, error: "Không tìm thấy học phí" };

  const legacyNumber = legacyTuitionInvoiceNumber(enrollment.id);
  const issuedAt = new Date();
  const total = Number(enrollment.tuitionFee);
  const amountPaid = Number(enrollment.paidAmount);
  const amountDue = Math.max(0, total - amountPaid);
  const status = amountDue <= 0 && total > 0
    ? InvoiceStatus.PAID
    : amountPaid > 0
      ? InvoiceStatus.PARTIAL
      : InvoiceStatus.SENT;

  let contact = enrollment.student.email
    ? await db.contact.findFirst({
        where: { email: enrollment.student.email, organizationId: session.organizationId },
      })
    : null;

  if (!contact) {
    contact = await db.contact.create({
      data: {
        organizationId: session.organizationId,
        firstName: enrollment.student.name,
        lastName: "",
        email: enrollment.student.email,
        phone: enrollment.student.phone || "",
        type: ContactType.CUSTOMER,
        status: ContactStatus.ACTIVE,
        source: "TRAINING_MODULE",
      },
    });
  }

  const itemName = `Học phí: ${enrollment.course.title}`;
  const itemDescription = enrollment.class ? `Lớp: ${enrollment.class.name}` : "Đăng ký khóa học";

  let invoice = await db.invoice.findFirst({
    where: {
      organizationId: session.organizationId,
      OR: [
        { number: legacyNumber },
        {
          number: { startsWith: "HP-" },
          title: itemName,
          contactId: contact.id,
        },
      ],
    },
  });

  const number = invoice?.number && /^HP-\d{8}$/.test(invoice.number)
      ? invoice.number
      : await nextTuitionInvoiceNumber(session.organizationId, issuedAt);

  if (invoice) {
    invoice = await db.invoice.update({
      where: { id: invoice.id },
      data: {
        number,
        title: itemName,
        status,
        contactId: contact.id,
        currency: enrollment.course.currency || "VND",
        subtotal: total,
        total,
        amountPaid,
        amountDue,
        dueDate: enrollment.startedAt || new Date(),
        notes: enrollment.paymentNote || null,
      },
    });
  } else {
    invoice = await db.invoice.create({
      data: {
      organizationId: session.organizationId,
      token: randomUUID(),
      number,
      title: itemName,
      status,
      contactId: contact.id,
      creatorId: session.userId,
      currency: enrollment.course.currency || "VND",
      paymentChannels: ["company"],
      subtotal: total,
      total,
      amountPaid,
      amountDue,
      issuedAt: new Date(),
      dueDate: enrollment.startedAt || new Date(),
      notes: enrollment.paymentNote || null,
      items: {
        create: [{
          name: itemName,
          description: itemDescription,
          quantity: 1,
          unitPrice: total,
          total,
        }],
      },
      },
    });
  }

  const existingItem = await db.invoiceItem.findFirst({
    where: { invoiceId: invoice.id },
    orderBy: { createdAt: "asc" },
  });

  if (existingItem) {
    await db.invoiceItem.update({
      where: { id: existingItem.id },
      data: {
        name: itemName,
        description: itemDescription,
        quantity: 1,
        unitPrice: total,
        total,
      },
    });
  } else {
    await db.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        name: itemName,
        description: itemDescription,
        quantity: 1,
        unitPrice: total,
        total,
      },
    });
  }

  return { success: true, invoiceId: invoice.id, invoiceToken: invoice.token, invoiceNumber: invoice.number };
}

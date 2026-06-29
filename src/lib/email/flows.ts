import { db } from "@/lib/db";
import {
  formatMailDate,
  formatVnd,
  renderEmailTemplate,
  sendEmail,
  sendMailOnce,
} from "@/lib/email/service";

type DocumentType = "quotation" | "contract" | "invoice";

type ContactLike = {
  firstName: string;
  lastName: string;
  email?: string | null;
  company?: { name: string } | null;
  customFields?: unknown;
} | null;

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

function contactName(contact: ContactLike) {
  if (!contact) return "Quý khách";
  const name = `${contact.firstName} ${contact.lastName}`.trim();
  return name || contact.company?.name || contact.email || "Quý khách";
}

function documentLink(token?: string | null) {
  return token ? `${appUrl()}/document/${token}` : `${appUrl()}/workspace/dashboard`;
}

function receiptLink(paymentId?: string) {
  return paymentId ? `${appUrl()}/document/payment/${paymentId}` : `${appUrl()}/workspace/finance/payments`;
}

function documentTitle(doc: { number: string; title?: string | null }) {
  return doc.title || doc.number;
}

function canReceiveEmail(contact: ContactLike, key: "account" | "quotation" | "contract" | "invoice" | "payment" | "marketing") {
  if (!contact?.customFields || typeof contact.customFields !== "object" || Array.isArray(contact.customFields)) {
    return true;
  }

  const customFields = contact.customFields as { portalEmailPreferences?: Record<string, boolean> };
  const preferences = customFields.portalEmailPreferences;
  if (!preferences || typeof preferences !== "object") return true;
  return preferences[key] !== false;
}

export async function canRecipientReceiveEmail(input: {
  organizationId: string;
  email: string;
  key: "account" | "quotation" | "contract" | "invoice" | "payment" | "marketing";
}) {
  const contact = await db.contact.findFirst({
    where: { organizationId: input.organizationId, email: input.email },
    select: { customFields: true, firstName: true, lastName: true, email: true },
  });

  return canReceiveEmail(contact, input.key);
}

async function internalRecipients(organizationId: string, preferred?: Array<string | null | undefined>) {
  const members = await db.organizationMember.findMany({
    where: { organizationId, role: { in: ["OWNER", "ADMIN"] } },
    include: { user: true },
    take: 10,
  });

  return Array.from(
    new Set([
      ...(preferred ?? []),
      ...members.map((member) => member.user.email),
      process.env.RESEND_FROM_EMAIL,
    ].filter(Boolean) as string[])
  );
}

export async function sendPortalAccountEmail(input: {
  organizationId: string;
  recipientEmail: string;
  recipientName: string;
  loginPassword: string;
  portalRole?: string;
  operatorName?: string | null;
  operatorEmail?: string | null;
  relatedType?: string;
  relatedId?: string;
  sendRecipient?: boolean;
}) {
  let recipientSent = false;
  const portalLink = `${appUrl()}/login`;
  const variables = {
    customer_name: input.recipientName,
    company_name: input.recipientName,
    portal_role: input.portalRole || "Khách hàng",
    portal_link: portalLink,
    login_email: input.recipientEmail,
    login_password: input.loginPassword,
    recipient_email_status: input.sendRecipient === false ? "Không gửi email cho người nhận" : "Đã gửi email cho người nhận",
    operator_name: input.operatorName || "Hệ thống",
    operator_email: input.operatorEmail || "",
    action_url: portalLink,
    action_label: "Đăng nhập Portal",
  };

  if (input.sendRecipient !== false && await canRecipientReceiveEmail({
    organizationId: input.organizationId,
    email: input.recipientEmail,
    key: "account",
  })) {
    const rendered = await renderEmailTemplate({
      organizationId: input.organizationId,
      code: "CUSTOMER_ACCOUNT_CREATED",
      variables,
      fallbackSubject: "Tài khoản Đăng nhập Portal của Quý khách",
      fallbackBody:
        "Xin chào <strong>{{customer_name}}</strong>,<br><br>Tài khoản Portal đã được tạo.<br>Email đăng nhập: <strong>{{login_email}}</strong><br>Mật khẩu: <strong>{{login_password}}</strong><br><br><a href=\"{{portal_link}}\">Đăng nhập Portal</a>",
    });

    await sendMailOnce(
      `portal-recipient:${input.relatedType || "user"}:${input.relatedId || input.recipientEmail}:${input.recipientEmail}`,
      20,
      () =>
        sendEmail({
          organizationId: input.organizationId,
          to: input.recipientEmail,
          subject: rendered.subject,
          html: rendered.html,
          templateCode: rendered.code,
          relatedType: input.relatedType || "User",
          relatedId: input.relatedId,
          metadata: { flow: "portal_account", portalRole: input.portalRole },
        })
    );
    recipientSent = true;
  }

  const staffTo = await internalRecipients(input.organizationId, [input.operatorEmail]);
  if (staffTo.length) {
    const renderedStaff = await renderEmailTemplate({
      organizationId: input.organizationId,
      code: "PORTAL_ACCOUNT_CREATED_STAFF",
      variables,
      fallbackSubject: "Portal - Đã cấp tài khoản cho {{customer_name}}",
      fallbackBody:
        "Đã cấp tài khoản Portal cho <strong>{{customer_name}}</strong>.<br>Email: {{login_email}}<br>Trạng thái: {{recipient_email_status}}<br>Người thao tác: {{operator_name}}",
    });

    await sendMailOnce(
      `portal-internal:${input.relatedId || input.recipientEmail}:${renderedStaff.subject}`,
      20,
      () =>
        sendEmail({
          organizationId: input.organizationId,
          to: staffTo,
          subject: renderedStaff.subject,
          html: renderedStaff.html,
          templateCode: renderedStaff.code,
          relatedType: input.relatedType || "User",
          relatedId: input.relatedId,
          metadata: { flow: "portal_account_staff", portalRole: input.portalRole },
      })
    );
  }

  return { recipientSent };
}

export async function sendPortalPasswordChangedEmail(input: {
  organizationId: string;
  userId: string;
  recipientEmail: string;
  recipientName: string;
}) {
  const allowed = await canRecipientReceiveEmail({
    organizationId: input.organizationId,
    email: input.recipientEmail,
    key: "account",
  });

  if (!allowed) {
    return { sent: false, skipped: "customer_email_preference" };
  }

  const loginLink = `${appUrl()}/login`;
  const rendered = await renderEmailTemplate({
    organizationId: input.organizationId,
    code: "CUSTOMER_PASSWORD_CHANGED",
    variables: {
      customer_name: input.recipientName,
      login_email: input.recipientEmail,
      portal_link: loginLink,
      action_url: loginLink,
      action_label: "Đăng nhập Portal",
      changed_at: formatMailDate(new Date()),
    },
    fallbackSubject: "Mật khẩu Portal của Quý khách đã được thay đổi",
    fallbackBody:
      "Xin chào <strong>{{customer_name}}</strong>,<br><br>Mật khẩu Portal của Quý khách vừa được thay đổi thành công vào {{changed_at}}.<br>Nếu đây không phải thao tác của Quý khách, vui lòng liên hệ Ong Vàng ngay.<br><br><a href=\"{{portal_link}}\">Đăng nhập Portal</a>",
  });

  await sendEmail({
    organizationId: input.organizationId,
    to: input.recipientEmail,
    subject: rendered.subject,
    html: rendered.html,
    templateCode: rendered.code,
    relatedType: "User",
    relatedId: input.userId,
    metadata: { flow: "portal_password_changed" },
  });

  return { sent: true };
}

export async function sendFinanceDocumentEmail(input: {
  organizationId: string;
  type: DocumentType;
  id: string;
  to?: string;
}) {
  const include = { contact: { include: { company: true } } };
  const doc =
    input.type === "quotation"
      ? await db.quotation.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
      : input.type === "contract"
        ? await db.contract.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
        : await db.invoice.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include });

  if (!doc) throw new Error("Document not found");
  if (!doc.token) throw new Error("Token không tồn tại, vui lòng tạo token public trước khi gửi");

  const to = input.to || doc.contact?.email;
  if (!to) throw new Error("Tài liệu chưa có email người nhận");

  const name = contactName(doc.contact);
  const companyName = doc.contact?.company?.name || name;
  const link = documentLink(doc.token);
  const templateCode =
    input.type === "quotation"
      ? "QUOTATION_SIGN_REQUEST_SENT"
      : input.type === "contract"
        ? "CONTRACT_SIGN_REQUEST_SENT"
        : "INVOICE_SIGN_REQUEST_SENT";
  const documentLabel = input.type === "quotation" ? "Báo giá" : input.type === "contract" ? "Hợp đồng" : "Hóa đơn";
  const total = "total" in doc ? doc.total : 0;
  const variables = {
    customer_name: name,
    company_name: companyName,
    document_label: documentLabel,
    document_code: doc.number,
    document_date: formatMailDate(doc.createdAt),
    document_status: doc.status,
    document_total: formatVnd(total),
    quotation_number: doc.number,
    quotation_total: formatVnd(total),
    quotation_link: link,
    contract_subject: documentTitle(doc),
    contract_value: formatVnd(total),
    contract_link: link,
    invoice_number: doc.number,
    invoice_total: formatVnd(total),
    invoice_duedate: "dueDate" in doc ? formatMailDate(doc.dueDate) : "---",
    invoice_link: link,
    action_url: link,
    action_label: `Xem và ký ${documentLabel.toLowerCase()}`,
  };

  if (!canReceiveEmail(doc.contact, input.type)) {
    return { sent: false, skipped: "customer_email_preference" };
  }

  const rendered = await renderEmailTemplate({
    organizationId: input.organizationId,
    code: templateCode,
    variables,
    fallbackSubject: `Vui lòng xác nhận ${documentLabel} ${doc.number}`,
    fallbackBody:
      "Xin chào <strong>{{customer_name}}</strong>,<br><br>Vui lòng xem và xác nhận tài liệu tại liên kết sau:<br><a href=\"{{action_url}}\">{{action_url}}</a>",
  });

  await sendMailOnce(`${input.type}:${doc.id}:${to}:send-customer`, 20, () =>
    sendEmail({
      organizationId: input.organizationId,
      to,
      subject: rendered.subject,
      html: rendered.html,
      templateCode: rendered.code,
      relatedType: input.type,
      relatedId: doc.id,
      metadata: { flow: "finance_document", documentType: input.type },
    })
  );

  return { sent: true };
}

export async function sendSignedDocumentEmails(input: {
  organizationId: string;
  type: Extract<DocumentType, "quotation" | "contract" | "invoice">;
  id: string;
}) {
  const include = { contact: { include: { company: true } } };
  const doc =
    input.type === "quotation"
      ? await db.quotation.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
      : input.type === "contract"
        ? await db.contract.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
        : await db.invoice.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include });

  if (!doc) return;
  const link = documentLink(doc.token);
  const name = contactName(doc.contact);
  const companyName = doc.contact?.company?.name || name;
  const total = "total" in doc ? doc.total : 0;
  const baseVars = {
    customer_name: name,
    company_name: companyName,
    document_date: formatMailDate(new Date()),
    document_status: doc.status,
    quotation_number: doc.number,
    quotation_total: formatVnd(total),
    quotation_link: link,
    contract_subject: documentTitle(doc),
    contract_value: formatVnd(total),
    contract_link: link,
    invoice_number: doc.number,
    invoice_total: formatVnd(total),
    invoice_duedate: "dueDate" in doc ? formatMailDate(doc.dueDate) : "---",
    invoice_link: link,
    action_url: link,
  };

  const customerCode =
    input.type === "quotation"
      ? "QUOTATION_ACCEPTED_CUSTOMER"
      : input.type === "contract"
        ? "CONTRACT_SIGNED_CUSTOMER"
        : "INVOICE_SIGNED_CUSTOMER";
  const staffCode =
    input.type === "quotation"
      ? "QUOTATION_ACCEPTED_STAFF"
      : input.type === "contract"
        ? "CONTRACT_SIGNED_STAFF"
        : "INVOICE_SIGNED_STAFF";

  if (doc.contact?.email && canReceiveEmail(doc.contact, input.type)) {
    const renderedCustomer = await renderEmailTemplate({
      organizationId: input.organizationId,
      code: customerCode,
      variables: baseVars,
      fallbackSubject: `Xác nhận ${doc.number} đã được ký`,
      fallbackBody: "Cảm ơn Quý khách đã xác nhận tài liệu <strong>{{document_code}}</strong>.",
    });
    await sendEmail({
      organizationId: input.organizationId,
      to: doc.contact.email,
      subject: renderedCustomer.subject,
      html: renderedCustomer.html,
      templateCode: renderedCustomer.code,
      relatedType: input.type,
      relatedId: doc.id,
      metadata: { flow: "finance_signed_customer", documentType: input.type },
    });
  }

  const staffTo = await internalRecipients(input.organizationId);
  if (staffTo.length) {
    const renderedStaff = await renderEmailTemplate({
      organizationId: input.organizationId,
      code: staffCode,
      variables: baseVars,
      fallbackSubject: `[Nội bộ] ${doc.number} đã được khách xác nhận`,
      fallbackBody: "Khách hàng <strong>{{customer_name}}</strong> đã xác nhận tài liệu.",
    });
    await sendEmail({
      organizationId: input.organizationId,
      to: staffTo,
      subject: renderedStaff.subject,
      html: renderedStaff.html,
      templateCode: renderedStaff.code,
      relatedType: input.type,
      relatedId: doc.id,
      metadata: { flow: "finance_signed_staff", documentType: input.type },
    });
  }
}

export async function sendPaymentEmails(input: { organizationId: string; paymentId: string }) {
  const payment = await db.payment.findFirst({
    where: { id: input.paymentId, organizationId: input.organizationId },
    include: { invoice: { include: { contact: { include: { company: true } } } } },
  });
  if (!payment?.invoice) return;

  const contact = payment.invoice.contact;
  const name = contactName(contact);
  const companyName = contact?.company?.name || name;
  const variables = {
    customer_name: name,
    company_name: companyName,
    payment_amount: formatVnd(payment.amount),
    payment_date: formatMailDate(payment.paidAt || payment.createdAt),
    payment_transaction_id: payment.reference || payment.id,
    invoice_number: payment.invoice.number,
    invoice_total: formatVnd(payment.invoice.total),
    receipt_link: receiptLink(payment.id),
    action_url: receiptLink(payment.id),
    action_label: "Xem phiếu thu",
  };

  if (contact?.email && canReceiveEmail(contact, "payment")) {
    const renderedCustomer = await renderEmailTemplate({
      organizationId: input.organizationId,
      code: "INVOICE_PAID_CUSTOMER",
      variables,
      fallbackSubject: "Xác nhận Thanh toán Hóa đơn {{invoice_number}}",
      fallbackBody: "Cảm ơn Quý khách đã thanh toán <strong>{{payment_amount}}</strong> cho hóa đơn {{invoice_number}}.",
    });
    await sendMailOnce(`payment:${payment.id}:${contact.email}:customer`, 20, () =>
      sendEmail({
        organizationId: input.organizationId,
        to: contact.email!,
        subject: renderedCustomer.subject,
        html: renderedCustomer.html,
        templateCode: renderedCustomer.code,
        relatedType: "payment",
        relatedId: payment.id,
        metadata: { flow: "payment_customer" },
      })
    );
  }

  const staffTo = await internalRecipients(input.organizationId);
  if (staffTo.length) {
    const renderedStaff = await renderEmailTemplate({
      organizationId: input.organizationId,
      code: "INVOICE_PAID_STAFF",
      variables,
      fallbackSubject: "[Nội bộ] Báo có tiền - Hóa đơn {{invoice_number}}",
      fallbackBody: "Khách hàng <strong>{{customer_name}}</strong> đã thanh toán {{payment_amount}}.",
    });
    await sendMailOnce(`payment:${payment.id}:staff`, 20, () =>
      sendEmail({
        organizationId: input.organizationId,
        to: staffTo,
        subject: renderedStaff.subject,
        html: renderedStaff.html,
        templateCode: renderedStaff.code,
        relatedType: "payment",
        relatedId: payment.id,
        metadata: { flow: "payment_staff" },
      })
    );
  }
}

import { getTenantDb } from "@/lib/db";
import {
  formatMailDate,
  formatVnd,
  renderEmailTemplate,
  sendEmail,
  sendMailOnce,
} from "@/lib/email/service";
import { getOrganizationPublicBaseUrl } from "@/lib/workspace-domain";

type DocumentType = "quotation" | "contract" | "invoice";

type ContactLike = {
  firstName: string;
  lastName: string;
  email?: string | null;
  company?: { name: string } | null;
  customFields?: unknown;
} | null;

function contactName(contact: ContactLike) {
  if (!contact) return "Quý khách";
  const name = `${contact.firstName} ${contact.lastName}`.trim();
  return name || contact.company?.name || contact.email || "Quý khách";
}

async function documentLink(organizationId: string, token?: string | null, publicBaseUrl?: string) {
  const baseUrl = publicBaseUrl || await getOrganizationPublicBaseUrl(organizationId, "portal");
  return token ? `${baseUrl}/document/${token}` : `${baseUrl}/workspace`;
}

async function documentPdfAttachment(organizationId: string, token?: string | null, filename = "tai-lieu-da-ky.pdf") {
  if (!token) return undefined;
  const link = await documentLink(organizationId, token);
  try {
    const response = await fetch(`${link}/pdf`, { cache: "no-store" });
    if (!response.ok) {
      console.error(`Không thể tạo PDF đính kèm ${filename} (${response.status}).`);
      return undefined;
    }

    return {
      filename,
      content: Buffer.from(await response.arrayBuffer()),
      contentType: "application/pdf",
    };
  } catch (error) {
    console.error(`Không thể tạo PDF đính kèm ${filename}.`, error);
    return undefined;
  }
}

async function documentPdfAttachmentFromLink(link: string, filename = "tai-lieu-da-ky.pdf") {
  try {
    const response = await fetch(`${link}/pdf`, { cache: "no-store" });
    if (!response.ok) {
      console.error(`Không thể tạo PDF đính kèm ${filename} (${response.status}).`);
      return undefined;
    }

    return {
      filename,
      content: Buffer.from(await response.arrayBuffer()),
      contentType: "application/pdf",
    };
  } catch (error) {
    console.error(`Không thể tạo PDF đính kèm ${filename}.`, error);
    return undefined;
  }
}

async function paymentReceiptPdfAttachment(input: {
  organizationId: string;
  paymentId: string;
  filename?: string;
  cookieHeader?: string;
}) {
  const baseUrl = await getOrganizationPublicBaseUrl(input.organizationId, "app");
  try {
    const response = await fetch(`${baseUrl}/finance/payments/${encodeURIComponent(input.paymentId)}/receipt/pdf`, {
      cache: "no-store",
      headers: input.cookieHeader ? { cookie: input.cookieHeader } : undefined,
    });
    if (!response.ok) {
      console.error(`Không thể tạo PDF phiếu thu ${input.paymentId} (${response.status}).`);
      return undefined;
    }

    return {
      filename: input.filename || "phieu-thu.pdf",
      content: Buffer.from(await response.arrayBuffer()),
      contentType: "application/pdf",
    };
  } catch (error) {
    console.error(`Không thể tạo PDF phiếu thu ${input.paymentId}.`, error);
    return undefined;
  }
}

async function receiptLink(organizationId: string, paymentId?: string) {
  const baseUrl = await getOrganizationPublicBaseUrl(organizationId, "portal");
  return paymentId ? `${baseUrl}/document/payment/${paymentId}` : `${baseUrl}/finance/payments`;
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
  const contact = await getTenantDb().contact.findFirst({
    where: { organizationId: input.organizationId, email: input.email },
    select: { customFields: true, firstName: true, lastName: true, email: true },
  });

  return canReceiveEmail(contact, input.key);
}

async function internalRecipients(organizationId: string, preferred?: Array<string | null | undefined>) {
  const members = await getTenantDb().organizationMember.findMany({
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
  portalPath?: string;
  operatorName?: string | null;
  operatorEmail?: string | null;
  relatedType?: string;
  relatedId?: string;
  sendRecipient?: boolean;
}) {
  let recipientSent = false;
  const baseUrl = await getOrganizationPublicBaseUrl(input.organizationId, "portal");
  const portalPath = input.portalPath || "/customer";
  const portalLink = `${baseUrl}${portalPath === "/" ? "" : portalPath}`;
  const loginLink = `${baseUrl}/login`;
  const variables = {
    customer_name: input.recipientName,
    company_name: input.recipientName,
    portal_role: input.portalRole || "Khách hàng",
    portal_link: portalLink,
    login_link: loginLink,
    login_email: input.recipientEmail,
    login_password: input.loginPassword,
    recipient_email_status: input.sendRecipient === false ? "Không gửi email cho người nhận" : "Đã gửi email cho người nhận",
    operator_name: input.operatorName || "Hệ thống",
    operator_email: input.operatorEmail || "",
    action_url: loginLink,
    action_label: "Đăng nhập",
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
      fallbackSubject: "Tài khoản đăng nhập của Quý khách",
      fallbackBody:
        "Xin chào <strong>{{customer_name}}</strong>,<br><br>Tài khoản truy cập không gian khách hàng của bạn đã được tạo thành công.<br><br>Email đăng nhập: <strong>{{login_email}}</strong><br>Mật khẩu: <strong>{{login_password}}</strong><br><br><div style=\"text-align: center; margin: 32px 0;\"><a href=\"{{login_link}}\" style=\"display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;\">Đăng nhập ngay</a></div><br>Sau khi đăng nhập, hệ thống sẽ tự động chuyển hướng bạn đến khu vực làm việc phù hợp.",
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

  const loginLink = `${await getOrganizationPublicBaseUrl(input.organizationId, "portal")}/login`;
  const rendered = await renderEmailTemplate({
    organizationId: input.organizationId,
    code: "CUSTOMER_PASSWORD_CHANGED",
    variables: {
      customer_name: input.recipientName,
      login_email: input.recipientEmail,
      portal_link: loginLink,
      action_url: loginLink,
      action_label: "Đăng nhập",
      changed_at: formatMailDate(new Date()),
    },
    fallbackSubject: "Mật khẩu đăng nhập của Quý khách đã được thay đổi",
    fallbackBody:
      "Xin chào <strong>{{customer_name}}</strong>,<br><br>Mật khẩu đăng nhập của Quý khách vừa được thay đổi thành công vào {{changed_at}}.<br>Nếu đây không phải thao tác của Quý khách, vui lòng liên hệ Ong Vàng ngay.<br><br><div style=\"text-align: center; margin: 32px 0;\"><a href=\"{{portal_link}}\" style=\"display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;\">Đăng nhập</a></div>",
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
  to?: string | string[];
  publicBaseUrl?: string;
  subject?: string;
  html?: string;
  attachPdf?: boolean;
}) {
  const include = { contact: { include: { company: true } } };
  const doc =
    input.type === "quotation"
      ? await getTenantDb().quotation.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
      : input.type === "contract"
        ? await getTenantDb().contract.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
        : await getTenantDb().invoice.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include });

  if (!doc) throw new Error("Document not found");
  if (!doc.token) throw new Error("Token không tồn tại, vui lòng tạo token public trước khi gửi");

  const name = contactName(doc.contact);
  const companyName = doc.contact?.company?.name || name;
  const link = await documentLink(input.organizationId, doc.token, input.publicBaseUrl);
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

  const metaBoxItems = [
    { label: "Khách hàng", value: name },
    { label: "Loại tài liệu", value: documentLabel },
    { label: "Số chứng từ", value: doc.number },
    { label: "Tổng tiền", value: formatVnd(total) },
  ];

  const rendered = input.subject || input.html ? {
    code: "CUSTOM",
    subject: input.subject || `Vui lòng xác nhận ${documentLabel} ${doc.number}`,
    html: input.html || `Xin chào <strong>${name}</strong>,<br><br>Vui lòng xem và xác nhận tài liệu tại liên kết sau:<br><a href="${link}">${link}</a>`,
  } : await renderEmailTemplate({
    organizationId: input.organizationId,
    code: templateCode,
    variables,
    metaBoxItems,
    fallbackSubject: `Vui lòng xác nhận ${documentLabel} ${doc.number}`,
    fallbackBody:
      "Xin chào <strong>{{customer_name}}</strong>,<br><br>Tài liệu <strong>{{document_label}}</strong> của bạn đã sẵn sàng. Vui lòng kiểm tra thông tin chi tiết và xác nhận tại liên kết dưới đây.<br><br><div style=\"text-align: center; margin: 32px 0;\"><a href=\"{{action_url}}\" style=\"display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;\">{{action_label}}</a></div>",
  });
  const to = input.to || doc.contact?.email;
  if (!to || (Array.isArray(to) && !to.length)) throw new Error("Tài liệu chưa có email người nhận");
  const attachment = input.attachPdf === false ? undefined : await documentPdfAttachmentFromLink(link, `${doc.number}.pdf`);

  await sendMailOnce(`${input.type}:${doc.id}:${Array.isArray(to) ? to.join(",") : to}:send-customer:${input.subject || ""}:${input.attachPdf === false ? "no-pdf" : "pdf"}`, 20, () =>
    sendEmail({
      organizationId: input.organizationId,
      to,
      subject: rendered.subject,
      html: rendered.html,
      templateCode: rendered.code,
      relatedType: input.type,
      relatedId: doc.id,
      attachments: attachment ? [attachment] : undefined,
      metadata: { flow: "finance_document", documentType: input.type, custom: Boolean(input.subject || input.html), attachPdf: input.attachPdf !== false },
    })
  );

  return { sent: true };
}

export async function renderFinanceDocumentEmailDraft(input: {
  organizationId: string;
  type: DocumentType;
  id: string;
  publicBaseUrl?: string;
}) {
  const include = { contact: { include: { company: true } } };
  const doc =
    input.type === "quotation"
      ? await getTenantDb().quotation.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
      : input.type === "contract"
        ? await getTenantDb().contract.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
        : await getTenantDb().invoice.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include });

  if (!doc) throw new Error("Document not found");
  if (!doc.token) throw new Error("Token không tồn tại, vui lòng tạo token public trước khi gửi");

  const name = contactName(doc.contact);
  const companyName = doc.contact?.company?.name || name;
  const link = await documentLink(input.organizationId, doc.token, input.publicBaseUrl);
  const documentLabel = input.type === "quotation" ? "Báo giá" : input.type === "contract" ? "Hợp đồng" : "Hóa đơn";
  const total = "total" in doc ? doc.total : 0;
  const templateCode =
    input.type === "quotation"
      ? "QUOTATION_SIGN_REQUEST_SENT"
      : input.type === "contract"
        ? "CONTRACT_SIGN_REQUEST_SENT"
        : "INVOICE_SIGN_REQUEST_SENT";
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
  const metaBoxItems = [
    { label: "Khách hàng", value: name },
    { label: "Loại tài liệu", value: documentLabel },
    { label: "Số chứng từ", value: doc.number },
    { label: "Tổng tiền", value: formatVnd(total) },
  ];

  const rendered = await renderEmailTemplate({
    organizationId: input.organizationId,
    code: templateCode,
    variables,
    metaBoxItems,
    fallbackSubject: `Vui lòng xác nhận ${documentLabel} ${doc.number}`,
    fallbackBody:
      "Xin chào <strong>{{customer_name}}</strong>,<br><br>Tài liệu <strong>{{document_label}}</strong> của bạn đã sẵn sàng. Vui lòng kiểm tra thông tin chi tiết và xác nhận tại liên kết dưới đây.<br><br><div style=\"text-align: center; margin: 32px 0;\"><a href=\"{{action_url}}\" style=\"display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;\">{{action_label}}</a></div>",
  });

  return {
    to: doc.contact?.email || "",
    subject: rendered.subject,
    html: rendered.html,
    link,
    attachPdf: true,
  };
}

export async function sendSignedDocumentEmails(input: {
  organizationId: string;
  type: Extract<DocumentType, "quotation" | "contract" | "invoice">;
  id: string;
}) {
  const include = { contact: { include: { company: true } } };
  const doc =
    input.type === "quotation"
      ? await getTenantDb().quotation.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
      : input.type === "contract"
        ? await getTenantDb().contract.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include })
        : await getTenantDb().invoice.findFirst({ where: { id: input.id, organizationId: input.organizationId }, include });

  if (!doc) return;
  const link = await documentLink(input.organizationId, doc.token);
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
  const signedPdf = await documentPdfAttachment(input.organizationId, doc.token, `${doc.number}-da-ky.pdf`);

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
      attachments: signedPdf ? [signedPdf] : undefined,
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
      attachments: signedPdf ? [signedPdf] : undefined,
      metadata: { flow: "finance_signed_staff", documentType: input.type },
    });
  }
}

export async function renderPaymentEmailDraft(input: { organizationId: string; paymentId: string }) {
  const payment = await getTenantDb().payment.findFirst({
    where: { id: input.paymentId, organizationId: input.organizationId },
    include: { invoice: { include: { contact: { include: { company: true } } } } },
  });
  if (!payment?.invoice) throw new Error("Không tìm thấy phiếu thu hoặc hóa đơn liên kết.");

  const contact = payment.invoice.contact;
  const name = contactName(contact);
  const companyName = contact?.company?.name || name;
  const variables = {
    customer_name: name,
    company_name: companyName,
    payment_amount: formatVnd(payment.amount),
    payment_date: formatMailDate(payment.paidAt || payment.createdAt),
    payment_transaction_id: payment.number || payment.reference || `PT-${payment.id.slice(-8).toUpperCase()}`,
    invoice_number: payment.invoice.number,
    invoice_total: formatVnd(payment.invoice.total),
    receipt_link: await receiptLink(input.organizationId, payment.id),
    action_url: await receiptLink(input.organizationId, payment.id),
    action_label: "Xem phiếu thu",
  };
  const metaBoxItems = [
    { label: "Khách hàng", value: name },
    { label: "Mã giao dịch", value: payment.number || payment.reference || `PT-${payment.id.slice(-8).toUpperCase()}` },
    { label: "Số tiền thanh toán", value: formatVnd(payment.amount) },
    { label: "Thanh toán cho", value: `Hóa đơn ${payment.invoice.number}` },
    { label: "Thời gian", value: formatMailDate(payment.paidAt || payment.createdAt) },
  ];

  const renderedCustomer = await renderEmailTemplate({
    organizationId: input.organizationId,
    code: "INVOICE_PAID_CUSTOMER",
    variables,
    metaBoxItems,
    fallbackSubject: "Xác nhận Thanh toán Hóa đơn {{invoice_number}}",
    fallbackBody: "Xin chào <strong>{{customer_name}}</strong>,<br><br>Cảm ơn Quý khách đã thanh toán thành công <strong>{{payment_amount}}</strong> cho hóa đơn <strong>{{invoice_number}}</strong>. Số dư của Quý khách đã được cập nhật hệ thống.<br><br>QUAN TRỌNG: Quý khách không cần thực hiện thêm bất kỳ hành động nào.<br><br><div style=\"text-align: center; margin: 32px 0;\"><a href=\"{{receipt_link}}\" style=\"display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;\">{{action_label}}</a></div>",
  });

  return {
    to: contact?.email || "",
    subject: renderedCustomer.subject,
    html: renderedCustomer.html,
    link: variables.receipt_link,
    attachPdf: true,
    variables,
  };
}

export async function sendPaymentEmails(input: { organizationId: string; paymentId: string; to?: string | string[]; subject?: string; html?: string; attachPdf?: boolean; cookieHeader?: string }) {
  const payment = await getTenantDb().payment.findFirst({
    where: { id: input.paymentId, organizationId: input.organizationId },
    include: { invoice: { include: { contact: { include: { company: true } } } } },
  });
  if (!payment?.invoice) return;

  const contact = payment.invoice.contact;
  const draft = await renderPaymentEmailDraft({ organizationId: input.organizationId, paymentId: input.paymentId });
  const receiptPdf = input.attachPdf === false ? undefined : await paymentReceiptPdfAttachment({
    organizationId: input.organizationId,
    paymentId: payment.id,
    filename: `${payment.number || payment.reference || `PT-${payment.id.slice(-8).toUpperCase()}`}.pdf`,
    cookieHeader: input.cookieHeader,
  });

  if (contact?.email && canReceiveEmail(contact, "payment")) {
    const to = input.to || contact.email;
    await sendMailOnce(`payment:${payment.id}:${Array.isArray(to) ? to.join(",") : to}:customer:${input.subject || ""}:${input.attachPdf === false ? "no-pdf" : "pdf"}`, 20, () =>
      sendEmail({
        organizationId: input.organizationId,
        to,
        subject: input.subject || draft.subject,
        html: input.html || draft.html,
        templateCode: input.subject || input.html ? "CUSTOM" : "INVOICE_PAID_CUSTOMER",
        relatedType: "payment",
        relatedId: payment.id,
        attachments: receiptPdf ? [receiptPdf] : undefined,
        metadata: { flow: "payment_customer", custom: Boolean(input.subject || input.html), attachPdf: input.attachPdf !== false },
      })
    );
  }

  const staffTo = await internalRecipients(input.organizationId);
  if (staffTo.length) {
    const renderedStaff = await renderEmailTemplate({
      organizationId: input.organizationId,
      code: "INVOICE_PAID_STAFF",
      variables: draft.variables,
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
        attachments: receiptPdf ? [receiptPdf] : undefined,
        metadata: { flow: "payment_staff" },
      })
    );
  }
}

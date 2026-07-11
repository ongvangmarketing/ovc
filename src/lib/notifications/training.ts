import { getTenantDb } from "@/lib/db";
import { renderEmailTemplate, sendEmail, formatVnd, formatMailDate } from "@/lib/email/service";
import { getOrganizationPublicBaseUrl } from "@/lib/workspace-domain";

// ─────────────────────────────────────────────────────────
// 1. Email xác nhận ghi danh + link hóa đơn
// ─────────────────────────────────────────────────────────
export async function sendEnrollmentConfirmationEmail(input: {
  organizationId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  className: string;
  tuitionFee: number;
  invoiceToken?: string | null;
}) {
  if (!input.studentEmail || input.studentEmail.includes("@no-email.ovc.local")) return;

  const appUrl = await getOrganizationPublicBaseUrl(input.organizationId, "portal").catch(
    () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  );

  const invoiceLink = input.invoiceToken
    ? `${appUrl}/document/${input.invoiceToken}/pay`
    : `${appUrl}/student`;

  const { subject, html } = await renderEmailTemplate({
    organizationId: input.organizationId,
    code: "TRAINING_ENROLLMENT_CONFIRMATION",
    fallbackSubject: `Xác nhận ghi danh — ${input.courseName}`,
    fallbackBody: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#0f172a;padding:32px 24px;">
        <h2 style="font-size:24px;font-weight:600;margin:0 0 8px;">Đăng ký thành công 🎉</h2>
        <p style="color:#64748b;margin:0 0 24px;">Xin chào <strong>${input.studentName}</strong>,</p>
        <p style="color:#334155;line-height:1.7;margin:0 0 16px;">
          Bạn đã ghi danh thành công vào <strong>${input.className}</strong> — <em>${input.courseName}</em>.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:0 0 24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Khóa học</td><td style="text-align:right;font-weight:500;">${input.courseName}</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Lớp học</td><td style="text-align:right;font-weight:500;">${input.className}</td></tr>
            <tr style="border-top:1px solid #e2e8f0;">
              <td style="color:#0f172a;font-size:14px;font-weight:600;padding:12px 0 6px;">Học phí</td>
              <td style="text-align:right;font-size:16px;font-weight:600;padding:12px 0 6px;color:#0f172a;">${formatVnd(input.tuitionFee)}</td>
            </tr>
          </table>
        </div>
        ${input.invoiceToken ? `
        <a href="${invoiceLink}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:500;text-decoration:none;margin-bottom:24px;">
          Xem & Thanh toán ngay →
        </a>
        ` : ""}
        <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;border-top:1px solid #f1f5f9;padding-top:16px;">
          Sau khi thanh toán, hệ thống sẽ tự động kích hoạt tài khoản học của bạn.<br/>
          Cần hỗ trợ? Trả lời email này hoặc liên hệ chúng tôi.
        </p>
      </div>
    `,
    variables: {
      student_name: input.studentName,
      student_email: input.studentEmail,
      course_name: input.courseName,
      class_name: input.className,
      tuition_fee: formatVnd(input.tuitionFee),
      invoice_link: invoiceLink,
    },
  });

  await sendEmail({
    organizationId: input.organizationId,
    to: input.studentEmail,
    subject,
    html,
    templateCode: "TRAINING_ENROLLMENT_CONFIRMATION",
    relatedType: "Enrollment",
    metadata: { courseName: input.courseName, className: input.className },
  }).catch((err) => console.error("sendEnrollmentConfirmationEmail error:", err));
}

// ─────────────────────────────────────────────────────────
// 2. Email xác nhận đã thanh toán đủ + cấp portal
// ─────────────────────────────────────────────────────────
export async function sendPaymentConfirmedEmail(input: {
  organizationId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  className: string;
  paidAmount: number;
  portalUrl?: string;
}) {
  if (!input.studentEmail || input.studentEmail.includes("@no-email.ovc.local")) return;

  const appUrl = await getOrganizationPublicBaseUrl(input.organizationId, "portal").catch(
    () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  );
  const portalUrl = input.portalUrl || `${appUrl}/student`;

  const { subject, html } = await renderEmailTemplate({
    organizationId: input.organizationId,
    code: "TRAINING_PAYMENT_CONFIRMED",
    fallbackSubject: `Thanh toán học phí thành công — ${input.courseName}`,
    fallbackBody: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#0f172a;padding:32px 24px;">
        <h2 style="font-size:24px;font-weight:600;margin:0 0 8px;">Thanh toán thành công ✅</h2>
        <p style="color:#64748b;margin:0 0 24px;">Xin chào <strong>${input.studentName}</strong>,</p>
        <p style="color:#334155;line-height:1.7;margin:0 0 16px;">
          Chúng tôi đã ghi nhận thanh toán học phí của bạn. Tài khoản học của bạn đã được <strong>kích hoạt</strong>.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:0 0 24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Khóa học</td><td style="text-align:right;font-weight:500;">${input.courseName}</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Lớp học</td><td style="text-align:right;font-weight:500;">${input.className}</td></tr>
            <tr style="border-top:1px solid #d1fae5;">
              <td style="color:#166534;font-size:14px;font-weight:600;padding:12px 0 6px;">Đã thanh toán</td>
              <td style="text-align:right;font-size:16px;font-weight:600;padding:12px 0 6px;color:#166534;">${formatVnd(input.paidAmount)}</td>
            </tr>
          </table>
        </div>
        <a href="${portalUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:500;text-decoration:none;margin-bottom:24px;">
          Vào trang học ngay →
        </a>
        <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;border-top:1px solid #f1f5f9;padding-top:16px;">
          Sử dụng email này để đăng nhập Portal học viên. Cần hỗ trợ? Liên hệ chúng tôi.
        </p>
      </div>
    `,
    variables: {
      student_name: input.studentName,
      student_email: input.studentEmail,
      course_name: input.courseName,
      class_name: input.className,
      paid_amount: formatVnd(input.paidAmount),
      portal_url: portalUrl,
    },
  });

  await sendEmail({
    organizationId: input.organizationId,
    to: input.studentEmail,
    subject,
    html,
    templateCode: "TRAINING_PAYMENT_CONFIRMED",
    relatedType: "Enrollment",
    metadata: { courseName: input.courseName, className: input.className },
  }).catch((err) => console.error("sendPaymentConfirmedEmail error:", err));
}

// ─────────────────────────────────────────────────────────
// 3. Email nhắc học phí (admin gửi thủ công)
// ─────────────────────────────────────────────────────────
export async function sendInvoiceReminderEmail(input: {
  organizationId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  className: string;
  remainingAmount: number;
  invoiceToken?: string | null;
}) {
  if (!input.studentEmail || input.studentEmail.includes("@no-email.ovc.local")) return;

  const appUrl = await getOrganizationPublicBaseUrl(input.organizationId, "portal").catch(
    () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  );
  const payLink = input.invoiceToken ? `${appUrl}/document/${input.invoiceToken}/pay` : `${appUrl}/student`;

  const { subject, html } = await renderEmailTemplate({
    organizationId: input.organizationId,
    code: "TRAINING_INVOICE_REMINDER",
    fallbackSubject: `Nhắc nhở học phí — ${input.courseName}`,
    fallbackBody: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif;max-width:560px;margin:0 auto;color:#0f172a;padding:32px 24px;">
        <h2 style="font-size:24px;font-weight:600;margin:0 0 8px;">Nhắc nhở học phí 💳</h2>
        <p style="color:#64748b;margin:0 0 24px;">Xin chào <strong>${input.studentName}</strong>,</p>
        <p style="color:#334155;line-height:1.7;margin:0 0 16px;">
          Học phí khóa <strong>${input.className} — ${input.courseName}</strong> của bạn vẫn chưa được thanh toán đủ.
        </p>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin:0 0 24px;">
          <p style="color:#9a3412;font-size:13px;margin:0 0 4px;">Số tiền còn lại</p>
          <p style="color:#c2410c;font-size:22px;font-weight:700;margin:0;">${formatVnd(input.remainingAmount)}</p>
        </div>
        <a href="${payLink}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 28px;border-radius:999px;font-size:14px;font-weight:500;text-decoration:none;margin-bottom:24px;">
          Thanh toán ngay →
        </a>
        <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;border-top:1px solid #f1f5f9;padding-top:16px;">
          Nếu bạn đã thanh toán, vui lòng bỏ qua email này hoặc liên hệ chúng tôi để xác nhận.
        </p>
      </div>
    `,
    variables: {
      student_name: input.studentName,
      student_email: input.studentEmail,
      course_name: input.courseName,
      class_name: input.className,
      remaining_amount: formatVnd(input.remainingAmount),
      pay_link: payLink,
    },
  });

  await sendEmail({
    organizationId: input.organizationId,
    to: input.studentEmail,
    subject,
    html,
    templateCode: "TRAINING_INVOICE_REMINDER",
    relatedType: "Enrollment",
    metadata: { courseName: input.courseName },
  }).catch((err) => console.error("sendInvoiceReminderEmail error:", err));
}

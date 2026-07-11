export type MetaBoxItem = {
  label: string;
  value: string;
};

export function wrapGoogleWorkspaceStyle(
  bodyHtml: string, 
  variables: Record<string, unknown>, 
  metaBoxItems?: MetaBoxItem[]
) {
  const companyName = String(variables.company_workspace_name || variables.company_name || "Hệ thống");
  const companyLogo = String(variables.company_logo_url || "");
  const fallbackActionUrl = String(
    variables.quotation_link ||
    variables.contract_link ||
    variables.invoice_link ||
    variables.receipt_link ||
    variables.deal_link ||
    variables.action_url ||
    ""
  );
  const fallbackLinkHtml = fallbackActionUrl && !bodyHtml.includes("Nếu nút không hoạt động")
    ? `<p style="margin:14px 0 0 0;font-size:12px;line-height:1.55;color:#737373;text-align:center;">
        Nếu nút không hoạt động, sao chép và mở liên kết này trong trình duyệt:<br>
        <a href="${fallbackActionUrl}" style="color:#525252;text-decoration:underline;font-weight:400;word-break:break-all;overflow-wrap:anywhere;">${fallbackActionUrl}</a>
      </p>`
    : "";

  // Build Header
  const headerContent = companyLogo
    ? `<img src="${companyLogo}" alt="${companyName}" style="max-height:40px;max-width:220px;width:auto;height:auto;display:block;border:0;" />`
    : `<div style="font-size:16px;font-weight:600;color:#111111;letter-spacing:-0.2px;">${companyName}</div>`;

  // Build Meta Box
  let metaBoxHtml = "";
  if (metaBoxItems && metaBoxItems.length > 0) {
    const rows = metaBoxItems.map((item, index) => {
      const borderBottom = index === metaBoxItems.length - 1 ? "" : "border-bottom: 1px solid #eaeaea;";
      return `
      <tr>
        <td style="padding: 14px 0; color: #666666; width: 40%; vertical-align: top; ${borderBottom}">
          ${item.label}
        </td>
        <td style="padding: 14px 0; color: #171717; font-weight: 500; vertical-align: top; text-align: right; ${borderBottom}">
          ${item.value}
        </td>
      </tr>
      `;
    }).join("");

    metaBoxHtml = `
      <div style="margin:32px 0 0 0;border-top:1px solid #eaeaea;border-bottom:1px solid #eaeaea;padding:6px 0;background-color:#ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          ${rows}
        </table>
      </div>
    `;
  }

  // Footer
  const companyAddress = String(variables.company_address || "");
  const companyWebsite = String(variables.company_website || "");
  const companyEmail = String(variables.company_email || "");
  const contactParts = [companyWebsite, companyEmail].filter(Boolean);

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin:0;padding:48px 0;background-color:#f6f8fa;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility; }
        .email-wrapper { max-width:640px;margin:0 auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;font-optical-sizing:auto;font-synthesis:none; }
        .email-container { background-color:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;color:#1f1f1f;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','SF Pro Display','Helvetica Neue',Arial,sans-serif;font-weight:400; }
        .header { padding:28px 40px;border-bottom:1px solid #eeeeee; }
        .body-content { padding:40px;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:400;line-height:1.5;letter-spacing:-0.05px;color:#333333;font-optical-sizing:auto;font-synthesis:none; }
        .body-content table, .body-content td, .body-content a { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','SF Pro Display','Helvetica Neue',Arial,sans-serif; }
        .body-content table td { font-size:14px !important;font-weight:400 !important;color:#333333 !important;font-optical-sizing:auto !important; }
        .body-content table td strong,
        .body-content table td span { font-family:inherit !important;font-size:14px !important;font-weight:400 !important;color:#333333 !important;background:transparent !important;border:0 !important;border-radius:0 !important;padding:0 !important;font-optical-sizing:auto !important; }
        .body-content > div > p strong,
        .body-content > div > div:nth-of-type(2) strong { font-family:inherit !important;font-size:inherit !important;font-weight:600 !important;color:inherit !important;font-optical-sizing:auto !important; }
        .body-content .email-details-card,
        .body-content > div > div:nth-of-type(3) { background:#f7f7f7 !important;border:1px solid #e8e8e8 !important;border-radius:10px !important;padding:20px 22px !important;margin-bottom:28px !important; }
        .body-content .email-details-card *,
        .body-content > div > div:nth-of-type(3) * { font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif !important;font-size:14px !important;font-weight:400 !important;line-height:1.45 !important;color:#333333 !important;font-optical-sizing:auto !important; }
        .body-content .email-details-card h3,
        .body-content > div > div:nth-of-type(3) h3 { font-weight:600 !important; }
        .body-content .email-details-card tr td:last-child,
        .body-content > div > div:nth-of-type(3) tr td:last-child { font-weight:500 !important; }
        .body-content .email-details-card tr:nth-child(4) td:last-child,
        .body-content > div > div:nth-of-type(3) tr:nth-child(4) td:last-child { font-weight:600 !important; }
        .body-content > div > div:nth-of-type(4) { text-align:center !important; }
        .body-content p { margin: 0 0 16px 0; }
        .body-content a { color: #000000; text-decoration: underline; font-weight: 500; }
        .body-content a:hover { color: #666666; }
        .footer { margin-top:24px;padding:0 28px;font-size:12px;color:#8a8a8a;line-height:1.6;text-align:center; }
        @media only screen and (max-width: 600px) { body { padding:0;background:#ffffff; } .email-wrapper { padding:0; } .email-container { border:0;border-radius:0; } .header { padding:24px; } .body-content { padding:28px 24px; } .body-content .email-details-card, .body-content > div > div:nth-of-type(3) { padding:18px !important; } }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            ${headerContent}
          </div>

          <!-- Body -->
          <div class="body-content">
            ${bodyHtml}
            ${fallbackLinkHtml}
            ${metaBoxHtml}
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0 0 8px 0;">
            Email tự động từ <strong>${companyName}</strong>. Vui lòng không trả lời trực tiếp email này.
          </p>
          ${companyAddress ? `<p style="margin:0 0 4px 0;">${companyAddress}</p>` : ""}
          ${contactParts.length > 0 ? `<p style="margin:0;white-space:nowrap;">${contactParts.join(" &bull; ")}</p>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;
}

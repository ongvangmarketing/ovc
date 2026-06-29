export const defaultTemplates = [
  {
    code: 'SEND_QUOTATION',
    module: 'Quotation',
    name: 'Báo giá cần ký duyệt',
    subject: 'Vui lòng xác nhận Báo giá {{quotation_number}}',
    body: 'Xin chào <strong>{{customer_name}}</strong>,<br><br>Chúng tôi xin gửi đến Quý khách Báo giá mới <strong>{{quotation_number}}</strong> từ hệ thống của chúng tôi.<br>Giá trị báo giá: <strong>{{quotation_total}}</strong>.<br><br>Quý khách vui lòng kiểm tra chi tiết các hạng mục và thực hiện ký xác nhận trực tuyến để chúng tôi có thể tiến hành các bước tiếp theo.<br><br><div style="text-align: center; margin: 30px 0;"><a href="{{quotation_link}}" style="background-color: #0f766e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Xem và Ký Báo Giá</a></div>',
    variables: ['customer_name', 'quotation_number', 'quotation_total', 'quotation_link', 'company_name']
  },
  {
    code: 'SEND_CONTRACT',
    module: 'Contract',
    name: 'Hợp đồng cần ký duyệt',
    subject: 'Vui lòng ký Hợp đồng {{contract_subject}}',
    body: 'Xin chào <strong>{{customer_name}}</strong>,<br><br>Hợp đồng <strong>{{contract_subject}}</strong> đã được soạn thảo thành công. Giá trị hợp đồng: <strong>{{contract_value}}</strong>.<br><br>Chúng tôi xin gửi đến Quý khách bản Hợp đồng điện tử. Quý khách vui lòng truy cập vào đường dẫn bên dưới để xem chi tiết các điều khoản và thực hiện ký điện tử xác nhận.<br><br><div style="text-align: center; margin: 30px 0;"><a href="{{contract_link}}" style="background-color: #0f766e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Xem và Ký Hợp Đồng</a></div>',
    variables: ['customer_name', 'contract_subject', 'contract_value', 'contract_link', 'company_name']
  },
  {
    code: 'SEND_INVOICE',
    module: 'Invoice',
    name: 'Hóa đơn cần xác nhận',
    subject: 'Vui lòng xác nhận Hóa đơn {{invoice_number}}',
    body: 'Xin chào <strong>{{customer_name}}</strong>,<br><br>Hóa đơn <strong>{{invoice_number}}</strong> với tổng giá trị thanh toán <strong>{{invoice_total}}</strong> đã được xuất. Thời hạn thanh toán: <strong>{{invoice_duedate}}</strong>.<br><br>Quý khách vui lòng truy cập đường dẫn bên dưới để xem chi tiết hóa đơn, thực hiện ký xác nhận và tiến hành thanh toán.<br><br><div style="text-align: center; margin: 30px 0;"><a href="{{invoice_link}}" style="background-color: #ea580c; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Xem và Ký Hóa Đơn</a></div><br><br><strong>Lưu ý:</strong> Hóa đơn dịch vụ này không phải hóa đơn VAT, hóa đơn VAT sẽ được xuất sau khi Quý khách thanh toán.',
    variables: ['customer_name', 'invoice_number', 'invoice_total', 'invoice_duedate', 'invoice_link', 'company_name']
  },
  {
    code: 'INVOICE_PAID_CUSTOMER',
    module: 'Payment',
    name: 'Xác nhận thanh toán thành công (Gửi Khách hàng)',
    subject: 'Xác nhận Thanh toán Hóa đơn {{invoice_number}}',
    body: 'Cảm ơn Quý khách <strong>{{customer_name}}</strong> đã thực hiện thanh toán thành công số tiền {{payment_amount}}. Chúng tôi xin xác nhận hệ thống đã ghi nhận khoản thanh toán của Quý khách cho Hóa đơn <strong>{{invoice_number}}</strong>.<br><br>Biên lai thu tiền điện tử mã <strong>{{payment_transaction_id}}</strong> đã được tạo và đính kèm trong email này để Quý khách lưu trữ vào hồ sơ kế toán.<br><br>Chúng tôi sẽ tiếp tục triển khai dự án theo kế hoạch và cập nhật tiến độ thường xuyên đến Quý khách.<br><br><div style="text-align: center; margin: 30px 0;"><a href="{{receipt_link}}" style="background-color: #10b981; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Tải Biên Lai (PDF)</a></div>',
    variables: ['customer_name', 'payment_amount', 'invoice_number', 'payment_transaction_id', 'receipt_link', 'company_name']
  }
];

function getDetailsRows(module: string) {
  switch (module) {
    case 'Quotation': return `
      <tr><td style="padding:4px 0;width:42%;font-weight:800;">Khách hàng</td><td style="padding:4px 0;text-align:right;color:#111827;font-weight:900;">{{customer_name}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Số báo giá</td><td style="padding:4px 0;text-align:right;">{{quotation_number}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Ngày lập</td><td style="padding:4px 0;text-align:right;">{{document_date}}</td></tr>
      <tr><td style="padding:5px 0;font-weight:800;">Giá trị báo giá</td><td style="padding:5px 0;text-align:right;color:#ea580c;font-size:18px;font-weight:900;">{{quotation_total}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Trạng thái</td><td style="padding:4px 0;text-align:right;"><span style="display:inline-block;background:#fff7ed;color:#92400e;border:1px solid #fed7aa;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:900;">{{document_status}}</span></td></tr>`;
    case 'Contract': return `
      <tr><td style="padding:4px 0;width:42%;font-weight:800;">Khách hàng</td><td style="padding:4px 0;text-align:right;color:#111827;font-weight:900;">{{customer_name}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Hợp đồng</td><td style="padding:4px 0;text-align:right;">{{contract_subject}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Ngày lập</td><td style="padding:4px 0;text-align:right;">{{document_date}}</td></tr>
      <tr><td style="padding:5px 0;font-weight:800;">Giá trị hợp đồng</td><td style="padding:5px 0;text-align:right;color:#ea580c;font-size:18px;font-weight:900;">{{contract_value}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Trạng thái</td><td style="padding:4px 0;text-align:right;"><span style="display:inline-block;background:#fff7ed;color:#92400e;border:1px solid #fed7aa;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:900;">{{document_status}}</span></td></tr>`;
    case 'Invoice': return `
      <tr><td style="padding:4px 0;width:42%;font-weight:800;">Khách hàng</td><td style="padding:4px 0;text-align:right;color:#111827;font-weight:900;">{{customer_name}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Số hóa đơn</td><td style="padding:4px 0;text-align:right;">{{invoice_number}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Ngày lập</td><td style="padding:4px 0;text-align:right;">{{document_date}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Hạn thanh toán</td><td style="padding:4px 0;text-align:right;">{{invoice_duedate}}</td></tr>
      <tr><td style="padding:5px 0;font-weight:800;">Tổng thanh toán</td><td style="padding:5px 0;text-align:right;color:#ea580c;font-size:18px;font-weight:900;">{{invoice_total}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Trạng thái</td><td style="padding:4px 0;text-align:right;"><span style="display:inline-block;background:#fff7ed;color:#92400e;border:1px solid #fed7aa;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:900;">{{document_status}}</span></td></tr>`;
    case 'Payment': return `
      <tr><td style="padding:4px 0;width:42%;font-weight:800;">Khách hàng</td><td style="padding:4px 0;text-align:right;color:#111827;font-weight:900;">{{customer_name}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Mã giao dịch</td><td style="padding:4px 0;text-align:right;">{{payment_transaction_id}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Hóa đơn</td><td style="padding:4px 0;text-align:right;">{{invoice_number}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Ngày thanh toán</td><td style="padding:4px 0;text-align:right;">{{payment_date}}</td></tr>
      <tr><td style="padding:5px 0;font-weight:800;">Số tiền</td><td style="padding:5px 0;text-align:right;color:#ea580c;font-size:18px;font-weight:900;">{{payment_amount}}</td></tr>
      <tr><td style="padding:4px 0;font-weight:800;">Trạng thái</td><td style="padding:4px 0;text-align:right;"><span style="display:inline-block;background:#fff7ed;color:#92400e;border:1px solid #fed7aa;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:900;">Đã thanh toán</span></td></tr>`;
    default: return '';
  }
}

function getDetailsTitle(module: string) {
  switch (module) {
    case 'Quotation': return 'Thông tin báo giá';
    case 'Contract': return 'Thông tin hợp đồng';
    case 'Invoice': return 'Thông tin hóa đơn';
    case 'Payment': return 'Thông tin phiếu thu';
    default: return 'Thông tin chi tiết';
  }
}

function getEyebrow(module: string) {
  switch (module) {
    case 'Quotation': return 'Thông báo báo giá';
    case 'Contract': return 'Thông báo hợp đồng';
    case 'Invoice': return 'Thông báo hóa đơn';
    case 'Payment': return 'Thông báo thanh toán';
    default: return 'Thông báo từ Ong Vàng';
  }
}

function getActionUrl(code: string) {
  if (code.includes('QUOTATION')) return '{{quotation_link}}';
  if (code.includes('CONTRACT')) return '{{contract_link}}';
  if (code.includes('INVOICE_PAID')) return '{{receipt_link}}';
  if (code.includes('INVOICE')) return '{{invoice_link}}';
  return '{{action_url}}';
}

function getActionLabel(code: string) {
  if (code.includes('QUOTATION')) return 'Xem báo giá';
  if (code.includes('CONTRACT')) return 'Xem hợp đồng';
  if (code.includes('INVOICE_PAID')) return 'Xem phiếu thu';
  if (code.includes('INVOICE')) return 'Xem hóa đơn';
  return 'Xem chi tiết';
}

export function buildTemplateHtml(t: any) {
  const eyebrow = getEyebrow(t.module);
  const detailsTitle = getDetailsTitle(t.module);
  const detailsRows = getDetailsRows(t.module);
  const actionLabel = getActionLabel(t.code);
  const actionUrl = getActionUrl(t.code);

  const bodyContent = t.body.replace(/<div[^>]*text-align:\s*center[^>]*>[\s\S]*?<a\b[\s\S]*?<\/a>[\s\S]*?<\/div>/i, '');

  const detailsBlock = `
          <tr>
            <td style="padding:14px 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f3b45b;border-radius:10px;overflow:hidden;">
                <tr><td style="background:#d97706;color:#ffffff;padding:9px 13px;font-size:12px;font-weight:900;text-transform:uppercase;">${detailsTitle}</td></tr>
                <tr>
                  <td style="padding:11px 13px;background:#fffaf2;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:12px;color:#374151;line-height:1.55;">
${detailsRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t.name}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:22px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:16px 20px 14px;border-bottom:3px solid #f59e0b;background:#fffaf2;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="font-size:20px;font-weight:900;color:#1f2937;line-height:1.2;">Ong Vàng Workspace</div>
                    <div style="font-size:12px;font-weight:700;color:#92400e;margin-top:4px;line-height:1.4;">Digital Business Platform</div>
                  </td>
                  <td align="right" style="vertical-align:middle;width:130px;">
                    <img src="https://ongvang.com.vn/images/logo.png" alt="Ong Vàng" style="display:inline-block;max-width:118px;max-height:46px;width:auto;height:auto;object-fit:contain;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 20px 8px;">
              <div style="font-size:11px;font-weight:900;color:#ea580c;text-transform:uppercase;letter-spacing:.05em;">${eyebrow}</div>
              <h1 style="margin:7px 0 9px;font-size:22px;line-height:1.25;color:#111827;font-weight:900;">${t.name}</h1>
            </td>
          </tr>
${detailsBlock}
          <tr>
            <td style="padding:8px 20px 8px;">
              <div style="color:#374151;font-size:13px;line-height:1.65;">${bodyContent}</div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:7px 20px 24px;">
              <a href="${actionUrl}" style="display:inline-block;background:#f59e0b;color:#ffffff;text-decoration:none;border-radius:8px;padding:11px 20px;font-size:13px;font-weight:900;">${actionLabel}</a>
              <div style="font-size:11px;color:#6b7280;margin-top:11px;line-height:1.5;">Nếu nút không hoạt động, vui lòng sao chép liên kết sau:<br><span style="color:#92400e;word-break:break-all;">${actionUrl}</span></div>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <div style="font-size:11px;color:#4b5563;line-height:1.65;"><strong style="color:#111827;">Công ty Truyền thông Đào tạo Du lịch Ong Vàng</strong><br>Ong Vàng Marketing &amp; Training<br>MST: 3401252747<br>Số 2 Trương Vĩnh Ký, Phường Phan Thiết, Tỉnh Lâm Đồng, Việt Nam<br>0918 320 331 | info@ovc.vn | ongvang.com.vn</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

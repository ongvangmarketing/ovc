export const defaultTemplates = [
  {
    code: 'QUOTATION_SIGN_REQUEST_SENT',
    module: 'Quotation',
    name: 'Báo giá cần ký duyệt',
    subject: 'Vui lòng xác nhận Báo giá {{quotation_number}}',
    body: 'Báo giá <strong>{{quotation_number}}</strong>, trị giá <strong>{{quotation_total}}</strong>, đã sẵn sàng để Quý khách xem và xác nhận.<br><br>Vui lòng kiểm tra nội dung trước khi ký trực tuyến.',
    variables: ['customer_name', 'quotation_number', 'quotation_total', 'document_date', 'document_status', 'quotation_link', 'company_name']
  },
  {
    code: 'CONTRACT_SIGN_REQUEST_SENT',
    module: 'Contract',
    name: 'Hợp đồng cần ký duyệt',
    subject: 'Vui lòng ký Hợp đồng {{contract_subject}}',
    body: 'Hợp đồng <strong>{{contract_subject}}</strong> với giá trị <strong>{{contract_value}}</strong> đã được hoàn thiện và sẵn sàng để Quý khách xem xét.<br><br>Quý khách vui lòng kiểm tra thông tin các bên, phạm vi công việc, điều khoản thanh toán và thực hiện ký điện tử. Bản hợp đồng sau khi ký sẽ được hệ thống lưu trữ và gửi lại qua email.',
    variables: ['customer_name', 'contract_subject', 'contract_value', 'document_date', 'document_status', 'contract_link', 'company_name']
  },
  {
    code: 'INVOICE_SIGN_REQUEST_SENT',
    module: 'Invoice',
    name: 'Hóa đơn cần xác nhận',
    subject: 'Vui lòng xác nhận Hóa đơn {{invoice_number}}',
    body: 'Hóa đơn <strong>{{invoice_number}}</strong> với tổng giá trị <strong>{{invoice_total}}</strong> đã được phát hành. Thời hạn thanh toán là <strong>{{invoice_duedate}}</strong>.<br><br>Quý khách vui lòng kiểm tra thông tin dịch vụ, số tiền và thực hiện xác nhận trực tuyến. Đây là hóa đơn dịch vụ; hóa đơn VAT sẽ được phát hành theo quy định sau khi khoản thanh toán được ghi nhận.',
    variables: ['customer_name', 'invoice_number', 'invoice_total', 'invoice_duedate', 'document_date', 'document_status', 'invoice_link', 'company_name']
  },
  {
    code: 'INVOICE_PAID_CUSTOMER',
    module: 'Payment',
    name: 'Xác nhận thanh toán thành công (Gửi Khách hàng)',
    subject: 'Xác nhận Thanh toán Hóa đơn {{invoice_number}}',
    body: 'Cảm ơn Quý khách đã thực hiện thanh toán thành công số tiền <strong>{{payment_amount}}</strong>. Chúng tôi xin xác nhận hệ thống đã ghi nhận khoản thanh toán của Quý khách cho Hóa đơn <strong>{{invoice_number}}</strong>.<br><br>Biên lai thu tiền điện tử mã <strong>{{payment_transaction_id}}</strong> đã được tạo và đính kèm trong email này để Quý khách lưu trữ vào hồ sơ kế toán.<br><br>Chúng tôi sẽ tiếp tục triển khai dự án theo kế hoạch và cập nhật tiến độ thường xuyên đến Quý khách.',
    variables: ['customer_name', 'payment_amount', 'invoice_number', 'payment_transaction_id', 'receipt_link', 'company_name']
  },
  {
    code: 'DEAL_APPROVED_INTERNAL',
    module: 'Deal',
    name: 'Nội bộ - Khách hàng đã duyệt deal',
    subject: '[Deal] Khách hàng đã duyệt {{deal_title}}',
    body: 'Khách hàng <strong>{{customer_name}}</strong> đã xác nhận lựa chọn cho deal <strong>{{deal_title}}</strong>.<br><br>Giá trị đã chọn: <strong>{{deal_total}}</strong>.<br><br><strong>Dịch vụ đã chọn:</strong><br>{{selected_options}}',
    variables: ['customer_name', 'deal_title', 'deal_total', 'selected_options', 'deal_link', 'company_name']
  },
  {
    code: 'CUSTOMER_PASSWORD_CHANGED',
    module: 'Account',
    name: 'Mật khẩu Portal đã thay đổi',
    subject: 'Mật khẩu đăng nhập của Quý khách đã được thay đổi',
    body: 'Mật khẩu Portal của Quý khách đã được thay đổi thành công vào <strong>{{changed_at}}</strong>.<br><br>Nếu đây không phải thao tác của Quý khách, vui lòng liên hệ bộ phận hỗ trợ ngay.',
    variables: ['customer_name', 'changed_at', 'portal_link']
  },
  {
    code: 'TRAINING_ENROLLMENT_CONFIRMATION',
    module: 'Training',
    name: 'Đào tạo - Xác nhận ghi danh',
    subject: 'Xác nhận ghi danh lớp {{class_name}}',
    body: 'Bạn đã ghi danh thành công vào lớp <strong>{{class_name}}</strong> thuộc khóa <strong>{{course_name}}</strong>.<br><br>Vui lòng kiểm tra thông tin học phí và hoàn tất thanh toán nếu cần.',
    variables: ['student_name', 'student_email', 'course_name', 'class_name', 'tuition_fee', 'invoice_link']
  },
  {
    code: 'TRAINING_PAYMENT_CONFIRMED',
    module: 'Training',
    name: 'Đào tạo - Xác nhận thanh toán',
    subject: 'Thanh toán học phí thành công — {{course_name}}',
    body: 'Khoản học phí <strong>{{paid_amount}}</strong> cho lớp <strong>{{class_name}}</strong> đã được ghi nhận.<br><br>Tài khoản học của bạn đã được kích hoạt và sẵn sàng sử dụng.',
    variables: ['student_name', 'student_email', 'course_name', 'class_name', 'paid_amount', 'portal_url']
  },
  {
    code: 'TRAINING_INVOICE_REMINDER',
    module: 'Training',
    name: 'Đào tạo - Nhắc nhở học phí',
    subject: 'Nhắc nhở học phí — {{course_name}}',
    body: 'Học phí của lớp <strong>{{class_name}}</strong> vẫn còn <strong>{{remaining_amount}}</strong> chưa thanh toán.<br><br>Nếu đã thanh toán, bạn có thể bỏ qua email này hoặc liên hệ chúng tôi để đối soát.',
    variables: ['student_name', 'student_email', 'course_name', 'class_name', 'remaining_amount', 'pay_link']
  },
  {
    code: 'REMINDER_DEFAULT',
    module: 'System',
    name: 'Nhắc việc mặc định',
    subject: '[Thông báo quan trọng] Nhắc việc cần xử lý',
    body: 'Đây là lời nhắc về <strong>{{targetName}}</strong>.<br><br>Vui lòng kiểm tra thông tin và hoàn thành công việc đúng thời hạn.',
    variables: ['customerName', 'targetName', 'entityId']
  }
];

export type EmailTemplateDesignInput = {
  code: string;
  module?: string;
  name: string;
  body: string;
  variables: string[];
};

export const templateCopyByCode: Record<string, string> = {
  QUOTATION_SIGN_REQUEST_SENT: 'Báo giá <strong>{{quotation_number}}</strong>, trị giá <strong>{{quotation_total}}</strong>, đã sẵn sàng để xem xét.<br><br>Vui lòng kiểm tra nội dung và xác nhận trực tuyến để chúng tôi triển khai bước tiếp theo.',
  QUOTATION_ACCEPTED_CUSTOMER: 'Báo giá <strong>{{quotation_number}}</strong> đã được xác nhận thành công.<br><br>Cảm ơn Quý khách. Chúng tôi sẽ chủ động liên hệ và triển khai công việc theo nội dung đã thống nhất.',
  QUOTATION_ACCEPTED_STAFF: 'Khách hàng <strong>{{customer_name}}</strong> đã xác nhận báo giá <strong>{{quotation_number}}</strong>.<br><br>Vui lòng kiểm tra hồ sơ và thực hiện các bước triển khai tiếp theo.',
  CONTRACT_SIGN_REQUEST_SENT: 'Hợp đồng <strong>{{contract_subject}}</strong>, trị giá <strong>{{contract_value}}</strong>, đang chờ xác nhận.<br><br>Vui lòng kiểm tra các điều khoản trước khi ký điện tử.',
  CONTRACT_SIGNED_CUSTOMER: 'Hợp đồng <strong>{{contract_subject}}</strong> đã được ký thành công.<br><br>Bản hợp đồng hoàn tất đã được lưu trên hệ thống để Quý khách tra cứu khi cần.',
  CONTRACT_SIGNED_STAFF: 'Khách hàng <strong>{{customer_name}}</strong> đã ký hợp đồng <strong>{{contract_subject}}</strong>.<br><br>Vui lòng hoàn tất hồ sơ và chuyển sang bước triển khai.',
  INVOICE_SIGN_REQUEST_SENT: 'Hóa đơn <strong>{{invoice_number}}</strong>, trị giá <strong>{{invoice_total}}</strong>, đã sẵn sàng để kiểm tra.<br><br>Vui lòng xác nhận thông tin trước thời hạn <strong>{{invoice_duedate}}</strong>.',
  INVOICE_SIGNED_CUSTOMER: 'Hóa đơn <strong>{{invoice_number}}</strong> đã được xác nhận thành công.<br><br>Cảm ơn Quý khách. Thông tin hóa đơn đã được cập nhật trên hệ thống.',
  INVOICE_SIGNED_STAFF: 'Khách hàng <strong>{{customer_name}}</strong> đã xác nhận hóa đơn <strong>{{invoice_number}}</strong>.<br><br>Vui lòng kiểm tra trạng thái và tiếp tục quy trình thu tiền.',
  INVOICE_PAID_CUSTOMER: 'Khoản thanh toán <strong>{{payment_amount}}</strong> cho hóa đơn <strong>{{invoice_number}}</strong> đã được ghi nhận thành công.<br><br>Quý khách không cần thực hiện thêm thao tác nào. Phiếu thu đã sẵn sàng để tra cứu.',
  INVOICE_PAID_STAFF: 'Hệ thống đã ghi nhận <strong>{{payment_amount}}</strong> từ khách hàng <strong>{{customer_name}}</strong> cho hóa đơn <strong>{{invoice_number}}</strong>.<br><br>Vui lòng đối soát và hoàn tất hồ sơ thanh toán.',
  CUSTOMER_ACCOUNT_CREATED: 'Tài khoản Portal của Quý khách đã được tạo thành công.<br><br>Vui lòng sử dụng thông tin đăng nhập bên dưới và đổi mật khẩu sau lần truy cập đầu tiên.',
  PORTAL_ACCOUNT_CREATED_STAFF: 'Tài khoản Portal của <strong>{{customer_name}}</strong> đã được cấp thành công.<br><br>Vui lòng kiểm tra trạng thái gửi email và thông tin người thực hiện.',
  STUDENT_CREATED_CUSTOMER: 'Tài khoản học viên của <strong>{{student_name}}</strong> đã sẵn sàng.<br><br>Vui lòng đăng nhập Portal để theo dõi lớp học, lịch học và các thông báo liên quan.',
  STUDENT_CREATED_STAFF: 'Hồ sơ học viên <strong>{{student_name}}</strong> đã được tạo thành công.<br><br>Vui lòng kiểm tra thông tin liên hệ và lớp học được phân bổ.',
  INSTRUCTOR_ACCOUNT_CREATED: 'Tài khoản giảng viên của <strong>{{instructor_name}}</strong> đã sẵn sàng.<br><br>Vui lòng đăng nhập Portal để quản lý lớp học và theo dõi học viên.',
  CLASS_ENROLLMENT_CONFIRMATION_STUDENT: 'Bạn đã đăng ký thành công lớp <strong>{{class_name}}</strong>.<br><br>Thông tin lớp học và lịch bắt đầu được hiển thị bên dưới.',
  CLASS_ENROLLMENT_STAFF: 'Học viên <strong>{{student_name}}</strong> vừa đăng ký lớp <strong>{{class_name}}</strong>.<br><br>Vui lòng kiểm tra hồ sơ và xác nhận công tác tiếp nhận.',
  CLASS_ENROLLMENT_INSTRUCTOR: 'Lớp <strong>{{class_name}}</strong> vừa có học viên mới: <strong>{{student_name}}</strong>.<br><br>Vui lòng kiểm tra danh sách lớp trên Portal.',
  CLASS_REGISTRATION_SUCCESS_INSTRUCTOR: 'Học viên <strong>{{student_name}}</strong> đã hoàn tất đăng ký lớp <strong>{{class_name}}</strong>.<br><br>Danh sách lớp đã được cập nhật trên Portal.',
  CLASS_ENROLLMENT_CANCELLED_STUDENT: 'Yêu cầu hủy đăng ký lớp <strong>{{class_name}}</strong> đã được ghi nhận.<br><br>Thông tin lớp đã được cập nhật trên tài khoản học viên.',
  CLASS_ENROLLMENT_CANCELLED_INSTRUCTOR: 'Học viên <strong>{{student_name}}</strong> đã hủy đăng ký lớp <strong>{{class_name}}</strong>.<br><br>Danh sách lớp đã được cập nhật.',
  CLASS_ENROLLMENT_CANCELLED_STAFF: 'Học viên <strong>{{student_name}}</strong> đã hủy lớp <strong>{{class_name}}</strong>.<br><br>Vui lòng kiểm tra các công việc liên quan đến hồ sơ và học phí.',
  TUITION_INVOICE_CREATED_STUDENT: 'Hóa đơn học phí của lớp <strong>{{class_name}}</strong> đã được tạo.<br><br>Vui lòng kiểm tra số tiền và trạng thái thanh toán bên dưới.',
  TUITION_INVOICE_CREATED_STAFF: 'Hóa đơn học phí cho học viên <strong>{{student_name}}</strong> đã được tạo.<br><br>Vui lòng kiểm tra số tiền còn lại và trạng thái hồ sơ.',
  TUITION_PAYMENT_RECEIVED_STUDENT: 'Khoản học phí <strong>{{paid_amount}}</strong> của lớp <strong>{{class_name}}</strong> đã được ghi nhận.<br><br>Phiếu thu và số tiền còn lại được hiển thị bên dưới.',
  TUITION_PAYMENT_RECEIVED_STAFF: 'Hệ thống đã ghi nhận <strong>{{paid_amount}}</strong> từ học viên <strong>{{student_name}}</strong>.<br><br>Vui lòng đối soát số tiền còn lại và hoàn tất hồ sơ.',
  DEAL_APPROVED_INTERNAL: 'Khách hàng <strong>{{customer_name}}</strong> đã xác nhận lựa chọn cho deal <strong>{{deal_title}}</strong>.<br><br>Vui lòng kiểm tra phương án đã chọn và triển khai bước tiếp theo.',
  CUSTOMER_PASSWORD_CHANGED: 'Mật khẩu Portal của Quý khách đã được thay đổi thành công vào <strong>{{changed_at}}</strong>.<br><br>Nếu đây không phải thao tác của Quý khách, vui lòng liên hệ bộ phận hỗ trợ ngay.',
  TRAINING_ENROLLMENT_CONFIRMATION: 'Bạn đã ghi danh thành công vào lớp <strong>{{class_name}}</strong> thuộc khóa <strong>{{course_name}}</strong>.<br><br>Vui lòng kiểm tra thông tin học phí và hoàn tất thanh toán nếu cần.',
  TRAINING_PAYMENT_CONFIRMED: 'Khoản học phí <strong>{{paid_amount}}</strong> cho lớp <strong>{{class_name}}</strong> đã được ghi nhận.<br><br>Tài khoản học của bạn đã được kích hoạt và sẵn sàng sử dụng.',
  TRAINING_INVOICE_REMINDER: 'Học phí của lớp <strong>{{class_name}}</strong> vẫn còn <strong>{{remaining_amount}}</strong> chưa thanh toán.<br><br>Nếu đã thanh toán, bạn có thể bỏ qua email này hoặc liên hệ chúng tôi để đối soát.',
  REMINDER_DEFAULT: 'Đây là lời nhắc về <strong>{{targetName}}</strong>.<br><br>Vui lòng kiểm tra thông tin và hoàn thành công việc đúng thời hạn.',
};

export function inferTemplateModule(template: Pick<EmailTemplateDesignInput, 'code' | 'name'>) {
  const source = `${template.code} ${template.name}`.toUpperCase();
  if (source.includes('QUOTATION') || source.includes('BÁO GIÁ')) return 'Quotation';
  if (source.includes('CONTRACT') || source.includes('HỢP ĐỒNG')) return 'Contract';
  if (source.includes('INVOICE') || source.includes('HÓA ĐƠN') || source.includes('HỌC PHÍ')) return 'Invoice';
  if (source.includes('PAYMENT') || source.includes('THANH TOÁN') || source.includes('PHIẾU THU')) return 'Payment';
  if (source.includes('DEAL')) return 'Deal';
  if (source.includes('STUDENT') || source.includes('HỌC VIÊN') || source.includes('CLASS') || source.includes('LỚP')) return 'Training';
  if (source.includes('PORTAL') || source.includes('ACCOUNT') || source.includes('TÀI KHOẢN')) return 'Account';
  return 'System';
}

const detailLabels: Record<string, string> = {
  customer_name: 'Khách hàng', student_name: 'Học viên', instructor_name: 'Giảng viên',
  quotation_number: 'Số báo giá', quotation_total: 'Giá trị báo giá', contract_subject: 'Hợp đồng',
  contract_value: 'Giá trị hợp đồng', invoice_number: 'Số hóa đơn', invoice_total: 'Tổng thanh toán',
  invoice_duedate: 'Hạn thanh toán', payment_amount: 'Số tiền', payment_transaction_id: 'Mã giao dịch',
  payment_date: 'Ngày thanh toán', document_date: 'Ngày lập', document_status: 'Trạng thái',
  student_code: 'Mã học viên', student_email: 'Email học viên', student_phone: 'Điện thoại',
  class_name: 'Lớp học', course_name: 'Khóa học', class_start_date: 'Ngày bắt đầu',
  tuition_fee: 'Học phí', paid_amount: 'Đã thanh toán', remaining_amount: 'Còn lại',
  login_email: 'Email đăng nhập', login_password: 'Mật khẩu tạm thời', portal_role: 'Vai trò',
  recipient_email_status: 'Trạng thái gửi', operator_name: 'Người thực hiện', deal_title: 'Deal',
  deal_total: 'Giá trị đã chọn',
};

const detailPriority = [
  'customer_name', 'student_name', 'instructor_name', 'quotation_number', 'contract_subject',
  'invoice_number', 'class_name', 'course_name', 'student_code', 'login_email', 'login_password',
  'document_date', 'class_start_date', 'invoice_duedate', 'quotation_total', 'contract_value',
  'invoice_total', 'tuition_fee', 'paid_amount', 'payment_amount', 'remaining_amount',
  'payment_transaction_id', 'payment_date', 'portal_role', 'operator_name', 'recipient_email_status',
  'deal_title', 'deal_total', 'document_status',
];

function getDetailsRows(module: string, variables: string[] = []) {
  const selected = detailPriority.filter((key) => variables.includes(key)).slice(0, 6);
  if (selected.length) {
    return selected.map((key) => `
      <tr>
        <td style="padding:7px 0;width:42%;color:#333333;font-size:14px;font-weight:400;">${detailLabels[key]}</td>
        <td style="padding:7px 0;text-align:right;color:#333333;font-size:14px;font-weight:500;">{{${key}}}</td>
      </tr>`).join('');
  }

  switch (module) {
    case 'Quotation': return `
      <tr><td style="padding:6px 0;width:42%;color:#333333;font-size:14px;font-weight:400;">Khách hàng</td><td style="padding:6px 0;text-align:right;color:#333333;font-size:14px;font-weight:400;">{{customer_name}}</td></tr>
      <tr><td style="padding:6px 0;color:#333333;font-size:14px;font-weight:400;">Số báo giá</td><td style="padding:6px 0;text-align:right;color:#333333;font-size:14px;font-weight:400;">{{quotation_number}}</td></tr>
      <tr><td style="padding:6px 0;color:#333333;font-size:14px;font-weight:400;">Ngày lập</td><td style="padding:6px 0;text-align:right;color:#333333;font-size:14px;font-weight:400;">{{document_date}}</td></tr>
      <tr><td style="padding:6px 0;color:#333333;font-size:14px;font-weight:400;">Giá trị báo giá</td><td style="padding:6px 0;text-align:right;color:#333333;font-size:14px;font-weight:400;">{{quotation_total}}</td></tr>
      <tr><td style="padding:6px 0;color:#333333;font-size:14px;font-weight:400;">Trạng thái</td><td style="padding:6px 0;text-align:right;color:#333333;font-size:14px;font-weight:400;">{{document_status}}</td></tr>`;
    case 'Contract': return `
      <tr><td style="padding:6px 0;width:42%;color:#666666;">Khách hàng</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{customer_name}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Hợp đồng</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{contract_subject}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Ngày lập</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{document_date}}</td></tr>
      <tr><td style="padding:8px 0;color:#666666;">Giá trị hợp đồng</td><td style="padding:8px 0;text-align:right;color:#171717;font-size:16px;font-weight:600;">{{contract_value}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Trạng thái</td><td style="padding:6px 0;text-align:right;"><span style="display:inline-block;background:#fafafa;color:#171717;border:1px solid #eaeaea;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:500;">{{document_status}}</span></td></tr>`;
    case 'Invoice': return `
      <tr><td style="padding:6px 0;width:42%;color:#666666;">Khách hàng</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{customer_name}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Số hóa đơn</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{invoice_number}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Ngày lập</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{document_date}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Hạn thanh toán</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{invoice_duedate}}</td></tr>
      <tr><td style="padding:8px 0;color:#666666;">Tổng thanh toán</td><td style="padding:8px 0;text-align:right;color:#171717;font-size:16px;font-weight:600;">{{invoice_total}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Trạng thái</td><td style="padding:6px 0;text-align:right;"><span style="display:inline-block;background:#fafafa;color:#171717;border:1px solid #eaeaea;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:500;">{{document_status}}</span></td></tr>`;
    case 'Payment': return `
      <tr><td style="padding:6px 0;width:42%;color:#666666;">Khách hàng</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{customer_name}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Mã giao dịch</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{payment_transaction_id}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Hóa đơn</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{invoice_number}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Ngày thanh toán</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{payment_date}}</td></tr>
      <tr><td style="padding:8px 0;color:#666666;">Số tiền</td><td style="padding:8px 0;text-align:right;color:#171717;font-size:16px;font-weight:600;">{{payment_amount}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Trạng thái</td><td style="padding:6px 0;text-align:right;"><span style="display:inline-block;background:#fafafa;color:#171717;border:1px solid #eaeaea;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:500;">Đã thanh toán</span></td></tr>`;
    case 'Deal': return `
      <tr><td style="padding:6px 0;width:42%;color:#666666;">Khách hàng</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{customer_name}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Deal</td><td style="padding:6px 0;text-align:right;color:#171717;font-weight:500;">{{deal_title}}</td></tr>
      <tr><td style="padding:8px 0;color:#666666;">Giá trị đã chọn</td><td style="padding:8px 0;text-align:right;color:#171717;font-size:16px;font-weight:600;">{{deal_total}}</td></tr>
      <tr><td style="padding:6px 0;color:#666666;">Trạng thái</td><td style="padding:6px 0;text-align:right;"><span style="display:inline-block;background:#fafafa;color:#171717;border:1px solid #eaeaea;border-radius:999px;padding:3px 8px;font-size:11px;font-weight:500;">Đã duyệt</span></td></tr>`;
    default: return '';
  }
}

function getDetailsTitle(module: string) {
  switch (module) {
    case 'Quotation': return 'Thông tin báo giá';
    case 'Contract': return 'Thông tin hợp đồng';
    case 'Invoice': return 'Thông tin hóa đơn';
    case 'Payment': return 'Thông tin phiếu thu';
    case 'Deal': return 'Thông tin deal';
    default: return 'Thông tin chi tiết';
  }
}

function getEyebrow(module: string) {
  switch (module) {
    case 'Quotation': return 'Thông báo báo giá';
    case 'Contract': return 'Thông báo hợp đồng';
    case 'Invoice': return 'Thông báo hóa đơn';
    case 'Payment': return 'Thông báo thanh toán';
    case 'Deal': return 'Thông báo deal';
    default: return 'Thông báo từ Ong Vàng';
  }
}

function getActionUrl(template: EmailTemplateDesignInput) {
  if (template.variables.includes('quotation_link')) return '{{quotation_link}}';
  if (template.variables.includes('contract_link')) return '{{contract_link}}';
  if (template.variables.includes('receipt_link')) return '{{receipt_link}}';
  if (template.variables.includes('invoice_link')) return '{{invoice_link}}';
  if (template.variables.includes('deal_link')) return '{{deal_link}}';
  if (template.variables.includes('portal_link')) return '{{portal_link}}';
  if (template.variables.includes('login_link')) return '{{login_link}}';
  if (template.variables.includes('portal_url')) return '{{portal_url}}';
  if (template.variables.includes('pay_link')) return '{{pay_link}}';
  if (template.variables.includes('action_url')) return '{{action_url}}';
  return '';
}

function getActionLabel(code: string) {
  if (code.includes('QUOTATION')) return 'Xem và xác nhận →';
  if (code.includes('CONTRACT')) return 'Xem hợp đồng';
  if (code.includes('INVOICE_PAID')) return 'Xem phiếu thu';
  if (code.includes('INVOICE')) return 'Xem hóa đơn';
  if (code.includes('DEAL')) return 'Xem deal';
  if (code.includes('ACCOUNT')) return 'Đăng nhập Portal';
  if (code.includes('CLASS') || code.includes('STUDENT') || code.includes('INSTRUCTOR')) return 'Mở Portal';
  if (code.includes('TUITION')) return code.includes('PAYMENT') ? 'Xem phiếu thu' : 'Xem học phí';
  return 'Xem chi tiết';
}

function getGreeting(template: EmailTemplateDesignInput) {
  if (template.code.includes('STAFF') || template.code.includes('INTERNAL')) return 'Xin chào đội ngũ,';
  const recipientVariable = ['customer_name', 'student_name', 'instructor_name']
    .find((key) => template.variables.includes(key));
  return recipientVariable
    ? `Xin chào <strong style="font-weight:600;">{{${recipientVariable}}}</strong>,`
    : 'Xin chào,';
}

export function buildTemplateHtml(t: EmailTemplateDesignInput) {
  const templateModule = t.module || inferTemplateModule(t);
  const isQuotation = templateModule === 'Quotation';
  const eyebrow = isQuotation ? 'Yêu cầu xác nhận' : getEyebrow(templateModule);
  const title = isQuotation ? 'Báo giá {{quotation_number}} đang chờ xác nhận' : t.name;
  const detailsTitle = getDetailsTitle(templateModule);
  const detailsRows = getDetailsRows(templateModule, t.variables);
  const bodyContent = t.body;
  const actionUrl = getActionUrl(t);
  const actionLabel = getActionLabel(t.code);
  const greeting = getGreeting(t);

  const preheader = isQuotation
    ? '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">Báo giá {{quotation_number}} trị giá {{quotation_total}} đang chờ Quý khách xem và xác nhận.</div>'
    : '';

  const detailsHtml = detailsRows ? `<div class="email-details-card" style="background:#f7f7f7;border:1px solid #e8e8e8;border-radius:10px;padding:20px 22px;margin-bottom:28px;">
    <h3 style="margin:0 0 12px 0;font-size:14px;font-weight:600;color:#333333;text-transform:uppercase;letter-spacing:0.8px;font-optical-sizing:auto;">${detailsTitle}</h3>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:400;border-collapse:collapse;">${detailsRows}</table>
  </div>` : '';
  const actionHtml = actionUrl ? `<div style="margin:28px 0 4px 0;text-align:center;">
    <a href="${actionUrl}" style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;background:#111111;color:#ffffff;padding:10px 16px;text-decoration:none;border:1px solid #111111;border-radius:6px;font-weight:500;display:inline-block;font-size:13px;line-height:20px;letter-spacing:-0.1px;">${actionLabel}</a>
  </div>
  <p style="margin:14px 0 0 0;font-size:12px;line-height:1.55;color:#737373;text-align:center;">
    Nếu nút không hoạt động, sao chép và mở liên kết này trong trình duyệt:<br>
    <a href="${actionUrl}" style="color:#525252;text-decoration:underline;font-weight:400;word-break:break-all;overflow-wrap:anywhere;">${actionUrl}</a>
  </p>` : '';

  return `${preheader}<div style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;font-optical-sizing:auto;font-synthesis:none;color:#1f1f1f;line-height:1.6;letter-spacing:-0.08px;">
  <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.4px;color:#a16207;margin-bottom:12px;">
    ${eyebrow}
  </div>
  <h2 style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',Arial,sans-serif;font-optical-sizing:auto;font-synthesis:none;font-size:28px;line-height:1.2;font-weight:600;margin:0 0 28px 0;letter-spacing:-0.5px;color:#111111;">
    ${title}
  </h2>

  <p style="margin:0 0 14px 0;font-size:14px;font-weight:400;line-height:1.5;color:#333333;font-optical-sizing:auto;">${greeting}</p>

  <div style="font-size:14px;font-weight:400;line-height:1.5;color:#333333;margin-bottom:26px;font-optical-sizing:auto;">
    ${bodyContent}
  </div>

  ${detailsHtml}

  ${actionHtml}
</div>`;
}

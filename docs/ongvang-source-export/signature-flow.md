# Luồng Ký Và Public Document

## Khái niệm

Source Laravel hiện có hai lớp ký:

1. Admin ký duyệt nội bộ trước khi gửi tài liệu.
2. Khách hàng ký/xác nhận tài liệu qua public link.

Tài liệu có public link:

- Báo giá
- Hợp đồng
- Hóa đơn
- Phiếu thu chỉ xem/tải, không ký

## Public link

Source:

- `app/Support/PublicDocumentLinks.php`
- `routes/web.php`

Mỗi tài liệu dùng `hash` UUID.

`PublicDocumentLinks::hash($record)`:

- Nếu record đã có `hash`, trả về hash hiện tại.
- Nếu chưa có, tạo UUID và save quietly.

Routes:

- `/view/quotation/{hash}`
- `/view/quotation/{hash}/sign`
- `/view/quotation/{hash}/pdf`
- `/view/contract/{hash}`
- `/view/contract/{hash}/sign`
- `/view/contract/{hash}/pdf`
- `/view/invoice/{hash}`
- `/view/invoice/{hash}/sign`
- `/view/invoice/{hash}/pdf`
- `/view/payment/{payment}`
- `/view/payment/{payment}/pdf`

## Admin ký duyệt

### Báo giá

Nguồn: `modules/Finance/Filament/Resources/Quotations/Pages/EditQuotation.php`

Action `adminSign`:

- Label:
  - Chưa ký: `Ký duyệt (Admin)`
  - Đã ký: `Đã Ký duyệt`
- Cập nhật:
  - `admin_signed_at = now()`
  - `status = sent`
- Sau đó gửi email báo giá nếu có email người nhận.

### Hợp đồng

Nguồn: `modules/Finance/Filament/Resources/Contracts/Pages/EditContract.php`

Action `adminSign`:

- Cập nhật:
  - `admin_signed_at = now()`
  - `admin_id` nếu thiếu
  - `status = sent` nếu đang draft
- Gửi email hợp đồng nếu customer có email.

### Hóa đơn

Nguồn: `modules/Finance/Filament/Resources/Invoices/Pages/EditInvoice.php`

Action `adminSign`:

- Cập nhật:
  - `admin_signed_at = now()`
  - `admin_id` nếu thiếu
- Gửi email hóa đơn cho khách bằng template `invoice_sign_request_sent`.

## Điều kiện gửi email

Các nút gửi thủ công bị disable nếu chưa admin ký duyệt:

- Báo giá: `disabled(fn ($record) => empty($record->admin_signed_at))`
- Hợp đồng: `disabled(fn ($record) => empty($record->admin_signed_at))`
- Hóa đơn: `disabled(fn ($record) => empty($record->admin_signed_at))`

Ý nghĩa:

- Tài liệu phải được duyệt nội bộ trước khi gửi khách.
- Admin approve là gate chính của workflow.

## Khách xem tài liệu

### Báo giá

Nguồn: `app/Http/Controllers/PublicQuotationController.php`

Khi `GET /view/quotation/{hash}`:

- Load quotation theo hash.
- Render HTML bằng `QuotationPdfService::renderHtml`.
- Nếu session chưa có `viewed_quotation_{hash}`:
  - Lưu session viewed.
  - Gửi notification cho admin.

### Hợp đồng

Nguồn: `app/Http/Controllers/PublicContractController.php`

Khi `GET /view/contract/{hash}`:

- Load contract theo hash.
- Render HTML bằng `ContractPdfService::renderHtml`.
- Gửi notification cho admin lần đầu trong session.

### Hóa đơn

Nguồn: `app/Http/Controllers/PublicInvoiceController.php`

Khi `GET /view/invoice/{hash}`:

- Load invoice theo hash.
- Render HTML bằng `InvoicePdfService::renderHtml`.
- Gửi notification cho admin lần đầu trong session.

## Khách ký tài liệu

### Báo giá

Route:

- `POST /view/quotation/{hash}/sign`

Validate:

- `signature` required string

Cập nhật:

- `signature`
- `signed_at = now()`
- `signed_ip = request IP`
- `signed_user_agent = request user agent`
- `status = accepted`

Sau ký:

- Notification admin: “Báo giá đã được ký”.
- Redirect back với success message.

### Hợp đồng

Route:

- `POST /view/contract/{hash}/sign`

Validate:

- `signature` required string

Cập nhật:

- `signature`
- `signed_at = now()`
- `signed_ip = request IP`

Sau ký:

- Nếu trước đó chưa ký, gọi `SignedDocumentMailService::contractSigned`.
- Notification admin: “Hợp đồng đã được ký”.
- Tự tạo hóa đơn nếu không có đợt thanh toán.
- Copy items/payment installments sang invoice nếu tạo mới.

### Hóa đơn

Route:

- `POST /view/invoice/{hash}/sign`

Validate:

- `signature` required string

Cập nhật:

- `signature`
- `signed_at = now()`
- `signed_ip = request IP`

Sau ký:

- Nếu trước đó chưa ký, gọi `SignedDocumentMailService::invoiceSigned`.
- Notification admin: “Hóa đơn đã được ký”.

## Xóa chữ ký

Admin có action `clearSignature`.

### Báo giá

Cập nhật:

- `signature = null`
- `signed_at = null`
- `signed_ip = null`
- `signed_user_agent = null`
- `status = draft`

### Hợp đồng

Cập nhật:

- `signature = null`
- `signed_at = null`
- `signed_ip = null`

Side effect:

- Xóa invoice tự động chưa thanh toán nếu invoice prefix `HD-`/`INV-`, number = contract id, status `unpaid`.

### Hóa đơn

Cập nhật:

- `signature = null`
- `signed_at = null`
- `signed_ip = null`

## PDF

Services:

- `app/Services/QuotationPdfService.php`
- `app/Services/ContractPdfService.php`
- `app/Services/InvoicePdfService.php`
- `app/Services/PaymentPdfService.php`

Views:

- `resources/views/pdf/quotation.blade.php`
- `resources/views/pdf/contract.blade.php`
- `resources/views/pdf/invoice.blade.php`
- `resources/views/pdf/payment.blade.php`

Controller methods:

- `show()` render HTML.
- `pdf()` render PDF and return download response.

## Rủi ro bảo mật hiện tại

- Public payment route dùng `{payment}` model binding theo ID, không hash/token.
- Notification ở public controllers gửi `User::all()`, chưa lọc admin phụ trách hoặc tenant.
- Public sign chỉ yêu cầu `signature` string, chưa có OTP/email confirmation.
- Chưa thấy expiry cho public hash.
- Chưa thấy audit log riêng cho signature ngoài IP/user agent.

## Gợi ý port sang Ong Vàng Workspace

Nên thiết kế:

- `publicToken`
- `publicTokenExpiresAt`
- `signatureImage` hoặc `signatureText`
- `signedAt`
- `signedIp`
- `signedUserAgent`
- `signedByName`
- `signedByEmail`
- `signatureAudit`
- `adminApprovedAt`
- `adminApprovedById`

Nên thêm:

- OTP hoặc email magic confirm cho tài liệu giá trị cao.
- Event log cho mọi lần view/sign/download.
- Token riêng cho payment receipt.
- Chỉ notify owner/admin/project manager trong cùng organization.

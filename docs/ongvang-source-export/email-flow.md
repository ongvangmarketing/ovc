# Luồng Email

## Thành phần chính

Source:

- `app/Services/EmailTemplateService.php`
- `app/Services/SignedDocumentMailService.php`
- `app/Support/MailOnce.php`
- `app/Models/EmailTemplate.php`
- `app/Models/EmailLog.php`
- `database/seeders/EmailTemplateSeeder.php`
- `app/Mail/QuotationMail.php`
- `app/Mail/ContractMail.php`
- `app/Mail/InvoiceMail.php`
- `app/Mail/PaymentMail.php`
- `app/Mail/SendQuotationMail.php`
- `app/Mail/SendContractMail.php`
- `app/Mail/SendInvoiceMail.php`
- `app/Mail/SendPaymentMail.php`

## EmailTemplateService

Service: `app/Services/EmailTemplateService.php`

Nhiệm vụ:

- Tìm template theo `key` và `status = published`.
- Rút biến từ model.
- Replace biến dạng `{variable}` trong subject/body.
- Trả về:
  - `subject`
  - `body`

Model hỗ trợ:

- `Quotation`
- `Contract`
- `Invoice`
- `Payment`
- `Customer`

Biến chuẩn hóa:

- `customer_name`
- `company_name`
- `document_label`
- `document_code`
- `document_total`
- `document_date`
- `document_status`
- `action_url`
- `action_label`

Biến riêng báo giá:

- `quotation_number`
- `quotation_total`
- `quotation_link`

Biến riêng hợp đồng:

- `contract_subject`
- `contract_value`
- `contract_link`

Biến riêng hóa đơn:

- `invoice_number`
- `invoice_total`
- `invoice_duedate`
- `invoice_link`

Biến riêng thanh toán:

- `payment_amount`
- `payment_date`
- `payment_transaction_id`
- `receipt_link`

## Template key tài chính

Từ `database/seeders/EmailTemplateSeeder.php`:

### Yêu cầu ký/xác nhận

- `quotation_sign_request_sent`
  - Gửi cho khách khi báo giá đã admin ký duyệt.
  - CTA: xem và ký báo giá.

- `contract_sign_request_sent`
  - Gửi cho khách khi hợp đồng đã admin ký duyệt.
  - CTA: xem và ký hợp đồng.

- `invoice_sign_request_sent`
  - Gửi cho khách khi hóa đơn đã admin ký duyệt.
  - CTA: xem và ký hóa đơn.

### Khách đã ký/xác nhận

- `quotation_accepted_customer`
  - Gửi khách sau khi báo giá được duyệt.

- `quotation_accepted_staff`
  - Gửi nội bộ sau khi khách duyệt báo giá.

- `contract_signed_customer`
  - Gửi khách sau khi hợp đồng được ký.

- `contract_signed_staff`
  - Gửi nội bộ sau khi khách ký hợp đồng.

- `invoice_signed_customer`
  - Gửi khách sau khi hóa đơn được ký.

- `invoice_signed_staff`
  - Gửi nội bộ sau khi khách ký hóa đơn.

### Thanh toán

- `invoice_paid_customer`
  - Gửi khách sau khi ghi nhận thanh toán.
  - Có link phiếu thu.

- `invoice_paid_staff`
  - Gửi nội bộ báo có tiền.

## Khi nào email được gửi?

### Báo giá

Nguồn: `modules/Finance/Filament/Resources/Quotations/Pages/EditQuotation.php`

Khi admin ký duyệt:

- Set `admin_signed_at`.
- Set `status = sent`.
- Parse template `quotation_sign_request_sent`.
- Gửi `QuotationMail`.

Khi admin bấm gửi thủ công:

- Form nhập email và message.
- Gửi `SendQuotationMail`.
- Set `status = sent`.

Khi khách ký:

- Hiện source chỉ notification admin.
- Nên gọi thêm `SignedDocumentMailService::quotationAccepted` khi port sang Workspace.

### Hợp đồng

Nguồn: `modules/Finance/Filament/Resources/Contracts/Pages/EditContract.php`

Khi admin ký duyệt:

- Set `admin_signed_at`.
- Nếu draft thì set `status = sent`.
- Gửi `SendContractMail` cho customer.

Khi admin gửi thủ công:

- Parse template `contract_sign_request_sent` để lấy body mặc định.
- Gửi `SendContractMail`.

Khi khách ký:

Nguồn: `app/Http/Controllers/PublicContractController.php`

- Nếu chưa từng ký, gọi `SignedDocumentMailService::contractSigned`.
- Service gửi:
  - `contract_signed_customer`
  - `contract_signed_staff`

### Hóa đơn

Nguồn: `modules/Finance/Filament/Resources/Invoices/Pages/EditInvoice.php`

Khi admin ký duyệt:

- Set `admin_signed_at`.
- Parse template `invoice_sign_request_sent`.
- Gửi `SendInvoiceMail`.
- Dùng `MailOnce` key `invoice:{id}:{email}:send-customer`.

Khi admin gửi thủ công:

- Gửi `SendInvoiceMail`.
- Dùng `MailOnce` với cùng logic chặn trùng.

Khi khách ký:

Nguồn: `app/Http/Controllers/PublicInvoiceController.php`

- Nếu chưa từng ký, gọi `SignedDocumentMailService::invoiceSigned`.
- Service gửi:
  - `invoice_signed_customer`
  - `invoice_signed_staff`

### Thanh toán

Nguồn:

- `modules/Finance/Filament/Resources/Invoices/Pages/EditInvoice.php`
- `modules/Finance/Filament/Resources/Payments/Pages/CreatePayment.php`
- `modules/Finance/Filament/Resources/Payments/Pages/EditPayment.php`

Khi ghi nhận thanh toán từ invoice:

- Gửi customer template `invoice_paid_customer`, nếu:
  - customer có email
  - customer không bật `suppress_automatic_emails`
- Gửi staff template `invoice_paid_staff` cho:
  - invoice admin
  - customer admin
  - project manager

Khi tạo payment trực tiếp:

- Nếu `send_email` true:
  - Gửi `PaymentMail`
  - Dùng `MailOnce` key `payment:{id}:{email}:send-customer`

Khi gửi lại phiếu thu thủ công:

- Gửi `PaymentMail`.
- Dùng `MailOnce` để chặn gửi trùng.

## Chống gửi trùng

Source: `app/Support/MailOnce.php`

Logic:

- Dùng cache key `mail-once:{sha1(key)}`.
- Nếu cache đang tồn tại, trả `false`, không gửi.
- Mặc định giữ key 20 giây.
- Nếu callback gửi mail lỗi, xóa cache để lần sau gửi lại được.

Nơi dùng:

- Invoice email.
- Payment email.

## Email Log

Source: `app/Models/EmailLog.php`

Field:

- `status`
- `mailer`
- `subject`
- `to`, `cc`, `bcc`
- `from_email`, `from_name`
- `message_id`
- `attachments_count`
- `template_key`
- `mailable`
- `related_type`, `related_id`
- `error_message`
- `meta`
- `sent_at`

Logic:

- `recordSent(MessageSent $event)` ghi log khi mail gửi thành công.
- Tự trích subject, recipients, sender, attachment count, mailable name, related model.

## Gợi ý port sang Ong Vàng Workspace

Data model cần có:

- `EmailTemplate`
- `EmailLog`
- `EmailDispatch`
- `Notification`

Service nên có:

- `parseTemplate(key, model, vars)`
- `sendDocumentEmail(type, model, recipient, templateKey)`
- `sendOnce(key, ttlSeconds)`

Luồng gửi nên gắn với event:

- `QuotationApproved`
- `QuotationSigned`
- `ContractApproved`
- `ContractSigned`
- `InvoiceApproved`
- `InvoiceSigned`
- `PaymentRecorded`

Nên lưu:

- `templateKey`
- recipient list
- related document
- mail provider response/message id
- attachment count
- error nếu fail

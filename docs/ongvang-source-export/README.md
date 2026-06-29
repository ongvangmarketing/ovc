# Ongvang.com.vn Source Export

Nguồn phân tích: `/Users/ONG VÀNG/AI Learning Lab/Website/ongvang.com.vn`.

Mục tiêu: rút module Tài chính, luồng workflow, luồng email và luồng ký từ source Laravel/Filament hiện tại để dùng làm blueprint nâng cấp `Ong Vàng Workspace`.

## Bộ tài liệu

- [finance-module.md](./finance-module.md): module Tài chính, entity, trạng thái, màn hình, action.
- [workflow-flow.md](./workflow-flow.md): luồng từ báo giá đến hợp đồng, hóa đơn, thanh toán.
- [email-flow.md](./email-flow.md): template, service gửi email, chống gửi trùng, log email.
- [signature-flow.md](./signature-flow.md): admin ký duyệt, khách ký public link, PDF, notification.

## Source chính đã đọc

- `modules/Finance/Filament/Resources/**`
- `app/Http/Controllers/PublicQuotationController.php`
- `app/Http/Controllers/PublicContractController.php`
- `app/Http/Controllers/PublicInvoiceController.php`
- `app/Http/Controllers/PublicPaymentController.php`
- `app/Services/EmailTemplateService.php`
- `app/Services/SignedDocumentMailService.php`
- `app/Support/PublicDocumentLinks.php`
- `app/Support/MailOnce.php`
- `database/seeders/EmailTemplateSeeder.php`
- `app/Models/Quotation.php`
- `app/Models/Contract.php`
- `app/Models/Invoice.php`
- `app/Models/Payment.php`

## Kết luận ngắn

Ongvang.com.vn đã có một module Finance khá đầy đủ theo chuỗi:

`Báo giá -> Hợp đồng -> Hóa đơn -> Thanh toán/Phiếu thu`

Điểm mạnh hiện tại:

- Có public link theo `hash` cho báo giá, hợp đồng, hóa đơn.
- Có PDF render/download cho báo giá, hợp đồng, hóa đơn, phiếu thu.
- Có admin ký duyệt trước khi gửi khách.
- Có khách ký xác nhận qua public document.
- Có email template động theo key và biến.
- Có email nội bộ sau khi khách ký hoặc thanh toán.
- Có chống gửi trùng email ngắn hạn bằng `MailOnce`.
- Có ghi log email bằng `EmailLog`.

Điểm cần cân nhắc khi port sang Next.js:

- Chuẩn hóa lại status enum vì source đang dùng chuỗi tự do như `draft`, `sent`, `accepted`, `unpaid`, `partially_paid`, `paid`, `cancelled`, `rejected`.
- Public signing cần hash/token riêng, không dùng ID tuần tự cho payment nếu cần bảo mật cao hơn.
- Notification hiện gửi cho `User::all()` ở public view/sign, nên khi sang multi-tenant cần lọc theo organization/admin/project manager.
- Nên giữ triết lý: admin duyệt trước, khách ký sau, hệ thống tự động báo email và tạo tài liệu kế tiếp.

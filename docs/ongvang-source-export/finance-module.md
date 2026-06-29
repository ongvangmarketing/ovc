# Module Tài Chính

## Phạm vi module

Module Finance trong source Laravel/Filament gồm:

- Báo giá: `Quotation`
- Hợp đồng: `Contract`
- Hóa đơn: `Invoice`
- Thanh toán/Phiếu thu: `Payment`
- Chi phí: `Expense`
- Học phí: `Tuition`
- Feedback tài chính
- Widget tổng quan tài chính

Source chính:

- `modules/Finance/Filament/Resources/Quotations`
- `modules/Finance/Filament/Resources/Contracts`
- `modules/Finance/Filament/Resources/Invoices`
- `modules/Finance/Filament/Resources/Payments`
- `modules/Finance/Filament/Widgets/FinanceOverview`
- `app/Models/Quotation.php`
- `app/Models/Contract.php`
- `app/Models/Invoice.php`
- `app/Models/Payment.php`

## Entity chính

### Quotation

Model: `app/Models/Quotation.php`

Field quan trọng:

- `prefix`, `number`: mã báo giá, ví dụ `BG-...`
- `customer_id`, `lead_id`, `project_id`
- `subject`, `date`, `open_till`
- `status`
- `discount_percent`, `discount_total`, `subtotal`, `total_tax`, `total`
- `currency`, `content`
- `hash`: public link token
- `signature`, `signed_at`, `signed_ip`, `signed_user_agent`
- `admin_signature`, `admin_signed_at`, `admin_id`

Quan hệ:

- `customer`
- `lead`
- `project`
- `items`

Logic:

- Tự tạo `hash` bằng UUID nếu chưa có.
- Tự tạo `number` bằng `DocumentCode::nextSplitNumber`.
- Tự gán `admin_id` từ customer, lead hoặc user đang đăng nhập.
- `updateTotals()` tính lại subtotal, tax, discount, total từ item.

### Contract

Model: `app/Models/Contract.php`

Field quan trọng:

- `subject`: chứa mã hợp đồng, ví dụ `HDDV-...`
- `customer_id`, `project_id`
- `contract_value`
- `datestart`, `dateend`
- `contract_type`
- `payment_channels`
- `content`
- `hash`
- `signature`, `signed_at`, `signed_ip`
- `admin_signature`, `admin_signed_at`, `admin_id`

Quan hệ:

- `customer`
- `project`
- `payments`
- `paymentInstallments`
- `items`

Logic:

- Tự tạo `hash`.
- Tự tạo mã hợp đồng bằng `Contract::nextCode()`.
- `document_code` parse từ `subject`.
- Có kế hoạch thanh toán nhiều đợt qua `paymentInstallments`.

### Invoice

Model: `app/Models/Invoice.php`

Field quan trọng:

- `prefix`, mặc định `HD-`
- `number`
- `customer_id`, `project_id`, `admin_id`
- `date`, `duedate`
- `subtotal`, `total_tax`, `total`, `amount_paid`
- `status`
- `payment_channels`
- `hash`
- `signature`, `signed_at`, `signed_ip`
- `admin_signed_at`
- `clientnote`

Quan hệ:

- `customer`
- `project`
- `payments`
- `items`
- `paymentInstallments`

Logic:

- Tự tạo `hash`.
- Nếu prefix cũ `INV-`, đổi về `HD-`.
- Tự tạo `number` theo prefix.
- Tự gán `admin_id`.

### Payment

Model: `app/Models/Payment.php`

Field quan trọng:

- `invoice_id`
- `amount`
- `paymentmode`
- `date`
- `transactionid`
- `note`

Quan hệ:

- `invoice`

Logic:

- Tự tạo `transactionid` bằng `Payment::nextTransactionId()`, prefix `PT`.
- Sau khi payment được lưu/xóa, gọi `updateInvoiceStatus()`.
- Invoice status được tính:
  - `unpaid`: chưa thanh toán
  - `partially_paid`: đã thanh toán một phần
  - `paid`: đã thanh toán đủ
- Với hóa đơn học phí prefix `HP`/`HPT`, sync ngược qua DB `education.class_student`.

## Filament Resources

### Báo giá

Resource:

- `modules/Finance/Filament/Resources/Quotations/QuotationResource.php`
- `.../Pages/CreateQuotation.php`
- `.../Pages/EditQuotation.php`
- `.../Schemas/QuotationForm.php`
- `.../Tables/QuotationsTable.php`

Action chính trong edit:

- Copy public link
- Gửi báo giá
- Xem PDF
- Xóa chữ ký
- Tạo hóa đơn
- Tạo hợp đồng
- Đánh dấu đã hủy
- Xem hóa đơn đã tạo
- Xem hợp đồng đã tạo
- Admin ký duyệt

### Hợp đồng

Resource:

- `modules/Finance/Filament/Resources/Contracts/ContractResource.php`
- `.../Pages/CreateContract.php`
- `.../Pages/EditContract.php`
- `.../Schemas/ContractForm.php`
- `.../Tables/ContractsTable.php`

Action chính:

- Quay lại báo giá nguồn
- Xem hóa đơn liên quan
- Admin ký duyệt
- Copy public link
- Gửi hợp đồng
- Xem PDF
- Xóa chữ ký
- Tạo hóa đơn
- Đánh dấu đã hủy

Đặc biệt:

- Sau khi save, `balanceFinalInstallment()` tự cân lại đợt thanh toán cuối theo tổng hợp đồng.
- Nếu invoice của đợt cuối chưa paid, cập nhật lại số tiền invoice/item tương ứng.

### Hóa đơn

Resource:

- `modules/Finance/Filament/Resources/Invoices/InvoiceResource.php`
- `.../Pages/CreateInvoice.php`
- `.../Pages/EditInvoice.php`
- `.../Pages/FinanceOverview.php`
- `.../RelationManagers/PaymentsRelationManager.php`
- `.../Schemas/InvoiceForm.php`
- `.../Tables/InvoicesTable.php`

Action chính:

- Quay lại báo giá/hợp đồng nguồn
- Đi tới payment liên quan
- Admin ký duyệt
- Copy public link
- Gửi hóa đơn
- Xem PDF
- Xóa chữ ký
- Ghi nhận thanh toán
- Đánh dấu đã hủy

### Thanh toán

Resource:

- `modules/Finance/Filament/Resources/Payments/PaymentResource.php`
- `.../Pages/CreatePayment.php`
- `.../Pages/EditPayment.php`
- `.../Tables/PaymentsTable.php`
- `.../Schemas/PaymentForm.php`

Action chính:

- Copy link phiếu thu
- Xem public link
- Gửi phiếu thu
- Tải PDF

Khi tạo payment:

- Có flag `send_email`.
- Nếu bật và customer có email, gửi email xác nhận thanh toán bằng template `invoice_paid_customer`.
- Dùng `MailOnce` để chặn gửi trùng.

## Public Routes

Trong `routes/web.php`:

- `GET /view/quotation/{hash}` -> xem báo giá
- `POST /view/quotation/{hash}/sign` -> khách ký báo giá
- `GET /view/quotation/{hash}/pdf` -> tải PDF báo giá
- `GET /view/contract/{hash}` -> xem hợp đồng
- `POST /view/contract/{hash}/sign` -> khách ký hợp đồng
- `GET /view/contract/{hash}/pdf` -> tải PDF hợp đồng
- `GET /view/invoice/{hash}` -> xem hóa đơn
- `POST /view/invoice/{hash}/sign` -> khách ký hóa đơn
- `GET /view/invoice/{hash}/pdf` -> tải PDF hóa đơn
- `GET /view/payment/{payment}` -> xem phiếu thu
- `GET /view/payment/{payment}/pdf` -> tải PDF phiếu thu

## Trạng thái đang dùng

Quotation:

- `draft`
- `sent`
- `accepted`
- `rejected`
- có nơi dùng `declined`, `expired`, `canceled` theo template/comment

Contract:

- `draft`
- `sent`
- `rejected`
- `signed`/`active` được map trong email label

Invoice:

- `unpaid`
- `partially_paid`
- `paid`
- `overdue`
- `cancelled`

Payment:

- Không thấy enum status riêng trong model hiện tại; payment tồn tại là giao dịch đã ghi nhận.

## Gợi ý port sang Ong Vàng Workspace

- Dùng enum Prisma rõ ràng cho từng document.
- Giữ 4 entity lõi: quotation, contract, invoice, payment.
- Dùng `publicToken` thay `hash`.
- Payment public link nên dùng token/hash thay vì ID tuần tự.
- Tách `DocumentItem` chung hoặc giữ item riêng theo từng document nếu cần snapshot pháp lý.
- Tách `DocumentSignature` nếu muốn lưu nhiều lần ký/nhiều bên ký.

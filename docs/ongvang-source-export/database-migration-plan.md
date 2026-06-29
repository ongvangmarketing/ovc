# Database Migration Plan

Mục tiêu: dùng dữ liệu/logic nghiệp vụ từ `ongvang.com.vn` cũ để nuôi backend mới `Ong Vàng Workspace`, nhưng không clone nguyên công nghệ cũ.

## Khác biệt công nghệ

| Phần | Ongvang.com.vn cũ | Ong Vàng Workspace mới |
| --- | --- | --- |
| App | Laravel/PHP + Filament | Next.js/React + Server Actions |
| Database | MySQL, nhiều connection/module | PostgreSQL, Prisma schema thống nhất |
| Auth | Laravel users/Filament | Better Auth + role + organization |
| Module split | `crm`, `education`, `business`, `perfex` | `organizationId` multi-tenant trong một schema |
| Email | Laravel Mail/Mailable/Blade | Resend/SMTP-compatible service sau này |
| Document | Blade + PDF service | React A4 preview + print/PDF route |

## Biến môi trường legacy

Đã thêm vào `.env.example`:

- `LEGACY_DB_HOST`
- `LEGACY_DB_PORT`
- `LEGACY_DB_USER`
- `LEGACY_DB_PASSWORD`
- `LEGACY_DB_SOCKET`
- `LEGACY_DB_CRM_DATABASE`
- `LEGACY_DB_EDUCATION_DATABASE`
- `LEGACY_DB_BUSINESS_DATABASE`
- `LEGACY_DB_PERFEX_DATABASE`
- `LEGACY_IMPORT_ORGANIZATION_SLUG`
- `LEGACY_IMPORT_OWNER_EMAIL`
- `LEGACY_IMPORT_DRY_RUN`
- `LEGACY_IMPORT_WIPE_TARGET`

Nguyên tắc:

- Không commit mật khẩu thật.
- Import mặc định là dry-run.
- Chỉ xóa dữ liệu target khi bật rõ `LEGACY_IMPORT_DRY_RUN=false` và `LEGACY_IMPORT_WIPE_TARGET=true`.

## Mapping dữ liệu cũ -> mới

### CRM

| MySQL cũ | Prisma mới | Ghi chú |
| --- | --- | --- |
| `customers.company` | `Company.name` | Tạo company nếu có tên công ty |
| `customers.name/contact_person` | `Contact.firstName/lastName` | Tách tên đơn giản |
| `customers.email` | `Contact.email`, `Company.email` | Nếu company tồn tại thì copy email vào company |
| `customers.phone` | `Contact.phone`, `Company.phone` |  |
| `customers.address` | `Contact.address`, `Company.address` |  |
| `customers.customer_type` | `Contact.type` | business -> CUSTOMER, còn lại -> PROSPECT |
| `customers.lead_source` | `Contact.source` |  |
| `customers.notes` | `Contact.notes` |  |
| legacy id | `customFields.legacyId` | Giữ trace để đối soát |

### Projects

| MySQL cũ | Prisma mới | Ghi chú |
| --- | --- | --- |
| `projects.name` | `Project.name` |  |
| `projects.customer_id` | `Project.contactId` | Qua map customer -> contact |
| `projects.project_manager_id` | `customFields.projectManagerId` | Chưa map user cũ |
| `projects.start_date` | `Project.startDate` |  |
| `projects.deadline` | `Project.dueDate` |  |
| `projects.contract_value` | `Project.budget` |  |
| `projects.status` | `Project.status` | planning/active/hold/completed/cancelled |
| domain/hosting/renewal fields | `Project.customFields` | Giữ nguyên thông tin vận hành |

### Finance: Báo giá

| MySQL cũ | Prisma mới |
| --- | --- |
| `quotations.hash` | `Quotation.token` |
| `quotations.prefix + number` hoặc `code` | `Quotation.number` |
| `quotations.subject` | `Quotation.title` |
| `quotations.customer_id` | `Quotation.contactId` |
| `quotations.status` | `Quotation.status` |
| `quotations.subtotal/total_amount` | `Quotation.subtotal` |
| `quotations.total_tax/tax_amount` | `Quotation.tax` |
| `quotations.discount_total/discount_amount` | `Quotation.discount` |
| `quotations.total/grand_total` | `Quotation.total` |
| `quotations.open_till/valid_until` | `Quotation.validUntil` |
| `quotations.admin_signed_at` | `Quotation.adminSignedAt` |
| `quotations.signed_at` | `Quotation.signedAt`, `acceptedAt` |
| `quotation_items` | `QuotationItem` |

### Finance: Hợp đồng

| MySQL cũ | Prisma mới |
| --- | --- |
| `contracts.hash` | `Contract.token` |
| `contracts.subject/code` | `Contract.number`, `Contract.title` |
| `contracts.customer_id` | `Contract.contactId` |
| `contracts.status/signed_at` | `Contract.status` |
| `contracts.contract_value/value` | `Contract.total` |
| `contracts.datestart/start_date` | `Contract.validFrom` |
| `contracts.dateend/end_date` | `Contract.validUntil` |
| `contracts.admin_signed_at` | `Contract.adminSignedAt` |
| `contracts.signed_at` | `Contract.signedAt` |
| `contract_items` | `ContractItem` |
| `payment_installments` | `PaymentInstallment` |

### Finance: Hóa đơn

| MySQL cũ | Prisma mới |
| --- | --- |
| `invoices.hash` | `Invoice.token` |
| `invoices.prefix + number` | `Invoice.number` |
| `invoices.customer_id` | `Invoice.contactId` |
| `invoices.project_id` | `Invoice.projectId` |
| `invoices.status` | `Invoice.status` |
| `invoices.subtotal` | `Invoice.subtotal` |
| `invoices.total_tax` | `Invoice.tax` |
| `invoices.discount_total` | `Invoice.discount` |
| `invoices.total` | `Invoice.total` |
| `invoices.amount_paid` | `Invoice.amountPaid` |
| derived | `Invoice.amountDue` |
| `invoices.date` | `Invoice.issuedAt` |
| `invoices.duedate` | `Invoice.dueDate` |
| `invoice_items` | `InvoiceItem` |

### Finance: Thanh toán

| MySQL cũ | Prisma mới |
| --- | --- |
| `payments.invoice_id` | `Payment.invoiceId` |
| `payments.amount` | `Payment.amount` |
| `payments.paymentmode` | `Payment.method` |
| `payments.transactionid` | `Payment.reference` |
| `payments.note` | `Payment.notes` |
| `payments.date` | `Payment.paidAt` |

### Email templates

| MySQL cũ | Prisma mới |
| --- | --- |
| `email_templates.key` | `EmailTemplate.code` |
| `email_templates.name` | `EmailTemplate.name` |
| `email_templates.subject` | `EmailTemplate.subject` |
| `email_templates.html_body` | `EmailTemplate.body` |
| variables in `{var}` | `EmailTemplate.variables` |
| `email_templates.status` | `EmailTemplate.isActive` |

## Script import

File:

- `scripts/migrate-data.ts`

Trạng thái chạy gần nhất:

- Thời điểm: 2026-06-28
- Target organization: `ong-vang`
- Mode: `IMPORT`
- Status: `COMPLETED`
- Source CRM DB: `ongvang_crm`
- Source app DB: `ongvang_company`

Kết quả đã import vào Postgres/Prisma mới:

| Nhóm | Số lượng |
| --- | ---: |
| Companies | 211 |
| Contacts | 213 |
| Projects | 22 |
| Quotations | 251 |
| Quotation items | 450 |
| Contracts | 4 |
| Contract items | 2 |
| Payment installments | 3 |
| Invoices | 413 |
| Invoice items | 718 |
| Payments | 420 |
| Email templates import từ legacy | 27 |

Sau import, database mới đang có 30 email templates tổng cộng vì trước đó đã có 3 template seed/demo.

Chạy dry-run:

```bash
npx tsx scripts/migrate-data.ts
```

Chạy import thật:

```bash
LEGACY_IMPORT_DRY_RUN=false npx tsx scripts/migrate-data.ts
```

Chạy import thật và xóa dữ liệu target của organization trước:

```bash
LEGACY_IMPORT_DRY_RUN=false LEGACY_IMPORT_WIPE_TARGET=true npx tsx scripts/migrate-data.ts
```

Lưu ý: lệnh trên sẽ xóa dữ liệu CRM/Project/Finance của organization target trước khi import lại, nhưng không xóa users, organization, settings.

## Thứ tự import

1. Customers -> Company/Contact
2. Projects
3. Quotations + items
4. Contracts + items + installments
5. Invoices + items
6. Payments
7. Email templates

## Việc còn lại trước production

- Thêm map user cũ -> user mới nếu cần giữ người phụ trách.
- Thêm import `leads`, `opportunities/deals`, `project_tasks`.
- Chuẩn hóa payment public token thay vì ID.
- Thêm audit event cho view/sign/download.
- Thay email mock bằng service thật và ghi `EmailLog`.

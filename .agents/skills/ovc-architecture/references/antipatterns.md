# OVC Anti-Patterns — Danh sách vi phạm phổ biến và cách xử lý

## 🔴 CRITICAL: Vi phạm ngay lập tức phải báo cáo

### Anti-pattern #1: Import DB trực tiếp trong App layer

```typescript
// ❌ VI PHẠM NGHIÊM TRỌNG
// src/app/(workspace)/workspace/crm/contacts/page.tsx
import { db } from "@/lib/prisma";  // ← CẤM TUYỆT ĐỐI

export default async function ContactsPage() {
  const contacts = await db.contact.findMany(); // ← CẤM
}

// ✅ CHUẨN
import { ContactService } from "@/modules/crm/services/contact.service";

export default async function ContactsPage() {
  const contacts = await ContactService.getContacts(auth.organizationId!);
}
```

---

### Anti-pattern #2: Tạo thư mục ngoài 5 Clean Architecture folders

```
// ❌ VI PHẠM
src/modules/crm/
├── helpers/          ← KHÔNG ĐƯỢC TẠO
├── utils/            ← KHÔNG ĐƯỢC TẠO
├── hooks/            ← KHÔNG ĐƯỢC TẠO
├── constants/        ← KHÔNG ĐƯỢC TẠO
└── config/           ← KHÔNG ĐƯỢC TẠO

// ✅ CHUẨN — đặt vào đúng folder
src/modules/crm/
├── services/
│   └── contact.service.ts   ← helper logic ở đây
├── types/
│   └── crm.types.ts         ← constants, types ở đây
└── components/
    └── contact-form.tsx     ← hooks, utils UI ở đây
```

---

### Anti-pattern #3: Tạo file ngoài Route Groups trong src/app

```
// ❌ VI PHẠM
src/app/
├── dashboard/          ← TẠO TỰ DO — CẤM
│   └── page.tsx
├── profile/            ← TẠO TỰ DO — CẤM
└── settings/           ← TẠO TỰ DO — CẤM

// ✅ CHUẨN
src/app/
├── (workspace)/
│   └── workspace/
│       ├── dashboard/  ← ĐẶT ĐÚNG CHỖ
│       └── settings/
├── (portals)/
│   └── customer/
│       └── profile/    ← ĐẶT ĐÚNG CHỖ
```

---

### Anti-pattern #4: Logic nghiệp vụ trong Page/Action

```typescript
// ❌ VI PHẠM — Business logic trong action
"use server";
export async function createOrderAction(formData: FormData) {
  const auth = await requireAuth();
  const db = getTenantDb(auth.organizationId!);

  // ← ĐÂY LÀ BUSINESS LOGIC, PHẢI ĐẶT TRONG SERVICE
  const existingOrders = await db.order.count({
    where: { customerId: formData.get("customerId") as string }
  });
  if (existingOrders > 10) throw new Error("Khách hàng đạt giới hạn đơn hàng");

  const discountRate = existingOrders > 5 ? 0.1 : 0;
  const total = Number(formData.get("amount")) * (1 - discountRate);

  await db.order.create({ data: { total, ... } });
}

// ✅ CHUẨN — Action chỉ là thin wrapper
"use server";
export async function createOrderAction(formData: FormData) {
  const auth = await requireAuth();
  await OrderService.createOrder(auth.organizationId!, {
    customerId: formData.get("customerId") as string,
    amount: Number(formData.get("amount")),
  });
  revalidatePath("/workspace/crm/orders");
}
```

---

### Anti-pattern #5: Cross-module DB access

```typescript
// ❌ VI PHẠM — Module Finance truy cập DB của CRM trực tiếp
// src/modules/finance/services/invoice.service.ts
import { CRMRepository } from "@/modules/crm/repositories/contact.repository"; // ← CẤM cross-module repo

// ✅ CHUẨN — Giao tiếp qua Public Service
// src/modules/finance/services/invoice.service.ts
import { ContactService } from "@/modules/crm/services/contact.service"; // ← OK — Public Service
const contact = await ContactService.getContactById(organizationId, contactId);
```

---

### Anti-pattern #6: Bỏ qua organizationId trong query

```typescript
// ❌ VI PHẠM — Query không có organizationId filter
const contacts = await db.contact.findMany(); // ← Lấy tất cả của mọi org!

// ✅ CHUẨN — Luôn filter theo organizationId
const contacts = await db.contact.findMany({
  where: { organizationId }, // ← BẮT BUỘC
});

// ✅ CHUẨN HƠN — Dùng getTenantDb với extension tự động inject
const tenantDb = getTenantDb(organizationId);
const contacts = await tenantDb.contact.findMany(); // Extension tự inject organizationId
```

---

### Anti-pattern #7: Thêm Sidebar/Nav cho module chưa Published

```typescript
// ❌ VI PHẠM — Module mới ở trạng thái Development
// src/components/layout/sidebar.tsx
const navItems = [
  { href: "/workspace/crm", label: "CRM" },
  { href: "/workspace/training", label: "Training" },
  { href: "/workspace/new-feature", label: "Tính năng mới" }, // ← CẤM nếu chưa Published
];

// ✅ CHUẨN — Module mới phát triển âm thầm, không thêm vào Nav
// Code vẫn được viết đầy đủ, chỉ không hiển thị
```

---

### Anti-pattern #8: Tạo component trùng lặp

```typescript
// ❌ VI PHẠM — Tạo component giống nhau ở nhiều module
// src/modules/crm/components/delete-modal.tsx  — đã có
// src/modules/finance/components/delete-modal.tsx  — TRÙNG LẶP
// src/modules/training/components/confirm-dialog.tsx — TRÙNG LẶP

// ✅ CHUẨN — Dùng shared component
// src/components/ui/confirm-dialog.tsx  ← 1 component dùng chung cho tất cả
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
```

---

### Anti-pattern #9: Không có TypeScript strict types

```typescript
// ❌ VI PHẠM — Dùng any bừa bãi
async function processData(data: any) {
  return data.map((item: any) => item.value);
}

// ✅ CHUẨN — Định nghĩa type rõ ràng
interface ProcessableItem {
  value: string;
  id: string;
}

async function processData(data: ProcessableItem[]) {
  return data.map((item) => item.value);
}
```

---

### Anti-pattern #10: Server Action không có error handling

```typescript
// ❌ VI PHẠM — Không xử lý lỗi
export async function deleteContactAction(id: string) {
  const auth = await requireAuth();
  await ContactService.deleteContact(auth.organizationId!, id);
  revalidatePath("/workspace/crm");
}

// ✅ CHUẨN — Wrap trong try/catch, return error state
export async function deleteContactAction(id: string) {
  try {
    const auth = await requireAuth();
    await ContactService.deleteContact(auth.organizationId!, id);
    revalidatePath("/workspace/crm");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteContactAction]", error);
    return { success: false, error: error.message };
  }
}
```

# OVC Code Examples — Ví dụ code chuẩn cho từng layer

## 1. Repository Layer

Repository chỉ có 1 trách nhiệm: **Giao tiếp với Database**.

```typescript
// src/modules/crm/repositories/contact.repository.ts

import { getTenantDb } from "@/lib/db";

export class ContactRepository {
  // Luôn nhận organizationId như tham số đầu tiên
  static async findMany(organizationId: string) {
    const db = getTenantDb(organizationId);
    return db.contact.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(organizationId: string, id: string) {
    const db = getTenantDb(organizationId);
    return db.contact.findFirst({
      where: { id, organizationId },
    });
  }

  static async create(organizationId: string, data: Omit<ContactCreateInput, "organizationId">) {
    const db = getTenantDb(organizationId);
    return db.contact.create({
      data: { ...data, organizationId },
    });
  }

  static async update(organizationId: string, id: string, data: Partial<ContactUpdateInput>) {
    const db = getTenantDb(organizationId);
    return db.contact.update({
      where: { id, organizationId },
      data,
    });
  }

  static async delete(organizationId: string, id: string) {
    const db = getTenantDb(organizationId);
    return db.contact.delete({
      where: { id, organizationId },
    });
  }
}
```

---

## 2. Service Layer

Service xử lý **logic nghiệp vụ**, gọi Repository, gọi Service khác (qua Public API).

```typescript
// src/modules/crm/services/contact.service.ts

import { ContactRepository } from "@/modules/crm/repositories/contact.repository";
// ✅ Giao tiếp với module khác qua Public Service
import { FinanceService } from "@/modules/finance/services/finance.service";

export class ContactService {
  static async getContacts(organizationId: string) {
    // Validation
    if (!organizationId) throw new Error("organizationId is required");
    
    return ContactRepository.findMany(organizationId);
  }

  static async createContact(organizationId: string, userId: string, data: ContactCreateInput) {
    // Business validation
    if (!data.email && !data.phone) {
      throw new Error("Phải có ít nhất email hoặc số điện thoại");
    }

    const contact = await ContactRepository.create(organizationId, {
      ...data,
      createdBy: userId,
    });

    // Giao tiếp với module Finance qua Service (không qua Repository)
    await FinanceService.syncContactCredit(organizationId, contact.id);

    return contact;
  }
}
```

---

## 3. Actions Layer

Actions là **thin wrapper** giữa Next.js và Service. Không chứa logic nghiệp vụ.

```typescript
// src/modules/crm/actions/crm.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { ContactService } from "@/modules/crm/services/contact.service";

export async function createContactAction(formData: FormData) {
  // 1. Xác thực người dùng
  const auth = await requireAuth();

  // 2. Parse input (thin — không validate logic)
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim() || undefined;
  const phone = String(formData.get("phone") || "").trim() || undefined;

  // 3. Delegate TOÀN BỘ logic xuống Service
  await ContactService.createContact(auth.organizationId!, auth.userId, {
    name, email, phone,
  });

  // 4. Revalidate cache
  revalidatePath("/workspace/crm/contacts");
}
```

---

## 4. Page Layer (Thin Router — src/app)

Page chỉ **fetch data và render UI**. Không có logic nghiệp vụ.

```typescript
// src/app/(workspace)/workspace/crm/contacts/page.tsx

import { requireAuth } from "@/lib/auth/require-auth";
import { ContactService } from "@/modules/crm/services/contact.service";
import { ContactsTable } from "@/modules/crm/components/contacts-table";
import { createContactAction } from "@/modules/crm/actions/crm.actions";

export default async function ContactsPage() {
  // 1. Auth — bắt buộc là dòng đầu tiên
  const auth = await requireAuth();

  // 2. Fetch data — CHỈ được gọi Service, không gọi getTenantDb trực tiếp
  const contacts = await ContactService.getContacts(auth.organizationId!);

  // 3. Render UI
  return (
    <div>
      <ContactsTable contacts={contacts} onCreateAction={createContactAction} />
    </div>
  );
}
```

---

## 5. Component Layer (trong module)

Components trong `modules/<module>/components/` chỉ dùng cho module đó.

```typescript
// src/modules/crm/components/contact-form.tsx
"use client";

import { useTransition } from "react";
import { createContactAction } from "@/modules/crm/actions/crm.actions";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createContactAction(formData);
    });
  }

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Đang tạo..." : "Tạo liên hệ"}
      </button>
    </form>
  );
}
```

---

## 6. Types Layer

```typescript
// src/modules/crm/types/crm.types.ts

export interface ContactCreateInput {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  note?: string;
}

export interface ContactUpdateInput extends Partial<ContactCreateInput> {
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

// ✅ Sử dụng Prisma types khi cần type chính xác từ DB
export type ContactRow = Awaited<ReturnType<typeof ContactRepository.findById>>;
```

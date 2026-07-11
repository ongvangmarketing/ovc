---
name: ovc-architecture
description: >
  MANDATORY PRE-FLIGHT CHECK — BẮT BUỘC ĐỌC TRƯỚC KHI VIẾT BẤT KỲ DÒNG CODE NÀO trong dự án OVC Workspace.
  Skill này định nghĩa toàn bộ kiến trúc chuẩn, cấu trúc thư mục, luật đặt file, luật giao tiếp Module,
  luật Database, luật UI và checklist xác nhận bắt buộc trước khi kết thúc mỗi tác vụ.
  Trigger ngay lập tức khi: tạo file mới, tạo module mới, tạo route mới, tạo component mới, tạo service mới,
  tạo action mới, tạo repository mới, hoặc bất kỳ thay đổi nào liên quan đến cấu trúc thư mục.
---

# 🏛️ OVC Architecture Master Rulebook

> **LỜI CAM KẾT**: Bằng việc đọc Skill này, Agent cam kết sẽ tuyệt đối không tạo ra code rác, thư mục rác,
> data rác, hoặc bất kỳ cấu trúc nào đi ngược lại với quy định dưới đây. Mọi vi phạm phải bị phát hiện
> và báo cáo với người dùng **TRƯỚC KHI THỰC HIỆN**, không phải sau.

---

## ⛔ BƯỚC 0: PRE-FLIGHT CHECKLIST (Bắt buộc thực hiện trước khi viết bất kỳ dòng code nào)

Trả lời 5 câu hỏi sau. Nếu bất kỳ câu nào trả lời **KHÔNG** — DỪNG LẠI và báo cáo người dùng:

```
[ ] 1. File này có thuộc đúng Route Group trong src/app KHÔNG?
[ ] 2. Module này có nằm trong src/modules/<tên-module>/ KHÔNG?
[ ] 3. Tôi có đang sử dụng đúng 1 trong 5 Clean Architecture folders KHÔNG?
[ ] 4. Tôi có đang gọi DB trực tiếp từ src/app (vi phạm Thin Router) KHÔNG?
[ ] 5. Tôi có đang tạo code trùng lặp với Service/Component/Util đã tồn tại KHÔNG?
```

---

## 📁 PHẦN 1: Kiến trúc Giao diện (`src/app`)

Thư mục `src/app` được quản lý bởi Next.js App Router. **Tuyệt đối cấm** tạo thư mục tự do ở cấp 1.

### 6 Route Groups hợp lệ duy nhất:

| Route Group | Mục đích | Ví dụ |
|---|---|---|
| `(admin)` | Quản trị cấp cao hệ thống | `/admin`, `/super-admin` |
| `(auth)` | Xác thực người dùng | `/login`, `/register`, `/forgot-password` |
| `(frontend)` | Giao diện web công khai | `/booking`, `/tralist`, `/ongvang`, `/sites` |
| `(portals)` | Cổng thông tin người dùng có tài khoản | `/student`, `/customer`, `/agent`, `/instructor` |
| `(tools)` | Công cụ độc lập, tiện ích | `/builder`, `/embed`, `/share`, `/document`, `/uploads` |
| `(workspace)` | Giao diện quản lý doanh nghiệp | `/workspace`, `/[orgSlug]` |

**Ngoại lệ duy nhất:** Thư mục `api/` được phép nằm ngoài Route Groups.

### Luật Thin Router (BẮT BUỘC):

```
src/app/(workspace)/workspace/crm/contacts/page.tsx  ✅ CHỈ được làm:
  - Gọi requireAuth()
  - Gọi Service/Repository để lấy data
  - Trả về JSX

src/app/(workspace)/workspace/crm/contacts/page.tsx  ❌ NGHIÊM CẤM:
  - import { db } từ prisma
  - Viết logic nghiệp vụ (tính toán, validation phức tạp)
  - Gọi trực tiếp getTenantDb() để query DB
  - Tạo hàm helper không thuộc về UI layer
```

**Nơi đặt Server Actions:**
- `src/modules/<module>/actions/<feature>.actions.ts` → **CHUẨN**
- `src/app/(any)/any/actions.ts` → Chỉ cho phép các thin wrapper gọi lại module actions

---

## 🧩 PHẦN 2: Kiến trúc Nghiệp vụ (`src/modules`)

Mỗi tính năng lớn là một **Bounded Context** độc lập = 1 Module.

### Cấu trúc Module chuẩn (5 thư mục, không hơn không kém):

```
src/modules/<module-name>/
├── actions/          # Next.js Server Actions
│   └── <feature>.actions.ts
├── components/       # UI Components, Forms, Modals của module
│   └── <feature>-form.tsx
├── repositories/     # Giao tiếp trực tiếp với Database (Prisma)
│   └── <entity>.repository.ts
├── services/         # Logic nghiệp vụ, tính toán, phân quyền
│   └── <entity>.service.ts
└── types/            # TypeScript Interfaces & Types
    └── <module>.types.ts
```

**NGHIÊM CẤM tạo thư mục con nào khác.** Nếu cần chia nhỏ, chia bên trong 5 thư mục đó.

### Luật giao tiếp giữa các Module:

```
Module A ──→ Module B.Service (PUBLIC)   ✅ Hợp lệ
Module A ──→ Module B.Repository         ❌ VI PHẠM
Module A ──→ Module B DB trực tiếp       ❌ VI PHẠM
```

---

## 🗄️ PHẦN 3: Luật Database & Tenant Isolation

### Hybrid Multi-Tenant Architecture:
- **Shared DB** (default): Tất cả Organization dùng chung 1 DB
- **Dedicated DB** (per-org): Organization lớn có DB riêng

### Cách truy cập DB (BẮT BUỘC):

```typescript
// ✅ CHUẨN — trong Service/Repository
import { getTenantDb } from "@/lib/db";
const db = getTenantDb(organizationId);
await db.model.findMany(...);

// ✅ CHUẨN — System-level (Admin, Cron, Webhook)
import { getSystemDb } from "@/lib/db";
const db = getSystemDb();

// ❌ NGHIÊM CẤM — import db trực tiếp từ Prisma
import { db } from "@/lib/prisma";     // ← KHÔNG ĐƯỢC
import prisma from "@/lib/prisma";      // ← KHÔNG ĐƯỢC
```

### Global Models (không bị Tenant Isolation):
`User`, `Session`, `Account`, `Verification`, `Organization`, `PlatformModule`, `PlatformPlan`, `PlanModule`

---

## 🎨 PHẦN 4: Luật Giao diện (UI Rules)

### Design System (theo thứ tự ưu tiên):
1. **Apple HIG** — Tối giản, Premium, Khoảng trắng nhiều
2. **Vercel Design System** — Typography rõ ràng, Monochrome chủ đạo
3. **OVC UI Skill** — Components chuẩn của hệ thống

### Nghiêm cấm trong UI:
- Không dùng màu thuần (plain red, blue, green) — dùng palette curated
- Không bỏ qua Dark Mode support nếu page đang hỗ trợ Dark Mode
- Không tạo component mới nếu đã có component tương tự trong hệ thống
- Không hardcode string tiếng Việt lẫn tiếng Anh không nhất quán

---

## 📋 PHẦN 5: Module Lifecycle

| Trạng thái | Sidebar | Navigation | Dashboard | Permission Production |
|---|---|---|---|---|
| Development | ⚠️ Super Admin preview only | ⚠️ Super Admin preview only | ❌ | ❌ |
| Testing | ⚠️ Super Admin preview only | ⚠️ Super Admin preview only | ❌ | ❌ |
| Beta | ❌ | ❌ | ❌ | ⚠️ Staging only |
| Published | ✅ | ✅ | ✅ | ✅ |
| Deprecated | ❌ | ❌ | ❌ | ❌ |

### Ngoại lệ Super Admin Preview

- Module khai báo `Development` hoặc `Testing` trong Module Registry mặc định tự động hiện trên App Launcher và Navigation Sidebar cho `SUPER_ADMIN`, không cần cờ preview riêng.
- Chỉ role `SUPER_ADMIN` được nhìn thấy và truy cập.
- Route, Server Action và API phải kiểm tra quyền ở server; ẩn UI là chưa đủ.
- Không thêm module preview vào entitlement của Organization, Dashboard hoặc Permission Production.

---

## ✅ PHẦN 6: POST-TASK CHECKLIST (Bắt buộc tự kiểm tra trước khi kết thúc)

```
[ ] Tôi có sửa ngoài phạm vi yêu cầu không?
[ ] Tôi có ảnh hưởng đến module Production đang hoạt động không?
[ ] Tôi có tạo code/component/service trùng lặp không?
[ ] Tôi có để import { db } trực tiếp ở bất kỳ đâu không?
[ ] Tôi có tạo thư mục ngoài 5 Clean Architecture folders không?
[ ] Tôi có tạo file ngoài 6 Route Groups không?
[ ] Tôi có để logic nghiệp vụ trong src/app không?
[ ] Module Development/Testing có chỉ hiển thị cho SUPER_ADMIN và có server-side access guard không?
[ ] Có thể mở rộng trong tương lai mà không cần refactor không?
[ ] TypeScript strict — có còn lỗi type nào không?
```

**Nếu bất kỳ ô nào bị đánh dấu vi phạm → Phải FIX trước khi báo cáo hoàn thành.**

---

## 📂 Tham chiếu chi tiết

Đọc thêm tại `references/` nếu cần:
- [`structure-map.md`](.agents/skills/ovc-architecture/references/structure-map.md) — Sơ đồ đầy đủ toàn bộ cấu trúc dự án
- [`module-examples.md`](.agents/skills/ovc-architecture/references/module-examples.md) — Ví dụ code chuẩn cho từng layer
- [`antipatterns.md`](.agents/skills/ovc-architecture/references/antipatterns.md) — Danh sách các anti-pattern phổ biến và cách xử lý

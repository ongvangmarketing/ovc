# OVC Workspace — Structure Map (Sơ đồ cấu trúc đầy đủ)

```
newongvangnew/
├── prisma/
│   ├── schema.prisma                # Database schema duy nhất (nguồn sự thật)
│   └── migrations/                  # Migration files — KHÔNG sửa tay
│
├── src/
│   ├── app/                         # Next.js App Router — THIN ROUTER ONLY
│   │   ├── (admin)/                 # Route Group: Admin & Super Admin
│   │   │   └── admin/
│   │   │       ├── organizations/   # Quản lý organizations
│   │   │       ├── users/           # Quản lý users
│   │   │       └── platform/        # Cấu hình platform
│   │   │
│   │   ├── (auth)/                  # Route Group: Xác thực
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (frontend)/              # Route Group: Web công khai
│   │   │   ├── booking/             # Trang đặt phòng/tour
│   │   │   ├── tralist/             # Danh sách tour
│   │   │   ├── ongvang/             # Landing page OngVang
│   │   │   └── sites/[orgSlug]/     # Multi-site theo org
│   │   │
│   │   ├── (portals)/               # Route Group: Cổng người dùng có tài khoản
│   │   │   ├── student/             # Cổng học viên
│   │   │   ├── instructor/          # Cổng giảng viên
│   │   │   ├── agent/               # Cổng đại lý du lịch
│   │   │   └── customer/            # Cổng khách hàng
│   │   │
│   │   ├── (tools)/                 # Route Group: Công cụ độc lập
│   │   │   ├── builder/             # Page/Form builder
│   │   │   ├── embed/               # Widget nhúng
│   │   │   └── document/            # Document viewer
│   │   │
│   │   ├── (workspace)/             # Route Group: Dashboard chính
│   │   │   └── workspace/
│   │   │       ├── crm/             # Module CRM
│   │   │       ├── finance/         # Module Finance
│   │   │       ├── training/        # Module Training
│   │   │       ├── traveling/       # Module Traveling
│   │   │       ├── leads/           # Module Leads
│   │   │       └── settings/        # Cài đặt workspace
│   │   │
│   │   └── api/                     # API Routes (exception — nằm ngoài Route Groups)
│   │       ├── auth/                # better-auth endpoints
│   │       └── webhooks/            # Webhook receivers
│   │
│   ├── modules/                     # Business Logic — CLEAN ARCHITECTURE
│   │   ├── crm/                     # Bounded Context: CRM
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   ├── finance/                 # Bounded Context: Tài chính
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   ├── training/                # Bounded Context: Đào tạo
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   ├── traveling/               # Bounded Context: Du lịch
│   │   │   ├── actions/
│   │   │   ├── components/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   └── leads/                   # Bounded Context: Lead Management
│   │       ├── actions/
│   │       ├── components/
│   │       ├── repositories/
│   │       ├── services/
│   │       └── types/
│   │
│   ├── lib/                         # Shared Infrastructure (không phải nghiệp vụ)
│   │   ├── auth/                    # better-auth config & guards (requireAuth, rbac)
│   │   ├── db/                      # Database connection (getTenantDb, getSystemDb)
│   │   ├── email/                   # Email templates & flows
│   │   ├── storage/                 # File storage utilities
│   │   └── utils/                   # Shared utility functions (cn, format, etc.)
│   │
│   └── components/                  # Shared UI Components (dùng được ở mọi module)
│       ├── ui/                      # Base components (Button, Input, Modal...)
│       └── layout/                  # Layout components (Sidebar, Header...)
│
├── .agents/                         # Agent configuration (KHÔNG sửa nếu không hiểu)
│   ├── AGENTS.md                    # Rules cho AI Agents
│   └── skills/                      # Skills cho AI Agents
│       ├── ovc-architecture/        # Skill này
│       ├── ovc-ui/                  # UI guidelines
│       └── vercel-ui/               # Vercel style guidelines
│
└── AGENTS.md                        # Root-level rules (workspace-wide)
```

## Quy tắc đặt tên file:

| Layer | Pattern | Ví dụ |
|---|---|---|
| Service | `<entity>.service.ts` | `contact.service.ts` |
| Repository | `<entity>.repository.ts` | `contact.repository.ts` |
| Action | `<feature>.actions.ts` | `crm.actions.ts` |
| Page | `page.tsx` | `page.tsx` |
| Component | `<name>-<type>.tsx` | `contact-form.tsx`, `lead-table.tsx` |
| Types | `<module>.types.ts` | `crm.types.ts` |

## Quy tắc import path:

```typescript
// ✅ Luôn dùng path alias
import { ContactService } from "@/modules/crm/services/contact.service";
import { getTenantDb } from "@/lib/db";
import { Button } from "@/components/ui/button";

// ❌ Không dùng relative path vượt quá 2 cấp
import { ContactService } from "../../../modules/crm/services/contact.service";
```

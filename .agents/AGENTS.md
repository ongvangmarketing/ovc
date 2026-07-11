# OVC Workspace — Agent Enforcement Rules

## 🔴 MANDATORY PRE-FLIGHT: Phải đọc skill trước khi viết bất kỳ dòng code nào

**RULE [STRICT]:** Trước khi thực hiện BẤT KỲ hành động nào dưới đây, Agent phải trigger và đọc
skill `ovc-architecture` (tại `.agents/skills/ovc-architecture/SKILL.md`):

- ✏️ Tạo file mới bất kỳ trong `src/`
- 📁 Tạo thư mục mới bất kỳ trong `src/`
- 🧩 Tạo Module, Service, Repository, Action mới
- 🎨 Tạo UI Component, Page, Route mới
- 🗄️ Thay đổi Prisma Schema
- 🔌 Thêm tích hợp module mới
- 🛠️ Refactor bất kỳ file nào trong `src/modules/` hoặc `src/app/`

**Không có ngoại lệ.** Nếu Agent chưa đọc skill, Agent phải đọc ngay bây giờ.

---

## ❌ TUYỆT ĐỐI NGHIÊM CẤM

1. **Đặt file trong `src/app` ngoài 6 Route Groups** đã định nghĩa trong `ovc-architecture` skill
2. **Tạo thư mục con ngoài 5 Clean Architecture folders** trong bất kỳ module nào
3. **Import `db` hoặc `prisma` trực tiếp trong `src/app`** — mọi DB access phải qua Service/Repository
4. **Viết business logic trong Page hay Action** — Page là Thin Router, Action là thin wrapper
5. **Truy cập Repository của Module khác** — chỉ được giao tiếp qua Public Service
6. **Tạo code/component/service trùng lặp** với cái đã tồn tại
7. **Thêm Sidebar/Navigation/Dashboard** cho module chưa ở trạng thái `Published`, ngoại trừ App Launcher và Sidebar tự động dành cho `SUPER_ADMIN` khi module khai báo lifecycle `Development/Testing` và khóa quyền ở route/action/API
8. **Sửa module khác ngoài phạm vi được yêu cầu** — kể cả sửa nhỏ
9. **Bỏ qua `organizationId`** trong bất kỳ DB query nào (trừ Global Models)
10. **Kết thúc tác vụ mà không chạy POST-TASK CHECKLIST** từ `ovc-architecture` skill

---

## ⚠️ BÁO CÁO BẮT BUỘC

Nếu phát hiện bất kỳ vi phạm nào trong các điều trên — kể cả trong code **hiện có** — Agent phải:

1. **DỪNG LẠI** — không tiếp tục
2. **Liệt kê** rõ vi phạm cụ thể
3. **Giải thích** tại sao đây là vi phạm
4. **Đề xuất** cách xử lý đúng
5. **Chờ xác nhận** từ người dùng trước khi tiếp tục

---

## 📚 Tài liệu tham chiếu bắt buộc

| Khi cần | Đọc file |
|---|---|
| Cấu trúc tổng quan, đặt file ở đâu | `.agents/skills/ovc-architecture/references/structure-map.md` |
| Code mẫu chuẩn cho từng layer | `.agents/skills/ovc-architecture/references/module-examples.md` |
| Kiểm tra có đang vi phạm không | `.agents/skills/ovc-architecture/references/antipatterns.md` |
| UI/Component standards | `.agents/skills/ovc-ui/SKILL.md` |
| Vercel minimalist style | `.agents/skills/vercel-ui/SKILL.md` |

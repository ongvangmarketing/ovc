<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# OVC Workspace Architecture & Development Guidelines

## Nguyên tắc bắt buộc
- Trước khi viết code, luôn phân tích kiến trúc hiện có để hiểu module đang làm.
- Chỉ được sửa đúng module được yêu cầu.
- Không được tự ý sửa, refactor hoặc tối ưu module khác nếu không có yêu cầu rõ ràng.
- Không được thay đổi Database, API, Permission hoặc Business Logic của module khác.
- Không được tạo code trùng lặp nếu hệ thống đã có component, service hoặc utility tương tự. Luôn ưu tiên tái sử dụng code hiện có.
- Khi cần thay đổi kiến trúc hoặc ảnh hưởng sang module khác, phải dừng lại và giải thích trước khi thực hiện.

## Kiến trúc Module
- Mỗi module là một Bounded Context độc lập.
- Mỗi module phải có: Database, Service, Repository, Server Action, Permission, Route, UI, Config, Migration, Types.
- Các module chỉ được giao tiếp thông qua Public Service, Internal API hoặc Event.
- Không được truy cập trực tiếp Database hoặc Repository của module khác.

## Module Lifecycle
- Trạng thái: Development, Testing, Beta, Published, Deprecated.
- Nếu module chưa ở trạng thái Published thì:
  - Mặc định không thêm Sidebar hoặc Navigation.
  - Không hiển thị trên Dashboard.
  - Không hiển thị trong Menu.
  - Không kích hoạt Permission Production.
  - Không cho Organization sử dụng.
- Ngoại lệ kiểm thử nội bộ:
  - Module ở trạng thái Development hoặc Testing được phép xuất hiện trên App Launcher và Navigation Sidebar chỉ với `SUPER_ADMIN`.
  - Module phải khai báo rõ lifecycle trong Module Registry; `Development` và `Testing` mặc định tự động hiển thị cho Super Admin, không cần cờ preview riêng.
  - Route, Server Action và API của module preview phải kiểm tra `SUPER_ADMIN`; không chỉ ẩn giao diện.
  - Không được đưa module preview vào entitlement của Organization hoặc kích hoạt Permission Production.
  - ADMIN, MANAGER, STAFF và các role Organization khác tuyệt đối không được nhìn thấy hoặc truy cập module preview.
- Code vẫn phải được viết hoàn chỉnh để có thể triển khai và kiểm thử.

## Nguyên tắc phát triển
- Khi phát triển module mới:
  - Chỉ tạo file trong module đó.
  - Không ảnh hưởng module đã hoàn thành.
  - Không làm hỏng chức năng Production.
  - Không thay đổi giao diện của module khác.
- Nếu cần chỉnh sửa module khác để tích hợp, hãy liệt kê rõ các thay đổi và chờ xác nhận trước khi thực hiện.

## Chất lượng Code
- Clean Architecture, SOLID, TypeScript Strict.
- Dễ mở rộng, Dễ bảo trì, Ít phụ thuộc giữa các module.
- Có xử lý lỗi, validate dữ liệu.
- Có comment ở những đoạn logic phức tạp.

## Giao diện
- Ưu tiên Apple HIG & Vercel Design System:
  - Tối giản, Premium, Responsive.
  - Nhiều khoảng trắng, Typography rõ ràng.
  - Component tái sử dụng, Hỗ trợ Dark Mode.

## Checklist Trước Khi Kết Thúc Tác Vụ
- Có sửa ngoài phạm vi yêu cầu không?
- Có ảnh hưởng module Production không?
- Có tạo code trùng lặp không?
- Có thể mở rộng trong tương lai không?
- Có đảm bảo module mới vẫn ở trạng thái Development/Testing nếu chưa hoàn thiện không?
- (Nếu vi phạm nguyên tắc trên, phải dừng lại và giải thích với người dùng)

# Progressive Web App (PWA) - Hướng dẫn & Kiến trúc

Ong Vàng Cloud (OVC) đã được nâng cấp thành Progressive Web App (PWA) để mang lại trải nghiệm giống như ứng dụng Native, hỗ trợ cài đặt trên thiết bị, và hoạt động tốt ngay cả khi kết nối mạng không ổn định.

## 1. Kiến trúc PWA

Hệ thống PWA của OVC được xây dựng dựa trên:
- **`@ducanh2912/next-pwa`**: Bản fork của `next-pwa`, hỗ trợ đầy đủ Next.js App Router (version 13+).
- **`workbox`**: Framework của Google để quản lý Service Worker và Caching.
- **`public/manifest.webmanifest`**: File cấu hình chứa metadata của ứng dụng để trình duyệt hiểu cách hiển thị khi cài đặt (tên, icon, màu sắc, chế độ hiển thị).
- **Service Worker (`sw.js`)**: Được tự động tạo ở môi trường Production. Đứng giữa trình duyệt và server, giúp chặn request để xử lý logic cache.

## 2. Chiến lược Cache (Workbox Strategies)

Chúng ta sử dụng các chiến lược cache khác nhau để tối ưu tốc độ mà vẫn đảm bảo tính mới của dữ liệu:

- **Static Assets (CSS, JS, Fonts, Images, Audio, Video)**:
  - Chiến lược: `StaleWhileRevalidate` (hoặc `CacheFirst` cho fonts/media).
  - Hoạt động: Trả về bản sao trong cache ngay lập tức để tải trang cực nhanh, đồng thời (nếu là `StaleWhileRevalidate`) tải bản mới ngầm từ server để cập nhật cache cho lần sau.

- **Điều hướng trang (HTML/RSC)**:
  - Chiến lược: `NetworkFirst`.
  - Hoạt động: Ưu tiên lấy bản mới nhất từ server. Nếu mạng chậm hoặc rớt mạng, lấy từ cache.

- **API Requests (Chỉ GET)**:
  - Chiến lược: `NetworkFirst`.
  - Hoạt động: Luôn ưu tiên lấy data mới nhất từ DB. Nếu mất mạng, lấy kết quả cuối cùng lưu trong cache.
  - Timeout: 10 giây. Quá 10s sẽ tự fallback sang cache.

- **Loại trừ Cache (No-cache)**:
  - Authentication (Login, Register, Session): Không bao giờ cache để đảm bảo bảo mật.
  - Mutating API (POST, PUT, DELETE, PATCH): Không cache.

## 3. Quy trình Cài đặt (Install Flow)

### Android / Chrome (Desktop)
- Khi người dùng truy cập web và đủ điều kiện, trình duyệt kích hoạt sự kiện `beforeinstallprompt`.
- Component `InstallPrompt` chặn sự kiện này và hiển thị popup đẹp mắt ở góc màn hình: "Cài đặt Ứng dụng Ong Vàng Cloud".
- Người dùng nhấn "Cài đặt ngay" -> Trình duyệt hiển thị hộp thoại xác nhận cài ứng dụng.

### iOS / Safari
- iOS không hỗ trợ `beforeinstallprompt`.
- Component `InstallPrompt` tự động nhận diện thiết bị iOS.
- Hiển thị hướng dẫn thủ công: "Nhấn Share > Thêm vào Màn hình chính".
- *Lưu ý*: Có lưu trạng thái vào `localStorage` nếu người dùng tắt popup, để không làm phiền những lần sau.

## 4. Trải nghiệm Offline (Offline Flow)

- Khi mất mạng, nếu người dùng điều hướng sang một trang chưa từng truy cập (không có trong cache), Service Worker sẽ điều hướng về trang `/offline`.
- Giao diện Offline thông báo thân thiện.
- Trang Offline tự động lắng nghe sự kiện `window.addEventListener('online')` và reload lại trang ngay khi có mạng trở lại.

## 5. Quy trình Cập nhật (Update Flow)

- Khi developer đẩy code mới và build lại PWA, một phiên bản Service Worker mới sẽ được sinh ra.
- Trình duyệt tải SW mới ở chế độ nền (waiting status).
- Component `UpdatePrompt` lắng nghe sự kiện `waiting` từ `workbox-window`.
- Hiển thị thông báo: "Có phiên bản mới" cho người dùng.
- Khi người dùng nhấn "Cập nhật ngay", script sẽ gửi lệnh `messageSkipWaiting()` cho SW, ép buộc kích hoạt SW mới và reload lại trang.

## 6. Các giới hạn trên iOS (Apple Limitations)

- Cài đặt thủ công: Không có nút "Cài đặt" trực tiếp (như Android), bắt buộc dùng tính năng Share của Safari.
- Xóa Data Cache định kỳ: Apple có thể tự động xóa data của PWA (IndexDB, Cache Storage) nếu người dùng không mở app trong khoảng vài tuần.
- Push Notifications: Đã được Apple hỗ trợ trên iOS 16.4+, nhưng yêu cầu phải được "Thêm vào màn hình chính" (Add to Home Screen) trước tiên.

# FIX: Logout liên tục & SPA Cache (2026-07-07)

## Tóm tắt

Đã fix lỗi **logout liên tục khi click sidebar/links** và **load trang nặng do không có SPA cache** trên `app.ovc.vn` và `app.ongvang.vn`.

---

## Nguyên nhân gốc rễ

### 1. `src/proxy.ts` — Middleware gây logout false-positive ⚠️ QUAN TRỌNG NHẤT

Middleware chạy trên **mọi request** và luôn gọi HTTP round-trip để verify session:

```ts
// ❌ CŨ — dễ timeout/race condition → redirect /login sai
const { data: session } = await betterFetch("/api/auth/get-session", { ... });
if (!session) {
  return NextResponse.redirect(new URL("/login", request.url)); // false-positive logout!
}
```

Khi `betterFetch` bị timeout hoặc network error → `session = null` → **redirect /login ngay**, dù user thật sự đã đăng nhập.

### 2. `src/components/layouts/sidebar.tsx` — `window.location.assign()` phá vỡ SPA

```ts
// ❌ CŨ — full page reload mỗi click, reset mọi state
function navigateWithoutRouterCache(event, href) {
  event.preventDefault();
  window.location.assign(href); // phá SPA, gây race condition session
}
```

Mọi link trong sidebar đều dùng hàm này → không phải SPA navigation → mỗi click là full reload.

### 3. `src/lib/auth/index.ts` — Cookie cache tắt

```ts
// ❌ CŨ — mọi request đều query DB
cookieCache: { enabled: false }
```

### 4. `src/lib/auth/client.ts` — fetch cache tắt

```ts
// ❌ CŨ — useSession() gọi API mỗi render
fetchOptions: { cache: "no-store" }
```

### 5. `next.config.ts` — Global `no-store` kể cả static assets

```ts
// ❌ CŨ — cả JS/CSS bundles cũng bị no-store
source: "/:path*",
headers: [{ key: "Cache-Control", value: "no-store, ..." }]
```

---

## Các fix đã áp dụng

### Fix #1 — `src/proxy.ts`

**Logic mới**: Check cookie trước, chỉ gọi API khi cần role, không logout nếu API fail mà cookie tồn tại.

```ts
// ✅ MỚI
const hasSessionToken = /better-auth\.session_token=([^;]+)/.test(cookieHeader);

if (!hasSessionToken) {
  // Không có cookie → chắc chắn chưa login → redirect /login
  return NextResponse.redirect(new URL("/login", request.url));
}

// Có cookie → gọi API để lấy role cho RBAC
const { data } = await betterFetch("/api/auth/get-session", { ... });
session = data ?? null;

// Nếu API fail nhưng có cookie → KHÔNG logout, để server component tự xử lý
if (!session) {
  return NextResponse.next(); // pass through, requireAuth() sẽ verify thật
}
```

### Fix #2 — `src/components/layouts/sidebar.tsx`

Xóa hoàn toàn `navigateWithoutRouterCache` và mọi `onClick` override. `<Link>` của Next.js tự dùng router client-side.

```tsx
// ✅ MỚI — không còn onClick override, Link tự navigate
<Link href={item.href} prefetch={false}>
  {item.label}
</Link>
```

> ⚠️ **ĐỪNG** thêm lại `onClick={(event) => window.location.assign(href)}` hay bất kỳ hàm override nào vào Link trong sidebar. Đây là nguyên nhân gây logout.

### Fix #3 — `src/lib/auth/index.ts`

```ts
// ✅ MỚI — session cache trong cookie 5 phút, giảm tải DB
session: {
  expiresIn: 60 * 60 * 24 * 30,
  updateAge: 60 * 60 * 24,
  cookieCache: {
    enabled: true,
    maxAge: 60 * 5, // 5 phút
  },
},
```

> ⚠️ Trade-off: Logout của user không có hiệu lực ngay lập tức, phải đợi ~5 phút để cookie cache hết hạn. Đây là trade-off chấp nhận được.

### Fix #4 — `src/lib/auth/client.ts`

```ts
// ✅ MỚI — bỏ fetchOptions để better-auth tự quản lý cache
export const authClient = createAuthClient({
  baseURL: ...,
  plugins: [organizationClient()],
  // không có fetchOptions: { cache: "no-store" }
});
```

### Fix #5 — `next.config.ts`

```ts
// ✅ MỚI — chỉ no-store cho API và HTML pages, static assets được cache
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [{ key: "Cache-Control", value: "no-store, no-cache, must-revalidate" }],
    },
    {
      // HTML pages: no-store, nhưng _next/static được cache bình thường
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      headers: [{ key: "Cache-Control", value: "no-store, no-cache, must-revalidate" }],
    },
  ];
},
```

---

## Files đã thay đổi

| File | Thay đổi |
|------|----------|
| `src/proxy.ts` | Middleware: check cookie trước, không logout false-positive |
| `src/components/layouts/sidebar.tsx` | Xóa `window.location.assign`, dùng Next.js `<Link>` thuần |
| `src/lib/auth/index.ts` | Bật `cookieCache: enabled: true, maxAge: 300` |
| `src/lib/auth/client.ts` | Xóa `fetchOptions: { cache: "no-store" }` |
| `next.config.ts` | Scope Cache-Control chỉ cho API + HTML, không cho static |

---

## Không được làm

- ❌ Thêm lại `window.location.assign()` hay `window.location.href` vào sidebar links
- ❌ Tắt `cookieCache` trong auth config (`src/lib/auth/index.ts`)
- ❌ Thêm `fetchOptions: { cache: "no-store" }` vào auth client
- ❌ Đặt middleware redirect `/login` khi API call fail (nếu cookie tồn tại)
- ❌ Global `Cache-Control: no-store` cho `/:path*` (sẽ block cache của static assets)

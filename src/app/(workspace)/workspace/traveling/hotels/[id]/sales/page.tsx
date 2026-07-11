import { requireAuth } from "@/lib/auth/require-auth";
import { headers } from "next/headers";
import { Copy, ExternalLink, Code2 } from "lucide-react";
import Link from "next/link";
import { HotelService } from "@/modules/traveling/services/hotel.service";

export default async function EmbedsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authData = await requireAuth();
  const { id: hotelId } = await params;

  const hotel = await HotelService.getHotelDetail(authData.organizationId, hotelId);

  if (!hotel) return null;

  // Lấy host thực tế
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const domain = `${protocol}://${host}`;
  
  const landingPageUrl = hotel.slug 
    ? `${domain}/booking/${hotel.slug}`
    : `${domain}/booking/id/${hotel.id}`;

  const iframeCode = `<iframe src="${domain}/embed/hotel/${hotel.id}" width="100%" height="600" frameborder="0" style="border:1px solid #eaeaea; border-radius:12px;"></iframe>`;
  
  const widgetCode = `<script src="${domain}/widget/hotel.js" data-hotel-id="${hotel.id}"></script>`;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-[20px] font-medium text-black">Công cụ Bán hàng & Nhúng (Embeds)</h2>
        <p className="text-[14px] text-gray-500 mt-1">
          Các công cụ giúp bạn mang khung đặt phòng (Booking Engine) tiếp cận khách hàng trên nhiều nền tảng.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Landing Page */}
        <div className="rounded-2xl border border-[#eaeaea] bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-medium text-black">Landing Page (Trang đích)</h3>
              <p className="text-[13px] text-gray-500">Trang đặt phòng độc lập, phù hợp gắn vào nút "Đặt phòng" trên Facebook, Zalo, Bio Link.</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <input 
              type="text" 
              readOnly 
              value={landingPageUrl} 
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[14px] text-gray-700 outline-none"
            />
            {/* Note: In a real app we'd use a Client Component for Copy to clipboard, doing it static here for UI demo */}
            <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-4 text-[13px] font-medium text-white hover:bg-gray-800">
              <Copy className="h-4 w-4" /> Copy Link
            </button>
          </div>
          {!hotel.slug && (
            <p className="mt-3 text-[12px] text-orange-600">
              * Khách sạn chưa có Slug. Hãy cập nhật Slug ở tab Tổng quan để đường dẫn được đẹp và chuẩn SEO hơn.
            </p>
          )}
        </div>

        {/* Iframe */}
        <div className="rounded-2xl border border-[#eaeaea] bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-medium text-black">Mã nhúng Iframe</h3>
              <p className="text-[13px] text-gray-500">Dùng để nhúng trực tiếp Form đặt phòng vào giữa trang chủ Website hiện có của bạn.</p>
            </div>
          </div>
          <div className="mt-4">
            <textarea 
              readOnly 
              rows={3}
              value={iframeCode} 
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[14px] font-mono text-gray-700 outline-none"
            />
          </div>
        </div>

        {/* Widget */}
        <div className="rounded-2xl border border-[#eaeaea] bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-medium text-black">Widget Đặt phòng nổi (Floating Widget)</h3>
              <p className="text-[13px] text-gray-500">Gắn script này vào thẻ &lt;head&gt; website của bạn, nó sẽ hiển thị một nút "Book Now" nổi ở góc màn hình.</p>
            </div>
          </div>
          <div className="mt-4">
            <textarea 
              readOnly 
              rows={2}
              value={widgetCode} 
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[14px] font-mono text-gray-700 outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

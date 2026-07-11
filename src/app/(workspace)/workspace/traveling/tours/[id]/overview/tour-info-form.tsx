"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateTourInfo } from "../actions";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { Tour } from "@prisma/client";

export default function TourInfoForm({ tour }: { tour: Tour }) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("tourId", tour.id);
    
    startTransition(async () => {
      const res = await updateTourInfo(formData);
      if (res.success) {
        alert("Đã lưu thông tin Tour thành công!");
      } else {
        alert(res.error || "Có lỗi xảy ra");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Hình ảnh */}
      <div className="rounded-2xl border border-[#eaeaea] bg-white flex flex-col overflow-hidden">
        <div className="p-8">
          <h2 className="text-[24px] font-medium tracking-tight text-black mb-1">Hình ảnh Tour</h2>
          <p className="text-[16px] text-gray-500 mb-8">Ảnh đại diện và thư viện ảnh quảng bá cho Tour.</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ImageUpload
                name="logo"
                label="Ảnh Đại diện (Thumbnail)"
                defaultValue={tour.images[0] || ""}
                helperText="Nên dùng ảnh vuông, kích thước tối đa 2MB."
                aspectRatio="square"
              />
            </div>
            <div className="lg:col-span-2">
              <MultiImageUpload
                name="images"
                label="Thư viện Ảnh (Gallery)"
                defaultValue={tour.images || []}
                helperText="Upload các hình ảnh nổi bật của điểm đến."
              />
            </div>
          </div>
        </div>
        <div className="border-t border-[#eaeaea] bg-gray-50/50 p-4 px-8 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex h-9 items-center justify-center rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Lưu hình ảnh
          </button>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="rounded-2xl border border-[#eaeaea] bg-white flex flex-col overflow-hidden mb-10">
        <div className="p-8">
          <h2 className="text-[24px] font-medium tracking-tight text-black mb-1">Thông tin cơ bản</h2>
          <p className="text-[16px] text-gray-500 mb-8">Các thông tin hiển thị chính của gói Tour.</p>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-gray-500">
                Tên Tour <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={tour.name}
                required
                className="w-full rounded-md border border-[#eaeaea] px-4 py-2 text-[15px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-gray-500">Mô tả Tour</label>
              <textarea
                name="description"
                defaultValue={tour.description || ""}
                rows={4}
                className="w-full rounded-md border border-[#eaeaea] px-4 py-3 text-[15px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-gray-500">Số ngày</label>
              <input
                type="number"
                name="durationDays"
                min="1"
                defaultValue={tour.durationDays}
                className="w-full rounded-md border border-[#eaeaea] px-4 py-2 text-[15px] text-black outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-gray-500">
                Giá người lớn (VNĐ)
              </label>
              <input
                type="number"
                name="basePrice"
                defaultValue={tour.basePrice}
                className="w-full rounded-md border border-[#eaeaea] px-4 py-3 text-[15px] text-black outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-gray-500">
                Giá trẻ em (VNĐ)
              </label>
              <input
                type="number"
                name="baseChildPrice"
                defaultValue={tour.baseChildPrice || 0}
                className="w-full rounded-md border border-[#eaeaea] px-4 py-3 text-[15px] text-black outline-none focus:border-black transition-colors"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-gray-500">Điểm đến (Cách bằng dấu phẩy)</label>
              <input
                type="text"
                name="destinations"
                defaultValue={tour.destinations.join(", ")}
                placeholder="VD: Hà Nội, Hạ Long, Ninh Bình"
                className="w-full rounded-md border border-[#eaeaea] px-4 py-2 text-[15px] text-black outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-[#eaeaea] bg-gray-50/50 p-4 px-8 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex h-9 items-center justify-center rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Lưu thông tin
          </button>
        </div>
      </div>
      {/* Giá & Chính sách */}
      <div className="rounded-2xl border border-[#eaeaea] bg-white flex flex-col overflow-hidden mb-10">
        <div className="p-8">
          <h2 className="text-[24px] font-medium tracking-tight text-black mb-1">Dịch vụ & Phụ phí</h2>
          <p className="text-[16px] text-gray-500 mb-8">Cấu hình các dịch vụ bao gồm, không bao gồm và phụ thu.</p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-gray-500">
                Giá đã bao gồm
              </label>
              <textarea
                name="included"
                defaultValue={tour.included?.join('\n') || ""}
                rows={4}
                placeholder="Mỗi dòng 1 mục (VD: Xe đưa đón\nKhách sạn 4 sao...)"
                className="w-full rounded-md border border-[#eaeaea] px-4 py-3 text-[15px] text-black outline-none focus:border-black transition-colors"
              />
            </div>
            <div>
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-gray-500">
                Giá CHƯA bao gồm
              </label>
              <textarea
                name="excluded"
                defaultValue={tour.excluded?.join('\n') || ""}
                rows={4}
                placeholder="Mỗi dòng 1 mục (VD: Tiền TIP\nChi phí cá nhân...)"
                className="w-full rounded-md border border-[#eaeaea] px-4 py-3 text-[15px] text-black outline-none focus:border-black transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-gray-500">
                Phụ thu / Phụ phí (JSON hoặc Text tùy chọn)
              </label>
              <textarea
                name="surcharges"
                defaultValue={typeof tour.surcharges === 'string' ? tour.surcharges : JSON.stringify(tour.surcharges, null, 2) || ""}
                rows={4}
                placeholder='{"Phụ thu lễ tết": 500000, "Phòng đơn": 1000000}'
                className="w-full font-mono rounded-md border border-[#eaeaea] px-4 py-3 text-[13px] text-black outline-none focus:border-black transition-colors bg-gray-50"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-[#eaeaea] bg-gray-50/50 p-4 px-8 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex h-9 items-center justify-center rounded-full bg-black px-6 text-[14px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Lưu chính sách
          </button>
        </div>
      </div>
    </form>
  );
}

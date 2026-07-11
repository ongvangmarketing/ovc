import { Settings, Save, Lock } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-auth";
import { TravelingService } from "@/modules/traveling/services/traveling.service";

export default async function AgentSettingsPage() {
  const authData = await requireAuth();

  const activeModules = await TravelingService.getActiveModules(authData.organizationId);

  return (
    <div className="quote-page mx-auto max-w-[1440px] px-6 py-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[14px] font-light text-slate-500">
            <Settings className="h-4 w-4 text-orange-500" />
            Đại lý / Cài đặt
          </div>
          <h1 className="text-[15px] font-medium text-slate-950">Hồ sơ đại lý và các dịch vụ được cấp quyền</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="quote-action-button quote-action-secondary">
            Hủy bỏ
          </button>
          <button className="quote-action-button quote-action-primary">
            <Save className="h-4 w-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl space-y-6">
        
        <section className="quote-panel">
          <div className="quote-panel-header">
            <h2>Tài khoản & Hồ sơ</h2>
            <span>Tên hiển thị trên hệ thống, email và hóa đơn.</span>
          </div>
          
          <div className="grid gap-4 p-5">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-slate-700">Tên hiển thị Đại lý <span className="text-red-500">*</span></span>
              <input 
                className="quote-input max-w-md" 
                placeholder="Ví dụ: Công ty TNHH Ong Vàng..." 
                defaultValue="Agent Name"
              />
            </label>
          </div>
        </section>

        <section className="quote-panel border-l-[3px] border-l-slate-400">
          <div className="quote-panel-header flex items-center justify-between">
            <div>
              <h2>Mảng kinh doanh (Được cấp quyền)</h2>
              <span>Danh sách các dịch vụ mà đại lý được Admin hệ thống cho phép hoạt động.</span>
            </div>
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="grid gap-4 p-5">
            <div className="p-3 mb-2 bg-slate-50 rounded-md border border-slate-200 text-[13px] text-slate-600 flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p>Tính năng mở khóa mảng kinh doanh (Tour, Khách sạn, Xe, Vé) <strong>do Admin toàn quyền kiểm soát</strong>. Sidebar sẽ tự động hiển thị các menu tương ứng dựa trên phân quyền dưới đây. Vui lòng liên hệ Admin nếu bạn muốn kinh doanh thêm mảng khác.</p>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-not-allowed opacity-80">
                <input type="checkbox" disabled checked={activeModules.includes("TRAVELING_TOUR")} className="w-4 h-4 rounded border-slate-300 text-orange-500 bg-gray-100" />
                <span className="text-[14px] font-medium text-slate-700">Tour Du Lịch</span>
              </label>
              <label className="flex items-center gap-3 cursor-not-allowed opacity-80">
                <input type="checkbox" disabled checked={activeModules.includes("TRAVELING_HOTEL")} className="w-4 h-4 rounded border-slate-300 text-orange-500 bg-gray-100" />
                <span className="text-[14px] font-medium text-slate-700">Khách Sạn & Lưu Trú</span>
              </label>
              <label className="flex items-center gap-3 cursor-not-allowed opacity-80">
                <input type="checkbox" disabled checked={activeModules.includes("TRAVELING_CAR")} className="w-4 h-4 rounded border-slate-300 text-orange-500 bg-gray-100" />
                <span className="text-[14px] font-medium text-slate-700">Cho Thuê Xe</span>
              </label>
              <label className="flex items-center gap-3 cursor-not-allowed opacity-80">
                <input type="checkbox" disabled checked={activeModules.includes("TRAVELING_TICKET") || activeModules.includes("TRAVELING_EVENT")} className="w-4 h-4 rounded border-slate-300 text-orange-500 bg-gray-100" />
                <span className="text-[14px] font-medium text-slate-700">Vé Dịch Vụ & Sự Kiện</span>
              </label>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

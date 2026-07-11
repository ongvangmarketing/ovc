import { requireAuth } from "@/lib/auth/require-auth";
import { TravelingService } from "@/modules/traveling/services/traveling.service";
import { Users, Plus, Building2, Map, Car, Ticket, Trash2, ArrowRight } from "lucide-react";
import { AgentPermissionToggle } from "./agent-toggle";

const TRAVELING_MODULES = [
  { code: "TRAVELING_HOTEL", name: "Khách sạn", icon: Building2 },
  { code: "TRAVELING_TOUR", name: "Tour Du Lịch", icon: Map },
  { code: "TRAVELING_CAR", name: "Thuê Xe", icon: Car },
  { code: "TRAVELING_TICKET", name: "Vé Dịch Vụ", icon: Ticket },
];

export default async function PartnersPage() {
  const session = await requireAuth();
  const agents = await TravelingService.getTravelingAgents(session.organizationId);

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-white font-sans">
      <div className="flex-1 overflow-auto p-8 lg:p-12">
        <div className="mx-auto max-w-[1200px]">
          
          {/* Header section perfectly matching the Vercel mockup */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-black text-white px-3 py-1.5 rounded-full text-[13px] font-medium tracking-wide">
                  Hệ thống Đối tác
                </span>
                <span className="text-[13px] text-gray-500">{currentDate}</span>
              </div>
              <button 
                className="flex h-9 items-center justify-center gap-2 rounded-full bg-black px-5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tạo mới
              </button>
            </div>
            
            <h1 className="text-[32px] md:text-[40px] font-medium tracking-tight text-black leading-tight max-w-3xl">
              Quản lý danh sách, <span className="text-gray-400 font-normal">phân quyền mạng lưới đại lý.</span>
            </h1>

            <p className="text-[15px] text-gray-500 max-w-2xl leading-relaxed">
              Trung tâm đối tác giúp bạn dễ dàng theo dõi, cập nhật thông tin và cấp quyền bán các dịch vụ cho các đại lý trong hệ thống OVC.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Create New Card */}
            <div 
              className="rounded-3xl border border-[#eaeaea] bg-white p-6 hover:border-gray-300 transition-colors cursor-pointer flex flex-col group min-h-[380px]"
            >
              <div className="w-12 h-12 rounded-full border border-[#eaeaea] bg-gray-50 flex items-center justify-center mb-5 group-hover:bg-black group-hover:border-black transition-colors">
                <Plus className="w-5 h-5 text-black group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-[18px] font-medium text-black mb-2 tracking-tight">Thêm Đại lý mới</h3>
              <p className="text-[14px] text-gray-500 mb-6 flex-1 leading-relaxed">
                Tạo một đối tác B2B mới, thiết lập thông tin cơ bản và bắt đầu phân quyền kinh doanh ngay lập tức.
              </p>
              <div className="border-t border-[#eaeaea] pt-4 mt-auto">
                <span className="text-[13px] text-gray-400 flex items-center gap-1 group-hover:text-black transition-colors">
                  Bắt đầu tạo <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Agent Cards */}
            {agents.map((agent) => (
              <div 
                key={agent.id}
                className="rounded-3xl border border-[#eaeaea] bg-white p-6 hover:border-gray-300 transition-colors flex flex-col group min-h-[380px] relative"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 rounded-full border border-[#eaeaea] bg-gray-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      className="w-7 h-7 flex items-center justify-center rounded-full border border-transparent hover:border-[#eaeaea] text-gray-300 hover:text-black hover:bg-gray-50 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-[18px] font-medium text-black mb-1 tracking-tight line-clamp-1 group-hover:underline underline-offset-4 decoration-gray-300">
                  {agent.user.name || "Chưa cập nhật tên"}
                </h3>
                <p className="text-[13px] text-gray-500 mb-6 line-clamp-1">
                  {agent.user.email}
                </p>
                
                <div className="flex-1 space-y-3.5 mb-6">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Phân quyền kinh doanh</div>
                  {TRAVELING_MODULES.map(mod => {
                    const isEnabled = (agent.permissions || []).includes(mod.code);
                    const ModIcon = mod.icon;
                    return (
                      <div key={mod.code} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <ModIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-[13.5px] text-gray-600 font-medium">{mod.name}</span>
                        </div>
                        <AgentPermissionToggle 
                          memberId={agent.id}
                          permissionCode={mod.code}
                          isEnabled={isEnabled}
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t border-[#eaeaea] pt-4 mt-auto flex items-center justify-between">
                  <span className="text-[13px] text-gray-400 flex items-center gap-1 group-hover:text-black transition-colors cursor-pointer">
                    Quản lý ngay <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-black" />
                    <span className="text-[11px] font-medium uppercase tracking-widest text-gray-500">
                      Hoạt động
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom active list */}
          <div className="rounded-3xl border border-[#eaeaea] bg-white p-8 mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-[16px] font-medium text-black tracking-tight">Đại lý đang hoạt động</h3>
                <p className="text-[13px] text-gray-500 mt-1">Các đối tác B2B đang hiển thị trên hệ thống và có thể kinh doanh.</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-[#eaeaea] flex items-center justify-center bg-gray-50">
                <div className="w-3 h-3 rounded-full border-2 border-black" />
              </div>
            </div>

            {agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full border border-[#eaeaea] flex items-center justify-center bg-gray-50 mb-4">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                </div>
                <p className="text-[14px] font-medium text-black">Chưa có đại lý nào</p>
                <p className="text-[13px] text-gray-500 mt-1">Vui lòng thêm một đại lý ở phía trên.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {agents.map(agent => (
                  <div key={`active-${agent.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-[#eaeaea] bg-gray-50/50">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#eaeaea] flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-black" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-black truncate">{agent.user.name || "Chưa cập nhật"}</div>
                      <div className="text-[11px] text-gray-500 truncate">{agent.user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Shield, Bell, Zap, Users, Save } from "lucide-react";

export function LeadSettingsClient() {
  const [activeTab, setActiveTab] = useState("ai_scoring");

  const tabs = [
    { id: "ai_scoring", label: "Chấm điểm AI (AI Scoring)" },
    { id: "duplicate", label: "Quy tắc chống trùng lặp" },
    { id: "assignment", label: "Phân công tự động" },
    { id: "notifications", label: "Cảnh báo & Thông báo" },
  ];

  return (
    <div className="flex flex-col space-y-8">
      {/* Horizontal Tabs Nav */}
      <nav className="flex flex-wrap gap-2" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-full text-[14px] font-medium transition-colors border
                ${isActive 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-500 border-[#eaeaea] hover:border-gray-300 hover:text-black'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Settings Content */}
      <div className="w-full">
        {activeTab === "ai_scoring" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
              <div className="p-6 md:p-8">
                <h3 className="text-[20px] font-medium tracking-tight text-black">
                  AI Scoring (Chấm điểm Lead)
                </h3>
                <p className="text-[14px] text-gray-500 mt-2 mb-8">
                  Hệ thống sẽ dựa vào các thông số dưới đây để tự động cộng/trừ điểm và đánh giá chất lượng Lead (Lạnh / Ấm / Nóng).
                </p>

                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b border-[#eaeaea]">
                    <div>
                      <h4 className="text-[14px] font-medium text-black">Lead để lại Email</h4>
                      <p className="text-[13px] text-gray-500 mt-1">Cộng điểm khi khách hàng cung cấp địa chỉ Email hợp lệ.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-emerald-600 font-medium">+</span>
                      <input type="number" defaultValue={10} className="w-16 text-center px-2 py-1.5 border border-[#eaeaea] rounded-md text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[14px] font-medium text-black">Lead để lại Số điện thoại</h4>
                      <p className="text-[13px] text-gray-500 mt-1">SĐT là tín hiệu cực mạnh chứng tỏ nhu cầu thật.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-emerald-600 font-medium">+</span>
                      <input type="number" defaultValue={20} className="w-16 text-center px-2 py-1.5 border border-[#eaeaea] rounded-md text-[14px] outline-none focus:border-black focus:ring-1 focus:ring-black" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Footer */}
              <div className="bg-gray-50 border-t border-[#eaeaea] px-6 md:px-8 py-4 flex items-center justify-between">
                <p className="text-[13px] text-gray-500">
                  Thay đổi điểm số sẽ cập nhật lại toàn bộ Lead trong hệ thống.
                </p>
                <button className="h-[32px] px-4 inline-flex items-center justify-center rounded-md bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors">
                  Lưu
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-6">
              <h4 className="font-medium text-blue-900 flex items-center mb-3 text-[14px]"><Zap className="w-4 h-4 mr-2"/> Ngưỡng đánh giá (Thresholds)</h4>
              <p className="text-[13px] text-blue-800 leading-relaxed">
                Dưới 15 điểm: <strong className="font-semibold">Lead Lạnh</strong> <br/>
                Từ 15 - 30 điểm: <strong className="font-semibold">Lead Ấm</strong> <br/>
                Trên 30 điểm: <strong className="font-semibold">Lead Nóng 🔥</strong>
              </p>
            </div>
          </div>
        )}

        {activeTab === "duplicate" && (
          <div className="rounded-2xl border border-[#eaeaea] bg-white overflow-hidden">
            <div className="p-6 md:p-8">
              <h3 className="text-[20px] font-medium tracking-tight text-black">
                Quy tắc chống trùng lặp
              </h3>
              <p className="text-[14px] text-gray-500 mt-2 mb-8">Xác định các trường hợp bị coi là trùng lặp.</p>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="w-4 h-4 border border-[#eaeaea] rounded bg-white peer-checked:bg-black peer-checked:border-black transition-colors"></div>
                    <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[14px] text-black font-medium group-hover:text-gray-600 transition-colors">Trùng Số điện thoại</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" defaultChecked className="peer sr-only" />
                    <div className="w-4 h-4 border border-[#eaeaea] rounded bg-white peer-checked:bg-black peer-checked:border-black transition-colors"></div>
                    <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <span className="text-[14px] text-black font-medium group-hover:text-gray-600 transition-colors">Trùng Email</span>
                </label>
              </div>
            </div>
            <div className="bg-gray-50 border-t border-[#eaeaea] px-6 md:px-8 py-4 flex items-center justify-end">
              <button className="h-[32px] px-4 inline-flex items-center justify-center rounded-md bg-black text-[13px] font-medium text-white hover:bg-gray-800 transition-colors">
                Lưu
              </button>
            </div>
          </div>
        )}

        {activeTab === "assignment" && (
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-12 flex flex-col items-center justify-center text-center">
            <Users className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-[16px] font-medium text-black mb-2">Phân công tự động</h3>
            <p className="text-[14px] text-gray-500">Chức năng phân công Sale tự động (Round-robin) đang được phát triển.</p>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="rounded-2xl border border-[#eaeaea] bg-white p-12 flex flex-col items-center justify-center text-center">
            <Bell className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-[16px] font-medium text-black mb-2">Cảnh báo & Thông báo</h3>
            <p className="text-[14px] text-gray-500">Cấu hình Webhook/Zalo Notification đang được phát triển.</p>
          </div>
        )}
      </div>
    </div>
  );
}

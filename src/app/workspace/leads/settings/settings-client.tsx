"use client";

import { useState } from "react";
import { Shield, Bell, Zap, Users, Save } from "lucide-react";

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState("ai_scoring");

  const tabs = [
    { id: "ai_scoring", label: "Chấm điểm AI (AI Scoring)", icon: Zap },
    { id: "duplicate", label: "Quy tắc chống trùng lặp", icon: Shield },
    { id: "assignment", label: "Phân công tự động", icon: Users },
    { id: "notifications", label: "Cảnh báo & Thông báo", icon: Bell },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-950 flex items-center gap-2">
          <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center border border-indigo-200">
            <Zap className="h-5 w-5 text-indigo-700" />
          </div>
          Cấu hình Trung tâm Lead
        </h1>
        <button className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm">
          <Save className="h-4 w-4 mr-1.5" />
          Lưu cấu hình
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Nav */}
        <div className="col-span-1 space-y-2">
          <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm flex flex-col space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-left transition-colors ${
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="col-span-2 space-y-6">
          {activeTab === "ai_scoring" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">
                Cấu hình AI Scoring (Chấm điểm Lead)
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Hệ thống sẽ dựa vào các thông số dưới đây để tự động cộng/trừ điểm và đánh giá chất lượng Lead (Lạnh / Ấm / Nóng).
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Lead để lại Email</h4>
                    <p className="text-xs text-gray-500 mt-1">Cộng điểm khi khách hàng cung cấp địa chỉ Email hợp lệ.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">+</span>
                    <input type="number" defaultValue={10} className="w-16 text-center px-2 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-500">điểm</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Lead để lại Số điện thoại</h4>
                    <p className="text-xs text-gray-500 mt-1">SĐT là tín hiệu cực mạnh chứng tỏ nhu cầu thật.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">+</span>
                    <input type="number" defaultValue={20} className="w-16 text-center px-2 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-500">điểm</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-900 flex items-center mb-1 text-sm"><Zap className="w-4 h-4 mr-1.5"/> Ngưỡng đánh giá (Thresholds)</h4>
                <p className="text-xs text-blue-800">
                  Dưới 15 điểm: <strong>Lead Lạnh</strong> <br/>
                  Từ 15 - 30 điểm: <strong>Lead Ấm</strong> <br/>
                  Trên 30 điểm: <strong>Lead Nóng 🔥</strong>
                </p>
              </div>
            </div>
          )}

          {activeTab === "duplicate" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-4">
                Quy tắc chống trùng lặp (Duplicate rules)
              </h3>
              <p className="text-sm text-gray-500 mb-6">Xác định các trường hợp bị coi là trùng lặp.</p>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600" />
                  <span className="text-sm text-gray-700 font-medium">Trùng Số điện thoại</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600" />
                  <span className="text-sm text-gray-700 font-medium">Trùng Email</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "assignment" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center py-12 text-gray-500">
              <Users className="w-12 h-12 text-gray-300 mb-3" />
              <p>Chức năng phân công Sale tự động (Round-robin) đang được phát triển.</p>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center py-12 text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 mb-3" />
              <p>Cấu hình Webhook/Zalo Notification đang được phát triển.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
